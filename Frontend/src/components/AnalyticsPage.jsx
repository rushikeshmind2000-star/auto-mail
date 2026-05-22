import React, { useState, useEffect, useCallback } from 'react';
import { getAllMails } from '../api/mailApi';
import { BarChart2, CheckCircle2, XCircle, Mail, TrendingUp } from 'lucide-react';

const AnalyticsPage = ({ refreshKey }) => {
  const [mails, setMails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMails();
      setMails(res.data);
    } catch {
      // silently fail on analytics
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMails(); }, [fetchMails, refreshKey]);

  const total = mails.length;
  const sent = mails.filter((m) => m.status === 'SENT').length;
  const failed = total - sent;
  const rate = total > 0 ? ((sent / total) * 100).toFixed(1) : '0.0';

  // Collect unique recipients
  const uniqueRecipients = [...new Set(mails.map((m) => m.recipient))];

  // Group by domain
  const domainMap = {};
  mails.forEach((m) => {
    const domain = m.recipient?.split('@')[1] || 'unknown';
    domainMap[domain] = (domainMap[domain] || 0) + 1;
  });
  const topDomains = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Most recent 5
  const recent = [...mails].sort((a, b) => b.id - a.id).slice(0, 5);

  if (loading) {
    return (
      <div className="fade-in loading-overlay">
        <div className="loading-ring" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">
          <div className="section-title-icon">
            <BarChart2 size={16} color="var(--accent-secondary)" />
          </div>
          Email Analytics
        </h2>
        <span className="badge badge-primary">{total} Total Emails</span>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card purple">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total Emails Sent</div>
          <div className="stat-icon">📧</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{sent}</div>
          <div className="stat-label">Delivered Successfully</div>
          <div className="stat-icon">✅</div>
        </div>
        <div className="stat-card red">
          <div className="stat-value">{failed}</div>
          <div className="stat-label">Failed Deliveries</div>
          <div className="stat-icon">❌</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-value">{rate}%</div>
          <div className="stat-label">Delivery Success Rate</div>
          <div className="stat-icon">📈</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Top Domains */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="var(--accent-secondary)" />
            Top Recipient Domains
          </h3>
          {topDomains.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topDomains.map(([domain, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={domain}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>@{domain}</span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {count} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'var(--gradient-primary)',
                        borderRadius: 3,
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Success vs Failed Pie-like */}
        <div className="card" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} color="var(--accent-secondary)" />
            Delivery Breakdown
          </h3>
          {total === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data available yet.</p>
          ) : (
            <>
              {/* Visual bar */}
              <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', marginBottom: 20 }}>
                <div style={{
                  height: '100%',
                  width: `${rate}%`,
                  background: 'linear-gradient(90deg, #4ade80, #86efac)',
                  transition: 'width 0.8s ease',
                }} />
                <div style={{
                  height: '100%',
                  flex: 1,
                  background: 'rgba(248,113,113,0.3)',
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Delivered', value: sent, color: 'var(--accent-green)', icon: '✅' },
                  { label: 'Failed', value: failed, color: 'var(--accent-red)', icon: '❌' },
                  { label: 'Unique Recipients', value: uniqueRecipients.length, color: 'var(--accent-cyan)', icon: '👥' },
                ].map(({ label, value, color, icon }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <span>{icon}</span> {label}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ padding: '24px 28px', gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={16} color="var(--accent-secondary)" />
            Recent Activity (Last 5)
          </h3>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No emails yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recent.map((mail) => {
                const isSent = mail.status === 'SENT';
                return (
                  <div key={mail.id} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '12px 0', borderBottom: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isSent ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                      border: `1px solid ${isSent ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16,
                    }}>
                      {isSent ? '✅' : '❌'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{mail.subject}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>To: {mail.recipient}</div>
                    </div>
                    <span className={`status-badge ${isSent ? 'status-sent' : 'status-failed'}`}>
                      {isSent ? 'Sent' : 'Failed'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
