import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import {
  inputCls, Toast, Spinner, Field, CategoryBadge, SkeletonRows, ErrorState,
  toSlug, makeUniqueSlug,
} from './shared';
import { useSettings } from '@/hooks/useSettings';
import MediaPicker from './MediaPicker';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const EMPTY_FORM = {
  title: '', category: 'RISET', contentType: 'article', date: '',
  description: '', author: '', readTime: '', fullContent: '',
  image: '', pdfUrl: '', gallery: '',
};

const CONTENT_TYPES = [
  { value: 'article',  label: 'Artikel / Opini', hint: 'Tulisan naratif — opini, esai, komentar.' },
  { value: 'research', label: 'Riset',           hint: 'Publikasi riset dengan penulis, durasi baca, dan struktur terarah.' },
  { value: 'book',     label: 'Buku / Laporan',   hint: 'Unduhan PDF ditonjolkan di halaman detail.' },
];

function parseFullContent(text) {
  if (!text || !text.trim()) return [];
  return text
    .split(/\n\n+/)
    .map(b => b.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith('## ')) return { type: 'heading', text: block.slice(3).trim() };
      if (block.startsWith('# ')) return { type: 'subheading', text: block.slice(2).trim() };
      return { type: i === 0 ? 'lead' : 'paragraph', text: block };
    });
}

function stringifyFullContent(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';
  return blocks.map(b => {
    if (b.type === 'heading') return `## ${b.text}`;
    if (b.type === 'subheading') return `# ${b.text}`;
    return b.text ?? '';
  }).join('\n\n');
}

function parseGallery(text) {
  if (!text || !text.trim()) return [];
  return text.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
}

function stringifyGallery(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.join('\n');
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;
  const slug = item.slug || toSlug(item.title || String(item.id ?? Date.now()));
  return {
    id: item.id ?? Date.now(),
    slug,
    title: (item.title ?? '').trim(),
    category: item.category ?? 'RISET',
    contentType: item.contentType ?? 'article',
    categoryColor: item.categoryColor ?? 'text-slate-400',
    date: item.date ?? '',
    description: (item.description ?? '').trim(),
    author: item.author ?? null,
    readTime: item.readTime ?? null,
    href: item.href || `/publikasi/${slug}`,
    fullContent: Array.isArray(item.fullContent) ? item.fullContent : [],
    image: item.image ?? null,
    pdfUrl: item.pdfUrl ?? null,
    gallery: Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [],
  };
}

function buildFormFromItem(item) {
  if (!item) return EMPTY_FORM;
  return {
    title: item.title ?? '',
    category: item.category ?? 'RISET',
    contentType: item.contentType ?? 'article',
    date: item.date ?? '',
    description: item.description ?? '',
    author: item.author ?? '',
    readTime: item.readTime ?? '',
    fullContent: stringifyFullContent(item.fullContent),
    image: item.image ?? '',
    pdfUrl: item.pdfUrl ?? '',
    gallery: stringifyGallery(item.gallery),
  };
}

function HeroImageField({ value, onChange, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const preview = value ? resolveMediaUrl(value) : null;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Gambar Utama</label>
      <div className="flex items-start gap-3">
        <div className="w-40 h-24 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400 uppercase text-center px-1">Belum ada gambar</span>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={disabled}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60"
            >
              Pilih dari Media
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled}
                className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-60"
              >
                Hapus
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400">Gambar hero di halaman detail publikasi. Pilih dari library Media.</p>
          {value && (
            <p className="text-[11px] text-slate-400 font-mono truncate" title={value}>{value}</p>
          )}
        </div>
      </div>
      <MediaPicker open={pickerOpen} filter="image" onClose={() => setPickerOpen(false)} onSelect={(m) => onChange(m.url)} />
    </div>
  );
}

