import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { generateColdEmail, addSubject, addTemplate } from '../api/api';
import { Sparkles, Briefcase, Mail, Send, RotateCw, Copy, Save, Users, Building, FileText, UploadCloud, Plus, Edit2 } from 'lucide-react';

export default function ColdEmailGeneratorPage() {
  const [form, setForm] = useState({
    targetType: 'Recruiter / HR',
    company: '',
    contactPerson: '',
    goal: 'Referral Request',
    currentRole: '',
    experience: 'Fresher (0-1 Year)',
    skills: '',
    tone: 'Professional',
    length: 'Medium',
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [savedEmails, setSavedEmails] = useState([
    { id: 1, type: 'Referral Request - Infosys', to: 'rahul.sharma@infosys.com', date: '16 May 2025' },
    { id: 2, type: 'Internship Request - TCS', to: 'careers@tcs.com', date: '15 May 2025' },
    { id: 3, type: 'Networking - Accenture', to: 'hiring@accenture.com', date: '14 May 2025' }
  ]);

  const handleGenerate = async () => {
    if (!form.company) {
      toast.error("Please enter a Company Name");
      return;
    }
    setLoading(true);
    try {
      const res = await generateColdEmail(form);
      setResult(res.data);
      toast.success('Email Generated!');
    } catch {
      toast.error('Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      await addSubject({ text: result.subject });
      await addTemplate({ name: `${form.goal} - ${form.company}`, body: result.body });
      toast.success('Saved to your Subjects & Templates!');
      setSavedEmails([{
        id: Date.now(),
        type: `${form.goal} - ${form.company}`,
        to: form.contactPerson || 'Hiring Team',
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})
      }, ...savedEmails]);
    } catch {
      toast.error('Failed to save');
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    toast.success('Copied to clipboard!');
  };

  const setPreset = (goal) => {
    setForm(prev => ({ ...prev, goal }));
  };

  return (
    <div style={{ maxWidth: 1300 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
           AI Cold Email Generator <Sparkles size={20} color="#6C63FF" />
        </h1>
        <p style={{ color: '#6B7280', fontSize: 13.5 }}>Generate personalized cold emails for networking, internship requests, referral requests and more.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column - Form & Result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Form Card */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
               <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6C63FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>1</div>
               Enter Details
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Target Type</label>
                  <select className="inp" value={form.targetType} onChange={e=>setForm({...form, targetType: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }}>
                    <option>Recruiter / HR</option>
                    <option>Employee</option>
                    <option>Hiring Manager</option>
                    <option>Founder / CEO</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Company Name</label>
                  <input className="inp" placeholder="e.g. Infosys" value={form.company} onChange={e=>setForm({...form, company: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }} />
               </div>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Contact Person (Optional)</label>
                  <input className="inp" placeholder="e.g. Rahul Sharma" value={form.contactPerson} onChange={e=>setForm({...form, contactPerson: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }} />
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Your Goal</label>
                  <select className="inp" value={form.goal} onChange={e=>setForm({...form, goal: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }}>
                    <option>Referral Request</option>
                    <option>Internship Request</option>
                    <option>Networking</option>
                    <option>Job Inquiry</option>
                    <option>Collaboration</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Your Current Role</label>
                  <input className="inp" placeholder="e.g. Frontend Developer" value={form.currentRole} onChange={e=>setForm({...form, currentRole: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }} />
               </div>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Experience</label>
                  <select className="inp" value={form.experience} onChange={e=>setForm({...form, experience: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }}>
                    <option>Fresher (0-1 Year)</option>
                    <option>Junior (1-3 Years)</option>
                    <option>Mid-Level (3-5 Years)</option>
                    <option>Senior (5+ Years)</option>
                  </select>
               </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Key Skills (comma separated)</label>
              <input className="inp" placeholder="e.g. React.js, JavaScript, HTML, CSS" value={form.skills} onChange={e=>setForm({...form, skills: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'end' }}>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Email Tone</label>
                  <select className="inp" value={form.tone} onChange={e=>setForm({...form, tone: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }}>
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Persuasive</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Email Length</label>
                  <select className="inp" value={form.length} onChange={e=>setForm({...form, length: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }}>
                    <option>Short</option>
                    <option>Medium</option>
                    <option>Detailed</option>
                  </select>
               </div>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4B5563', marginBottom: 6, display: 'block' }}>Additional Notes (Optional)</label>
                  <input className="inp" placeholder="Any specific request or note..." value={form.additionalNotes} onChange={e=>setForm({...form, additionalNotes: e.target.value})} style={{ fontSize: 13, padding: '8px 12px' }} />
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
               <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ background: '#6C63FF', borderColor: '#6C63FF', padding: '10px 24px' }}>
                 {loading ? <RotateCw className="spin" size={16} /> : <Sparkles size={16} />}
                 {loading ? 'Generating...' : 'Generate Email'}
               </button>
            </div>
          </div>

          {/* Result Card */}
          {result && (
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6C63FF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>2</div>
                   AI Generated Email
                </h3>
                <div style={{ display: 'flex', gap: 10 }}>
                   <button className="btn btn-outline btn-sm" onClick={handleGenerate}><RotateCw size={14}/> Regenerate</button>
                   <button className="btn btn-outline btn-sm" onClick={copyToClipboard}><Copy size={14}/> Copy</button>
                   <button className="btn btn-outline btn-sm" onClick={handleSave} style={{ color: '#6C63FF', borderColor: '#EEF2FF', background: '#EEF2FF' }}><Save size={14}/> Save Template</button>
                </div>
              </div>

              <div style={{ background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: 8, padding: '20px', fontSize: 13.5 }}>
                 <div style={{ color: '#4B5563', marginBottom: 16, fontWeight: 600, paddingBottom: 16, borderBottom: '1px solid #E5E7EB' }}>
                   <span style={{ color: '#6C63FF' }}>Subject:</span> {result.subject}
                 </div>
                 <div style={{ color: '#1F2937', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                   {result.body}
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-outline" style={{ color: '#6C63FF', borderColor: '#6C63FF' }}>
                  <Send size={16}/> Send Email
                </button>
                <button className="btn btn-ghost" style={{ color: '#6B7280' }}>
                  <Edit2 size={16}/> Edit Email
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Templates & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 16 }}>Email Type Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {[
                 { title: 'Networking Email', desc: 'Build professional connections', icon: Users, color: '#6C63FF', bg: '#EEF2FF' },
                 { title: 'Internship Request', desc: 'Request internship opportunities', icon: Briefcase, color: '#10B981', bg: '#D1FAE5' },
                 { title: 'Referral Request', desc: 'Ask for job referral', icon: Sparkles, color: '#F59E0B', bg: '#FEF3C7' },
                 { title: 'Job Inquiry', desc: 'Inquire about job openings', icon: Building, color: '#3B82F6', bg: '#DBEAFE' },
                 { title: 'Collaboration', desc: 'Explore collaboration opportunities', icon: FileText, color: '#EF4444', bg: '#FEE2E2' },
               ].map((t, i) => (
                 <div key={i} onClick={() => setPreset(t.title)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }} className="hover-shadow">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: t.bg, color: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <t.icon size={18}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{t.desc}</div>
                    </div>
                    <div style={{ color: '#9CA3AF' }}>›</div>
                 </div>
               ))}
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>Saved Emails</h3>
              <button className="btn btn-ghost btn-sm" style={{ color: '#6C63FF' }}>View All</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {savedEmails.map((e, i) => (
                 <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937' }}>{e.type}</div>
                      <div style={{ display: 'flex', gap: 6, color: '#6B7280' }}>
                         <Copy size={14} style={{ cursor: 'pointer' }} />
                         <span style={{ fontSize: 14, cursor: 'pointer', marginTop: -4 }}>⋮</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>To: {e.to}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>Generated on: {e.date}</div>
                 </div>
               ))}
               <button className="btn btn-outline" style={{ marginTop: 8, borderStyle: 'dashed', color: '#6C63FF', borderColor: '#C7D2FE', background: '#EEF2FF' }}>
                 <Plus size={16}/> Create New Email
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
