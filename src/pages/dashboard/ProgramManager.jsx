import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';
import MediaPicker from './MediaPicker';

/* ── Constants ───────────────────────────────────────────────────────────── */
const CATEGORIES = ['Pendidikan Pemilih', 'Pengawasan Pemilu', 'Riset & Analisis', 'Advokasi', 'Pemberdayaan', 'Jaringan'];
const EMPTY = { title: '', status: 'published', category: '', description: '', fullContent: '', image: '', gallery: '' };

/* ── Content parser/serialiser (same contract as PublikasiManager) ─────── */
function parseContent(text) {
  if (!text || !text.trim()) return [];
  return text.split(/\n\n+/).map((b, i) => {
    const t = b.trim();
    if (t.startsWith('## ')) return { type: 'heading',    text: t.slice(3).trim() };
    if (t.startsWith('# '))  return { type: 'subheading', text: t.slice(2).trim() };
    return { type: i === 0 ? 'lead' : 'paragraph', text: t };
  }).filter(b => b.text);
}

function serialiseContent(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks.map(b => {
    if (b.type === 'heading')    return `## ${b.text}`;
    if (b.type === 'subheading') return `# ${b.text}`;
    return b.text ?? '';
  }).join('\n\n');
}

function parseGallery(text) {
  if (!text || !text.trim()) return [];
  return text.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
}

function serialiseGallery(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.join('\n');
}

/* ── Build API payload from form ─────────────────────────────────────────── */
function buildPayload(form) {
  const blocks = parseContent(form.fullContent);
  const galleryArr = parseGallery(form.gallery);
  return {
    title:       form.title.trim(),
    status:      form.status,
    category:    form.category.trim(),
    description: form.description.trim(),
    fullContent: JSON.stringify(blocks),
    image:       form.image.trim(),
    gallery:     JSON.stringify(galleryArr),
    link:        (form.link || '').trim(),
  };
}

/* ── Build form from API response ─────────────────────────────────────────── */
function buildForm(item) {
  const fc = Array.isArray(item.fullContent) ? item.fullContent : [];
  const gl = Array.isArray(item.gallery) ? item.gallery : [];
  return {
    title:       item.title || '',
    status:      item.status || 'published',
    category:    item.category || '',
    description: item.description || '',
    fullContent: serialiseContent(fc),
    image:       item.image || '',
    gallery:     serialiseGallery(gl),
    link:        item.link || '',
  };
}

/* ── Image picker field ───────────────────────────────────────────────────── */
function ImageField({ label = 'Gambar Sampul', value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const preview = value ? resolveMediaUrl(value) : null;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-32 h-20 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {preview
            ? <img src={preview} alt="" className="w-full h-full object-cover" />
            : <span className="text-[10px] text-slate-400 text-center px-1">Tanpa gambar</span>}
        </div>
        <div className="flex gap-2 flex-wrap pt-1">
          <button type="button" onClick={() => setOpen(true)} disabled={disabled}
            className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60">
            Pilih dari Media
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} disabled={disabled}
              className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-60">
              Hapus
            </button>
          )}
        </div>
      </div>
      <MediaPicker open={open} filter="image" onClose={() => setOpen(false)} onSelect={m => onChange(m.url)} />
    </div>
  );
}

