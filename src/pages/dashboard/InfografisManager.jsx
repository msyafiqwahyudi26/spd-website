import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { inputCls, Toast, Spinner, Field, SkeletonRows, ErrorState } from './shared';
import MediaPicker from './MediaPicker';

const EMPTY = { title: '', imageUrl: '', caption: '' };

function ImagePickerField({ value, onChange, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const preview = value ? resolveMediaUrl(value) : null;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Gambar Infografis *</label>
      <div className="flex items-center gap-3">
        <div className="w-24 h-16 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6z" />
            </svg>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setPickerOpen(true)} disabled={disabled}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-md disabled:opacity-60 transition-colors">
              Pilih dari Media
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} disabled={disabled}
                className="text-xs font-medium text-slate-400 hover:text-red-500 border border-slate-200 px-3 py-1.5 rounded-md disabled:opacity-60 transition-colors">
                Hapus
              </button>
            )}
          </div>
          {value && <p className="text-[11px] font-mono text-slate-400 truncate">{value}</p>}
        </div>
      </div>
      <MediaPicker open={pickerOpen} filter="image" onClose={() => setPickerOpen(false)}
        onSelect={(m) => onChange(m.url)} />
    </div>
  );
}

function InfografisForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = {};
    if (!form.title.trim())    errs.title    = 'Judul wajib diisi';
    if (!form.imageUrl.trim()) errs.imageUrl = 'Pilih gambar terlebih dahulu';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ title: form.title.trim(), imageUrl: form.imageUrl.trim(), caption: form.caption.trim() });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-800">
          {initial ? 'Edit Infografis' : 'Tambah Infografis'}
        </h2>

        <Field label="Judul *" error={errors.title}>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="cth: Peta Hasil Pilpres 2024" maxLength={200}
            className={inputCls} />
        </Field>

        <div>
          <ImagePickerField value={form.imageUrl} onChange={v => set('imageUrl', v)} disabled={saving} />
          {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>}
        </div>

        <Field label="Keterangan (opsional)" hint="Teks singkat di bawah judul infografis">
          <input type="text" value={form.caption} onChange={e => set('caption', e.target.value)}
            placeholder="cth: Sumber: KPU RI, 2024" maxLength={200}
            className={inputCls} />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
            {saving && <Spinner small />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={onCancel} disabled={saving}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}

function InfografisCard({ item, onEdit, onDelete, deleting }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const preview = item.imageUrl ? resolveMediaUrl(item.imageUrl) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        {preview ? (
          <img src={preview} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{item.title}</p>
        {item.caption && <p className="text-xs text-slate-400 mt-1">{item.caption}</p>}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => onEdit(item)}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 px-3 py-1.5 rounded-md transition-colors">
            Edit
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => onDelete(item.id)} disabled={deleting}
                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md disabled:opacity-50 transition-colors">
                {deleting ? '...' : 'Hapus'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-md transition-colors">
                Batal
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="text-xs font-medium text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-md transition-colors">
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InfografisManager() {
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setLoadError(false);
    try {
      const rows = await api('/infografis');
      setList(Array.isArray(rows) ? rows : []);
    } catch { setLoadError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editItem) {
        const updated = await api(`/infografis/${editItem.id}`, { method: 'PUT', body: JSON.stringify(data) });
        setList(prev => prev.map(r => r.id === editItem.id ? updated : r));
        setToast({ message: 'Infografis diperbarui', kind: 'success' });
      } else {
        const created = await api('/infografis', { method: 'POST', body: JSON.stringify(data) });
        setList(prev => [...prev, created]);
        setToast({ message: 'Infografis ditambahkan', kind: 'success' });
      }
      setShowForm(false); setEditItem(null);
    } catch (err) {
      setToast({ message: err?.message || 'Gagal menyimpan', kind: 'error' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api(`/infografis/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(r => r.id !== id));
      setToast({ message: 'Infografis dihapus', kind: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Gagal menghapus', kind: 'error' });
    } finally { setDeletingId(null); }
  };

  const openEdit = (item) => { setEditItem(item); setShowForm(true); };
  const openCreate = () => { setEditItem(null); setShowForm(true); };
  const handleCancel = () => { setShowForm(false); setEditItem(null); };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Infografis Pemilu</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola gambar-gambar infografis yang tampil di halaman Data Pemilu.
          </p>
        </div>
        {!showForm && (
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Infografis
          </button>
        )}
      </div>

      {showForm && (
        <InfografisForm
          initial={editItem}
          onSave={handleSave}
          onCancel={handleCancel}
          saving={saving}
        />
      )}

      {loadError && <ErrorState message="Gagal memuat infografis" onRetry={load} />}

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <SkeletonRows count={3} />
        </div>
      ) : !loadError && list.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-dashed border-slate-200">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6z" />
          </svg>
          <p className="text-sm font-medium text-slate-600">Belum ada infografis</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Upload gambar infografis pemilu dari Media terlebih dahulu</p>
          <button onClick={openCreate}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 px-4 py-2 rounded-lg transition-colors">
            Tambah Infografis Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map(item => (
            <InfografisCard
              key={item.id}
              item={item}
              onEdit={openEdit}
              onDelete={handleDelete}
              deleting={deletingId === item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
