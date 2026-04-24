import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { inputCls, Toast, Field, Spinner } from './shared';
import MediaPicker from './MediaPicker';
import { ICON_KEYS, ICON_COMPONENTS } from '../../data/approachIcons';

/* ── Reusable image-picker field — supports direct upload + pick from library ─ */

function ImagePickerField({ label, hint, value, onChange, disabled }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);
  const preview = value ? resolveMediaUrl(value) : null;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const created = await api('/media', { method: 'POST', body: formData });
      onChange(created.url);
    } catch (err) {
      setUploadError(err?.message || 'Gagal mengunggah');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-start gap-3">
        {/* Preview thumbnail */}
        <div className="w-20 h-16 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="" className="max-w-full max-h-full object-contain" />
          ) : (
            <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap gap-2">
            {/* Direct upload button */}
            <label className={`inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md cursor-pointer transition-colors ${(disabled || uploading) ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? (
                <Spinner small />
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              )}
              {uploading ? 'Mengunggah…' : 'Upload Foto'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                disabled={disabled || uploading}
                onChange={handleUpload}
                className="hidden"
              />
            </label>

            {/* Pick from library */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={disabled || uploading}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 bg-white px-3 py-1.5 rounded-md disabled:opacity-60 transition-colors"
            >
              Pilih dari Pustaka
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled}
                className="text-xs font-medium text-slate-400 hover:text-red-500 px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-60 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>

          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
          {hint && !uploadError && <p className="text-xs text-slate-400">{hint}</p>}
          {value && (
            <p className="text-[11px] text-slate-400 font-mono truncate" title={value}>{value}</p>
          )}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        filter="image"
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => onChange(m.url)}
      />
    </div>
  );
}

/* ── Confirmation dialog for the primary settings save ──────────────────── */

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Simpan' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Stats CRUD (unchanged — wraps its own state) ───────────────────────── */

function StatsSection({ onNotify }) {
  const [stats,   setStats]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ value: '', label: '' });
  const [saving,  setSaving]  = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api('/stats');
      setStats(Array.isArray(rows) ? rows : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const value = form.value.trim();
    const label = form.label.trim();
    if (!value || !label) return;
    setSaving(true);
    try {
      const created = await api('/stats', { method: 'POST', body: JSON.stringify({ value, label }) });
      setStats((prev) => [...prev, created]);
      setForm({ value: '', label: '' });
      onNotify('Statistik ditambahkan');
    } catch (err) { onNotify(err.message || 'Gagal menambah statistik'); }
    finally { setSaving(false); }
  };

  const commitEdit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/stats/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setStats((prev) => prev.map((s) => (s.id === id ? updated : s)));
      onNotify('Statistik diperbarui');
    } catch (err) { onNotify(err.message || 'Gagal memperbarui'); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/stats/${id}`, { method: 'DELETE' });
      setStats((prev) => prev.filter((s) => s.id !== id));
      onNotify('Statistik dihapus');
    } catch (err) { onNotify(err.message || 'Gagal menghapus'); }
    finally { setPendingId(null); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Statistik Publik</h2>
        <p className="text-sm text-slate-500 mt-1">
          Angka dan label yang tampil di banner halaman Tentang Kami (mis. 9 Tahun Pengalaman, 15 Mitra).
        </p>
      </div>
      <div className="p-6 space-y-6">
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 items-end">
          <Field label="Nilai">
            <input className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="9 atau 100+" disabled={saving} />
          </Field>
          <Field label="Label">
            <input className={inputCls} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Tahun Pengalaman" disabled={saving} />
          </Field>
          <button type="submit" disabled={saving || !form.value.trim() || !form.label.trim()} className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
            {saving && <Spinner small />} Tambah
          </button>
        </form>
        <div className="border-t border-slate-100 pt-5">
          {loading ? (
            <p className="text-sm text-slate-400 italic">Memuat statistik…</p>
          ) : stats.length === 0 ? (
            <p className="text-sm text-slate-500 italic">Belum ada statistik.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.map((s) => (
                <StatRow key={s.id} stat={s} pending={pendingId === s.id} onCommit={commitEdit} onDelete={remove} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatRow({ stat, pending, onCommit, onDelete }) {
  const [value, setValue] = useState(stat.value);
  const [label, setLabel] = useState(stat.label);
  useEffect(() => { setValue(stat.value); setLabel(stat.label); }, [stat.value, stat.label]);
  const dirty = value !== stat.value || label !== stat.label;
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <input className="w-20 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" value={value} onChange={(e) => setValue(e.target.value)} disabled={pending} />
      <input className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" value={label} onChange={(e) => setLabel(e.target.value)} disabled={pending} />
      {dirty && (
        <button onClick={() => onCommit(stat.id, { value: value.trim(), label: label.trim() })} disabled={pending || !value.trim() || !label.trim()} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md">Simpan</button>
      )}
      <button onClick={() => onDelete(stat.id)} disabled={pending} className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors" title="Hapus">
        {pending ? <Spinner small /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </button>
    </div>
  );
}

/* ── Missions CRUD — inline variant, embedded inside Organisasi card ───── */

function InlineMissionSection({ onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api('/missions');
      setItems(Array.isArray(rows) ? rows : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setSaving(true);
    try {
      const created = await api('/missions', { method: 'POST', body: JSON.stringify({ text: v }) });
      setItems(prev => [...prev, created]);
      setText('');
      onNotify('Misi ditambahkan');
    } catch (err) { onNotify(err.message || 'Gagal menambah misi'); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/missions/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setItems(prev => prev.map(m => m.id === id ? updated : m));
      onNotify('Misi diperbarui');
    } catch (err) { onNotify(err.message || 'Gagal memperbarui'); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/missions/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(m => m.id !== id));
      onNotify('Misi dihapus');
    } catch (err) { onNotify(err.message || 'Gagal menghapus'); }
    finally { setPendingId(null); }
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">Poin Misi</h3>
      <p className="text-xs text-slate-500 mb-4">
        Daftar butir misi yang tampil di halaman Visi &amp; Misi. Setiap poin disimpan secara mandiri saat Anda menekan Tambah atau Simpan.
      </p>
      <form onSubmit={add} className="flex gap-3 items-end mb-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1">Poin misi baru</label>
          <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tambahkan kalimat misi…" disabled={saving} />
        </div>
        <button type="submit" disabled={saving || !text.trim()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
          {saving && <Spinner small />} Tambah
        </button>
      </form>
      {loading ? (
        <p className="text-sm text-slate-400 italic">Memuat misi…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Belum ada misi.</p>
      ) : (
        <div className="space-y-2">
          {items.map((m) => <MissionRow key={m.id} item={m} pending={pendingId === m.id} onCommit={commit} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
}

function MissionRow({ item, pending, onCommit, onDelete }) {
  const [text, setText] = useState(item.text);
  useEffect(() => { setText(item.text); }, [item.text]);
  const dirty = text !== item.text;
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <input className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" value={text} onChange={(e) => setText(e.target.value)} disabled={pending} />
      {dirty && (
        <button onClick={() => onCommit(item.id, { text: text.trim() })} disabled={pending || !text.trim()} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md">Simpan</button>
      )}
      <button onClick={() => onDelete(item.id)} disabled={pending} className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors" title="Hapus">
        {pending ? <Spinner small /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </button>
    </div>
  );
}

/* ── Approach (Pendekatan Kami) CRUD — inline inside Organisasi tab ─────── */

/**
 * Visual icon picker — shows preset SVG icons as clickable tiles,
 * plus an "Upload Ikon" button for custom uploaded icons.
 * Props:
 *   iconKey   — currently selected preset key (string)
 *   iconUrl   — currently set custom icon URL (string, overrides iconKey when non-empty)
 *   onIconKey — (key: string) => void
 *   onIconUrl — (url: string) => void
 *   disabled  — bool
 */
function IconPicker({ iconKey, iconUrl, onIconKey, onIconUrl, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const created = await api('/media', { method: 'POST', body: fd });
      onIconUrl(created.url);
    } catch (err) {
      setUploadErr(err?.message || 'Gagal mengunggah');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const customPreview = iconUrl ? resolveMediaUrl(iconUrl) : null;

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-2">Ikon</label>
      <div className="flex flex-wrap gap-2 items-start">
        {/* Preset icon tiles */}
        {ICON_KEYS.map((key) => {
          const Comp = ICON_COMPONENTS[key];
          const active = !iconUrl && iconKey === key;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled || uploading}
              onClick={() => { onIconKey(key); onIconUrl(''); }}
              title={key}
              className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                active
                  ? 'border-orange-500 bg-orange-50 text-orange-500'
                  : 'border-slate-200 bg-white text-slate-400 hover:border-orange-300 hover:text-orange-400'
              } disabled:opacity-50`}
            >
              <Comp className="w-6 h-6" />
            </button>
          );
        })}

        {/* Custom icon: preview tile */}
        {customPreview && (
          <div className="relative w-10 h-10 rounded-lg border-2 border-orange-500 bg-orange-50 overflow-hidden flex items-center justify-center">
            <img src={customPreview} alt="" className="w-full h-full object-contain" />
            <button
              type="button"
              disabled={disabled}
              onClick={() => onIconUrl('')}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] leading-none disabled:opacity-50"
              title="Hapus ikon kustom"
            >×</button>
          </div>
        )}

        {/* Upload button */}
        <label className={`w-10 h-10 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer transition-colors hover:border-orange-300 hover:bg-orange-50 ${(disabled || uploading) ? 'opacity-50 pointer-events-none' : ''}`} title="Upload ikon kustom">
          {uploading ? (
            <Spinner small />
          ) : (
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          <input ref={fileRef} type="file" accept="image/*" disabled={disabled || uploading} onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {uploadErr && <p className="text-xs text-red-500 mt-1">{uploadErr}</p>}
    </div>
  );
}

function InlineApproachSection({ onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api('/approaches');
      setItems(Array.isArray(rows) ? rows : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    setSaving(true);
    try {
      const created = await api('/approaches', {
        method: 'POST',
        body: JSON.stringify({ iconKey: form.iconKey, iconUrl: form.iconUrl, title, description: form.description.trim() }),
      });
      setItems((prev) => [...prev, created]);
      setForm({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
      onNotify('Pendekatan ditambahkan');
    } catch (err) { onNotify(err.message || 'Gagal menambah pendekatan'); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/approaches/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      onNotify('Pendekatan diperbarui');
    } catch (err) { onNotify(err.message || 'Gagal memperbarui'); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/approaches/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((a) => a.id !== id));
      onNotify('Pendekatan dihapus');
    } catch (err) { onNotify(err.message || 'Gagal menghapus'); }
    finally { setPendingId(null); }
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">Pendekatan Kami</h3>
      <p className="text-xs text-slate-500 mb-4">
        Kartu pilar yang tampil di halaman Beranda. Pilih ikon atau unggah ikon kustom.
      </p>
      <form onSubmit={add} className="space-y-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 items-end">
          <IconPicker
            iconKey={form.iconKey}
            iconUrl={form.iconUrl}
            onIconKey={(k) => setForm({ ...form, iconKey: k })}
            onIconUrl={(u) => setForm({ ...form, iconUrl: u })}
            disabled={saving}
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Judul</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kolaborasi Multi-Pihak" disabled={saving} />
          </div>
          <button type="submit" disabled={saving || !form.title.trim()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
            {saving && <Spinner small />} Tambah
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Deskripsi</label>
          <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Penjelasan singkat pilar ini" disabled={saving} />
        </div>
      </form>
      {loading ? (
        <p className="text-sm text-slate-400 italic">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Belum ada pendekatan — halaman Beranda akan pakai default.</p>
      ) : (
        <div className="space-y-2">
          {items.map((a) => <ApproachRow key={a.id} item={a} pending={pendingId === a.id} onCommit={commit} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
}

function ApproachRow({ item, pending, onCommit, onDelete }) {
  const [iconKey, setIconKey]       = useState(item.iconKey);
  const [iconUrl, setIconUrl]       = useState(item.iconUrl || '');
  const [title, setTitle]           = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  useEffect(() => {
    setIconKey(item.iconKey);
    setIconUrl(item.iconUrl || '');
    setTitle(item.title);
    setDescription(item.description || '');
  }, [item.iconKey, item.iconUrl, item.title, item.description]);
  const dirty =
    iconKey !== item.iconKey ||
    iconUrl !== (item.iconUrl || '') ||
    title !== item.title ||
    description !== (item.description || '');
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-2 items-start">
        <IconPicker
          iconKey={iconKey}
          iconUrl={iconUrl}
          onIconKey={setIconKey}
          onIconUrl={setIconUrl}
          disabled={pending}
        />
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
        <div className="flex items-start gap-1.5 pt-0.5">
          {dirty && (
            <button onClick={() => onCommit(item.id, { iconKey, iconUrl, title: title.trim(), description: description.trim() })} disabled={pending || !title.trim()} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md">Simpan</button>
          )}
          <button onClick={() => onDelete(item.id)} disabled={pending} className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors px-2 py-1.5" title="Hapus">
            {pending ? <Spinner small /> : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </button>
        </div>
      </div>
      <textarea className={inputCls + ' resize-none'} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} disabled={pending} />
    </div>
  );
}

/* ── Core Values CRUD — mirrors Approach section, different endpoint ────── */

function InlineCoreValueSection({ onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api('/core-values');
      setItems(Array.isArray(rows) ? rows : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    setSaving(true);
    try {
      const created = await api('/core-values', {
        method: 'POST',
        body: JSON.stringify({ iconKey: form.iconKey, iconUrl: form.iconUrl, title, description: form.description.trim() }),
      });
      setItems((prev) => [...prev, created]);
      setForm({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
      onNotify('Core value ditambahkan');
    } catch (err) { onNotify(err.message || 'Gagal menambah core value'); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/core-values/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setItems((prev) => prev.map((a) => (a.id === id ? updated : a)));
      onNotify('Core value diperbarui');
    } catch (err) { onNotify(err.message || 'Gagal memperbarui'); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/core-values/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((a) => a.id !== id));
      onNotify('Core value dihapus');
    } catch (err) { onNotify(err.message || 'Gagal menghapus'); }
    finally { setPendingId(null); }
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">Core Value</h3>
      <p className="text-xs text-slate-500 mb-4">
        Kartu nilai yang tampil di halaman Visi &amp; Misi. Pilih ikon atau unggah ikon kustom.
      </p>
      <form onSubmit={add} className="space-y-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 items-end">
          <IconPicker
            iconKey={form.iconKey}
            iconUrl={form.iconUrl}
            onIconKey={(k) => setForm({ ...form, iconKey: k })}
            onIconUrl={(u) => setForm({ ...form, iconUrl: u })}
            disabled={saving}
          />
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Judul</label>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="cth: Kolaboratif" disabled={saving} />
          </div>
          <button type="submit" disabled={saving || !form.title.trim()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
            {saving && <Spinner small />} Tambah
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Deskripsi</label>
          <textarea className={inputCls + ' resize-none'} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Penjelasan singkat nilai ini" disabled={saving} />
        </div>
      </form>
      {loading ? (
        <p className="text-sm text-slate-400 italic">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Belum ada core value — halaman Visi &amp; Misi akan pakai default.</p>
      ) : (
        <div className="space-y-2">
          {items.map((a) => <ApproachRow key={a.id} item={a} pending={pendingId === a.id} onCommit={commit} onDelete={remove} />)}
        </div>
      )}
    </div>
  );
}

/* ── Footer links CRUD (Navigasi + Layanan) ─────────────────────────────── */

function FooterLinksSection({ onNotify }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api('/footer-links');
      setLinks(Array.isArray(rows) ? rows : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const addLink = async (section, label, url) => {
    try {
      const created = await api('/footer-links', {
        method: 'POST',
        body: JSON.stringify({ section, label: label.trim(), url: url.trim() }),
      });
      setLinks((prev) => [...prev, created]);
      onNotify('Tautan ditambahkan');
      return true;
    } catch (err) {
      onNotify(err.message || 'Gagal menambah tautan');
      return false;
    }
  };

  const updateLink = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/footer-links/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
      onNotify('Tautan diperbarui');
    } catch (err) {
      onNotify(err.message || 'Gagal memperbarui');
    } finally {
      setPendingId(null);
    }
  };

  const removeLink = async (id) => {
    setPendingId(id);
    try {
      await api(`/footer-links/${id}`, { method: 'DELETE' });
      setLinks((prev) => prev.filter((l) => l.id !== id));
      onNotify('Tautan dihapus');
    } catch (err) {
      onNotify(err.message || 'Gagal menghapus');
    } finally {
      setPendingId(null);
    }
  };

  const navLinks    = links.filter((l) => l.section === 'nav');
  const layananLinks = links.filter((l) => l.section === 'layanan');

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Tautan Footer</h2>
        <p className="text-sm text-slate-500 mt-1">
          Dua kolom di footer: <strong>Navigasi</strong> (halaman utama) dan <strong>Layanan</strong> (daftar layanan lembaga).
        </p>
      </div>

      <div className="p-6 space-y-8">
        <FooterLinkColumn
          title="Kolom Navigasi"
          help="Tampil sebagai daftar link di kolom ke-2 footer."
          section="nav"
          items={navLinks}
          loading={loading}
          pendingId={pendingId}
          onAdd={addLink}
          onUpdate={updateLink}
          onDelete={removeLink}
        />
        <FooterLinkColumn
          title="Kolom Layanan"
          help="Tampil sebagai daftar link di kolom ke-3 footer."
          section="layanan"
          items={layananLinks}
          loading={loading}
          pendingId={pendingId}
          onAdd={addLink}
          onUpdate={updateLink}
          onDelete={removeLink}
        />
      </div>
    </section>
  );
}

function FooterLinkColumn({ title, help, section, items, loading, pendingId, onAdd, onUpdate, onDelete }) {
  const [label, setLabel] = useState('');
  const [url, setUrl]     = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    setSaving(true);
    const ok = await onAdd(section, label, url);
    setSaving(false);
    if (ok) { setLabel(''); setUrl(''); }
  };

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{help}</p>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
          <input className={inputCls} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="cth: Publikasi" disabled={saving} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">URL</label>
          <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/publikasi atau https://..." disabled={saving} />
        </div>
        <button type="submit" disabled={saving || !label.trim() || !url.trim()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
          {saving && <Spinner small />} Tambah
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-400 italic">Memuat…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 italic">
          Belum ada tautan — footer akan pakai daftar default.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((l) => <FooterLinkRow key={l.id} item={l} pending={pendingId === l.id} onUpdate={onUpdate} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function FooterLinkRow({ item, pending, onUpdate, onDelete }) {
  const [label, setLabel] = useState(item.label);
  const [url, setUrl]     = useState(item.url);
  useEffect(() => { setLabel(item.label); setUrl(item.url); }, [item.label, item.url]);
  const dirty = label !== item.label || url !== item.url;
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <input className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500" value={label} onChange={(e) => setLabel(e.target.value)} disabled={pending} />
      <input className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 font-mono text-xs" value={url} onChange={(e) => setUrl(e.target.value)} disabled={pending} />
      {dirty && (
        <button onClick={() => onUpdate(item.id, { label: label.trim(), url: url.trim() })} disabled={pending || !label.trim() || !url.trim()} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md">Simpan</button>
      )}
      <button onClick={() => onDelete(item.id)} disabled={pending} className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors" title="Hapus">
        {pending ? <Spinner small /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </button>
    </div>
  );
}

/* ── Categories CRUD (unchanged body, extracted for Sistem tab) ──────────── */

function CategoriesSection({ onNotify }) {
  const { categories, addCategory, deleteCategory } = useSettings();
  const [catInput, setCatInput] = useState('');
  const [catColor, setCatColor] = useState('text-slate-500');
  const [catBg,    setCatBg]    = useState('bg-slate-100');
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const value = catInput.trim();
    if (!value) return;
    setSavingCat(true);
    try {
      await addCategory({ value, color: catColor, bg: catBg });
      setCatInput('');
      onNotify('Kategori ditambahkan');
    } catch (err) { onNotify(err.message || 'Gagal menambah kategori'); }
    finally { setSavingCat(false); }
  };

  const handleDeleteCategory = async (id) => {
    setDeletingCatId(id);
    try {
      await deleteCategory(id);
      onNotify('Kategori dihapus');
    } catch (err) { onNotify(err.message || 'Gagal menghapus kategori'); }
    finally { setDeletingCatId(null); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Kategori Publikasi</h2>
        <p className="text-sm text-slate-500 mt-1">Kelola kategori yang digunakan dalam filter publikasi dan riset.</p>
      </div>
      <div className="p-6 flex flex-col md:flex-row gap-8">
        <form onSubmit={handleAddCategory} className="w-full md:w-1/3 space-y-4">
          <Field label="Nama Kategori Baru">
            <input className={inputCls} value={catInput} onChange={e => setCatInput(e.target.value)} placeholder="cth: ARTIKEL" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Warna Teks">
              <select className={inputCls} value={catColor} onChange={e => setCatColor(e.target.value)}>
                <option value="text-slate-500">Abu-abu</option>
                <option value="text-orange-500">Oranye</option>
                <option value="text-teal-500">Teal</option>
                <option value="text-blue-500">Biru</option>
                <option value="text-red-500">Merah</option>
                <option value="text-emerald-500">Hijau</option>
              </select>
            </Field>
            <Field label="Warna Latar">
              <select className={inputCls} value={catBg} onChange={e => setCatBg(e.target.value)}>
                <option value="bg-slate-100">Abu-abu</option>
                <option value="bg-orange-50">Oranye</option>
                <option value="bg-teal-50">Teal</option>
                <option value="bg-blue-50">Biru</option>
                <option value="bg-red-50">Merah</option>
                <option value="bg-emerald-50">Hijau</option>
              </select>
            </Field>
          </div>
          <button type="submit" disabled={!catInput.trim() || savingCat} className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            {savingCat && <Spinner small />} {savingCat ? 'Menambahkan...' : 'Tambah Kategori'}
          </button>
        </form>
        <div className="flex-1 bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Daftar Kategori ({categories.length})</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map(c => (
              <div key={c.id} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                <span className={`text-xs font-bold tracking-wide px-2 py-0.5 rounded ${c.bg} ${c.color}`}>{c.value}</span>
                <button onClick={() => handleDeleteCategory(c.id)} disabled={deletingCatId === c.id} className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors ml-2" title="Hapus">
                  {deletingCatId === c.id ? <Spinner small /> : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-slate-500 italic">Belum ada kategori.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Hardcoded site defaults — mirrors what each page shows when DB is empty ─
   Keeping them here (not duplicated in each page) means the admin always sees
   the effective content in the form fields and can edit it directly.          */

const CONTENT_DEFAULTS = {
  heroSubtitle: 'Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia',
  vision: 'Menjadi pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan.',
  aboutIntro:
    'Sindikasi Pemilu dan Demokrasi (SPD) adalah organisasi masyarakat sipil yang didirikan pada tahun 2016 dengan komitmen untuk mempelajari dan memperkuat isu-isu pemilu dan demokrasi di Indonesia secara konsisten.\n\n' +
    'Sebagai organisasi yang berfokus pada kolaborasi multihak, SPD bertujuan untuk memperkuat ekosistem pemilu melalui inisiatif kerja kolaboratif antara organisasi masyarakat sipil (CSO), komunitas kreatif, civic-tech, komunitas bisnis, dan stakeholder lainnya.\n\n' +
    'SPD berkomitmen menjadi pusat kerja kolaboratif yang mendorong transparansi, akuntabilitas, dan inovasi dalam penyelenggaraan demokrasi dan kepemiluan Indonesia.',
};

/* ── Main tabbed page ────────────────────────────────────────────────────── */

const TABS = [
  { id: 'hero',     label: 'Hero',            desc: 'Nama situs, subjudul, logo, dan gambar hero' },
  { id: 'tentang',  label: 'Tentang',         desc: 'Deskripsi, visi, misi, pendekatan, dan core value' },
  { id: 'footer',   label: 'Footer',          desc: 'Tautan yang tampil di footer (Navigasi & Layanan)' },
  { id: 'sosial',   label: 'Media Sosial',    desc: 'Tautan Instagram, YouTube, Facebook, Twitter, LinkedIn' },
  { id: 'beranda',  label: 'Halaman Beranda', desc: 'Statistik yang tampil di banner' },
  { id: 'sistem',   label: 'Sistem',           desc: 'Email kontak, kategori publikasi, gambar fallback' },
];

export default function SettingsManager() {
  const { settings, saveSettings } = useSettings();
  const [tab, setTab] = useState('hero');

  const [form, setForm] = useState({
    siteName: settings.siteName,
    email:    settings.email,
    logo:     settings.images.logo,
    hero:     settings.images.hero,
    placeholder: settings.images.placeholder,
    vision:       settings.content?.vision       || CONTENT_DEFAULTS.vision,
    aboutIntro:   settings.content?.aboutIntro   || CONTENT_DEFAULTS.aboutIntro,
    heroSubtitle: settings.content?.heroSubtitle || CONTENT_DEFAULTS.heroSubtitle,
    cta1Label: settings.hero?.cta1?.label || '',
    cta1Href:  settings.hero?.cta1?.href  || '',
    cta2Label: settings.hero?.cta2?.label || '',
    cta2Href:  settings.hero?.cta2?.href  || '',
    facebook:  settings.social?.facebook  || '',
    twitter:   settings.social?.twitter   || '',
    linkedin:  settings.social?.linkedin  || '',
    instagram: settings.social?.instagram || '',
    youtube:   settings.social?.youtube   || '',
  });

  // Track the baseline so we can detect dirty state and surface it in the UI.
  const [baseline, setBaseline] = useState(form);
  useEffect(() => {
    const next = {
      siteName: settings.siteName,
      email:    settings.email,
      logo:     settings.images.logo,
      hero:     settings.images.hero,
      placeholder: settings.images.placeholder,
      vision:       settings.content?.vision       || CONTENT_DEFAULTS.vision,
      aboutIntro:   settings.content?.aboutIntro   || CONTENT_DEFAULTS.aboutIntro,
      heroSubtitle: settings.content?.heroSubtitle || CONTENT_DEFAULTS.heroSubtitle,
      cta1Label: settings.hero?.cta1?.label || '',
      cta1Href:  settings.hero?.cta1?.href  || '',
      cta2Label: settings.hero?.cta2?.label || '',
      cta2Href:  settings.hero?.cta2?.href  || '',
      facebook:  settings.social?.facebook  || '',
      twitter:   settings.social?.twitter   || '',
      linkedin:  settings.social?.linkedin  || '',
      instagram: settings.social?.instagram || '',
      youtube:   settings.social?.youtube   || '',
    };
    setForm(next);
    setBaseline(next);
  }, [settings]);

  const dirty = Object.keys(form).some((k) => form[k] !== baseline[k]);

  const [savingSettings, setSavingSettings] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const doSave = async () => {
    setConfirmOpen(false);
    setSavingSettings(true);
    try {
      await saveSettings({
        siteName: form.siteName,
        email:    form.email,
        images: {
          logo:        form.logo,
          hero:        form.hero,
          placeholder: form.placeholder,
        },
        content: { vision: form.vision, aboutIntro: form.aboutIntro, heroSubtitle: form.heroSubtitle },
        hero: {
          cta1: { label: form.cta1Label, href: form.cta1Href },
          cta2: { label: form.cta2Label, href: form.cta2Href },
        },
        social: {
          facebook:  form.facebook,
          twitter:   form.twitter,
          linkedin:  form.linkedin,
          instagram: form.instagram,
          youtube:   form.youtube,
        },
      });
      setToast('Pengaturan berhasil disimpan');
    } catch (err) {
      setToast(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!dirty) return;
    // Only confirm when a brand-critical field changed (siteName, email, images,
    // or vision). Social-link edits skip the confirm for a smoother flow.
    const critical = ['siteName', 'email', 'logo', 'hero', 'placeholder', 'vision', 'aboutIntro', 'heroSubtitle'];
    const criticalChanged = critical.some((k) => form[k] !== baseline[k]);
    if (criticalChanged) setConfirmOpen(true);
    else doSave();
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Kelola identitas situs, konten halaman, dan media secara terpusat.</p>
      </div>

      {/* Tab bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <nav className="flex gap-0.5 p-1.5 overflow-x-auto scrollbar-hide" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">{TABS.find((t) => t.id === tab)?.desc}</p>
        </div>
      </div>

      {/* Hero, Tentang, Sosial, and Sistem all commit through the primary
          Save. Footer has its own inline CRUD via FooterLinksSection. */}
      {(tab === 'hero' || tab === 'tentang' || tab === 'sosial' || tab === 'sistem') && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {tab === 'hero' && (
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Hero &amp; Identitas</h2>
                <p className="text-sm text-slate-500 mt-1">Apa yang visitor lihat pertama kali: nama, subjudul, logo, dan gambar hero.</p>
              </div>
              <div className="p-6 space-y-6">
                <Field label="Nama Situs" hint="Tampil di header, footer, dan tab browser.">
                  <input className={inputCls} value={form.siteName} onChange={e => setForm({ ...form, siteName: e.target.value })} />
                </Field>
                <Field label="Subjudul Beranda" hint="Kalimat yang tampil di bawah nama situs pada halaman Hero.">
                  <textarea
                    rows={2}
                    className={inputCls + ' resize-none'}
                    value={form.heroSubtitle}
                    onChange={e => setForm({ ...form, heroSubtitle: e.target.value })}
                    placeholder="Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia."
                  />
                </Field>

                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-1">Tombol Hero</h3>
                  <p className="text-xs text-slate-500 mb-4">Dua tombol di Beranda. Kosongkan label untuk memakai default.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Field label="Tombol 1 — Label"><input className={inputCls} value={form.cta1Label} onChange={e => setForm({ ...form, cta1Label: e.target.value })} placeholder="cth: Pelajari Lebih Lanjut" /></Field>
                    <Field label="Tombol 1 — URL"><input className={inputCls} value={form.cta1Href} onChange={e => setForm({ ...form, cta1Href: e.target.value })} placeholder="/tentang-kami" /></Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Tombol 2 — Label"><input className={inputCls} value={form.cta2Label} onChange={e => setForm({ ...form, cta2Label: e.target.value })} placeholder="cth: Lihat Program Kami" /></Field>
                    <Field label="Tombol 2 — URL"><input className={inputCls} value={form.cta2Href} onChange={e => setForm({ ...form, cta2Href: e.target.value })} placeholder="/program" /></Field>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 space-y-5">
                  <ImagePickerField
                    label="Logo Situs"
                    hint="Tampil di header dan footer. Kosongkan untuk memakai logo SPD default."
                    value={form.logo}
                    onChange={(v) => setForm({ ...form, logo: v })}
                    disabled={savingSettings}
                  />
                  <ImagePickerField
                    label="Gambar Hero"
                    hint="Latar belakang section Hero di Beranda & Entry."
                    value={form.hero}
                    onChange={(v) => setForm({ ...form, hero: v })}
                    disabled={savingSettings}
                  />
                </div>
              </div>
            </section>
          )}

          {tab === 'tentang' && (
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Konten Tentang Kami</h2>
                <p className="text-sm text-slate-500 mt-1">Semua narasi yang tampil di halaman Tentang Kami.</p>
              </div>
              <div className="p-6 space-y-6">
                <Field label="Deskripsi / Siapa Kami" hint="Tampil di halaman Profil. Pisahkan paragraf dengan baris kosong.">
                  <textarea
                    rows={5}
                    className={inputCls + ' resize-y'}
                    value={form.aboutIntro}
                    onChange={e => setForm({ ...form, aboutIntro: e.target.value })}
                    placeholder="Sindikasi Pemilu dan Demokrasi (SPD) adalah organisasi masyarakat sipil yang berfokus pada penguatan demokrasi dan reformasi kepemiluan di Indonesia."
                  />
                </Field>
                <Field label="Visi" hint="Tampil di halaman Visi & Misi.">
                  <textarea
                    rows={3}
                    className={inputCls + ' resize-none'}
                    value={form.vision}
                    onChange={e => setForm({ ...form, vision: e.target.value })}
                    placeholder="Menjadi pusat kerja kolaboratif multihak dalam memperkuat demokrasi dan kepemiluan yang inklusif di Indonesia."
                  />
                </Field>
                <div className="border-t border-slate-100 pt-5">
                  <InlineMissionSection onNotify={(m) => setToast(m)} />
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <InlineApproachSection onNotify={(m) => setToast(m)} />
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <InlineCoreValueSection onNotify={(m) => setToast(m)} />
                </div>
              </div>
            </section>
          )}

          {tab === 'sosial' && (
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Tautan Media Sosial</h2>
                <p className="text-sm text-slate-500 mt-1">Ikon akan tampil di header dan footer. Kosongkan satu field untuk menyembunyikan ikonnya.</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Instagram" hint="Tempel URL lengkap akun Instagram SPD">
                  <input className={inputCls} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/spdindonesia" />
                </Field>
                <Field label="YouTube" hint="Tempel URL channel YouTube SPD">
                  <input className={inputCls} value={form.youtube} onChange={e => setForm({ ...form, youtube: e.target.value })} placeholder="https://youtube.com/@spdindonesia" />
                </Field>
                <Field label="Facebook">
                  <input className={inputCls} value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/spdindonesia" />
                </Field>
                <Field label="Twitter / X">
                  <input className={inputCls} value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="https://x.com/spdindonesia" />
                </Field>
                <Field label="LinkedIn">
                  <input className={inputCls} value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/company/spdindonesia" />
                </Field>
              </div>
            </section>
          )}

          {tab === 'sistem' && (
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800">Sistem</h2>
                <p className="text-sm text-slate-500 mt-1">Email kontak, gambar fallback, dan kategori publikasi.</p>
              </div>
              <div className="p-6 space-y-6">
                <Field label="Email Kontak" hint="Alamat yang menerima pesan dari form kontak. Tampil di footer.">
                  <input type="email" className={inputCls} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </Field>
                <ImagePickerField
                  label="Gambar Fallback"
                  hint="Ditampilkan saat gambar publikasi atau event tidak tersedia."
                  value={form.placeholder}
                  onChange={(v) => setForm({ ...form, placeholder: v })}
                  disabled={savingSettings}
                />
              </div>
            </section>
          )}

          {/* Sticky save bar */}
          <div className={`flex items-center justify-between rounded-xl px-5 py-3 shadow-sm sticky bottom-4 border transition-colors ${dirty ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
            <p className={`text-xs font-medium ${dirty ? 'text-orange-700' : 'text-slate-400'}`}>
              {dirty
                ? '⚠ Ada perubahan yang belum disimpan'
                : '✓ Semua perubahan sudah tersimpan'}
            </p>
            <button
              type="submit"
              disabled={savingSettings || !dirty}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {savingSettings && <Spinner small />}
              {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      )}

      {tab === 'beranda' && (
        <div className="space-y-6">
          <StatsSection onNotify={setToast} />
        </div>
      )}

      {tab === 'footer' && (
        <FooterLinksSection onNotify={setToast} />
      )}

      {tab === 'sistem' && (
        <CategoriesSection onNotify={setToast} />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Simpan perubahan pengaturan?"
        message="Anda akan memperbarui pengaturan yang tampil di seluruh situs (nama, email, visi, atau gambar global). Lanjutkan?"
        confirmLabel="Ya, simpan"
        onConfirm={doSave}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