/* ── Gallery picker field ─────────────────────────────────────────────────── */
function GalleryField({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const urls = parseGallery(value);

  const addImage = (url) => {
    if (!urls.includes(url)) onChange(serialiseGallery([...urls, url]));
  };
  const removeImage = (url) => onChange(serialiseGallery(urls.filter(u => u !== url)));

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Galeri Foto</label>
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {urls.map((url, i) => {
            const src = resolveMediaUrl(url);
            return (
              <div key={i} className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  disabled={disabled}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  aria-label="Hapus foto"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button type="button" onClick={() => setOpen(true)} disabled={disabled}
        className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60">
        + Tambah foto ke galeri
      </button>
      <MediaPicker open={open} filter="image" onClose={() => setOpen(false)} onSelect={m => { addImage(m.url); setOpen(false); }} />
    </div>
  );
}

/* ── Status badge ─────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  return status === 'published'
    ? <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Dipublikasikan</span>
    : <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Draf</span>;
}

/* ── Editor modal / expanded form ─────────────────────────────────────────── */
function ProgramEditor({ item, onSave, onCancel }) {
  const isNew = !item?.id;
  const [form, setForm] = useState(item ? buildForm(item) : EMPTY);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr('Judul wajib diisi'); return; }
    setSaving(true); setErr('');
    try {
      await onSave(buildPayload(form), item?.id);
    } catch (e) { setErr(e?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/30 flex items-start justify-center overflow-y-auto py-8 px-4">
      <form
        onSubmit={handleSave}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            {isNew ? 'Tambah Program' : 'Edit Program'}
          </h2>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <button
            type="button"
            onClick={() => set('status', form.status === 'published' ? 'draft' : 'published')}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.status === 'published' ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              form.status === 'published' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <StatusBadge status={form.status} />
        </div>

        {/* Title */}
        <Field label="Judul Program">
          <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="cth: Youth Hub Community" disabled={saving} />
        </Field>

        {/* Category */}
        <Field label="Kategori" hint="Pilih atau ketik kategori baru">
          <div className="flex gap-2 flex-wrap mb-1.5">
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => set('category', c)}
                disabled={saving}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  form.category === c
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}
            placeholder="Atau ketik kategori kustom" disabled={saving} />
        </Field>

        {/* Description */}
        <Field label="Deskripsi Singkat">
          <textarea className={inputCls} rows={3} value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Ringkasan singkat program ini (tampil di kartu dan detail)" disabled={saving} />
        </Field>

        {/* Rich content */}
        <Field label="Konten Lengkap" hint="Pisahkan paragraf dengan baris kosong. Awali dengan ## untuk judul, # untuk sub-judul.">
          <textarea className={`${inputCls} font-mono text-xs`} rows={10} value={form.fullContent}
            onChange={e => set('fullContent', e.target.value)}
            placeholder={"Paragraf pertama menjadi lead.\n\n## Judul Bagian\n\nIsi konten di sini.\n\n# Sub-judul\n\nParagraf lainnya..."}
            disabled={saving} />
          {form.fullContent.trim() && (
            <p className="text-[11px] text-slate-400 mt-1">
              {parseContent(form.fullContent).length} blok konten tersimpan
            </p>
          )}
        </Field>

        {/* Cover image */}
        <ImageField value={form.image} onChange={v => set('image', v)} disabled={saving} />

        {/* Gallery */}
        <GalleryField value={form.gallery} onChange={v => set('gallery', v)} disabled={saving} />

        {/* External link */}
        <Field label="URL Eksternal (opsional)" hint="Jika diisi, tombol 'Selengkapnya' akan mengarah ke URL ini.">
          <input className={inputCls} value={form.link || ''} onChange={e => set('link', e.target.value)}
            placeholder="https://... atau kosongkan" disabled={saving} />
        </Field>

        {err && <p className="text-xs text-red-500">{err}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
            {saving && <Spinner small />}
            {saving ? 'Menyimpan…' : isNew ? 'Tambah Program' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={onCancel} disabled={saving}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Row card in list ─────────────────────────────────────────────────────── */
function Row({ item, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const preview = item.image ? resolveMediaUrl(item.image) : null;
  const galleryCount = Array.isArray(item.gallery) ? item.gallery.length : 0;
  const hasContent = Array.isArray(item.fullContent) && item.fullContent.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4 hover:border-orange-200 transition-colors">
      {/* Thumbnail */}
      <div className="w-24 h-16 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
        {preview
          ? <img src={preview} alt="" className="w-full h-full object-cover" />
          : <span className="text-[10px] text-slate-400 uppercase text-center px-1">Tanpa gambar</span>}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <StatusBadge status={item.status} />
          {item.category && (
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500">
              {item.category}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
        {item.description && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
          {hasContent && <span>{item.fullContent.length} blok konten</span>}
          {galleryCount > 0 && <span>{galleryCount} foto</span>}
          {item.link && <span className="font-mono truncate max-w-[160px]">{item.link}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 shrink-0">
        {confirmDel ? (
          <>
            <button onClick={() => { onDelete(item.id); setConfirmDel(false); }}
              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md">
              Hapus
            </button>
            <button onClick={() => setConfirmDel(false)}
              className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-md border border-slate-200">
              Batal
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onEdit(item)}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-md border border-orange-100 hover:border-orange-300">
              Edit
            </button>
            <a
              href={`/program/${item.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 text-center"
            >
              Lihat
            </a>
            <button onClick={() => setConfirmDel(true)}
              className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md border border-red-100 hover:border-red-300">
              Hapus
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main manager ─────────────────────────────────────────────────────────── */
export default function ProgramManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState('');
  const [editing, setEditing] = useState(null); // null = closed, {} = new, item = editing existing

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const rows = await api('/programs');
      setList(Array.isArray(rows) ? rows : []);
    } catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload, id) => {
    if (id) {
      const updated = await api(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setList(prev => prev.map(p => p.id === id ? updated : p));
      setToast('Program diperbarui');
    } else {
      const created = await api('/programs', { method: 'POST', body: JSON.stringify(payload) });
      setList(prev => [...prev, created]);
      setToast('Program ditambahkan');
    }
    setEditing(null);
  };

  const handleDelete = async (id) => {
    try {
      await api(`/programs/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(p => p.id !== id));
      setToast('Program dihapus');
    } catch (e) { setToast({ message: e?.message || 'Gagal menghapus', kind: 'error' }); }
  };

  // Stats
  const published = list.filter(p => p.status === 'published').length;
  const drafts    = list.filter(p => p.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Program</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Inisiatif jangka panjang SPD — berbeda dari <em>Event</em> yang punya tanggal spesifik.
          </p>
        </div>
        <button
          onClick={() => setEditing({})}
          className="shrink-0 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-colors"
        >
          + Tambah Program
        </button>
      </div>

      {/* Summary stats */}
      {!loading && list.length > 0 && (
        <div className="flex gap-4 flex-wrap">
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3">
            <p className="text-2xl font-bold text-slate-800">{list.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total program</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-5 py-3">
            <p className="text-2xl font-bold text-emerald-600">{published}</p>
            <p className="text-xs text-slate-500 mt-0.5">Dipublikasikan</p>
          </div>
          {drafts > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold text-amber-500">{drafts}</p>
              <p className="text-xs text-slate-500 mt-0.5">Draf</p>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <ErrorState message="Gagal memuat program" onRetry={load} />
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse flex gap-4">
              <div className="w-24 h-16 bg-slate-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-sm font-medium text-slate-600">Belum ada program.</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan program pertama dengan klik "Tambah Program".</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(p => (
            <Row key={p.id} item={p} onEdit={setEditing} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editing !== null && (
        <ProgramEditor
          item={editing?.id ? editing : null}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
