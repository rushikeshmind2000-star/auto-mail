import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { loginUser, registerUser } from '../api/api';

// SVG Icons - professional, no emojis
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-5.54"/>
  </svg>
);
const IconMailInput = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconEye = ({ open }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FEATURES = [
  { Icon: IconUsers,   title: 'AI HR Finder',           desc: 'Find and connect with the right recruiters' },
  { Icon: IconMail,    title: 'AI Cold Email Generator', desc: 'Generate personalized emails in seconds' },
  { Icon: IconBell,    title: 'Smart Job Alerts',        desc: 'Get job alerts that match your skills' },
  { Icon: IconBarChart,title: 'Application Tracking',    desc: 'Track applications and email opens' },
  { Icon: IconRefresh, title: 'Auto Follow-Up',          desc: 'Never miss a follow-up again' },
];

function InputField({ label, type, placeholder, value, onChange, children, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', letterSpacing: 0.1 }}>{label}</label>
        {rightSlot}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        border: `1.5px solid ${focused ? '#4F46E5' : '#E5E7EB'}`,
        borderRadius: 10, padding: '10px 14px',
        background: 'white', transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focused ? '0 0 0 3px rgba(79,70,229,0.08)' : 'none'
      }}>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{children}</div>
        <input
          type={type} placeholder={placeholder} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#1F2937', background: 'transparent', fontFamily: 'inherit' }}
        />
      </div>
    </div>
  );
}

