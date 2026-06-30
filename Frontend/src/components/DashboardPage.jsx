import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { getStats, getRecipients, getSubjects, getBodies, getLogs, getJobs, sendBulk, getResumes, uploadResume, deleteResume } from '../api/api';
import { Eye, Pencil, Trash2, Plus, Send, MoreVertical, Paperclip, X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { initials, getColor } from './Sidebar';

/* ─── Avatar ─────────────────────────────────────────── */
function Av({ name, size = 32 }) {
  const bg = getColor(name);
  return <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, flexShrink: 0 }}>{initials(name)}</div>;
}

/* ─── Multi-select resumes dropdown ──────────────────── */
function ResumeSelect({ allResumes, selected, onChange, onRefreshAll }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  
  const toggle = (r) => {
    const next = selected.find(s => s.id === r.id) ? selected.filter(s => s.id !== r.id) : [...selected, r];
    onChange(next);
  };

  const handleUpload = async (e) => {
    if (!e.target.files.length) return;
    setUploading(true);
    try {
      const res = await uploadResume(e.target.files[0]);
      onRefreshAll();
      onChange([...selected, res.data]);
    } catch {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };
  
  const handleDel = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteResume(id);
      onChange(selected.filter(s => s.id !== id));
      onRefreshAll();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <div className="tags-input" onClick={() => setOpen(o => !o)}>
        {selected.length === 0 && <span className="tags-placeholder">Select from saved resumes...</span>}
        {selected.map(r => (
          <span key={r.id} className="tag">
            {r.fileName}
            <button onClick={e => { e.stopPropagation(); toggle(r); }}>×</button>
          </span>
        ))}
        <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#9ca3af', flexShrink: 0 }} />
      </div>
      {open && (
        <div className="dropdown-list">
          {allResumes.map(r => (
            <div key={r.id} className={`dropdown-item ${selected.find(s => s.id === r.id) ? 'sel-item' : ''}`} onClick={() => toggle(r)}>
              <input type="checkbox" checked={!!selected.find(s => s.id === r.id)} readOnly style={{ accentColor: '#4f46e5', width: 16, height: 16, cursor: 'pointer' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.fileName}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{Math.round(r.size/1024)} KB</div>
              </div>
              <button className="act-btn del" style={{ width: 24, height: 24 }} onClick={e => handleDel(e, r.id)}><Trash2 size={12}/></button>
            </div>
          ))}
          <div className="dropdown-item" style={{ borderTop: '1px solid #e5e7eb', justifyContent: 'center', color: '#4f46e5', fontWeight: 600 }} onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
            {uploading ? 'Uploading...' : '+ Upload New Resume'}
          </div>
          <input type="file" ref={fileRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleUpload} />
        </div>
      )}
    </div>
  );
}

/* ─── Multi-select recipients dropdown ───────────────── */
function RecipientSelect({ recipients, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);
  const toggle = (r) => {
    const next = selected.find(s => s.id === r.id) ? selected.filter(s => s.id !== r.id) : [...selected, r];
    onChange(next);
  };
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <div className="tags-input" onClick={() => setOpen(o => !o)}>
        {selected.length === 0 && <span className="tags-placeholder">You can select multiple recipients</span>}
        {selected.map(r => (
          <span key={r.id} className="tag">
            {r.name || r.email}
            <button onClick={e => { e.stopPropagation(); toggle(r); }}>×</button>
          </span>
        ))}
        <ChevronDown size={14} style={{ marginLeft: 'auto', color: '#9ca3af', flexShrink: 0 }} />
      </div>
      {open && (
        <div className="dropdown-list">
          {recipients.length > 0 && (
            <div className="dropdown-item" onClick={(e) => {
              e.stopPropagation();
              onChange(selected.length === recipients.length ? [] : [...recipients]);
            }} style={{ borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>
              <input type="checkbox" checked={selected.length === recipients.length && recipients.length > 0} readOnly style={{ accentColor: '#4f46e5', width: 16, height: 16, cursor: 'pointer' }} />
              Select All ({recipients.length})
            </div>
          )}
          {recipients.map(r => (
            <div key={r.id} className={`dropdown-item ${selected.find(s => s.id === r.id) ? 'sel-item' : ''}`} onClick={() => toggle(r)}>
              <input type="checkbox" checked={!!selected.find(s => s.id === r.id)} readOnly style={{ accentColor: '#4f46e5', width: 16, height: 16, cursor: 'pointer' }} />
              <Av name={r.name || r.email} size={26} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name || '—'}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{r.email}</div>
              </div>
            </div>
          ))}
          {recipients.length === 0 && <div style={{ padding: '12px', color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>No active recipients</div>}
        </div>
      )}
    </div>
  );
}

/* ─── Preview Modal ─────────────────────────────────── */
function PreviewModal({ subject, body, hrName, company, onClose }) {
  const fill = (t) => t?.replace(/\{\{hr_name\}\}/g, hrName || 'HR').replace(/\{\{company\}\}/g, company || 'Company').replace(/\{\{role\}\}/g, 'Software Developer') || '';
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>📧 Email Preview</h3><button className="modal-x" onClick={onClose}><X size={15} /></button></div>
        <div className="modal-b">
          {subject && <div className="preview-subject">Subject: {fill(subject)}</div>}
          <div className="preview-body">{fill(body) || 'No template selected.'}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────── */
export default function DashboardPage({ refresh, onRefresh, setPage }) {
  const [stats, setStats] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bodies, setBodies] = useState([]);
  const [logs, setLogs] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Send Campaign state
  const [selR, setSelR] = useState([]);
  const [selSubj, setSelSubj] = useState('');
  const [selBody, setSelBody] = useState('');
  const [selResumes, setSelResumes] = useState([]);
  const [allResumes, setAllResumes] = useState([]);
  const [schedMode, setSchedMode] = useState('now');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileRef = useRef();

  const load = async () => {
    try {
      const [st, r, s, b, l, j, res] = await Promise.all([getStats(), getRecipients(), getSubjects(), getBodies(), getLogs(), getJobs(), getResumes()]);
      setStats(st.data); setRecipients(r.data.filter(x => x.active).sort((a,b) => b.id - a.id));
      setSubjects(s.data.sort((a,b) => b.id - a.id)); setBodies(b.data.sort((a,b) => b.id - a.id));
      setLogs(l.data.sort((a,b) => b.id - a.id).slice(0, 5)); setJobs(j.data.sort((a,b) => b.id - a.id).slice(0, 5));
      setAllResumes(res.data.sort((a,b) => b.id - a.id));
    } catch { toast.error('Cannot reach backend — is Spring Boot running on port 8080?'); }
  };

  useEffect(() => { load(); }, [refresh]);

  const handleSend = async () => {
    if (!selR.length) return toast.error('Select at least one recipient');
    if (!selSubj) return toast.error('Select a subject template');
    if (!selBody) return toast.error('Select a body template');
    if (schedMode === 'later' && (!schedDate || !schedTime)) return toast.error('Pick a schedule date & time');

    const scheduledAt = schedMode === 'later' ? `${schedDate}T${schedTime}` : null;
    setSending(true);

    const reqData = {
      recipientIds: selR.map(r => r.id),
      subjectId: +selSubj,
      bodyId: +selBody,
      scheduledAt: scheduledAt,
      resumeIds: selResumes.map(r => r.id)
    };

    try {
      const res = await sendBulk(reqData);
      toast.success(res.data.message || `✅ Job queued for ${selR.length} HR(s)`);
      setSelR([]); setSelSubj(''); setSelBody(''); setSelResumes([]); onRefresh();
    } catch (e) { toast.error(e?.response?.data?.error || 'Send failed'); }
    finally { setSending(false); }
  };

  const selSubjObj = subjects.find(s => s.id === +selSubj);
  const selBodyObj = bodies.find(b => b.id === +selBody);
  const firstHR = selR[0];

  const fmt = (dt) => { try { return format(new Date(dt), 'dd MMM yyyy, hh:mm a'); } catch { return '—'; } };

  return (
    <div>
      {/* ── Stats ── */}
      <div className="stats-row fade stagger-1">
        {[
          { label: 'Total Sent', val: stats?.totalSent ?? '—', sub: 'All time emails sent', cls: 'blue', ico: '📨' },
          { label: 'Pending', val: stats?.pendingJobs ?? '—', sub: 'Scheduled emails', cls: 'green', ico: '📤' },
          { label: 'Successful', val: stats?.totalSent ?? '—', sub: 'Successfully delivered', cls: 'yellow', ico: '✅' },
          { label: 'Failed', val: stats?.totalFailed ?? '—', sub: 'Failed to deliver', cls: 'red', ico: '❌' },
        ].map(({ label, val, sub, cls, ico }) => (
          <div key={label} className="stat-card">
            <div className={`stat-ico ${cls}`}>{ico}</div>
            <div>
              <div className="stat-val">{val}</div>
              <div className="stat-lbl">{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 3-Col: Recipients | Subjects | Templates ── */}
      <div className="grid-3 fade stagger-2">

        {/* Recipients */}
        <div className="card card-p">
          <div className="card-hd">
            <h3>👥 Recipients (HRs)</h3>
            <button className="view-all" onClick={() => setPage('recipients')}>View all</button>
          </div>
          <div className="scroll-list">
            {recipients.map(r => (
              <div key={r.id} className="rcpt-row">
                <Av name={r.name || r.email} />
                <div className="rcpt-info">
                  <div className="rcpt-name">{r.name || '—'}</div>
                  <div className="rcpt-company">{r.company || '—'}</div>
                </div>
                <div className="rcpt-email">{r.email}</div>
                <button className="rcpt-menu"><MoreVertical size={14} /></button>
              </div>
            ))}
          </div>
          <button className="add-btn" onClick={() => setPage('recipients')}><Plus size={14} /> Add Recipient</button>
        </div>

        {/* Subjects */}
        <div className="card card-p">
          <div className="card-hd">
            <h3>📝 Subjects</h3>
            <button className="view-all" onClick={() => setPage('subjects')}>View all</button>
          </div>
          <div className="scroll-list">
            {subjects.map(s => (
              <div key={s.id} className="list-item">{s.content}</div>
            ))}
            {subjects.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af', padding: '8px 0' }}>No subjects yet.</div>}
          </div>
          <button className="add-btn" onClick={() => setPage('subjects')}><Plus size={14} /> Add Subject</button>
        </div>

        {/* Templates */}
        <div className="card card-p">
          <div className="card-hd">
            <h3>✉️ Email Templates</h3>
            <button className="view-all" onClick={() => setPage('templates')}>View all</button>
          </div>
          <div className="scroll-list">
            {bodies.map(b => (
              <div key={b.id} className="list-item">{b.title}</div>
            ))}
            {bodies.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af', padding: '8px 0' }}>No templates yet.</div>}
          </div>
          <button className="add-btn" onClick={() => setPage('templates')}><Plus size={14} /> Add Template</button>
        </div>
      </div>

      {/* ── Send Campaign ── */}
      <div className="campaign-section fade stagger-3">
        <div className="campaign-header">
          <div className="ch-icon"><Send size={18} /></div>
          <div>
            <h3>Send Campaign</h3>
            <p>Select recipients, subject, template, resume and schedule your email campaign.</p>
          </div>
        </div>

        {/* Row 1 */}
        <div className="campaign-grid">
          <div>
            <div className="cg-label">Select Recipients</div>
            <RecipientSelect recipients={recipients} selected={selR} onChange={setSelR} />
          </div>
          <div>
            <div className="cg-label">Select Subject</div>
            <div className="sel-wrap">
              <select className="sel" value={selSubj} onChange={e => setSelSubj(e.target.value)}>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.content}</option>)}
              </select>
              <ChevronDown size={14} className="sel-arrow" />
            </div>
          </div>
          <div>
            <div className="cg-label">Select Email Template</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="sel-wrap" style={{ flex: 1 }}>
                <select className="sel" value={selBody} onChange={e => setSelBody(e.target.value)}>
                  <option value="">-- Select Template --</option>
                  {bodies.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
                <ChevronDown size={14} className="sel-arrow" />
              </div>
              <button className="btn btn-outline" onClick={() => setShowPreview(true)} disabled={!selBodyObj}>
                <Eye size={14} /> Preview
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="campaign-grid-2">
          <div>
            <div className="cg-label">Select Resumes</div>
            <ResumeSelect allResumes={allResumes} selected={selResumes} onChange={setSelResumes} onRefreshAll={load} />
          </div>
          <div>
            <div className="cg-label">Schedule Sending</div>
            <div className="radio-group">
              <label className="radio-item">
                <input type="radio" name="sched" value="now" checked={schedMode === 'now'} onChange={() => setSchedMode('now')} />
                Send Immediately
              </label>
              <label className="radio-item">
                <input type="radio" name="sched" value="later" checked={schedMode === 'later'} onChange={() => setSchedMode('later')} />
                Schedule for Later
              </label>
            </div>
          </div>
          <div>
            <div className="cg-label">Select Date &amp; Time</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="inp" type="date" value={schedDate} onChange={e => setSchedDate(e.target.value)}
                disabled={schedMode === 'now'} style={{ flex: 1 }} />
              <input className="inp" type="time" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                disabled={schedMode === 'now'} style={{ width: 110 }} />
            </div>
          </div>
        </div>

        <div className="send-row" style={{ marginTop: 18 }}>
          <button id="send-applications-btn" className="btn btn-primary btn-lg" onClick={handleSend} disabled={sending}>
            {sending ? <><div className="spin" />Sending…</> : <><Send size={16} />Send Applications</>}
          </button>
        </div>
      </div>

      {/* ── Tracking Summary ── */}
      <div className="card card-p fade stagger-3" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: '#fff' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#fff' }}>Email Open Tracking</h3>
          <p style={{ fontSize: 13.5, color: '#94a3b8' }}>Check if your emails were opened or replied to in real-time.</p>
        </div>
        <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setPage('tracking')}>
          <Eye size={16} /> View Tracking Stats
        </button>
      </div>

      {/* ── Recent Campaigns / Logs ── */}
      <div className="card card-p fade stagger-4">
        <div className="card-hd">
          <h3>📋 Recent Campaigns</h3>
          <button className="view-all" onClick={() => setPage('history')}>View all</button>
        </div>
        {logs.length === 0
          ? <div className="empty"><div className="empty-ico">📭</div><h3>No campaigns yet</h3><p>Send your first application above.</p></div>
          : <div className="tbl-wrap"><table>
            <thead><tr>
              <th>Recipient</th><th>Subject</th><th>Status</th><th>Sent At</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td><div style={{ fontWeight: 600 }}>{l.recipientEmail}</div><div style={{ fontSize: 11.5, color: '#9ca3af' }}>{l.recipientName}</div></td>
                  <td className="t2" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.subject}</td>
                  <td>
                    <span className={`badge ${l.status === 'SENT' ? 'badge-green' : 'badge-red'}`}>
                      {l.status === 'SENT' ? '✓' : '✗'} {l.status === 'SENT' ? 'Delivered' : 'Failed'}
                    </span>
                  </td>
                  <td className="t2 mono">{l.sentAt ? fmt(l.sentAt) : '—'}</td>
                  <td><div className="action-btns">
                    <button className="act-btn view"><Eye size={13} /></button>
                    <button className="act-btn edit"><Pencil size={13} /></button>
                    <button className="act-btn del"><Trash2 size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        }
      </div>

      {showPreview && (
        <PreviewModal
          subject={selSubjObj?.content}
          body={selBodyObj?.content}
          hrName={firstHR?.name}
          company={firstHR?.company}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
