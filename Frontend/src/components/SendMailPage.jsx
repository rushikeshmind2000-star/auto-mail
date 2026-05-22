import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getRecipients, getSubjects, getBodies, sendBulk } from '../api/api';
import { Send, Search, CheckSquare, Square, Clock, Zap } from 'lucide-react';

export default function SendMailPage({ onRefresh }) {
  const [recipients, setRecipients] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bodies, setBodies] = useState([]);
  const [selRecipients, setSelRecipients] = useState(new Set());
  const [selSubject, setSelSubject] = useState(null);
  const [selBody, setSelBody] = useState(null);
  const [scheduleMode, setScheduleMode] = useState(false);
  const [schedTime, setSchedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [qR, setQR] = useState('');

  useEffect(() => {
    Promise.all([getRecipients(), getSubjects(), getBodies()]).then(([r, s, b]) => {
      setRecipients(r.data.filter(x => x.active));
      setSubjects(s.data); setBodies(b.data);
    }).catch(() => toast.error('Failed to load data – is backend running?'));
  }, []);

  const filteredR = qR ? recipients.filter(r =>
    r.email?.toLowerCase().includes(qR.toLowerCase()) ||
    r.name?.toLowerCase().includes(qR.toLowerCase()) ||
    r.company?.toLowerCase().includes(qR.toLowerCase())
  ) : recipients;

  const toggleR = (id) => setSelRecipients(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelRecipients(new Set(filteredR.map(r => r.id)));
  const clearAll = () => setSelRecipients(new Set());

  const canSend = selRecipients.size > 0 && selSubject && selBody;

  const handleSend = async () => {
    if (!canSend) return toast.error('Select recipients, subject, and body first.');
    if (scheduleMode && !schedTime) return toast.error('Pick a scheduled date & time.');

    setLoading(true); setResult(null);
    try {
      const payload = {
        recipientIds: [...selRecipients],
        subjectId: selSubject,
        bodyId: selBody,
        scheduledAt: scheduleMode && schedTime ? schedTime : null,
      };
      const res = await sendBulk(payload);
      setResult(res.data);
      onRefresh();
      if (!res.data.scheduled) {
        toast.success(`✅ Sent to ${res.data.sent} | ❌ Failed: ${res.data.failed}`);
        if (res.data.sent > 0) { setSelRecipients(new Set()); setSelSubject(null); setSelBody(null); }
      } else {
        toast.success(`📅 Scheduled for ${schedTime}`);
        setSelRecipients(new Set()); setSelSubject(null); setSelBody(null); setSchedTime('');
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Send failed');
    } finally { setLoading(false); }
  };

  const minDateTime = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <div className="fade">
      <div className="sh-row">
        <h2 className="sh-title"><div className="sh-icon"><Send size={14} color="var(--p2)"/></div>Send Application Emails</h2>
        <span className="badge">{selRecipients.size} selected</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT: Recipients */}
        <div className="card card-p">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>👥 Select HR Recipients</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-g btn-sm" onClick={selectAll}><CheckSquare size={11}/>All</button>
              <button className="btn btn-g btn-sm" onClick={clearAll}><Square size={11}/>Clear</button>
            </div>
          </div>
          <div className="search-wrap" style={{ maxWidth: '100%', marginBottom: 10 }}>
            <Search className="search-ico" size={13}/>
            <input placeholder="Filter by name, email, company…" value={qR} onChange={e => setQR(e.target.value)}/>
          </div>
          {recipients.length === 0
            ? <div className="empty" style={{ padding: '24px 0' }}><div className="empty-ico">👥</div><h3>No contacts</h3><p>Add HR contacts first.</p></div>
            : <div className="rcpt-list">
              {filteredR.map(r => (
                <label key={r.id} className={`rcpt-item ${selRecipients.has(r.id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selRecipients.has(r.id)} onChange={() => toggleR(r.id)}/>
                  <div style={{ flex: 1 }}>
                    <div className="rcpt-name">{r.name || r.email}</div>
                    <div className="rcpt-email">{r.email}</div>
                    {r.company && <div className="rcpt-company">{r.company}{r.position ? ` · ${r.position}` : ''}</div>}
                  </div>
                </label>
              ))}
            </div>
          }
        </div>

        {/* RIGHT: Templates + Send */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Subject */}
          <div className="card card-p">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📝 Select Subject Template</div>
            {subjects.length === 0
              ? <div className="empty" style={{ padding: '16px 0' }}><h3>No subjects</h3><p>Create subject templates first.</p></div>
              : <div className="tpl-list">
                {subjects.map(s => (
                  <div key={s.id} className={`tpl-item ${selSubject === s.id ? 'selected' : ''}`} onClick={() => setSelSubject(s.id)}>
                    <div className="tpl-title">{s.title}</div>
                    <div className="tpl-preview">{s.content}</div>
                  </div>
                ))}
              </div>
            }
          </div>

          {/* Body */}
          <div className="card card-p">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>📄 Select Body Template</div>
            {bodies.length === 0
              ? <div className="empty" style={{ padding: '16px 0' }}><h3>No bodies</h3><p>Create body templates first.</p></div>
              : <div className="tpl-list">
                {bodies.map(b => (
                  <div key={b.id} className={`tpl-item ${selBody === b.id ? 'selected' : ''}`} onClick={() => setSelBody(b.id)}>
                    <div className="tpl-title">{b.title}</div>
                    <div className="tpl-preview">{b.content}</div>
                  </div>
                ))}
              </div>
            }
          </div>

          {/* Schedule + Send */}
          <div className="card card-p">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>⏱️ Sending Options</div>

            {/* Toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <button className={`btn btn-sm ${!scheduleMode ? 'btn-p' : 'btn-g'}`} onClick={() => setScheduleMode(false)}>
                <Zap size={13}/>Send Now
              </button>
              <button className={`btn btn-sm ${scheduleMode ? 'btn-p' : 'btn-g'}`} onClick={() => setScheduleMode(true)}>
                <Clock size={13}/>Schedule
              </button>
            </div>

            {scheduleMode && (
              <div className="fg" style={{ marginBottom: 14 }}>
                <label className="fl">Send Date & Time <span className="req">*</span></label>
                <input className="fi" type="datetime-local" min={minDateTime} value={schedTime} onChange={e => setSchedTime(e.target.value)}/>
              </div>
            )}

            {/* Summary */}
            <div style={{ fontSize: 12.5, color: 'var(--tm)', marginBottom: 14, lineHeight: 1.7 }}>
              <div>Recipients: <b style={{ color: selRecipients.size > 0 ? 'var(--green)' : 'var(--red)' }}>{selRecipients.size} selected</b></div>
              <div>Subject: <b style={{ color: selSubject ? 'var(--green)' : 'var(--red)' }}>{selSubject ? subjects.find(s => s.id === selSubject)?.title : 'Not selected'}</b></div>
              <div>Body: <b style={{ color: selBody ? 'var(--green)' : 'var(--red)' }}>{selBody ? bodies.find(b => b.id === selBody)?.title : 'Not selected'}</b></div>
            </div>

            <button id="send-btn" className="btn btn-p" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading || !canSend} onClick={handleSend}>
              {loading ? <><div className="spin"/>Sending…</> : scheduleMode ? <><Clock size={15}/>Schedule Send to {selRecipients.size} HR(s)</> : <><Send size={15}/>Send Now to {selRecipients.size} HR(s)</>}
            </button>
          </div>
        </div>
      </div>

      {/* Result Box */}
      {result && (
        <div className={`result-box ${result.scheduled ? 'scheduled' : result.failed === 0 ? 'success' : 'partial'}`} style={{ marginTop: 20 }}>
          {result.scheduled ? (
            <div className="rr" style={{ color: 'var(--p2)' }}>📅 Scheduled for {result.totalRecipients} recipients on {result.scheduledAt}</div>
          ) : (
            <>
              <div className="rr" style={{ marginBottom: 8 }}>
                <span style={{ color: 'var(--green)' }}>✅ {result.sent} Delivered</span>
                {result.failed > 0 && <span style={{ color: 'var(--red)', marginLeft: 16 }}>❌ {result.failed} Failed</span>}
              </div>
              <div className="pbar-wrap">
                <div className="pbar" style={{ width: `${result.total > 0 ? (result.sent / result.total) * 100 : 0}%` }}/>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