export default function LoginPage({ onLogin }) {
  const [tab, setTab]           = useState('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [suName, setSuName]     = useState('');
  const [suEmail, setSuEmail]   = useState('');
  const [suPass, setSuPass]     = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please enter your credentials'); return; }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      const data = res.data;
      if (data.success) {
        if (remember) localStorage.setItem('joblith_auth', JSON.stringify(data.user));
        toast.success('Login successful. Welcome back.');
        onLogin(data.user);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipLogin = () => {
    toast.success('Continuing as Guest');
    onLogin({
      id: 1,
      fullName: 'Guest User',
      email: 'guest@joblith.ai',
      role: 'user'
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!suName || !suEmail || !suPass) { toast.error('Please fill all fields'); return; }
    try {
      const res = await registerUser({ fullName: suName, email: suEmail, password: suPass });
      if (res.data.success) {
        toast.success('Account created! Please log in.');
        setTab('login'); setEmail(suEmail);
      } else {
        toast.error(res.data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Server error.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: '#F1F5F9'
    }}>
      {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
      <div style={{
        width: 440, minWidth: 400, flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(155deg, #0A0720 0%, #14105C 40%, #1E1280 70%, #0D1756 100%)',
        padding: '52px 44px 44px',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }} />
        {/* Glow blobs */}
        <div style={{ position: 'absolute', top: -40, right: -60, width: 260, height: 260, borderRadius: '50%', background: 'rgba(99,102,241,0.14)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 80, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48, zIndex: 1 }}>
          <img src="/joblith-logo.png" alt="Joblith AI"
            style={{ height: 65, objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'}
          />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>
              JobLith <span style={{ color: '#818CF8' }}>AI</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', letterSpacing: 0.3, marginTop: 2 }}>
              AI Powered Career Automation Platform
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ zIndex: 1, marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.3, letterSpacing: -0.5 }}>
            Smarter Tools.<br />Better Connections.
          </h2>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#818CF8', margin: '4px 0 16px', letterSpacing: -0.5 }}>
            Faster Opportunities.
          </h2>
          <p style={{ color: '#94A3B8', fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>
            Automate your job search, connect with recruiters and get hired faster with AI.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, zIndex: 1 }}>
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(129,140,248,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#818CF8'
              }}>
                <Icon />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'white', marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom branding */}
        <div style={{ marginTop: 'auto', paddingTop: 40, zIndex: 1 }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />
          <div style={{ fontSize: 11.5, color: '#475569', letterSpacing: 0.2 }}>
            © 2026 Joblith AI · RSM Innovatives Pvt Ltd
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'white', borderRadius: 20,
          boxShadow: '0 4px 32px rgba(0,0,0,0.07)', padding: '44px 40px'
        }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: -0.4 }}>
              Welcome Back
            </h1>
            <p style={{ color: '#64748B', fontSize: 13.5, marginTop: 6 }}>
              Sign in to your Joblith AI account
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#F8FAFC', borderRadius: 10, padding: 4, marginBottom: 28, gap: 4 }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '9px 0',
                background: tab === t ? 'white' : 'transparent',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit',
                color: tab === t ? '#4F46E5' : '#94A3B8',
                boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}>
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Demo hint */}
              <div style={{
                background: '#EEF2FF', border: '1px solid #C7D2FE',
                borderRadius: 8, padding: '9px 14px', fontSize: 12.5,
                color: '#4338CA', display: 'flex', justifyContent: 'center', gap: 6
              }}>
                <span style={{ fontWeight: 500 }}>Demo:</span>
                <span>admin@joblith.ai</span>
                <span style={{ color: '#A5B4FC' }}>/</span>
                <span>joblith123</span>
              </div>

              {/* Email */}
              <InputField label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}>
                <IconMailInput />
              </InputField>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>Password</label>
                  <span style={{ fontSize: 12.5, color: '#4F46E5', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => toast('Contact admin@joblith.ai to reset password.', { icon: null })}>
                    Forgot Password?
                  </span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 14px',
                  background: 'white'
                }}>
                  <IconLock />
                  <input
                    type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13.5, color: '#1F2937', background: 'transparent', fontFamily: 'inherit' }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <IconEye open={showPass} />
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <div
                  onClick={() => setRemember(r => !r)}
                  style={{
                    width: 17, height: 17, borderRadius: 5, flexShrink: 0, cursor: 'pointer',
                    background: remember ? '#4F46E5' : 'white',
                    border: `2px solid ${remember ? '#4F46E5' : '#D1D5DB'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                >
                  {remember && <IconCheck />}
                </div>
                <span style={{ fontSize: 13.5, color: '#374151', fontWeight: 500 }}>Remember me</span>
              </label>

              {/* Login Button */}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px 20px', fontFamily: 'inherit',
                background: loading ? '#A5B4FC' : 'linear-gradient(135deg, #4338CA, #6366F1)',
                color: 'white', border: 'none', borderRadius: 11,
                fontSize: 14.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
                letterSpacing: 0.2, transition: 'all 0.2s'
              }}>
                {loading ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                ) : (
                  <><span>Log In</span><IconArrow /></>
                )}
              </button>

              {/* Skip Login Button */}
              <button type="button" onClick={handleSkipLogin} style={{
                width: '100%', padding: '13px 20px', fontFamily: 'inherit',
                background: 'white', color: '#4F46E5',
                border: '1.5px solid #E5E7EB', borderRadius: 11,
                fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                letterSpacing: 0.2, transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.background = '#FAFBFF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}>
                <span>Skip Login</span>
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                <span style={{ fontSize: 12, color: '#94A3B8', letterSpacing: 0.2 }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
              </div>

              {/* Social Buttons */}
              {[
                {
                  label: 'Continue with Google',
                  logo: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                },
                {
                  label: 'Continue with LinkedIn',
                  logo: <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                }
              ].map((s, i) => (
                <button key={i} type="button"
                  onClick={() => toast.error('Social login not available in demo mode.')}
                  style={{
                    width: '100%', padding: '12px', border: '1.5px solid #E5E7EB', borderRadius: 11,
                    background: 'white', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    fontSize: 13.5, fontWeight: 600, color: '#1F2937', transition: 'border-color 0.2s, background 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#C7D2FE'; e.currentTarget.style.background = '#FAFBFF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}
                >
                  {s.logo} {s.label}
                </button>
              ))}

              <p style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                By signing in, you agree to our{' '}
                <span style={{ color: '#4F46E5', cursor: 'pointer', fontWeight: 500 }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: '#4F46E5', cursor: 'pointer', fontWeight: 500 }}>Privacy Policy</span>.
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { label: 'Full Name', ph: 'Your full name', val: suName, set: setSuName, type: 'text' },
                { label: 'Email Address', ph: 'you@email.com', val: suEmail, set: setSuEmail, type: 'email' },
                { label: 'Password', ph: 'Create a strong password', val: suPass, set: setSuPass, type: 'password' },
              ].map(({ label, ph, val, set, type }) => (
                <div key={label}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: 7 }}>{label}</label>
                  <input type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13.5, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1F2937' }}
                    onFocus={e => { e.target.style.borderColor = '#4F46E5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              ))}
              <button type="submit" style={{
                width: '100%', padding: '13px', fontFamily: 'inherit',
                background: 'linear-gradient(135deg, #4338CA, #6366F1)', color: 'white',
                border: 'none', borderRadius: 11, fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(79,70,229,0.3)', letterSpacing: 0.2
              }}>
                Create Account
              </button>
              <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', margin: 0 }}>
                Already have an account?{' '}
                <span style={{ color: '#4F46E5', cursor: 'pointer', fontWeight: 600 }} onClick={() => setTab('login')}>Log In</span>
              </p>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
