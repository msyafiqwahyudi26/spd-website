import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';
import MediaPicker from './MediaPicker';

const EMPTY = { title: '', description: '', image: '', link: '' };

function ImageField({ value, onChange, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const preview = value ? resolveMediaUrl(value) : null;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Gambar (opsional)</label>
      <div className="flex items-start gap-3">
        <div className="w-32 h-20 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400 uppercase text-center px-1">Tanpa gambar</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => setPickerOpen(true)} disabled={disabled} className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60">
              Pilih dari Media
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} disabled={disabled} className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-60">
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
      <MediaPicker open={pickerOpen} filter="image" onClose={() => setPickerOpen(false)} onSelect={(m) => onChange(m.url)} />
    </div>
  );
}

function Row({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: item.title, description: item.description || '', image: item.image || '', link: item.link || '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (!form.title.trim()) { setErr('Judul wajib diisi'); return; }
    setSaving(true); setErr('');
    try {
      await onUpdate(item.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        link:  form.link.trim(),
      });
      setEditing(false);
    } catch (e) { setErr(e?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const preview = item.image ? resolveMediaUrl(item.image) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
      <div className="w-24 h-16 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[10px] text-slate-400 uppercase text-center px-1">Tanpa gambar</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2.5">
            <input className={inputCls} placeholder="Judul program" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} disabled={saving} />
            <textarea className={inputCls} rows={3} placeholder="Deskripsi singkat" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={saving} />
            <input className={inputCls} placeholder="URL tujuan (opsional)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} disabled={saving} />
            <ImageField value={form.image} onChange={(v) => setForm({ ...form, image: v })} disabled={saving} />
            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
            {item.link && <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">{item.link}</p>}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        {editing ? (
          <>
            <button onClick={save} disabled={saving} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md disabled:opacity-60 inline-flex items-center gap-1.5">
              {saving && <Spinner small />} Simpan
            </button>
            <button onClick={() => { setForm({ title: item.title, description: item.description || '', image: item.image || '', link: item.link || '' }); setErr(''); setEditing(false); }} disabled={saving} className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-md border border-slate-200">Batal</button>
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

export default function ProgramManager() {
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
    try {
      const rows = await api('/programs');
      setList(Array.isArray(rows) ? rows : []);
    } catch { setError(true); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Judul wajib diisi'); return; }
    setSubmitting(true); setFormError('');
    try {
      const created = await api('/programs', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
          link:  form.link.trim(),
        }),
      });
      setList(prev => [...prev, created]);
      setForm(EMPTY); setShowForm(false);
      setToast('Program ditambahkan');
    } catch (err) { setFormError(err?.message || 'Gagal menyimpan'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id, data) => {
    const updated = await api(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setList(prev => prev.map(p => p.id === id ? updated : p));
    setToast('Program diperbarui');
    return updated;
  };

  const handleDelete = async (id) => {
    try {
      await api(`/programs/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(p => p.id !== id));
      setToast('Program dihapus');
    } catch (err) { setToast({ message: err?.message || 'Gagal menghapus', kind: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Program</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Inisiatif jangka panjang SPD (berbeda dari <em>Event</em> yang punya tanggal spesifik).
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setFormError(''); }} className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">+ Tambah program</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <Field label="Judul">
            <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="cth: Youth Hub Community" disabled={submitting} />
          </Field>
          <Field label="Deskripsi">
            <textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Penjelasan singkat tentang program ini" disabled={submitting} />
          </Field>
          <Field label="URL tujuan (opsional)" hint="Kosongkan untuk memakai halaman default /event/<slug>.">
            <input className={inputCls} value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://... atau /publikasi/..." disabled={submitting} />
          </Field>
          <ImageField value={form.image} onChange={(v) => setForm({ ...form, image: v })} disabled={submitting} />
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm"><ErrorState message="Gagal memuat program" onRetry={load} /></div>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse flex gap-4">
            <div className="w-24 h-16 bg-slate-100 rounded-lg" />
            <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-2.5 bg-slate-100 rounded w-2/3" /></div>
          </div>
        ))}</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada program.</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan program pertama di atas.</p>
        </div>
      ) : (
        <div className="space-y-3">{list.map(p => <Row key={p.id} item={p} onUpdate={handleUpdate} onDelete={handleDelete} />)}</div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
