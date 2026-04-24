import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Spinner } from './shared';

/**
 * Reusable media picker dialog.
 *
 *   <MediaPicker
 *     open={open}
 *     filter="image"        // or "pdf" or "all"
 *     onClose={() => ...}
 *     onSelect={(item) => setUrl(item.url)}
 *   />
 *
 * Lists existing media, with a built-in upload button so the admin can
 * add a new file without leaving the form. Returns the full media row
 * (`{ id, url, type, filename, size, key }`) to the caller.
 */
export default function MediaPicker({ open, onClose, onSelect, filter = 'image' }) {
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const predicate = (m) => {
    if (!m || !m.type) return true;
    if (filter === 'image') return m.type.startsWith('image/');
    if (filter === 'pdf')   return m.type === 'application/pdf';
    return true;
  };

  const load = async () => {
    setError('');
    try {
      const rows = await api('/media');
      setItems(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err?.message || 'Gagal memuat media');
      setItems([]);
    }
  };

  useEffect(() => {
    if (!open) return;
    setItems(null);
    load();
    // Esc closes
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const created = await api('/media', { method: 'POST', body: form });
      setItems((prev) => [created, ...(prev || []).filter((m) => m.id !== created.id)]);
    } catch (err) {
      setUploadError(err?.message || 'Gagal mengunggah');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filtered = items ? items.filter(predicate) : null;
  const accept = filter === 'pdf' ? 'application/pdf'
                : filter === 'image' ? 'image/*'
                : 'image/*,application/pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Pilih Media</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {filter === 'pdf' ? 'Pilih atau unggah PDF' :
               filter === 'image' ? 'Pilih atau unggah gambar' :
               'Pilih atau unggah file'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md cursor-pointer disabled:opacity-60">
              {uploading && <Spinner small />}
              {uploading ? 'Mengunggah…' : '+ Unggah baru'}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                disabled={uploading}
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="px-5 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">{uploadError}</div>
        )}

        <div className="overflow-auto p-5">
          {error ? (
            <div className="text-center py-10">
              <p className="text-sm text-red-500">{error}</p>
              <button onClick={load} className="mt-3 text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-200 px-4 py-1.5 rounded-lg">Coba lagi</button>
            </div>
          ) : filtered === null ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="aspect-[4/3] bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-medium text-slate-600">Belum ada media yang cocok.</p>
              <p className="text-xs text-slate-400 mt-1">Unggah file pertama dengan tombol di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((m) => {
                const isPdf = m.type === 'application/pdf';
                const url = resolveMediaUrl(m.url);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => { onSelect?.(m); onClose?.(); }}
                    className="text-left bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-orange-400 hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                  >
                    <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
                      {isPdf ? (
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-[10px] font-bold text-slate-500 mt-1 block">PDF</span>
                        </div>
                      ) : (
                        <img src={url} alt={m.filename} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                    <div className="px-2.5 py-1.5 border-t border-slate-100">
                      <p className="text-[11px] font-medium text-slate-700 truncate" title={m.filename}>
                        {m.filename || '—'}
                      </p>
                      {m.key && (
                        <p className="text-[10px] font-mono text-emerald-700 truncate">{m.key}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
