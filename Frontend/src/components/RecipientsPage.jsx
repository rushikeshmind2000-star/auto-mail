import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getRecipients, createRecipient, createRecipientsBulk, updateRecipient, deleteRecipient } from '../api/api';
import { Plus, Pencil, Trash2, Upload, Search, X, Users } from 'lucide-react';
import { initials, getColor } from './Sidebar';

const EMPTY = { name: '', email: '', company: '', position: '', active: true };

function Av({ name }) {
  return <div style={{ width: 34, height: 34, borderRadius: '50%', background: getColor(name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials(name)}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>{title}</h3><button className="modal-x" onClick={onClose}><X size={15} /></button></div>
        <div className="modal-b">{children}</div>
      </div>
    </div>
  );
}

function RecipientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (initial) setForm(initial);
    else setForm(EMPTY);
  }, [initial]);

  const isEdit = !!initial?.id;
  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault();
    if (!form.email) return toast.error('Email required');
    setLoading(true);
    try {
      const res = isEdit ? await updateRecipient(form.id, form) : await createRecipient(form);
      toast.success(isEdit ? 'Updated!' : 'Added!'); 
      onSave(res?.data);
    } catch (err) { 
      console.error(err);
      toast.error(err.response?.data?.message || 'Save failed'); 
    } finally { 
      setLoading(false); 
    }
  };
  return (
    <Modal title={isEdit ? '✏️ Edit Contact' : '➕ Add HR Contact'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid form-2" style={{ marginBottom: 16 }}>
          {[['name','HR Name','Rahul Verma'],['email','Email *','hr@company.com'],['company','Company','TCS'],['position','Position','HR Recruiter']].map(([k,l,ph]) => (
            <div className="fg" key={k}>
              <label className="fl">{l}</label>
              <input name={k} className="inp" placeholder={ph} value={form[k]||''} onChange={ch} type={k==='email'?'email':'text'} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <><div className="spin"/>Saving…</> : <>{isEdit?'Update':'Add Contact'}</>}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function BulkModal({ onSave, onClose }) {
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return toast.error('Paste at least one line');
    const recs = lines.map(line => { const p = line.split(',').map(x => x.trim()); return { email: p[0], name: p[1]||'', company: p[2]||'', position: p[3]||'', active: true }; });
    setLoading(true);
    try { const r = await createRecipientsBulk(recs); toast.success(`Imported ${r.data.length} contacts`); onSave(); }
    catch { toast.error('Import failed'); } finally { setLoading(false); }
  };
  return (
    <Modal title="📥 Bulk Import" onClose={onClose}>
      <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 10 }}>Format per line: <b>email, name, company, position</b></p>
      <textarea className="inp textarea" rows={7} placeholder={"hr@tcs.com, Rahul Verma, TCS, HR\njobs@infosys.com, Priya Singh, Infosys, Recruiter"} value={raw} onChange={e => setRaw(e.target.value)} />
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? <><div className="spin"/>Importing…</> : <><Upload size={13}/>Import</>}</button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function RecipientsPage({ onRefresh }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { const r = await getRecipients(); setList(r.data.sort((a,b) => b.id - a.id)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const filtered = q ? list.filter(r => [r.email,r.name,r.company].some(v => v?.toLowerCase().includes(q.toLowerCase()))) : list;
  const onSaved = () => { load(); if(onRefresh) onRefresh(); setModal(null); };
  const del = async id => { 
    try { 
      await deleteRecipient(id); 
      toast.success('Deleted'); 
      load(); 
      if(onRefresh) onRefresh(); 
    } catch (err) { 
      console.error(err);
      toast.error('Failed to delete'); 
    } 
  };

  return (
    <div>
      <div className="page-hd">
        <div>
          <div className="page-title">Recipients (HRs)</div>
          <div className="page-sub">{list.length} total contacts</div>
        </div>
        <div className="hd-actions">
          <div className="search-bar"><Search className="search-ico" size={14}/><input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)}/></div>
          <button className="btn btn-ghost" onClick={() => setModal('import')}><Upload size={14}/>Import CSV</button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setModal('add'); }}><Plus size={14}/>Add Recipient</button>
        </div>
      </div>
      <div className="card">
        {loading ? <div className="loading"><div className="ring"/></div>
        : filtered.length === 0 ? <div className="empty"><div className="empty-ico">👥</div><h3>{q ? 'No results' : 'No contacts yet'}</h3><p>Add your first HR contact.</p></div>
        : <div className="tbl-wrap"><table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Company</th><th>Position</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.id}>
                <td className="mono">{i+1}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Av name={r.name||r.email}/><div><div style={{ fontWeight: 600 }}>{r.name||'—'}</div></div></div></td>
                <td className="t2">{r.email}</td>
                <td className="t2">{r.company||'—'}</td>
                <td className="t2">{r.position||'—'}</td>
                <td><span className={`badge ${r.active ? 'badge-green' : 'badge-gray'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                <td><div className="action-btns">
                  <button className="act-btn edit" onClick={() => { setEditing(r); setModal('edit'); }}><Pencil size={13}/></button>
                  <button className="act-btn del" onClick={() => del(r.id)}><Trash2 size={13}/></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </div>
      {(modal==='add'||modal==='edit') && <RecipientModal initial={modal==='edit'?editing:null} onSave={onSaved} onClose={()=>setModal(null)}/>}
      {modal==='import' && <BulkModal onSave={onSaved} onClose={()=>setModal(null)}/>}
    </div>
  );
}
