import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import RecipientsPage from './components/RecipientsPage';
import TemplatesPage from './components/TemplatesPage';
import HistoryPage from './components/HistoryPage';
import ScheduledPage from './components/ScheduledPage';
import HrFinderPage from './components/HrFinderPage';
import AiPostAnalyzerPage from './components/AiPostAnalyzerPage';
import AiOutreachAgentPage from './components/AiOutreachAgentPage';
import AutoFollowUpPage from './components/AutoFollowUpPage';
import EmailTrackingPage from './components/EmailTrackingPage';
import ColdEmailGeneratorPage from './components/ColdEmailGeneratorPage';
import SubjectsPage from './components/SubjectsPage';
import { Bell, Sun, ChevronDown, Menu } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard', recipients: 'Recipients (HRs)', subjects: 'Subjects',
  templates: 'Email Templates', history: 'Sent Emails', scheduled: 'Scheduled Emails',
  failed: 'Failed Emails',
};

export default function App() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('joblith_auth'));
  const [page, setPage] = useState('dashboard');
  const [refresh, setRefresh] = useState(0);
  const onRefresh = () => setRefresh(k => k + 1);

  const handleLogout = () => {
    localStorage.removeItem('joblith_auth');
    setAuthed(false);
    setPage('dashboard');
  };

  if (!authed) return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13.5px' },
        success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
      }} />
      <LoginPage onLogin={() => setAuthed(true)} />
    </>
  );

  const renderPage = () => {
    if (page === 'dashboard')  return <DashboardPage refresh={refresh} onRefresh={onRefresh} setPage={setPage} />;
    if (page === 'hr-finder')  return <HrFinderPage onRefresh={onRefresh} />;
    if (page === 'analyzer' || page === 'post-analyzer') return <AiPostAnalyzerPage />;
    if (page === 'outreach')   return <AiOutreachAgentPage />;
    if (page === 'cold-email') return <ColdEmailGeneratorPage />;
    if (page === 'recipients') return <RecipientsPage onRefresh={onRefresh} />;
    if (page === 'subjects')   return <SubjectsPage onRefresh={onRefresh} />;
    if (page === 'templates')  return <TemplatesPage onRefresh={onRefresh} />;
    if (page === 'tracking')   return <EmailTrackingPage />;
    if (page === 'followup')   return <AutoFollowUpPage />;
    if (page === 'history' || page === 'failed') return <HistoryPage refresh={refresh} filter={page === 'failed' ? 'FAILED' : null} />;
    if (page === 'scheduled')  return <ScheduledPage refresh={refresh} />;
    return <DashboardPage refresh={refresh} onRefresh={onRefresh} setPage={setPage} />;
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13.5px' },
        success: { iconTheme: { primary: '#4f46e5', secondary: '#fff' } },
      }} />
      <Sidebar page={page} setPage={setPage} onLogout={handleLogout} />
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
              <Menu size={20} />
            </button>
          </div>
          <div className="topbar-right">
            <button className="tb-icon-btn"><Sun size={18} /></button>
            <button className="tb-icon-btn">
              <Bell size={18} />
              <span className="notif-badge">3</span>
            </button>
            <div className="tb-user">
              <div className="avatar av-sm">RS</div>
              <span>Rahul Sharma</span>
              <ChevronDown size={15} color="#6b7280" />
            </div>
          </div>
        </header>
        <main className="page fade" key={page}>
          {renderPage()}
        </main>
      </div>
    </>
  );
}
