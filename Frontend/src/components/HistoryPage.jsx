import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getLogs, deleteLog, clearLogs } from '../api/api';
import { Eye, Trash2, RefreshCw, Search, X } from 'lucide-react';
import { format } from 'date-fns';

function LogModal({ log, onClose }) {
  const fmt = dt => { try { return format(new Date(dt), 'dd MMM yyyy, hh:mm:ss a'); } catch { return '—'; } };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>📧 Email Log #{log.id}</h3><button className="modal-x" onClick={onClose}><X size={15}/></button></div>
        <div className="modal-b">
          {[['Recipient Email', log.recipientEmail],['Name', log.recipientName||'—'],['Subject', log.subject],['Status', log.status],['Sent At', fmt(log.sentAt)],['Error', log.errorMessage||'—'],['Body', log.body]].map(([k,v]) => (
            <div key={k} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13.5, color: '#111827', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage({ refresh, filter }) {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await getLogs(); setLogs(filter ? r.data.filter(l => l.status === filter).sort((a,b) => b.id - a.id) : r.data.sort((a,b) => b.id - a.id)); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load, refresh]);

  const filtered = q ? logs.filter(l => [l.recipientEmail, l.subject, l.status].some(v => v?.toLowerCase().includes(q.toLowerCase()))) : logs;

  const del = async id => {
    if (!confirm('Delete?')) return;
    try { await deleteLog(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const clear = async () => {
    if (!confirm('Clear ALL logs?')) return;
    try { await clearLogs(); toast.success('Cleared'); load(); } catch { toast.error('Failed'); }
  };

  const fmt = dt => { try { return format(new Date(dt), 'dd MMM yyyy, hh:mm a'); } catch { return '—'; } };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="page-title">{filter === 'FAILED' ? 'Failed Emails' : 'Sent Emails'}</div>
          <div className="page-sub">{logs.length} {filter === 'FAILED' ? 'failed' : 'sent'} emails</div>
        </div>
        <div className="hd-actions">
          <div className="search-bar"><Search className="search-ico" size={14}/><input placeholder="Search logs…" value={q} onChange={e => setQ(e.target.value)}/></div>
          <button className="btn btn-ghost" onClick={load}><RefreshCw size={14}/></button>
          <button className="btn btn-danger" onClick={clear}>🗑 Clear All</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <span className="badge badge-blue">{logs.length} total</span>
        <span className="badge badge-green">{logs.filter(l=>l.status==='SENT').length} sent</span>
        <span className="badge badge-red">{logs.filter(l=>l.status==='FAILED').length} failed</span>
      </div>
      <div className="card">
        {loading ? <div className="loading"><div className="ring"/></div>
        : filtered.length === 0
          ? <div className="empty"><div className="empty-ico">📭</div><h3>{q ? 'No results' : 'No logs yet'}</h3><p>Send emails to see history here.</p></div>
          : <div className="tbl-wrap"><table>
            <thead><tr><th>#</th><th>Recipient</th><th>Subject</th><th>Status</th><th>Sent At</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={l.id}>
                  <td className="mono">{i+1}</td>
                  <td><div style={{ fontWeight: 600 }}>{l.recipientEmail}</div><div style={{ fontSize: 11.5, color: '#9ca3af' }}>{l.recipientName}</div></td>
                  <td className="t2" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.subject}</td>
                  <td><span className={`badge ${l.status === 'SENT' ? 'badge-green' : 'badge-red'}`}>{l.status === 'SENT' ? '✓ Delivered' : '✗ Failed'}</span></td>
                  <td className="mono t2">{fmt(l.sentAt)}</td>
                  <td><div className="action-btns">
                    <button className="act-btn view" onClick={() => setViewing(l)}><Eye size={13}/></button>
                    <button className="act-btn del" onClick={() => del(l.id)}><Trash2 size={13}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        }
      </div>
      {viewing && <LogModal log={viewing} onClose={() => setViewing(null)}/>}
    </div>
  );
}
