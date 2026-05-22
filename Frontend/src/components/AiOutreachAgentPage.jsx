import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { generateOutreach, getRecipients } from '../api/api';
import { Bot, User, Briefcase, FileText, Settings, Search, Edit2, Copy, Send, HelpCircle, Building, Save } from 'lucide-react';

const copyText = (text) => { navigator.clipboard.writeText(text); toast.success('Copied to clipboard!'); };

export default function AiOutreachAgentPage() {
  const [profile, setProfile] = useState({
    name: 'Rahul Sharma',
    role: 'Frontend Developer',
    experience: 'Fresher',
    totalExp: '0 - 1 Year',
    location: 'Bangalore',
    skills: 'React.js, JavaScript, HTML, CSS, Tailwind CSS, Git, REST APIs, Bootstrap'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [prefs, setPrefs] = useState({
    goal: 'Looking for Referrals',
    tone: 'Professional',
    length: 'Medium'
  });

  const [recipients, setRecipients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedHr, setSelectedHr] = useState(null);
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRecipients().then(res => setRecipients(res.data)).catch(console.error);
  }, []);

  const handleGenerate = async (hr) => {
    if (!hr) return;
    setLoading(true);
    try {
      const payload = {
        candidateName: profile.name,
        candidateSkills: profile.skills.split(',').map(s => s.trim()),
        targetRole: profile.role,
        experienceLevel: profile.experience,
        hrName: hr.name,
        company: hr.company,
        tone: prefs.tone,
        goal: prefs.goal
      };
      const res = await generateOutreach(payload);
      setMessage(res.data.message);
      setSelectedHr(hr);
    } catch {
      toast.error('Failed to generate message');
    } finally {
      setLoading(false);
    }
  };

  const handleHrSelect = (hr) => {
    handleGenerate(hr);
  };

  const applyModifier = (mod) => {
    setPrefs(p => ({ ...p, tone: mod }));
    if (selectedHr) handleGenerate(selectedHr);
  };

  const filtered = recipients.filter(r => 
    (r.name && r.name.toLowerCase().includes(search.toLowerCase())) || 
    (r.company && r.company.toLowerCase().includes(search.toLowerCase()))
  );

  const openLinkedIn = () => {
    if (!selectedHr || !selectedHr.name) return toast.error('Select an HR first');
    const query = `${selectedHr.name} ${selectedHr.company || ''}`.trim();
    window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bot size={24} color="#6C63FF" /> AI Outreach Agent <span style={{ fontSize: 11, background: '#EEF2FF', color: '#6C63FF', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>Feature 4</span>
          </h1>
          <p style={{ color: '#6B7280', fontSize: 13.5 }}>AI will message HRs on your behalf for referrals and job opportunities.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
           <HelpCircle size={20} color="#9CA3AF" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* ── Column 1: Profile & Preferences ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>1. Your Profile</h3>
            <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>Add your details to personalize messages.</p>
            
            {isEditingProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <input className="inp" style={{ fontSize: 13, padding: '6px 10px' }} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Name" />
                <input className="inp" style={{ fontSize: 13, padding: '6px 10px' }} value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} placeholder="Role" />
                <input className="inp" style={{ fontSize: 13, padding: '6px 10px' }} value={profile.experience} onChange={e => setProfile({...profile, experience: e.target.value})} placeholder="Experience Level (e.g. Fresher)" />
                <input className="inp" style={{ fontSize: 13, padding: '6px 10px' }} value={profile.totalExp} onChange={e => setProfile({...profile, totalExp: e.target.value})} placeholder="Total Exp (e.g. 0-1 Year)" />
                <textarea className="inp" style={{ fontSize: 13, padding: '6px 10px', minHeight: 60 }} value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="Skills (comma separated)" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EEF2FF', color: '#6C63FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1F2937' }}>{profile.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{profile.role}</div>
                    <div style={{ fontSize: 11, color: '#6C63FF', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginTop: 2 }} onClick={() => setIsEditingProfile(true)}>
                       <Edit2 size={10} /> Edit Profile
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Experience Level</span>
                    <span style={{ color: '#1F2937', fontWeight: 500 }}>{profile.experience}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Total Experience</span>
                    <span style={{ color: '#1F2937', fontWeight: 500 }}>{profile.totalExp}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: 8 }}>Skills</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {profile.skills.split(',').map(s => s.trim() ? (
                        <span key={s} style={{ background: '#EEF2FF', color: '#6C63FF', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{s.trim()}</span>
                      ) : null)}
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <button 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: 20, fontSize: 12.5, borderColor: isEditingProfile ? '#6C63FF' : '#E5E7EB', color: isEditingProfile ? '#6C63FF' : '#4B5563', background: isEditingProfile ? '#EEF2FF' : 'transparent' }} 
              onClick={() => {
                if (isEditingProfile) toast.success("Profile Updated!");
                setIsEditingProfile(!isEditingProfile);
              }}
            >
              {isEditingProfile ? <Save size={12} /> : <Edit2 size={12} />} 
              {isEditingProfile ? 'Save Profile' : 'Update Profile'}
            </button>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>Message Preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Goal</label>
                <select className="inp" value={prefs.goal} onChange={e => setPrefs({...prefs, goal: e.target.value})} style={{ padding: '6px 10px', fontSize: 13 }}>
                  <option>Looking for Referrals</option>
                  <option>Asking for Openings</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Tone</label>
                <select className="inp" value={prefs.tone} onChange={e => setPrefs({...prefs, tone: e.target.value})} style={{ padding: '6px 10px', fontSize: 13 }}>
                  <option>Professional</option>
                  <option>Friendly</option>
                  <option>Short</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 20, fontSize: 13, background: '#6C63FF', borderColor: '#6C63FF' }} onClick={() => selectedHr && handleGenerate(selectedHr)}>
              Save Preferences
            </button>
          </div>
        </div>

        {/* ── Column 2: HR List ── */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '650px' }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 6 }}>2. Select HRs / Recruiters</h3>
          <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>Choose HR to generate AI message.</p>
          
          <div className="search-bar" style={{ marginBottom: 16, width: '100%' }}>
            <Search className="search-ico" size={14} />
            <input placeholder="Search HR by name, company..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 13 }} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>No HRs found. Add some from AI HR Finder.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280' }}>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 500 }}>HR / Recruiter</th>
                    <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 500 }}>Company</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(hr => (
                    <tr key={hr.id} 
                        style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: selectedHr?.id === hr.id ? '#F9FAFB' : 'transparent' }}
                        onClick={() => handleHrSelect(hr)}>
                      <td style={{ padding: '10px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <input type="radio" checked={selectedHr?.id === hr.id} readOnly style={{ accentColor: '#6C63FF' }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1F2937' }}>{hr.name || 'Unknown'}</div>
                            <div style={{ fontSize: 11, color: '#6B7280' }}>{hr.position || 'Recruiter'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 0', color: '#1F2937' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           <Building size={12} color="#6C63FF"/>
                           {hr.company || '—'}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Column 3: AI Message Preview ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '20px', minHeight: 450, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>3. AI Generated Message Preview</h3>
                <p style={{ fontSize: 12, color: '#6B7280' }}>AI will personalize messages for selected HR.</p>
              </div>
              {selectedHr && (
                <button className="btn btn-outline btn-sm" onClick={() => handleGenerate(selectedHr)} style={{ fontSize: 12, color: '#6C63FF', borderColor: '#EEF2FF', background: '#EEF2FF' }}>
                  <Bot size={12} /> Regenerate
                </button>
              )}
            </div>

            <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>To: {selectedHr ? `${selectedHr.name} (${selectedHr.company})` : 'Select an HR'}</div>
                <div style={{ color: '#0A66C2' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </div>
              </div>
              
              <div style={{ padding: '16px', flex: 1, fontSize: 13.5, color: '#1F2937', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {loading ? (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><div className="spin" style={{ borderColor: '#6C63FF', borderTopColor: 'transparent' }}/></div>
                ) : message ? message : (
                  <div style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>Select an HR to generate a personalized outreach message.</div>
                )}
              </div>
              
              {message && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #E5E7EB', background: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF' }}>{message.split(' ').length} words</div>
                  <button className="btn btn-outline btn-sm" onClick={() => copyText(message)} style={{ fontSize: 12 }}>
                    <Copy size={12} /> Copy Message
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1F2937', marginBottom: 12 }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => applyModifier('Short')} style={{ flex: 1, fontSize: 11, padding: '6px', flexDirection: 'column', gap: 4, color: '#6B7280' }}>
                   Shorten
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => applyModifier('Professional')} style={{ flex: 1, fontSize: 11, padding: '6px', flexDirection: 'column', gap: 4, color: '#6B7280' }}>
                   Make it Formal
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => applyModifier('Friendly')} style={{ flex: 1, fontSize: 11, padding: '6px', flexDirection: 'column', gap: 4, color: '#6B7280' }}>
                   More Friendly
                </button>
              </div>
            </div>

            {/* Send Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn btn-outline" onClick={openLinkedIn} style={{ flex: 1, justifyContent: 'center', color: '#0A66C2', borderColor: '#E5E7EB' }}>
                Open LinkedIn
              </button>
              <button className="btn btn-primary" onClick={() => copyText(message)} disabled={!message} style={{ flex: 1, justifyContent: 'center', background: '#6C63FF', borderColor: '#6C63FF' }}>
                <Send size={14} /> Copy & Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
