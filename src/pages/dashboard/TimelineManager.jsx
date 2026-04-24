import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';

const EMPTY = { year: '', tag: 'TONGGAK', title: '', description: '' };
const TAG_OPTIONS = ['TONGGAK', 'ADVOKASI', 'RISET', 'PROGRAM', 'PUBLIKASI'];

function trim(f) {
  return { year: f.year.trim(), tag: f.tag.trim(), title: f.title.trim(), description: f.description.trim() };
}

function Row({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    year: item.year, tag: item.tag, title: item.title, description: item.description,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!form.year.trim() || !form.title.trim()) { setErr('Tahun dan judul wajib diisi'); return; }
    setSaving(true); setErr('');
    try { await onUpdate(item.id, trim(form)); setEditing(false); }
    catch (e) { setErr(e?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
      <div className="shrink-0 pt-0.5">
        <span className="inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg leading-tight whitespace-nowrap">
          {item.year}
        </span>
      </div>
      <div className="w-px self-stretch bg-slate-200 shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-[100px_140px_1fr] gap-2.5">
              <input className={inputCls} placeholder="Tahun" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} disabled={saving} />
              <select className={inputCls} value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} disabled={saving}>
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className={inputCls} placeholder="Judul tonggak" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} disabled={saving} />
            </div>
            <textarea className={inputCls} rows={3} placeholder="Deskripsi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={saving} />
            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>
        ) : (
          <>
            <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase block mb-1">{item.tag}</span>
            <p className="font-semibold text-slate-800 text-sm leading-snug">{item.title}</p>
            {item.description && <p className="text-xs text-slate-500 leading-relaxed mt-1">{item.description}</p>}
          </>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        {editing ? (
          <>
            <button onClick={save} disabled={saving} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md disabled:opacity-60 inline-flex items-center gap-1.5">
              {saving && <Spinner small />} Simpan
            </button>
            <button onClick={() => { setForm({ year: item.year, tag: item.tag, title: item.title, description: item.description }); setErr(''); setEditing(false); }} disabled={saving} className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-md border border-slate-200">Batal</button>
          </>
        ) : confirmDel ? (
          <>
            <button onClick={() => { onDelete(item.id); setConfirmDel(false); }} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md">Hapus</button>
            <button onClick={() => setConfirmDel(false)} className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-md border border-slate-200">Batal</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="text-xs font-semibold text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-md border border-orange-100 hover:border-orange-300">Edit</button>
            <button onClick={() => setConfirmDel(true)} className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md border border-red-100 hover:border-red-300">Hapus</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TimelineManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { const rows = await api('/milestones'); setList(Array.isArray(rows) ? rows : []); }
    catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.year.trim() || !form.title.trim()) { setFormError('Tahun dan judul wajib diisi'); return; }
    setSubmitting(true); setFormError('');
    try {
      const created = await api('/milestones', { method: 'POST', body: JSON.stringify(trim(form)) });
      setList(prev => [...prev, created]);
      setForm(EMPTY); setShowForm(false);
      setToast('Tonggak ditambahkan');
    } catch (err) { setFormError(err?.message || 'Gagal menyimpan'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id, data) => {
    const updated = await api(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setList(prev => prev.map(m => m.id === id ? updated : m));
    setToast('Tonggak diperbarui');
    return updated;
  };

  const handleDelete = async (id) => {
    try {
      await api(`/milestones/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(m => m.id !== id));
      setToast('Tonggak dihapus');
    } catch (err) { setToast(err?.message || 'Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perjalanan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola tonggak sejarah yang tampil di halaman Profil.</p>
        </div>
        {!showForm && <button onClick={() => { setShowForm(true); setFormError(''); }} className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">+ Tambah tonggak</button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[140px_180px_1fr] gap-4">
            <Field label="Tahun"><input className={inputCls} value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="cth: 2016 atau 2016–2017" disabled={submitting} /></Field>
            <Field label="Tag">
              <select className={inputCls} value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} disabled={submitting}>
                {TAG_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Judul tonggak"><input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} disabled={submitting} /></Field>
          </div>
          <Field label="Deskripsi"><textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={submitting} /></Field>
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {submitting && <Spinner small />} {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); setFormError(''); }} disabled={submitting} className="text-sm font-medium text-slate-600 px-4 py-2">Batal</button>
          </div>
        </form>
      )}

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm"><ErrorState message="Gagal memuat perjalanan" onRetry={load} /></div>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse flex gap-4">
            <div className="w-20 h-4 bg-slate-100 rounded" />
            <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/2" /><div className="h-2.5 bg-slate-100 rounded w-3/4" /></div>
          </div>
        ))}</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada tonggak.</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan tonggak pertama di atas.</p>
        </div>
      ) : (
        <div className="space-y-3">{list.map(m => <Row key={m.id} item={m} onUpdate={handleUpdate} onDelete={handleDelete} />)}</div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
