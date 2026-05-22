import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>{title}</h3><button className="modal-x" onClick={onClose}><X size={15}/></button></div>
        <div className="modal-b">{children}</div>
      </div>
    </div>
  );
}

function SubjModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { title: '', content: '' });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (initial) setForm(initial);
    else setForm({ title: '', content: '' });
  }, [initial]);

  const isEdit = !!initial?.id;
  const save = async e => {
    e.preventDefault();
    if (!form.content) return toast.error('Subject line required');
    setLoading(true);
    try {
      const res = isEdit ? await updateSubject(form.id, form) : await createSubject(form);
      toast.success(isEdit ? 'Updated!' : 'Created!'); onSave(res.data);
    } catch { toast.error('Save failed'); } finally { setLoading(false); }
  };
  return (
    <Modal title={isEdit ? '✏️ Edit Subject' : '➕ New Subject'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="form-grid" style={{ marginBottom: 16 }}>
          <div className="fg">
            <label className="fl">Label / Tag</label>
            <input className="inp" placeholder="e.g. Frontend Role" value={form.title||''} onChange={e => setForm(p=>({...p,title:e.target.value}))}/>
          </div>
          <div className="fg">
            <label className="fl">Subject Line <span className="req">*</span></label>
            <input className="inp" placeholder="Application for Frontend Developer Role" value={form.content||''} onChange={e => setForm(p=>({...p,content:e.target.value}))}/>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading?<><div className="spin"/>Saving…</>:(isEdit?'Update':'Create')}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

export default function SubjectsPage({ onRefresh }) {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { const r = await getSubjects(); setList(r.data.sort((a,b) => b.id - a.id)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const onSaved = () => { load(); onRefresh(); setModal(null); };
  const del = async id => {
    if (!window.confirm('Delete?')) return;
    try { await deleteSubject(id); toast.success('Deleted'); load(); onRefresh(); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="page-title">Subjects</div>
          <div className="page-sub">{list.length} subject templates</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal('add'); }}><Plus size={14}/>New Subject</button>
      </div>
      <div className="card">
        {loading ? <div className="loading"><div className="ring"/></div>
        : list.length === 0 ? <div className="empty"><div className="empty-ico">📝</div><h3>No subjects yet</h3><p>Create subject templates for your campaigns.</p></div>
        : <div className="tbl-wrap"><table>
          <thead><tr><th>#</th><th>Label</th><th>Subject Line</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map((s, i) => (
              <tr key={s.id}>
                <td className="mono">{i+1}</td>
                <td><span className="badge badge-blue">{s.title||'—'}</span></td>
                <td style={{ fontWeight: 500 }}>{s.content}</td>
                <td><div className="action-btns">
                  <button className="act-btn edit" onClick={()=>{setEditing(s);setModal('edit');}}><Pencil size={13}/></button>
                  <button className="act-btn del" onClick={()=>del(s.id)}><Trash2 size={13}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </div>
      {(modal==='add'||modal==='edit') && <SubjModal initial={modal==='edit'?editing:null} onSave={onSaved} onClose={()=>setModal(null)}/>}
    </div>
  );
}
