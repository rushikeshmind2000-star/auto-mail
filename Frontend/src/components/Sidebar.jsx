import React from 'react';
import { LayoutDashboard, Users, BookOpen, Mail, Send, Clock, CheckCircle, XCircle, FileText, Settings, BotMessageSquare, Sparkles, Bot, Eye } from 'lucide-react';

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'hr-finder',  label: 'AI HR Finder',     icon: BotMessageSquare },
  { id: 'post-analyzer', label: 'AI Post Analyzer',  icon: FileText },
  { id: 'outreach',   label: 'AI Outreach Agent', icon: BotMessageSquare },
  { id: 'cold-email', label: 'AI Cold Email Generator', icon: Sparkles },
  { id: 'recipients', label: 'Recipients (HRs)', icon: Users },
  { id: 'subjects',   label: 'Subjects',         icon: BookOpen },
  { id: 'templates',  label: 'Email Templates',  icon: Mail },
  { id: 'tracking',   label: 'Email Open Tracking', icon: Eye },
  { id: 'send',       label: 'Send Campaign',    icon: Send },
  { id: 'followup',   label: 'Auto Follow-Up',   icon: Clock },
  { id: 'scheduled',  label: 'Scheduled Emails', icon: Clock },
  { id: 'history',    label: 'Sent Emails',      icon: CheckCircle },
  { id: 'failed',     label: 'Failed Emails',    icon: XCircle },
  { id: 'settings',   label: 'Settings',         icon: Settings },
];

// color map for avatar initials
const COLORS = ['#4f46e5','#7c3aed','#db2777','#059669','#d97706','#2563eb'];
export function getColor(str = '') { return COLORS[str.charCodeAt(0) % COLORS.length]; }
export function initials(name = '') { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'; }

export default function Sidebar({ page, setPage, onLogout }) {
  return (
    <aside className="sb">
      <div className="sb-top">
        <div className="sb-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
          <img src="/joblith-logo.png" alt="Joblith AI" style={{ height: 65, objectFit: 'contain' }} />
          <div className="sb-brand">
            <h1 style={{ fontSize: 16 }}>Joblith AI</h1>
            <p style={{ fontSize: 11 }}>AI Powered Career Automation</p>
          </div>
        </div>
      </div>
      <nav className="sb-nav">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} id={`nav-${id}`}
            className={`nav-item ${page === id || (id === 'send' && page === 'dashboard') ? 'active' : ''}`}
            onClick={() => id === 'send' ? setPage('dashboard') : setPage(id)}>
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>
      <div className="sb-upgrade">
        <div className="ico">✉️</div>
        <h4>Save time. Apply smart.</h4>
        <p>Automate your job applications in one click.</p>
        <button>Upgrade Plan</button>
      </div>
      <div className="sb-user" style={{ cursor: 'pointer' }} onClick={onLogout} title="Click to logout">
        <div className="avatar">RS</div>
        <div className="sb-user-info">
          <h4>Prasad Mohite</h4>
          <p style={{ color: '#EF4444', fontSize: 10, fontWeight: 600 }}>🔴 Logout</p>
        </div>
        <svg style={{ marginLeft: 'auto', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </aside>
  );
}
