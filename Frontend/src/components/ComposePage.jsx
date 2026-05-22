import React, { useState } from 'react';
import { sendMail } from '../api/mailApi';
import toast from 'react-hot-toast';
import { Send, User, AtSign, Type, AlignLeft, RotateCcw } from 'lucide-react';

const initialForm = { recipient: '', subject: '', body: '' };

const ComposePage = ({ onMailSent }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recipient || !form.subject || !form.body) {
      toast.error('Please fill in all required fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.recipient)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending email...');
    try {
      const res = await sendMail(form);
      if (res.data.status === 'SENT') {
        toast.success(`Email sent to ${form.recipient}!`, { id: toastId });
        setForm(initialForm);
        onMailSent();
      } else {
        toast.error(`Failed: ${res.data.status}`, { id: toastId });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'An error occurred';
      toast.error(`Error: ${msg}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="section-header">
        <h2 className="section-title">
          <div className="section-title-icon">
            <Send size={16} color="var(--accent-secondary)" />
          </div>
          Compose New Email
        </h2>
        <span className="badge badge-primary">Auto-Send via SMTP</span>
      </div>

      <div className="card">
        <form className="compose-form" onSubmit={handleSubmit} id="compose-form">
          <div className="form-grid">

            <div className="form-group">
              <label className="form-label" htmlFor="recipient">
                <AtSign size={13} />
                Recipient Email <span className="required">*</span>
              </label>
              <input
                id="recipient"
                name="recipient"
                type="email"
                className="form-input"
                placeholder="recipient@example.com"
                value={form.recipient}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subject">
                <Type size={13} />
                Subject <span className="required">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                className="form-input"
                placeholder="Enter email subject..."
                value={form.subject}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="body">
                <AlignLeft size={13} />
                Message Body <span className="required">*</span>
              </label>
              <textarea
                id="body"
                name="body"
                className="form-textarea"
                placeholder="Write your email message here..."
                value={form.body}
                onChange={handleChange}
                rows={7}
              />
            </div>

          </div>

          <div className="form-actions">
            <button
              id="send-mail-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={15} />
                  Send Email
                </>
              )}
            </button>
            <button
              id="reset-form-btn"
              type="button"
              className="btn btn-ghost"
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw size={14} />
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposePage;
