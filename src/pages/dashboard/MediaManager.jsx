import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl, invalidateMediaKey } from '@/lib/media';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';

// Keys that the frontend currently knows how to consume. Listing them in the
// dashboard gives admins a concrete mental model of what changing each one
// affects, instead of a blank text field. Free-form keys still work.
const SUGGESTED_KEYS = [
  { value: 'homepage.hero',    label: 'homepage.hero — latar belakang Hero beranda' },
  { value: 'footer.logo',      label: 'footer.logo — logo di footer' },
  { value: 'header.logo',      label: 'header.logo — logo di header' },
  { value: 'global.placeholder', label: 'global.placeholder — gambar fallback' },
];

const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,63}$/;

function formatBytes(n) {
  if (!Number.isFinite(n) || n <= 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadForm({ onUploaded }) {
  const fileInputRef = useRef(null);
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);  // createObjectURL of selected image
  const [key, setKey]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  // Generate a pre-upload thumbnail URL for the selected file (images only).
  // Revoked on unmount or whenever the selection changes so the URL never
  // leaks memory. PDFs skip preview — no browser-generated thumbnail.
  useEffect(() => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setKey('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Pilih gambar terlebih dahulu.');
      return;
    }
    const trimmedKey = key.trim().toLowerCase();
    if (trimmedKey && !KEY_RE.test(trimmedKey)) {
      setError('Key hanya boleh huruf kecil, angka, titik, tanda hubung, dan garis bawah.');
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (trimmedKey) form.append('key', trimmedKey);
      const created = await api('/media', { method: 'POST', body: form });
      if (trimmedKey) invalidateMediaKey(trimmedKey);
      onUploaded(created);
      reset();
    } catch (err) {
      setError(err?.message || 'Gagal mengunggah gambar.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Gambar atau PDF" hint="Maksimal 5 MB. JPG, PNG, WEBP, GIF, SVG, atau PDF.">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={submitting}
            className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200"
          />
          {preview && (
            <div className="mt-2 flex items-start gap-3">
              <div className="w-24 h-16 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                <img src={preview} alt="Pratinjau" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-xs text-slate-500 leading-snug">
                Pratinjau sebelum unggah. Klik <strong>Unggah</strong> untuk mengirim ke server.
              </p>
            </div>
          )}
        </Field>
        <Field label="Key (opsional)" hint="Gunakan key standar agar langsung tampil di frontend.">
          <input
            type="text"
            list="media-suggested-keys"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="cth: homepage.hero"
            disabled={submitting}
            className={inputCls}
          />
          <datalist id="media-suggested-keys">
            {SUGGESTED_KEYS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </datalist>
        </Field>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting || !file}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {submitting && <Spinner small />}
          {submitting ? 'Mengunggah…' : 'Unggah'}
        </button>
        {file && !submitting && (
          <span className="text-xs text-slate-500 truncate">{file.name} · {formatBytes(file.size)}</span>
        )}
      </div>
    </form>
  );
}

function MediaCard({ item, onAssignKey, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [keyValue, setKeyValue] = useState(item.key || '');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const save = async () => {
    const trimmed = keyValue.trim().toLowerCase();
    if (trimmed && !KEY_RE.test(trimmed)) return;
    setSaving(true);
    try {
      await onAssignKey(item.id, trimmed, item.key);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const isPdf = item.type === 'application/pdf';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="aspect-[4/3] bg-slate-100 relative flex items-center justify-center">
        {isPdf ? (
          <div className="text-center">
            <svg className="w-10 h-10 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-[10px] font-bold text-slate-500 mt-1 block">PDF</span>
          </div>
        ) : (
          <img
            src={resolveMediaUrl(item.url)}
            alt={item.filename || ''}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p className="text-sm font-medium text-slate-700 truncate" title={item.filename}>
            {item.filename || '—'}
          </p>
          <span className="text-[10px] uppercase tracking-wide text-slate-400 shrink-0">
            {formatBytes(item.size)}
          </span>
        </div>

        {editing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="homepage.hero"
              className="flex-1 px-2 py-1 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              disabled={saving}
            />
            <button
              onClick={save}
              disabled={saving}
              className="text-[11px] font-semibold text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded-md disabled:opacity-60"
            >
              {saving ? '…' : 'Simpan'}
            </button>
            <button
              onClick={() => { setEditing(false); setKeyValue(item.key || ''); }}
              disabled={saving}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-700 px-1.5"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            {item.key ? (
              <span className="inline-flex items-center text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded">
                {item.key}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic">tanpa key</span>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-semibold text-orange-500 hover:text-orange-600"
            >
              {item.key ? 'Ubah key' : 'Beri key'}
            </button>
          </div>
        )}

        <div className="flex items-center justify-end pt-1 border-t border-slate-100">
          {confirm ? (
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-500">Yakin hapus?</span>
              <button
                onClick={() => { onDelete(item.id, item.key); setConfirm(false); }}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Ya
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="font-medium text-slate-500 hover:text-slate-700"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600"
            >
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MediaManager() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [toast,   setToast]   = useState('');
  const [filter,  setFilter]  = useState('all'); // all | image | pdf

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const rows = await api('/media');
      setItems(Array.isArray(rows) ? rows : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUploaded = (created) => {
    setItems((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
    setToast('Gambar berhasil diunggah');
  };

  const handleAssignKey = async (id, newKey, prevKey) => {
    try {
      const updated = await api(`/media/${id}/key`, {
        method: 'PATCH',
        body: JSON.stringify({ key: newKey || '' }),
      });
      if (prevKey) invalidateMediaKey(prevKey);
      if (newKey) invalidateMediaKey(newKey);
      // Any other row that previously held this key was cleared server-side —
      // reflect that locally by re-loading. Cheap, avoids reasoning about
      // transfers manually.
      await load();
      setToast(newKey ? `Key "${newKey}" diatur` : 'Key dihapus');
      return updated;
    } catch (err) {
      setToast({ message: err?.message || 'Gagal mengatur key', kind: 'error' });
    }
  };

  const handleDelete = async (id, key) => {
    try {
      await api(`/media/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((m) => m.id !== id));
      if (key) invalidateMediaKey(key);
      setToast('Gambar dihapus');
    } catch (err) {
      setToast({ message: err?.message || 'Gagal menghapus', kind: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Media</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pusat semua aset gambar dan PDF yang dipakai di situs dan dashboard.
        </p>
      </div>

      {/* Short usage primer — admins sometimes forget which key maps to what. */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Alur pemakaian</p>
        <ol className="text-sm text-slate-600 leading-relaxed space-y-1 list-decimal list-inside">
          <li>Unggah gambar/PDF di formulir di bawah.</li>
          <li>Pratinjau muncul di grid setelah unggahan.</li>
          <li>Beri <em>key</em> semantik bila ingin otomatis tampil di halaman publik — mis. <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">homepage.hero</code>, <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">footer.logo</code>, atau <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">collage.1</code>…<code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">collage.8</code>.</li>
          <li>Untuk foto tim / logo mitra / PDF laporan: unggah tanpa key, lalu pilih dari dialog "Pilih dari Media" di halaman Tim, Mitra, atau Laporan.</li>
        </ol>
      </div>

      <UploadForm onUploaded={handleUploaded} />

      {/* Type filter — helps admin find that one PDF fast when the grid has
          dozens of images mixed in. Counts reflect the current dataset. */}
      {items.length > 0 && (() => {
        const imgCount = items.filter((m) => m.type && m.type.startsWith('image/')).length;
        const pdfCount = items.filter((m) => m.type === 'application/pdf').length;
        return (
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 w-fit shadow-sm" role="group" aria-label="Filter media">
            {[
              { id: 'all',   label: `Semua (${items.length})` },
              { id: 'image', label: `Gambar (${imgCount})` },
              { id: 'pdf',   label: `PDF (${pdfCount})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  filter === f.id ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        );
      })()}

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <ErrorState message="Gagal memuat daftar media" onRetry={load} />
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
              <div className="p-3.5 space-y-2">
                <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada media.</p>
          <p className="text-xs text-slate-400 mt-1">Unggah gambar pertama di formulir di atas.</p>
        </div>
      ) : (() => {
        const visible = items.filter((m) => {
          if (filter === 'all') return true;
          if (filter === 'image') return m.type && m.type.startsWith('image/');
          if (filter === 'pdf')   return m.type === 'application/pdf';
          return true;
        });
        if (visible.length === 0) {
          return (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
              <p className="text-sm font-medium text-slate-600">Tidak ada item untuk filter ini.</p>
              <p className="text-xs text-slate-400 mt-1">Ubah filter atau unggah file baru.</p>
            </div>
          );
        }
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visible.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                onAssignKey={handleAssignKey}
                onDelete={handleDelete}
              />
            ))}
          </div>
        );
      })()}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
