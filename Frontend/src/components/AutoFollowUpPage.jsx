import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getApplications, updateApplicationStatus } from '../api/api';
import { Clock, CheckCircle, XCircle, Send, Settings, Mail, RotateCw, Play, MoreVertical, Bot } from 'lucide-react';

export default function AutoFollowUpPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    enabled: true,
    days: 3,
    tone: 'Professional'
  });

  const load = async () => {
    setLoading(true);
    try {
      // In a real app we'd fetch from actual database, for preview we fetch what we can
      const r = await getApplications();
      setApps(r.data || []);
    } catch {
      // Fallback dummy data if backend isn't ready
      setApps([
        { id: 1, hrName: 'Rahul Sharma', companyName: 'Infosys', role: 'Frontend Developer', sentAt: new Date(Date.now() - 5*86400000).toISOString(), followupDate: new Date(Date.now() + 86400000).toISOString(), followupStatus: 'pending', replyStatus: 'waiting' },
        { id: 2, hrName: 'Priya Verma', companyName: 'TCS', role: 'React Developer', sentAt: new Date(Date.now() - 6*86400000).toISOString(), followupDate: new Date(Date.now()).toISOString(), followupStatus: 'pending', replyStatus: 'waiting' },
        { id: 3, hrName: 'Amit Kumar', companyName: 'Wipro', role: 'Frontend Developer', sentAt: new Date(Date.now() - 7*86400000).toISOString(), followupDate: new Date(Date.now() - 86400000).toISOString(), followupStatus: 'sent', replyStatus: 'waiting' },
        { id: 4, hrName: 'Neha Patel', companyName: 'Accenture', role: 'UI Developer', sentAt: new Date(Date.now() - 8*86400000).toISOString(), followupDate: new Date(Date.now() - 2*86400000).toISOString(), followupStatus: 'cancelled', replyStatus: 'replied' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markReplied = async (id) => {
    try {
      await updateApplicationStatus(id, { replyStatus: 'replied', followupStatus: 'cancelled' });
      toast.success('Marked as replied. Auto follow-up cancelled.');
      load();
    } catch { toast.error('Update failed'); }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDayDiffStr = (iso) => {
    if (!iso) return '';
    const diff = Math.round((new Date(iso) - new Date()) / 86400000);
    if (diff === 0) return '(Today)';
    if (diff === 1) return '(Tomorrow)';
    if (diff === -1) return '(Yesterday)';
    return '';
  };

  const stats = {
    total: apps.length,
    pending: apps.filter(a => a.followupStatus === 'pending').length,
    sent: apps.filter(a => a.followupStatus === 'sent').length,
    replied: apps.filter(a => a.replyStatus === 'replied').length,
    noReply: apps.filter(a => a.replyStatus === 'waiting' && a.followupStatus === 'sent').length
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={24} color="#6C63FF" /> Auto Follow-Up Generator
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13.5 }}>Automatically send smart follow-up emails after a few days if HRs do not reply.</p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Applications', count: stats.total, sub: 'All sent applications', color: '#6C63FF', bg: '#EEF2FF', icon: Mail },
          { label: 'Pending Follow-Ups', count: stats.pending, sub: 'Scheduled to be sent', color: '#D97706', bg: '#FFFBEB', icon: Clock },
          { label: 'Follow-Ups Sent', count: stats.sent, sub: 'Successfully sent', color: '#16A34A', bg: '#F0FDF4', icon: Send },
          { label: 'Replied', count: stats.replied, sub: 'HRs have replied', color: '#0284C7', bg: '#E0F2FE', icon: CheckCircle },
          { label: 'Not Replied', count: stats.noReply, sub: 'No response yet', color: '#DC2626', bg: '#FEF2F2', icon: XCircle }
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ fontSize: 24, fontWeight: 800, color: '#1F2937' }}>{s.count}</div>
               <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <s.icon size={18}/>
               </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4B5563' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings row */}
      <div className="card" style={{ padding: '20px', marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>Follow-Up Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 24, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>Enable Auto Follow-Up</label>
              <label className="switch">
                <input type="checkbox" checked={prefs.enabled} onChange={e => setPrefs({...prefs, enabled: e.target.checked})} />
                <span className="slider round"></span>
              </label>
            </div>
            <p style={{ fontSize: 11.5, color: '#6B7280' }}>System will send follow-up emails automatically</p>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: 6 }}>Follow-Up After</label>
            <select className="inp" value={prefs.days} onChange={e => setPrefs({...prefs, days: Number(e.target.value)})} style={{ padding: '8px 12px', fontSize: 13 }}>
              <option value={3}>3 Days</option>
              <option value={5}>5 Days</option>
              <option value={7}>7 Days</option>
            </select>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Days after the initial email is sent</p>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', display: 'block', marginBottom: 6 }}>Follow-Up Tone</label>
            <select className="inp" value={prefs.tone} onChange={e => setPrefs({...prefs, tone: e.target.value})} style={{ padding: '8px 12px', fontSize: 13 }}>
              <option>Professional</option>
              <option>Friendly</option>
              <option>Formal</option>
            </select>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Select email tone for follow-ups</p>
          </div>
          <div>
            <button className="btn btn-primary" style={{ padding: '10px 24px', background: '#6C63FF', borderColor: '#6C63FF' }} onClick={() => toast.success('Settings Saved!')}>
              <Settings size={14}/> Save Settings
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Pending Table */}
        <div className="card" style={{ padding: '20px', minHeight: 450 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
             <Clock size={18} color="#D97706" />
             <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>Pending Follow-Ups <span style={{ background: '#EEF2FF', color: '#6C63FF', padding: '2px 8px', borderRadius: 999, fontSize: 12, marginLeft: 8 }}>{stats.pending}</span></h3>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>These emails will be sent automatically on the scheduled date.</p>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 500 }}>HR / Recruiter</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 500 }}>Company</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 500 }}>Sent On</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 500 }}>Follow-Up On</th>
                <th style={{ padding: '10px 0', textAlign: 'left', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '10px 0', textAlign: 'center', fontWeight: 500 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 0' }}>
                     <div style={{ fontWeight: 600, color: '#1F2937' }}>{app.hrName}</div>
                     <div style={{ fontSize: 11, color: '#6B7280' }}>{app.role}</div>
                  </td>
                  <td style={{ padding: '12px 0', fontWeight: 500 }}>{app.companyName}</td>
                  <td style={{ padding: '12px 0', color: '#6B7280' }}>{formatDate(app.sentAt)}</td>
                  <td style={{ padding: '12px 0' }}>
                    <div style={{ fontWeight: 500, color: '#1F2937' }}>{formatDate(app.followupDate)}</div>
                    <div style={{ fontSize: 11, color: '#DC2626' }}>{getDayDiffStr(app.followupDate)}</div>
                  </td>
                  <td style={{ padding: '12px 0' }}>
                     <span style={{ 
                       fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                       background: app.followupStatus === 'pending' ? '#FFFBEB' : app.followupStatus === 'sent' ? '#F0FDF4' : '#F3F4F6',
                       color: app.followupStatus === 'pending' ? '#D97706' : app.followupStatus === 'sent' ? '#16A34A' : '#6B7280'
                     }}>
                       {app.followupStatus === 'pending' ? 'Pending' : app.followupStatus === 'sent' ? 'Sent' : 'Cancelled'}
                     </span>
                  </td>
                  <td style={{ padding: '12px 0', textAlign: 'center' }}>
                     <button className="btn btn-ghost btn-sm" onClick={() => markReplied(app.id)} title="Mark as Replied" style={{ padding: 4 }}>
                        <CheckCircle size={14} color="#16A34A" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ textAlign: 'center', marginTop: 16 }}>
             <button className="btn btn-ghost" style={{ fontSize: 13, color: '#6C63FF' }}>View All Applications →</button>
          </div>
        </div>

        {/* AI Preview */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 8 }}>
               <Bot size={18} color="#6C63FF" /> AI Generated Follow-Up Email
            </h3>
            <button className="btn btn-outline btn-sm" style={{ borderColor: '#E5E7EB', fontSize: 12 }}>
               <RotateCw size={12}/> Regenerate
            </button>
          </div>

          <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, background: '#FAFAFA', padding: 16, flex: 1 }}>
            <div style={{ marginBottom: 12, fontSize: 13 }}>
              <strong>To:</strong> Rahul Sharma (rahul@infosys.com)
            </div>
            <div style={{ marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
              Subject: Following Up Regarding Frontend Developer Application
            </div>
            <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
{`Dear Rahul,

I hope you are doing well.

I wanted to follow up regarding my application for the Frontend Developer role at Infosys. I remain very interested in the opportunity and would appreciate any updates regarding the hiring process.

Please let me know if you need any additional information from my side.

Thank you for your time and consideration.

Best Regards,
Prasad Mohite`}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              Copy Email
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#6C63FF', borderColor: '#6C63FF' }}>
              <Send size={14}/> Send Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Workflow Diagram */}
      <div className="card" style={{ padding: '24px', marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 20 }}>How Auto Follow-Up Works</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           {[
             { step: 1, title: 'You send an application', icon: Send, color: '#6C63FF' },
             { step: 2, title: 'System schedules follow-up', icon: Clock, color: '#D97706' },
             { step: 3, title: 'AI generates personalized mail', icon: Bot, color: '#10B981' },
             { step: 4, title: 'Email sent automatically', icon: Mail, color: '#3B82F6' },
             { step: 5, title: 'Stops if HR replies', icon: CheckCircle, color: '#8B5CF6' },
           ].map((s, i) => (
             <React.Fragment key={s.step}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#F3F4F6', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <s.icon size={18}/>
                 </div>
                 <div>
                   <div style={{ fontSize: 12, fontWeight: 700, color: '#1F2937' }}>Step {s.step}</div>
                   <div style={{ fontSize: 11, color: '#6B7280', maxWidth: 120 }}>{s.title}</div>
                 </div>
               </div>
               {i < 4 && <div style={{ color: '#D1D5DB' }}>→</div>}
             </React.Fragment>
           ))}
        </div>
      </div>
    </div>
  );
}
