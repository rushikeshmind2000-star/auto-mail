import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getJobs, cancelJob } from '../api/api';
import { RefreshCw, X } from 'lucide-react';
import { format } from 'date-fns';

export default function ScheduledPage({ refresh }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await getJobs(); setJobs(r.data.sort((a,b) => b.id - a.id)); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [refresh]);

  const cancel = async id => {
    if (!window.confirm('Cancel this job?')) return;
    try { await cancelJob(id); toast.success('Job cancelled'); load(); } catch (e) { toast.error(e?.response?.data?.error || 'Failed'); }
  };

  const fmt = dt => { try { return format(new Date(dt), 'dd MMM yyyy, hh:mm a'); } catch { return '—'; } };

  const statusClass = s => ({ PENDING: 'badge-yellow', DONE: 'badge-green', FAILED: 'badge-red', CANCELLED: 'badge-gray', PROCESSING: 'badge-blue' }[s] || 'badge-gray');

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="page-title">Scheduled Emails</div>
          <div className="page-sub">{jobs.length} scheduled jobs</div>
        </div>
        <button className="btn btn-ghost" onClick={load}><RefreshCw size={14}/>Refresh</button>
      </div>
      <div className="card">
        {loading ? <div className="loading"><div className="ring"/></div>
        : jobs.length === 0
          ? <div className="empty"><div className="empty-ico">⏰</div><h3>No scheduled jobs</h3><p>Schedule a campaign from the Dashboard.</p></div>
          : <div className="tbl-wrap"><table>
            <thead><tr><th>#</th><th>Recipients</th><th>Scheduled At</th><th>Status</th><th>Results</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map((j, i) => (
                <tr key={j.id}>
                  <td className="mono">#{j.id}</td>
                  <td><span className="badge badge-blue">{j.totalRecipients} Recipients</span></td>
                  <td className="mono t2">{fmt(j.scheduledAt)}</td>
                  <td><span className={`badge ${statusClass(j.status)}`}>{j.status}</span></td>
                  <td className="t2" style={{ fontSize: 12.5 }}>
                    {j.status === 'DONE' ? `✅ ${j.successCount} sent, ❌ ${j.failCount} failed` : '—'}
                  </td>
                  <td>
                    {j.status === 'PENDING' && (
                      <button className="btn btn-danger btn-sm" onClick={() => cancel(j.id)}>
                        <X size={13}/>Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        }
      </div>
    </div>
  );
}
