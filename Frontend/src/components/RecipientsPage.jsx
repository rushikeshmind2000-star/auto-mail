import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { getRecipients, createRecipient, createRecipientsBulk, updateRecipient, deleteRecipient } from '../api/api';
import { Plus, Pencil, Trash2, Upload, Search, X } from 'lucide-react';
import { initials, getColor } from './Sidebar';

const EMPTY = { name: '', email: '', company: '', position: '', active: true };

function Av({ name }) {
  return <div style={{ width: 34, height: 34, borderRadius: '50%', background: getColor(name), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials(name)}</div>;
}

function Modal({ title, onClose, children }) {
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-h"><h3>{title}</h3><button className="modal-x" onClick={onClose}><X size={15} /></button></div>
        <div className="modal-b">{children}</div>
      </div>
    </div>,
    document.body
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

// ── Shared CSV parser ─────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  // Auto-detect and skip header row
  let start = 0;
  const firstCell = lines[0].split(',')[0].trim().toLowerCase();
  if (!firstCell.includes('@') && ['email', 'name', 'e-mail', 'mail'].includes(firstCell)) start = 1;
  return lines.slice(start).map(line => {
    // Split on commas, strip surrounding quotes
    const cols = line.split(',').map(c => c.replace(/^\s*"|"\s*$/g, '').trim());
    let email = '', name = '', company = '', position = '';
    if (cols[0] && cols[0].includes('@'))      { [email, name, company, position] = cols; }
    else if (cols[1] && cols[1].includes('@')) { [name, email, company, position] = cols; }
    else                                        { [email, name, company, position] = cols; }
    return { email: (email||'').trim(), name: (name||'').trim(), company: (company||'').trim(), position: (position||'').trim(), active: true };
  }).filter(r => r.email && r.email.includes('@'));
}

function BulkModal({ onSave, onClose }) {
  const [tab, setTab]         = useState('csv');   // 'csv' | 'notepad'
  const [file, setFile]       = useState(null);
  const [raw, setRaw]         = useState('');
  const [preview, setPreview] = useState(null);    // { count, rows }
  const [loading, setLoading] = useState(false);
  const fileRef = React.useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.endsWith('.csv')) return toast.error('Please select a .csv file');
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result);
      setPreview({ count: rows.length, rows: rows.slice(0, 3) });
    };
    reader.readAsText(f);
  };

  const handleRawChange = (e) => {
    const val = e.target.value;
    setRaw(val);
    const rows = parseCSV(val);
    setPreview(val.trim() ? { count: rows.length, rows: rows.slice(0, 3) } : null);
  };

  const submit = async () => {
    let recs = [];
    if (tab === 'csv') {
      if (!file) return toast.error('Please select a CSV file');
      const text = await file.text();
      recs = parseCSV(text);
    } else {
      if (!raw.trim()) return toast.error('Please type or paste some contacts');
      recs = parseCSV(raw);
    }
    if (!recs.length) return toast.error('No valid email rows found');
    setLoading(true);
    try {
      const r = await createRecipientsBulk(recs);
      toast.success(`✅ Imported ${r.data.length} contacts`);
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, transition: 'all .18s',
    background: active ? 'var(--primary)' : 'transparent',
    color: active ? '#fff' : 'var(--t2)',
  });

  const canImport = tab === 'csv' ? !!file : !!raw.trim();

  return (
    <Modal title="📥 Import Contacts" onClose={onClose}>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 10, padding: 4, marginBottom: 16 }}>
        <button style={tabStyle(tab === 'csv')} onClick={() => { setTab('csv'); setPreview(null); }}>
          ☁️ Upload CSV
        </button>
        <button style={tabStyle(tab === 'notepad')} onClick={() => { setTab('notepad'); setPreview(null); }}>
          📝 Notepad
        </button>
      </div>

      {tab === 'csv' ? (
        <>
          <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 12 }}>
            Columns: <b>email, name, company, position</b> &nbsp;·&nbsp;
            <span style={{ opacity: 0.75 }}>Header row auto-detected.</span>
          </p>
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile({ target: { files: [f] } }); }}
            style={{
              border: '2px dashed var(--border, #e5e7eb)', borderRadius: 10,
              padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
              background: file ? 'rgba(34,197,94,0.06)' : 'rgba(99,102,241,0.04)',
              transition: 'background 0.2s', marginBottom: 14,
            }}
          >
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleFile} />
            <Upload size={28} style={{ color: file ? '#22c55e' : '#818cf8', marginBottom: 8 }} />
            {file ? (
              <>
                <div style={{ fontWeight: 600, color: '#22c55e' }}>📄 {file.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 600, color: '#374151' }}>Click to select CSV file</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>or drag &amp; drop here</div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 8 }}>
            Type or paste contacts below — one per line, comma-separated:<br />
            <b style={{ color: '#374151' }}>email, name, company, position</b>
          </p>
          <textarea
            className="inp textarea"
            rows={9}
            placeholder={"hr@tcs.com, Rahul Verma, TCS, HR Manager\njobs@infosys.com, Priya Singh, Infosys, Recruiter\nhiring@wipro.com, Amit Sharma, Wipro, Talent Lead"}
            value={raw}
            onChange={handleRawChange}
            style={{ fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.75, marginBottom: 14 }}
            autoFocus
          />
        </>
      )}

      {/* Live Preview */}
      {preview && (
        <div style={{ background: 'rgba(99,102,241,0.07)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12.5 }}>
          <b style={{ color: '#4f46e5' }}>Preview:</b> {preview.count} valid contact{preview.count !== 1 ? 's' : ''} found
          {preview.rows.map((r, i) => (
            <div key={i} style={{ color: '#374151', marginTop: 4, opacity: 0.85 }}>
              • {r.email}{r.name ? ` — ${r.name}` : ''}{r.company ? `, ${r.company}` : ''}
            </div>
          ))}
          {preview.count > 3 && <div style={{ color: '#6b7280', marginTop: 3 }}>…and {preview.count - 3} more</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={submit} disabled={loading || !canImport}>
          {loading ? <><div className="spin"/>Importing…</> : <><Upload size={13}/>Import {preview?.count ? `(${preview.count})` : ''}</>}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function RecipientsPage({ onRefresh }) {
  const [list, setList]       = useState([]);
  const [q, setQ]             = useState('');
  const [modal, setModal]     = useState(null);
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
