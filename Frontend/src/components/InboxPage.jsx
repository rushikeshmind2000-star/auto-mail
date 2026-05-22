import React, { useState, useEffect, useCallback } from 'react';
import { getAllMails, deleteMail } from '../api/mailApi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  Inbox, RefreshCw, Search, Eye, Trash2, CheckCircle2, XCircle, X
} from 'lucide-react';

/* ===== Mail Detail Modal ===== */
const MailModal = ({ mail, onClose }) => {
  if (!mail) return null;
  const isSent = mail.status === 'SENT';

  const formatDate = (dt) => {
    try { return format(new Date(dt), 'dd MMM yyyy, hh:mm:ss a'); }
    catch { return dt; }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="mail-detail-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} id="mail-detail-modal">
        <div className="modal-header">
          <h3 className="modal-title">📧 Mail Details</h3>
          <button className="modal-close" onClick={onClose} id="close-modal-btn">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          {[
            { label: 'ID', value: `#${mail.id}` },
            { label: 'Recipient', value: mail.recipient },
            { label: 'Subject', value: mail.subject },
            { label: 'Sent At', value: mail.sentAt ? formatDate(mail.sentAt) : '—' },
            {
              label: 'Status', value: (
                <span className={`status-badge ${isSent ? 'status-sent' : 'status-failed'}`}>
                  <span className="status-dot-sm" style={{ background: isSent ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                  {mail.status}
                </span>
              )
            },
            { label: 'Message', value: mail.body },
          ].map(({ label, value }) => (
            <div key={label} className="modal-detail-row">
              <span className="modal-detail-label">{label}</span>
              <span className="modal-detail-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ===== Confirm Delete Modal ===== */
const ConfirmModal = ({ mail, onConfirm, onClose }) => {
  if (!mail) return null;
  return (
    <div className="modal-overlay" onClick={onClose} id="confirm-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: 'var(--accent-red)' }}>🗑️ Delete Mail</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p className="confirm-text">
            Are you sure you want to delete the mail sent to{' '}
            <span className="confirm-email">{mail.recipient}</span>? This action cannot be undone.
          </p>
          <div className="form-actions" style={{ marginTop: 24 }}>
            <button id="confirm-delete-btn" className="btn btn-danger" onClick={onConfirm}>
              <Trash2 size={14} /> Delete
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== Main Inbox Page ===== */
const InboxPage = ({ refreshKey }) => {
  const [mails, setMails] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMail, setViewMail] = useState(null);
  const [deletingMail, setDeletingMail] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMails = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllMails();
      const sorted = [...res.data].sort((a, b) => b.id - a.id);
      setMails(sorted);
      setFiltered(sorted);
    } catch (err) {
      toast.error('Failed to load mails. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMails(); }, [fetchMails, refreshKey]);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFiltered(mails); return; }
    setFiltered(mails.filter((m) =>
      m.recipient?.toLowerCase().includes(q) ||
      m.subject?.toLowerCase().includes(q) ||
      m.body?.toLowerCase().includes(q)
    ));
  }, [search, mails]);

  const handleDelete = async () => {
    if (!deletingMail) return;
    setDeleting(true);
    try {
      await deleteMail(deletingMail.id);
      toast.success('Mail deleted successfully.');
      setDeletingMail(null);
      fetchMails();
    } catch (err) {
      toast.error('Failed to delete mail.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dt) => {
    try { return format(new Date(dt), 'dd MMM, hh:mm a'); }
    catch { return '—'; }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">
          <div className="section-title-icon">
            <Inbox size={16} color="var(--accent-secondary)" />
          </div>
          Sent Mail Log
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-bar">
            <Search className="search-icon" size={14} />
            <input
              id="search-mails"
              type="text"
              placeholder="Search recipient, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            id="refresh-mails-btn"
            className="btn btn-ghost btn-sm"
            onClick={fetchMails}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay">
            <div className="loading-ring" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>{search ? 'No results found' : 'No emails sent yet'}</h3>
            <p>{search ? 'Try a different search term.' : 'Compose your first email to see it here.'}</p>
          </div>
        ) : (
          <div className="mail-table-wrapper">
            <table className="mail-table" id="mail-log-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipient</th>
                  <th>Subject</th>
                  <th>Preview</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mail, idx) => {
                  const isSent = mail.status === 'SENT';
                  return (
                    <tr key={mail.id}>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {idx + 1}
                      </td>
                      <td className="recipient">{mail.recipient}</td>
                      <td className="subject">{mail.subject}</td>
                      <td className="body-preview">{mail.body}</td>
                      <td>
                        <span className={`status-badge ${isSent ? 'status-sent' : 'status-failed'}`}>
                          <span className="status-dot-sm"
                            style={{ background: isSent ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                          {isSent ? 'Sent' : 'Failed'}
                        </span>
                      </td>
                      <td className="date-cell">{mail.sentAt ? formatDate(mail.sentAt) : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            id={`view-mail-${mail.id}`}
                            className="btn btn-ghost btn-sm"
                            title="View details"
                            onClick={() => setViewMail(mail)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            id={`delete-mail-${mail.id}`}
                            className="btn btn-danger btn-sm"
                            title="Delete"
                            onClick={() => setDeletingMail(mail)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewMail && <MailModal mail={viewMail} onClose={() => setViewMail(null)} />}
      {deletingMail && (
        <ConfirmModal
          mail={deletingMail}
          onConfirm={handleDelete}
          onClose={() => setDeletingMail(null)}
        />
      )}
    </div>
  );
};

export default InboxPage;
