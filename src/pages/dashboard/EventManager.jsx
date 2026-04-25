import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import {
  inputCls, Toast, Spinner, Field, SkeletonRows, ErrorState,
  toSlug, makeUniqueSlug,
} from './shared';
import MediaPicker from './MediaPicker';

function EventImageField({ value, onChange, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const preview = value ? resolveMediaUrl(value) : null;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Gambar Event</label>
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
          <p className="text-xs text-slate-400">Gambar header di halaman detail event.</p>
        </div>
      </div>
      <MediaPicker open={pickerOpen} filter="image" onClose={() => setPickerOpen(false)} onSelect={(m) => onChange(m.url)} />
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const EMPTY_FORM = {
  title: '', date: '', startsAt: '', location: '', description: '', image: '',
};

// Convert an ISO string (or Date) into the value format that
// <input type="datetime-local"> expects: "YYYY-MM-DDTHH:mm".
function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function normalizeEvent(event) {
  if (!event || typeof event !== 'object') return null;
  const slug = event.slug || toSlug(event.title || String(event.id ?? Date.now()));
  return {
    id:          event.id              ?? Date.now(),
    slug,
    title:       (event.title          ?? '').trim(),
    date:        (event.date           ?? '').trim(),
    startsAt:    event.startsAt        ?? null,
    location:    (event.location       ?? '').trim(),
    description: (event.description    ?? '').trim(),
    image:       event.image           ?? null,
  };
}
function buildFormFromItem(item) {
  if (!item) return EMPTY_FORM;
  return {
    title:       item.title       ?? '',
    date:        item.date        ?? '',
    startsAt:    toDatetimeLocal(item.startsAt),
    location:    item.location    ?? '',
    description: item.description ?? '',
    image:       item.image       ?? '',
  };
}

/* ── Form ────────────────────────────────────────────────────────────────── */

function EventForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = 'Judul wajib diisi';
    if (!form.date.trim())        e.date        = 'Tanggal wajib diisi';
    if (!form.location.trim())    e.location    = 'Lokasi wajib diisi';
    if (!form.description.trim()) e.description = 'Deskripsi wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saving) return;
    if (!validate()) return;
    // datetime-local yields "YYYY-MM-DDTHH:mm"; new Date() turns that into an
    // ISO string the backend parses. Empty input → null (explicit clear).
    const startsAt = form.startsAt
      ? new Date(form.startsAt).toISOString()
      : null;

    onSave({
      title:       form.title.trim(),
      date:        form.date.trim(),
      startsAt,
      location:    form.location.trim(),
      description: form.description.trim(),
      image:       form.image.trim() || null,
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
              placeholder="Judul event"
            />
          </Field>

          <Field label="Tanggal *" hint="Tanggal dalam format manusia, ditampilkan di situs." error={errors.date}>
            <input
              className={inputCls}
              value={form.date}
              onChange={e => set('date', e.target.value)}
              placeholder="cth: 20 November 2024"
            />
          </Field>

          <Field label="Waktu mulai (opsional)" hint="Dipakai untuk urutan kronologis dan filter 'Mendatang'.">
            <input
              type="datetime-local"
              className={inputCls}
              value={form.startsAt}
              onChange={e => set('startsAt', e.target.value)}
            />
          </Field>

          <Field label="Lokasi *" error={errors.location}>
            <input
              className={inputCls}
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="cth: Jakarta, Indonesia"
            />
          </Field>
        </div>

        <div className="space-y-5 mb-6">
          <Field label="Deskripsi *" error={errors.description}>
            <textarea
              rows={4}
              className={inputCls + ' resize-none'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Deskripsi singkat event"
            />
          </Field>

          <EventImageField value={form.image} onChange={(v) => set('image', v)} disabled={saving} />
        </div>

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 active:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Spinner small />}
            {saving ? 'Menyimpan...' : 'Simpan Event'}
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

export default function EventManager() {
  const [events,          setEvents]          = useState([]);
  const [dataLoading,     setDataLoading]     = useState(true);
  const [loadError,       setLoadError]       = useState(false);
  const [view,            setView]            = useState('list');
  const [editingItem,     setEditingItem]     = useState(null);
  const [deletingId,      setDeletingId]      = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [toast,           setToast]           = useState(null);

  const showToast  = useCallback((msg, kind = 'success') => setToast({ message: msg, kind }), []);
  const clearToast = useCallback(() => setToast(null), []);

  const fetchEvents = useCallback(async () => {
    setDataLoading(true);
    setLoadError(false);
    try {
      const data = await api('/events');
      const safeData = Array.isArray(data) ? data : [];
      setEvents(safeData.map(normalizeEvent).filter(Boolean));
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
      setLoadError(true);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingItem) {
        await api(`/events/${editingItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        showToast('Event berhasil diperbarui');
      } else {
        await api('/events', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        showToast('Event berhasil ditambahkan');
      }
      await fetchEvents();
      setView('list');
      setEditingItem(null);
    } catch (e) {
      showToast(e.message || 'Gagal menyimpan event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      await fetchEvents();
      showToast('Event berhasil dihapus');
    } catch (error) {
      console.error(error);
      showToast('Gagal menghapus event', 'error');
    } finally {
      setDeletingId(null);
      setDeleteConfirmId(null);
    }
  };

  const openEdit   = (item) => { setEditingItem(item); setView('form'); setDeleteConfirmId(null); };
  const openCreate = ()     => { setEditingItem(null);  setView('form'); setDeleteConfirmId(null); };
  const handleCancel = ()   => { setView('list'); setEditingItem(null); };

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
              {editingItem ? 'Edit Event' : 'Tambah Event Baru'}
            </h2>
            <EventForm
              key={editingItem?.id ?? 'new'}
              initial={buildFormFromItem(editingItem)}
              onSave={handleSave}
              onCancel={handleCancel}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">
                {dataLoading
                  ? <span className="inline-block w-6 h-6 bg-slate-100 rounded animate-pulse" />
                  : events.length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Total Event</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-800">
                {dataLoading
                  ? <span className="inline-block w-6 h-6 bg-slate-100 rounded animate-pulse" />
                  : events.filter(e => e.date).length}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Dengan Tanggal</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-slate-800">
                Semua Event
                {!dataLoading && <span className="ml-2 font-normal text-slate-400">({events.length})</span>}
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
              <ErrorState message="Gagal memuat event" onRetry={fetchEvents} />
            )}

            {!dataLoading && !loadError && events.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400 mb-3">Belum ada event.</p>
                <button onClick={openCreate} className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Tambahkan yang pertama →
                </button>
              </div>
            )}

            {!dataLoading && !loadError && events.length > 0 && (
              <>
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span>Judul</span><span>Tanggal</span><span>Lokasi</span><span className="text-right">Aksi</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {events.map(evt => (
                    <div
                      key={evt.id}
                      className="px-6 py-4 flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center gap-3 sm:gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {evt.title || <span className="text-slate-300 italic">Tanpa judul</span>}
                      </p>
                      <p className="text-xs text-slate-400 whitespace-nowrap">{evt.date || '—'}</p>
                      <p className="text-xs text-slate-400 truncate max-w-[140px]">{evt.location || '—'}</p>
                      <div className="flex items-center gap-2 justify-end">
                        {deleteConfirmId === evt.id ? (
                          <>
                            <span className="text-xs text-red-500 font-medium">Hapus?</span>
                            <button
                              disabled={deletingId === evt.id}
                              onClick={() => handleDelete(evt.id)}
                              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-400 px-2.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              {deletingId === evt.id && <Spinner small />}
                              {deletingId === evt.id ? 'Menghapus...' : 'Ya'}
                            </button>
                            <button
                              disabled={deletingId === evt.id}
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >Batal</button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(evt)}
                              className="text-xs font-semibold text-orange-500 border border-orange-200 hover:border-orange-400 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                            >Edit</button>
                            <button
                              onClick={() => setDeleteConfirmId(evt.id)}
                              className="text-xs font-semibold text-red-400 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                            >Hapus</button>
                          </>
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
