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
  const [key, setKey]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const reset = () => {
    setFile(null);
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
        <Field label="Gambar" hint="Maksimal 5 MB. JPG, PNG, WEBP, GIF, atau SVG.">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={submitting}
            className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 file:text-xs file:font-semibold hover:file:bg-slate-200"
          />
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

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="aspect-[4/3] bg-slate-100 relative">
        <img
          src={resolveMediaUrl(item.url)}
          alt={item.filename || ''}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
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
      setToast(err?.message || 'Gagal mengatur key');
    }
  };

  const handleDelete = async (id, key) => {
    try {
      await api(`/media/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((m) => m.id !== id));
      if (key) invalidateMediaKey(key);
      setToast('Gambar dihapus');
    } catch (err) {
      setToast(err?.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Media</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Unggah gambar dan beri key agar otomatis tampil di frontend (mis. <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">homepage.hero</code>, <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">footer.logo</code>).
        </p>
      </div>

      <UploadForm onUploaded={handleUploaded} />

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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onAssignKey={handleAssignKey}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
