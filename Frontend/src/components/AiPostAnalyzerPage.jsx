import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { analyzePost, createSubject, createBody } from '../api/api';
import { Sparkles, Copy, Mail, Building, Briefcase, MapPin, Clock, Save, Send } from 'lucide-react';

const copyText = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

export default function AiPostAnalyzerPage({ setPage }) {
  const [postText, setPostText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!postText.trim()) return toast.error('Please paste a job post or hiring information.');
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzePost({ postText, yourName: 'Rahul Sharma' }); // Using a default name for now, could be dynamic
      setResult(res.data);
      toast.success('Generated successfully!');
    } catch (e) {
      toast.error('Failed to analyze post');
    } finally {
      setLoading(false);
    }
  };

  const saveTemplates = async () => {
    if (!result) return;
    try {
      await createSubject({ title: `Auto: ${result.role}`, content: result.subject });
      await createBody({ title: `Auto: ${result.role} Application`, content: result.emailBody });
      toast.success('Subject and Email Body saved to Templates!');
    } catch {
      toast.error('Failed to save templates');
    }
  };

  const useThisContent = () => {
      // You can store it in local storage or state to pass to the Send Campaign page, but for now just navigate
      setPage('send');
  };

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1F2937', marginBottom: 4 }}>✨ AI Post Analyzer</h1>
        <p style={{ color: '#6B7280', fontSize: 13.5 }}>Paste any job post or hiring information and let AI generate a professional email for you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        
        {/* ── Left Side: Input ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: '24px 26px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Sparkles size={16} color="#6C63FF" /> 1. Paste Job Post / Hiring Information
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>Paste the job post text, LinkedIn post, or any hiring information below.</p>
            
            <textarea 
              className="inp textarea" 
              rows={16} 
              placeholder="We are hiring Frontend Developers to join our dynamic team..."
              value={postText}
              onChange={e => setPostText(e.target.value)}
              style={{ fontSize: 13.5, minHeight: 350 }}
            />
            
            <div style={{ textAlign: 'right', fontSize: 12, color: '#9CA3AF', marginTop: 8, marginBottom: 16 }}>
              {postText.length}/5000
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', background: '#6C63FF', borderColor: '#6C63FF', fontSize: 14 }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <><div className="spin"/> Generating…</> : <><Sparkles size={16}/> Generate with AI</>}
            </button>
          </div>

          {/* Extracted Info Card (shows after generation) */}
          {result && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Building size={16} color="#6C63FF" /> Extracted Information (AI)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#EEF2FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5' }}><Mail size={16}/></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#6C63FF' }}>Company Email</div>
                    <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{result.companyEmail}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#F0FDF4', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}><Briefcase size={16}/></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>Role</div>
                    <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{result.role}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#FFFBEB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}><Clock size={16}/></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#D97706' }}>Experience</div>
                    <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{result.experience}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: '#FEF2F2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}><MapPin size={16}/></div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#DC2626' }}>Location</div>
                    <div style={{ fontSize: 13, color: '#1F2937', fontWeight: 500 }}>{result.location}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                 <div style={{ fontSize: 11, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>Key Skills</div>
                 <div style={{ fontSize: 13, color: '#6B7280' }}>
                   {result.skills && result.skills.length > 0 ? result.skills.join(', ') : 'Not explicitly mentioned'}
                 </div>
              </div>

            </div>
          )}
        </div>

        {/* ── Right Side: Generated Outputs ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {result ? (
            <>
              <div className="card" style={{ padding: '24px 26px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="#6C63FF" /> 2. AI Generated Outputs
                </h3>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} color="#6C63FF" /> Subject
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => copyText(result.subject)} style={{ padding: '4px 10px', fontSize: 12, borderColor: '#E5E7EB', color: '#6B7280' }}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div style={{ padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, color: '#1F2937', background: '#F9FAFB' }}>
                    {result.subject}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Mail size={14} color="#6C63FF" /> Email Body
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => copyText(result.emailBody)} style={{ padding: '4px 10px', fontSize: 12, borderColor: '#E5E7EB', color: '#6B7280' }}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, color: '#1F2937', background: '#F9FAFB', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {result.emailBody}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: '24px 26px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1F2937', display: 'flex', alignItems: 'center', gap: 6 }}>
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                       LinkedIn / Short Message (Optional)
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={() => copyText(result.linkedinMessage)} style={{ padding: '4px 10px', fontSize: 12, borderColor: '#E5E7EB', color: '#6B7280' }}>
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                  <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13.5, color: '#1F2937', background: '#F9FAFB', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {result.linkedinMessage}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
                  <button className="btn btn-ghost" onClick={handleGenerate} style={{ flex: 1, justifyContent: 'center' }}>
                    <Sparkles size={14}/> Regenerate
                  </button>
                  <button className="btn btn-outline" onClick={saveTemplates} style={{ flex: 1, justifyContent: 'center', borderColor: '#6C63FF', color: '#6C63FF' }}>
                    <Save size={14}/> Save as Template
                  </button>
                  <button className="btn btn-primary" onClick={useThisContent} style={{ flex: 1, justifyContent: 'center', background: '#6C63FF', borderColor: '#6C63FF' }}>
                    <Send size={14}/> Use This Content
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, color: '#9CA3AF', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, background: '#EEF2FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={32} color="#6C63FF" />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1F2937', marginBottom: 4 }}>AI-Powered</h3>
                  <p style={{ fontSize: 13, maxWidth: 220 }}>Generate professional emails instantly from any job post.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