function GalleryField({ value, onChange, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  // Value is a newline-separated list of URLs; normalize to array for UI.
  const urls = (value || '').split(/\n+/).map((u) => u.trim()).filter(Boolean);

  const removeAt = (idx) => {
    const next = urls.filter((_, i) => i !== idx).join('\n');
    onChange(next);
  };

  const add = (url) => {
    if (!url) return;
    if (urls.includes(url)) return;
    onChange([...urls, url].join('\n'));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Galeri (opsional)</label>
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {urls.map((u, i) => (
            <div key={u + i} className="relative aspect-[4/3] rounded-md border border-slate-200 overflow-hidden bg-slate-100 group">
              <img src={resolveMediaUrl(u)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                disabled={disabled}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 hover:bg-red-500 hover:text-white text-slate-600 text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Hapus dari galeri"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        disabled={disabled}
        className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60"
      >
        + Tambah dari Media
      </button>
      <p className="mt-1 text-xs text-slate-400">{urls.length} gambar dalam galeri. Pilih beberapa kali untuk menambahkan.</p>
      <MediaPicker open={pickerOpen} filter="image" onClose={() => setPickerOpen(false)} onSelect={(m) => { add(m.url); }} />
    </div>
  );
}

function PdfField({ value, onChange, disabled, label = 'File PDF' }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60"
        >
          Pilih PDF dari Media
        </button>
        {value && (
          <>
            <span className="text-[11px] font-mono text-slate-500 truncate max-w-[50%]" title={value}>{value}</span>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-60"
            >
              Hapus
            </button>
          </>
        )}
      </div>
      {!value && (
        <p className="mt-1 text-xs text-slate-400">Kosongkan untuk menerbitkan tanpa file PDF.</p>
      )}
      <MediaPicker open={pickerOpen} filter="pdf" onClose={() => setPickerOpen(false)} onSelect={(m) => onChange(m.url)} />
    </div>
  );
}

/* ── Form ────────────────────────────────────────────────────────────────── */

function PublikasiForm({ initial, onSave, onCancel, saving, categories, isAdmin }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  // Publishers can't publish books (server enforces via 403); filter the
  // dropdown so the option isn't even offered.
  const availableTypes = isAdmin ? CONTENT_TYPES : CONTENT_TYPES.filter((t) => t.value !== 'book');

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Judul wajib diisi';
    if (!form.category) e.category = 'Kategori wajib dipilih';
    if (!form.date.trim()) e.date = 'Tanggal wajib diisi';
    if (!form.description.trim()) e.description = 'Deskripsi wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) return;
    const catMeta = categories.find(c => c.value === form.category) ?? categories[0];
    onSave({
      title: form.title.trim(),
      category: form.category,
      contentType: form.contentType || 'article',
      categoryColor: catMeta.color,
      date: form.date.trim(),
      description: form.description.trim(),
      author: form.author.trim() || null,
      readTime: form.readTime.trim() || null,
      fullContent: parseFullContent(form.fullContent),
      image: form.image.trim() || null,
      pdfUrl: form.pdfUrl.trim() || null,
      gallery: parseGallery(form.gallery),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={saving} className="space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

          <Field label="Judul *" error={errors.title}>
            <input
              className={inputCls}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Judul artikel"
            />
          </Field>

          <Field label="Kategori *" error={errors.category}>
            <div className="relative">
              <select
                className={inputCls + ' appearance-none pr-9 cursor-pointer'}
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.id ?? c.value} value={c.value}>{c.value}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>

          <Field label="Tanggal *" error={errors.date}>
            <input
              className={inputCls}
              value={form.date}
              onChange={e => set('date', e.target.value)}
              placeholder="cth: 15 Maret 2024"
            />
          </Field>

          <Field label="Penulis">
            <input
              className={inputCls}
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="Nama penulis"
            />
          </Field>

          <Field label="Waktu Baca">
            <input
              className={inputCls}
              value={form.readTime}
              onChange={e => set('readTime', e.target.value)}
              placeholder="cth: 7 menit baca"
            />
          </Field>

          <Field label="Tipe Konten" hint={CONTENT_TYPES.find(t => t.value === form.contentType)?.hint}>
            <div className="relative">
              <select
                className={inputCls + ' appearance-none pr-9 cursor-pointer'}
                value={form.contentType}
                onChange={e => set('contentType', e.target.value)}
              >
                {availableTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>
        </div>

        {/* PDF attachment — relevant only for research and book types. */}
        {form.contentType !== 'article' && (
          <PdfField
            value={form.pdfUrl}
            onChange={(v) => set('pdfUrl', v)}
            disabled={saving}
            label={form.contentType === 'book' ? 'File PDF Buku' : 'File PDF Riset (opsional)'}
          />
        )}

        <div className="space-y-5 mb-6">
          <Field label="Deskripsi *" error={errors.description}>
            <textarea
              rows={3}
              className={inputCls + ' resize-none'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Ringkasan singkat artikel (tampil di kartu dan daftar)"
            />
          </Field>

          <Field
            label="Isi Artikel"
            hint='Pisahkan paragraf dengan baris kosong. Awali baris dengan "## " untuk judul bagian. Paragraf pertama menjadi lead.'
          >
            <textarea
              rows={14}
              className={inputCls + ' resize-y font-mono text-xs leading-relaxed'}
              value={form.fullContent}
              onChange={e => set('fullContent', e.target.value)}
              placeholder={'Paragraf pembuka (lead) di sini.\n\n## Judul Bagian\n\nParagraf pertama di bawah judul.'}
            />
          </Field>

          <HeroImageField value={form.image} onChange={(v) => set('image', v)} disabled={saving} />
          <GalleryField value={form.gallery} onChange={(v) => set('gallery', v)} disabled={saving} />
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Spinner small />}
            {saving ? 'Menyimpan...' : 'Simpan Publikasi'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
        </div>
      </fieldset>
    </form>
  );
}

/* ── Manager ─────────────────────────────────────────────────────────────── */

export default function PublikasiManager() {
  // Dashboard provides the signed-in user via outlet context. Publishers
  // shouldn't see Edit/Hapus on book-type publications — server enforces
  // it with a 403, but hiding the buttons avoids dead-click UX.
  const outlet = useOutletContext();
  const isAdmin = outlet?.user?.role === 'admin';
  const { categories } = useSettings();
  const [publications, setPublications] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => setToast(msg), []);
  const clearToast = useCallback(() => setToast(null), []);

  const fetchPublications = useCallback(async () => {
    setDataLoading(true);
    setLoadError(false);
    try {
      const data = await api('/publications');
      const safeData = Array.isArray(data) ? data : [];
      setPublications(safeData.map(normalizeItem).filter(Boolean));
    } catch (error) {
      console.error('Failed to load publications:', error);
      setPublications([]);
      setLoadError(true);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingItem) {
        await api(`/publications/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        showToast('Publikasi berhasil diperbarui');
      } else {
        await api('/publications', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        showToast('Publikasi berhasil ditambahkan');
      }
      await fetchPublications();
      setView('list');
      setEditingItem(null);
    } catch (e) {
      showToast(e.message || 'Gagal menyimpan publikasi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api(`/publications/${id}`, { method: 'DELETE' });
      await fetchPublications();
      showToast('Publikasi berhasil dihapus');
    } catch (error) {
      console.error(error);
      showToast('Gagal menghapus publikasi');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const openEdit = (item) => { setEditingItem(item); setView('form'); setDeleteConfirmId(null); };
  const openCreate = () => { setEditingItem(null); setView('form'); setDeleteConfirmId(null); };
  const handleCancel = () => { setView('list'); setEditingItem(null); };

  const stats = [
    { label: 'Total Publikasi', value: publications.length },
    { label: 'Riset Singkat', value: publications.filter(p => p.category === 'RISET SINGKAT').length },
    { label: 'Riset', value: publications.filter(p => p.category === 'RISET').length },
    { label: 'Opini & Analisis', value: publications.filter(p => p.category === 'OPINI' || p.category === 'ANALISIS').length },
  ];

  return (
    <>
      {toast && <Toast message={toast} onDone={clearToast} />}

      {/* Form view */}
      {view === 'form' && (
        <div className="space-y-4">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar
          </button>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8">
            <h2 className="text-base font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">
              {editingItem ? 'Edit Publikasi' : 'Tambah Publikasi Baru'}
            </h2>
            <PublikasiForm
              key={editingItem?.id ?? 'new'}
              initial={buildFormFromItem(editingItem)}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
              categories={categories}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-2xl font-bold text-slate-800">
                  {dataLoading
                    ? <span className="inline-block w-6 h-6 bg-slate-100 rounded animate-pulse" />
                    : s.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Semua Publikasi
                {!dataLoading && <span className="ml-2 font-normal text-slate-400">({publications.length})</span>}
              </h2>
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Tambah
              </button>
            </div>

            {dataLoading && <SkeletonRows />}

            {!dataLoading && loadError && (
              <ErrorState message="Gagal memuat publikasi" onRetry={fetchPublications} />
            )}

            {!dataLoading && !loadError && publications.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400 mb-3">Belum ada publikasi.</p>
                <button onClick={openCreate} className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Tambahkan yang pertama →
                </button>
              </div>
            )}

            {!dataLoading && !loadError && publications.length > 0 && (
              <>
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span>Judul</span><span>Kategori</span><span>Tanggal</span><span className="text-right">Aksi</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {publications.map(pub => (
                    <div
                      key={pub.id}
                      className="px-6 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-snug">
                          {pub.title || <span className="text-slate-300 italic">Tanpa judul</span>}
                        </p>
                        {pub.author && <p className="text-xs text-slate-400 mt-0.5 truncate">{pub.author}</p>}
                      </div>
                      <CategoryBadge category={pub.category} />
                      <p className="text-xs text-slate-400 whitespace-nowrap">{pub.date || '—'}</p>
                      <div className="flex items-center gap-2 justify-end">
                        {deleteConfirmId === pub.id ? (
                          <>
                            <span className="text-xs text-red-500 font-medium">Hapus?</span>
                            <button
                              disabled={deletingId === pub.id}
                              onClick={() => handleDelete(pub.id)}
                              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-400 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              {deletingId === pub.id && <Spinner small />}
                              {deletingId === pub.id ? 'Menghapus...' : 'Ya'}
                            </button>
                            <button
                              disabled={deletingId === pub.id}
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >Batal</button>
                          </>
                        ) : (
                          (!isAdmin && pub.contentType === 'book') ? (
                            <span className="text-[11px] text-slate-400 italic">Khusus admin</span>
                          ) : (
                            <>
                              <button
                                onClick={() => openEdit(pub)}
                                className="text-xs font-semibold text-orange-500 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                              >Edit</button>
                              <button
                                onClick={() => setDeleteConfirmId(pub.id)}
                                className="text-xs font-semibold text-red-400 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                              >Hapus</button>
                            </>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
