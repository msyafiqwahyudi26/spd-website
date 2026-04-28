import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { inputCls, Toast, Spinner, Field, SkeletonRows, ErrorState } from './shared';
import MediaPicker from './MediaPicker';

const EMPTY = { title: '', imageUrl: '', caption: '', description: '', slides: [] };

/* ── Reusable image picker ──────────────────────────────────────────────── */
function ImagePickerField({ label, value, onChange, disabled, required }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const preview = value ? resolveMediaUrl(value) : null;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}{required && ' *'}
        </label>
      )}
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

/* ── Slide row editor ───────────────────────────────────────────────────── */
function SlideRow({ slide, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast, disabled }) {
  const preview = slide.imageUrl ? resolveMediaUrl(slide.imageUrl) : null;
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-14 rounded bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center border border-slate-200">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => setPickerOpen(true)} disabled={disabled}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 px-2.5 py-1 rounded disabled:opacity-60 transition-colors">
              {slide.imageUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
            </button>
            {slide.imageUrl && (
              <span className="text-[10px] text-slate-400 self-center truncate font-mono max-w-[160px]">
                {slide.imageUrl.split('/').pop()}
              </span>
            )}
          </div>
          <input
            type="text"
            value={slide.caption}
            onChange={e => onChange(index, { ...slide, caption: e.target.value })}
            placeholder="Keterangan slide (penjelasan singkat data)"
            maxLength={500}
            disabled={disabled}
            className={`${inputCls} text-xs`}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          <span className="text-[10px] text-slate-400 font-semibold text-center mb-0.5">#{index + 1}</span>
          <button type="button" onClick={() => onMoveUp(index)} disabled={isFirst || disabled}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
            title="Pindah ke atas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button type="button" onClick={() => onMoveDown(index)} disabled={isLast || disabled}
            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
            title="Pindah ke bawah">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button type="button" onClick={() => onRemove(index)} disabled={disabled}
            className="p-1 text-slate-300 hover:text-red-500 disabled:opacity-30 transition-colors"
            title="Hapus slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <MediaPicker open={pickerOpen} filter="image" onClose={() => setPickerOpen(false)}
        onSelect={(m) => onChange(index, { ...slide, imageUrl: m.url })} />
    </div>
  );
}

/* ── Form ───────────────────────────────────────────────────────────────── */
function InfografisForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, slides: Array.isArray(initial.slides) ? initial.slides : [] }
      : { ...EMPTY }
  );
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  // Slide helpers
  const addSlide = () => set('slides', [...form.slides, { imageUrl: '', caption: '' }]);
  const removeSlide = (i) => set('slides', form.slides.filter((_, idx) => idx !== i));
  const updateSlide = (i, val) => set('slides', form.slides.map((s, idx) => idx === i ? val : s));
  const moveSlide = (i, dir) => {
    const arr = [...form.slides];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set('slides', arr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = {};
    if (!form.title.trim())    errs.title    = 'Judul wajib diisi';
    if (!form.imageUrl.trim()) errs.imageUrl = 'Pilih gambar cover terlebih dahulu';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const slides = form.slides
      .filter(s => s.imageUrl.trim())
      .map(s => ({ imageUrl: s.imageUrl.trim(), caption: s.caption.trim() }));

    onSave({
      title:       form.title.trim(),
      imageUrl:    form.imageUrl.trim(),
      caption:     form.caption.trim(),
      description: form.description.trim(),
      slides,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="text-base font-semibold text-slate-800">
          {initial ? 'Edit Infografis' : 'Tambah Infografis'}
        </h2>

        <Field label="Judul *" error={errors.title}>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="cth: Partisipasi Pilgub 2024 per Provinsi" maxLength={200}
            className={inputCls} />
        </Field>

        <div>
          <ImagePickerField
            label="Gambar Cover"
            required
            value={form.imageUrl}
            onChange={v => set('imageUrl', v)}
            disabled={saving}
          />
          {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>}
        </div>

        <Field label="Keterangan Cover" hint="Teks singkat di bawah judul pada kartu grid (maks. 200 karakter)">
          <input type="text" value={form.caption} onChange={e => set('caption', e.target.value)}
            placeholder="cth: Sumber: KPU RI, 2024" maxLength={200}
            className={inputCls} />
        </Field>

        <Field label="Deskripsi" hint="Paragraf pengantar yang tampil di halaman detail infografis">
          <textarea
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Jelaskan konteks data, metodologi, atau temuan utama secara singkat..."
            maxLength={2000}
            className={`${inputCls} resize-none`}
          />
        </Field>
      </div>

      {/* Slides Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Slide Data</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tambahkan gambar-gambar visualisasi data beserta penjelasan singkatnya. Setiap slide akan tampil di halaman detail.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {form.slides.length} slide
          </span>
        </div>

        {form.slides.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-lg py-8 text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">Belum ada slide data</p>
            <p className="text-xs text-slate-400 mt-0.5 mb-3">
              Tambahkan grafik, peta, atau tabel sebagai slide
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {form.slides.map((slide, i) => (
              <SlideRow
                key={i}
                slide={slide}
                index={i}
                onChange={updateSlide}
                onRemove={removeSlide}
                onMoveUp={(idx) => moveSlide(idx, -1)}
                onMoveDown={(idx) => moveSlide(idx, 1)}
                isFirst={i === 0}
                isLast={i === form.slides.length - 1}
                disabled={saving}
              />
            ))}
          </div>
        )}

        <button type="button" onClick={addSlide} disabled={saving}
          className="w-full border border-dashed border-orange-300 hover:border-orange-400 text-orange-500 hover:text-orange-600 text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Slide
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
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
    </form>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────── */
function InfografisCard({ item, onEdit, onDelete, deleting }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const preview = item.imageUrl ? resolveMediaUrl(item.imageUrl) : null;
  const slideCount = Array.isArray(item.slides) ? item.slides.filter(s => s.imageUrl).length : 0;

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
        {slideCount > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
            {slideCount} slide
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{item.title}</p>
        {item.caption && <p className="text-xs text-slate-400 mt-1">{item.caption}</p>}
        {item.description && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
        )}
        {item.slug && (
          <p className="text-[10px] font-mono text-slate-300 mt-1.5 truncate">/data-pemilu/infografis/{item.slug}</p>
        )}
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

/* ── Manager ────────────────────────────────────────────────────────────── */
export default function InfografisManager() {
  const [list, setList]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [saving, setSaving]       = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]         = useState(null);

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

  const openEdit   = (item) => { setEditItem(item); setShowForm(true); };
  const openCreate = ()     => { setEditItem(null); setShowForm(true); };
  const handleCancel = ()   => { setShowForm(false); setEditItem(null); };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Infografis & Data Brief Pemilu</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola ringkasan data pemilu berbasis visual — setiap item bisa berisi banyak slide dengan penjelasan singkat.
          </p>
        </div>
        {!showForm && (
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Data Brief
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
          <p className="text-xs text-slate-400 mt-1 mb-4">Buat data brief pertama dengan gambar dan slide data pemilu</p>
          <button onClick={openCreate}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-400 px-4 py-2 rounded-lg transition-colors">
            Buat Data Brief Pertama
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
