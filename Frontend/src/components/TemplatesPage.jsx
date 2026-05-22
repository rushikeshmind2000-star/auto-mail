import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getBodies, createBody, updateBody, deleteBody } from '../api/api';
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-react';

function PreviewModal({ body, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>📧 {body.title}</h3><button className="modal-x" onClick={onClose}><X size={15}/></button></div>
        <div className="modal-b"><div className="preview-body">{body.content}</div></div>
      </div>
    </div>
  );
}

function BodyModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { title: '', content: '' });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ title: '', content: '' });
  }, [initial]);

  const isEdit = !!initial?.id;
  const save = async e => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Both fields required');
    setLoading(true);
    try {
      const res = isEdit ? await updateBody(form.id, form) : await createBody(form);
      toast.success(isEdit ? 'Updated!' : 'Created!'); onSave(res.data);
    } catch { toast.error('Save failed'); } finally { setLoading(false); }
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>{isEdit ? '✏️ Edit Template' : '➕ New Template'}</h3><button className="modal-x" onClick={onClose}><X size={15}/></button></div>
        <div className="modal-b">
          <form onSubmit={save}>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="fg">
                <label className="fl">Template Name <span className="req">*</span></label>
                <input className="inp" placeholder="General Application Template" value={form.title||''} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/>
              </div>
              <div className="fg">
                <label className="fl">Email Body <span className="req">*</span></label>
                <p style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 5 }}>
                  Placeholders: <code style={{background:'#f3f4f6',padding:'1px 5px',borderRadius:4}}>{'{{hr_name}}'}</code>{' '}
                  <code style={{background:'#f3f4f6',padding:'1px 5px',borderRadius:4}}>{'{{company}}'}</code>{' '}
                  <code style={{background:'#f3f4f6',padding:'1px 5px',borderRadius:4}}>{'{{role}}'}</code>
                </p>
                <textarea className="inp textarea" rows={10} style={{ minHeight: 180 }}
                  placeholder={"Dear {{hr_name}},\n\nI am writing to express my interest at {{company}}...\n\nBest regards,\nYour Name"}
                  value={form.content||''} onChange={e=>setForm(p=>({...p,content:e.target.value}))}/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <><div className="spin"/>Saving…</> : (isEdit ? 'Update' : 'Create')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage({ onRefresh }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await getBodies(); setList(r.data.sort((a,b) => b.id - a.id)); } catch {}
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onSaved = () => { load(); onRefresh(); setModal(null); };
  const del = async id => {
    if (!window.confirm('Delete?')) return;
    try { await deleteBody(id); toast.success('Deleted'); load(); onRefresh(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="page-title">Email Templates</div>
          <div className="page-sub">Cover letter & body templates with placeholders</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal('add'); }}>
          <Plus size={14}/>New Template
        </button>
      </div>
      <div className="card">
        {loading ? <div className="loading"><div className="ring"/></div>
        : list.length === 0
          ? <div className="empty"><div className="empty-ico">✉️</div><h3>No templates yet</h3><p>Create templates with {`{{hr_name}}`} placeholders.</p></div>
          : <div className="tbl-wrap"><table>
            <thead><tr><th>#</th><th>Template Name</th><th>Preview</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((b, i) => (
                <tr key={b.id}>
                  <td className="mono">{i+1}</td>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td className="t2" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.content}</td>
                  <td><div className="action-btns">
                    <button className="act-btn view" onClick={() => setPreviewing(b)}><Eye size={13}/></button>
                    <button className="act-btn edit" onClick={() => { setEditing(b); setModal('edit'); }}><Pencil size={13}/></button>
                    <button className="act-btn del" onClick={() => del(b.id)}><Trash2 size={13}/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        }
      </div>
      {(modal==='add'||modal==='edit') && <BodyModal initial={modal==='edit'?editing:null} onSave={onSaved} onClose={()=>setModal(null)}/>}
      {previewing && <PreviewModal body={previewing} onClose={() => setPreviewing(null)}/>}
    </div>
  );
}
