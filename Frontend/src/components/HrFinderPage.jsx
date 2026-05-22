import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { searchHrs, createRecipientsBulk } from '../api/api';
import { Search, Download, Copy, UserPlus, ExternalLink, Building2 } from 'lucide-react';

/* ── helpers ── */
const downloadCSV = (company, hrList) => {
  const rows = [['#','Name','Designation','Email','LinkedIn','Email Status'],
    ...hrList.map(h => [h.serial, h.name, h.designation, h.email, h.linkedIn, h.emailStatus])];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `${company.replace(/\s+/g,'-')}-HRs.csv`; a.click();
};

const copyText = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

export default function HrFinderPage({ onRefresh }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [adding, setAdding] = useState(false);
  const inputRef = useRef();

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return toast.error('Enter a company name');
    setLoading(true); setResult(null); setSelected(new Set());
    try {
      const res = await searchHrs(q);
      setResult(res.data);
    } catch { toast.error('Search failed — is the backend running?'); }
    finally { setLoading(false); }
  };

  const handleKey = e => { if (e.key === 'Enter') handleSearch(); };

  const toggleSelect = (serial) => setSelected(prev => {
    const next = new Set(prev); next.has(serial) ? next.delete(serial) : next.add(serial); return next;
  });

  const toggleAll = () => {
    if (selected.size === result?.hrList?.length) setSelected(new Set());
    else setSelected(new Set(result.hrList.map(h => h.serial)));
  };

  const addToRecipients = async () => {
    if (!result) return;
    const hrs = result.hrList.filter(h => selected.size === 0 || selected.has(h.serial));
    if (!hrs.length) return toast.error('Select at least one HR');
    setAdding(true);
    try {
      const recs = hrs.map(h => ({
        name: h.name, email: h.email,
        company: result.companyName, position: h.designation, active: true,
      }));
      await createRecipientsBulk(recs);
      toast.success(`✅ Added ${recs.length} HR(s) to Recipients`);
      onRefresh();
    } catch { toast.error('Failed to add recipients'); }
    finally { setAdding(false); }
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>🤖 AI HR Finder</h1>
        <p style={{ color: '#6B7280', fontSize: 13.5 }}>Find HRs and Recruiters from any company instantly</p>
      </div>

      {/* ── Top Section: Search + Company Details ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24, alignItems: 'start' }}>

        {/* Search Card */}
        <div className="card" style={{ padding: '24px 26px' }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', display: 'block', marginBottom: 10 }}>
            Enter Company Name
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              className="inp"
              placeholder="e.g. Infosys, TCS, Google…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              style={{ flex: 1, fontSize: 14 }}
            />
            <button
              id="find-hrs-btn"
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading}
              style={{ whiteSpace: 'nowrap', background: '#6C63FF', borderColor: '#6C63FF' }}
            >
              {loading ? <><div className="spin" />Searching…</> : <><Search size={15} />Find HRs</>}
            </button>
          </div>
          {/* Quick suggestions */}
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Infosys','TCS','Wipro','Google','Flipkart','Zoho'].map(s => (
              <button key={s} onClick={() => { setQuery(s); }}
                style={{ background: '#F8F9FF', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#6C63FF', cursor: 'pointer', fontWeight: 500 }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Company Details Card */}
        <div className="card" style={{ padding: '24px 26px', minHeight: 140 }}>
          {result ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>Company Details</h3>
                <div style={{ width: 52, height: 52, background: '#F3F4F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={26} color="#6C63FF" />
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <tbody>
                  {[
                    ['Company Name', result.companyName, null],
                    ['Location', result.location, null],
                    ['Website', result.website, result.website],
                    ['LinkedIn Profile', result.linkedIn.replace('https://',''), result.linkedIn],
                  ].map(([label, val, link]) => (
                    <tr key={label}>
                      <td style={{ padding: '6px 0', color: '#6B7280', width: 130, fontWeight: 500, verticalAlign: 'top' }}>{label}</td>
                      <td style={{ padding: '6px 0', color: '#1F2937', fontWeight: 600 }}>
                        {link ? (
                          <a href={link} target="_blank" rel="noreferrer"
                            style={{ color: '#6C63FF', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {val} <ExternalLink size={11} />
                          </a>
                        ) : val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 8, color: '#9CA3AF', minHeight: 120 }}>
              <Building2 size={36} color="#E5E7EB" />
              <span style={{ fontSize: 13 }}>Company details appear here after search</span>
            </div>
          )}
        </div>
      </div>

      {/* ── HR Table ── */}
      {result && (
        <div className="card">
          {/* Table Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937' }}>
                HR / Recruiter List <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 13 }}>(Max 20)</span>
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selected.size > 0 && (
                <button className="btn btn-primary btn-sm" onClick={addToRecipients} disabled={adding}
                  style={{ background: '#6C63FF', borderColor: '#6C63FF' }}>
                  {adding ? <><div className="spin"/>Adding…</> : <><UserPlus size={13}/>Add {selected.size} to Recipients</>}
                </button>
              )}
              <button className="btn btn-outline btn-sm" onClick={addToRecipients} disabled={adding}
                style={{ borderColor: '#6C63FF', color: '#6C63FF' }}>
                <UserPlus size={13} />Add All
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => downloadCSV(result.companyName, result.hrList)}>
                <Download size={13} />Export CSV
              </button>
            </div>
          </div>

          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 36, paddingLeft: 20 }}>
                    <input type="checkbox"
                      checked={selected.size === result.hrList.length}
                      onChange={toggleAll}
                      style={{ accentColor: '#6C63FF', cursor: 'pointer' }}
                    />
                  </th>
                  <th>#</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Email</th>
                  <th>LinkedIn Profile</th>
                  <th>Email Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {result.hrList.map(h => (
                  <tr key={h.serial}>
                    <td style={{ paddingLeft: 20 }}>
                      <input type="checkbox" checked={selected.has(h.serial)} onChange={() => toggleSelect(h.serial)}
                        style={{ accentColor: '#6C63FF', cursor: 'pointer' }} />
                    </td>
                    <td className="mono" style={{ color: '#9CA3AF' }}>{h.serial}</td>
                    <td style={{ fontWeight: 600, color: '#1F2937' }}>{h.name}</td>
                    <td style={{ color: '#6B7280', fontSize: 13 }}>{h.designation}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, color: '#1F2937' }}>{h.email}</span>
                        <button onClick={() => copyText(h.email)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2, borderRadius: 4, transition: '.15s' }}
                          title="Copy email">
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <a href={h.linkedIn} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6C63FF', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
                        <span style={{ width: 14, height: 14, background: '#0A66C2', borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        </span>
                        View Profile
                      </a>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '3px 9px',
                        borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                        background: h.emailStatus === 'Found' ? '#F0FDF4' : '#FFFBEB',
                        color: h.emailStatus === 'Found' ? '#16A34A' : '#D97706',
                        border: `1px solid ${h.emailStatus === 'Found' ? '#BBF7D0' : '#FDE68A'}`,
                      }}>
                        {h.emailStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => copyText(h.email)} className="act-btn"
                          title="Copy email" style={{ width: 28, height: 28, borderRadius: 6 }}>
                          <Copy size={12} />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await createRecipientsBulk([{ name: h.name, email: h.email, company: result.companyName, position: h.designation, active: true }]);
                              toast.success(`Added ${h.name} to Recipients`); onRefresh();
                            } catch { toast.error('Failed to add'); }
                          }}
                          className="act-btn view" title="Add to Recipients"
                          style={{ width: 28, height: 28, borderRadius: 6 }}>
                          <UserPlus size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: 12.5, color: '#9CA3AF' }}>
            Showing {result.hrList.length} HR contacts for <b style={{ color: '#6C63FF' }}>{result.companyName}</b>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: '#9CA3AF' }}>
            <div className="ring" style={{ borderTopColor: '#6C63FF' }} />
            <span style={{ fontSize: 14 }}>Searching HR contacts for <b style={{ color: '#6C63FF' }}>{query}</b>…</span>
          </div>
        </div>
      )}
    </div>
  );
}
