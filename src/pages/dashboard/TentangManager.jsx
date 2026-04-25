/**
 * TentangManager — dedicated CMS untuk halaman Tentang Kami
 * Mengelola: Deskripsi / Siapa Kami, Visi, Misi, Nilai-Nilai (Core Values)
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { inputCls, Toast, Field, Spinner } from './shared';
import { ICON_KEYS, ICON_COMPONENTS } from '../../data/approachIcons';

/* ── Icon Picker (shared with BerandaManager) ───────────────────────────── */
function IconPicker({ iconKey, iconUrl, onIconKey, onIconUrl, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr('');
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
        {ICON_KEYS.map((key) => {
          const Comp = ICON_COMPONENTS[key];
          const active = !iconUrl && iconKey === key;
          return (
            <button key={key} type="button" disabled={disabled || uploading}
              onClick={() => { onIconKey(key); onIconUrl(''); }} title={key}
              className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                active ? 'border-orange-500 bg-orange-50 text-orange-500'
                       : 'border-slate-200 bg-white text-slate-400 hover:border-orange-300 hover:text-orange-400'
              } disabled:opacity-50`}>
              <Comp className="w-6 h-6" />
            </button>
          );
        })}
        {customPreview && (
          <div className="relative w-10 h-10 rounded-lg border-2 border-orange-500 bg-orange-50 overflow-hidden flex items-center justify-center">
            <img src={customPreview} alt="" className="w-full h-full object-contain" />
            <button type="button" disabled={disabled} onClick={() => onIconUrl('')}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] leading-none">×</button>
          </div>
        )}
        <label className={`w-10 h-10 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 ${(disabled||uploading)?'opacity-50 pointer-events-none':''}`} title="Upload ikon kustom">
          {uploading ? <Spinner small /> : (
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
          <input ref={fileRef} type="file" accept="image/*" disabled={disabled||uploading} onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {uploadErr && <p className="text-xs text-red-500 mt-1">{uploadErr}</p>}
    </div>
  );
}

/* ── Missions CRUD ──────────────────────────────────────────────────────── */
function MissionsSection({ onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(Array.isArray(await api('/missions')) ? await api('/missions') : []); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api('/missions').then(rows => { if (!cancelled) setItems(Array.isArray(rows) ? rows : []); })
      .catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const v = text.trim(); if (!v) return;
    setSaving(true);
    try {
      const created = await api('/missions', { method: 'POST', body: JSON.stringify({ text: v }) });
      setItems(prev => [...prev, created]); setText('');
      onNotify('Misi ditambahkan');
    } catch (err) { onNotify({ message: err.message || 'Gagal menambah', kind: 'error' }); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/missions/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setItems(prev => prev.map(m => m.id === id ? updated : m));
      onNotify('Misi diperbarui');
    } catch (err) { onNotify({ message: err.message || 'Gagal memperbarui', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/missions/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(m => m.id !== id));
      onNotify('Misi dihapus');
    } catch (err) { onNotify({ message: err.message || 'Gagal menghapus', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Poin Misi</h2>
        <p className="text-sm text-slate-500 mt-0.5">Butir misi yang tampil di halaman Visi &amp; Misi.</p>
      </div>
      <div className="p-6 space-y-4">
        <form onSubmit={add} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">Poin misi baru</label>
            <input className={inputCls} value={text} onChange={e => setText(e.target.value)}
              placeholder="Tulis kalimat misi…" disabled={saving} />
          </div>
          <button type="submit" disabled={saving || !text.trim()}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
            {saving && <Spinner small />} Tambah
          </button>
        </form>
        {loading ? (
          <p className="text-sm text-slate-400 italic">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Belum ada misi — tambahkan poin misi di atas.</p>
        ) : (
          <div className="space-y-2">
            {items.map(m => <MissionRow key={m.id} item={m} pending={pendingId === m.id} onCommit={commit} onDelete={remove} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function MissionRow({ item, pending, onCommit, onDelete }) {
  const [text, setText] = useState(item.text);
  useEffect(() => setText(item.text), [item.text]);
  const dirty = text !== item.text;
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <span className="text-slate-400 text-sm shrink-0">•</span>
      <input className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
        value={text} onChange={e => setText(e.target.value)} disabled={pending} />
      {dirty && (
        <button onClick={() => onCommit(item.id, { text: text.trim() })} disabled={pending || !text.trim()}
          className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md whitespace-nowrap">Simpan</button>
      )}
      <button onClick={() => onDelete(item.id)} disabled={pending}
        className="text-slate-400 hover:text-red-500 disabled:opacity-50 p-1" title="Hapus">
        {pending ? <Spinner small /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </button>
    </div>
  );
}

/* ── Core Values CRUD ───────────────────────────────────────────────────── */
function CoreValuesSection({ onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/core-values').then(rows => { if (!cancelled) setItems(Array.isArray(rows) ? rows : []); })
      .catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const title = form.title.trim(); if (!title) return;
    setSaving(true);
    try {
      const created = await api('/core-values', {
        method: 'POST',
        body: JSON.stringify({ iconKey: form.iconKey, iconUrl: form.iconUrl, title, description: form.description.trim() }),
      });
      setItems(prev => [...prev, created]);
      setForm({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
      onNotify('Nilai ditambahkan');
    } catch (err) { onNotify({ message: err.message || 'Gagal menambah', kind: 'error' }); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/core-values/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setItems(prev => prev.map(a => a.id === id ? updated : a));
      onNotify('Nilai diperbarui');
    } catch (err) { onNotify({ message: err.message || 'Gagal memperbarui', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/core-values/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(a => a.id !== id));
      onNotify('Nilai dihapus');
    } catch (err) { onNotify({ message: err.message || 'Gagal menghapus', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Nilai-Nilai (Core Values)</h2>
        <p className="text-sm text-slate-500 mt-0.5">Kartu nilai yang tampil di halaman Visi &amp; Misi.</p>
      </div>
      <div className="p-6 space-y-4">
        <form onSubmit={add} className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tambah Nilai Baru</p>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 items-end">
            <IconPicker iconKey={form.iconKey} iconUrl={form.iconUrl}
              onIconKey={k => setForm({ ...form, iconKey: k })}
              onIconUrl={u => setForm({ ...form, iconUrl: u })} disabled={saving} />
            <Field label="Judul">
              <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="cth: Kolaboratif" disabled={saving} />
            </Field>
            <button type="submit" disabled={saving || !form.title.trim()}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
              {saving && <Spinner small />} Tambah
            </button>
          </div>
          <Field label="Deskripsi">
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Penjelasan singkat nilai ini" disabled={saving} />
          </Field>
        </form>
        {loading ? (
          <p className="text-sm text-slate-400 italic">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Belum ada nilai — tambahkan di atas.</p>
        ) : (
          <div className="space-y-3">
            {items.map(a => <CoreValueRow key={a.id} item={a} pending={pendingId === a.id} onCommit={commit} onDelete={remove} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function CoreValueRow({ item, pending, onCommit, onDelete }) {
  const [iconKey, setIconKey] = useState(item.iconKey);
  const [iconUrl, setIconUrl] = useState(item.iconUrl || '');
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  useEffect(() => {
    setIconKey(item.iconKey); setIconUrl(item.iconUrl || '');
    setTitle(item.title); setDescription(item.description || '');
  }, [item.iconKey, item.iconUrl, item.title, item.description]);
  const dirty = iconKey !== item.iconKey || iconUrl !== (item.iconUrl||'') || title !== item.title || description !== (item.description||'');
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 items-start">
        <IconPicker iconKey={iconKey} iconUrl={iconUrl} onIconKey={setIconKey} onIconUrl={setIconUrl} disabled={pending} />
        <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} disabled={pending} placeholder="Judul nilai" />
        <div className="flex items-start gap-1.5 pt-0.5">
          {dirty && (
            <button onClick={() => onCommit(item.id, { iconKey, iconUrl, title: title.trim(), description: description.trim() })}
              disabled={pending || !title.trim()}
              className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md">Simpan</button>
          )}
          <button onClick={() => onDelete(item.id)} disabled={pending}
            className="text-slate-400 hover:text-red-500 disabled:opacity-50 px-2 py-1.5" title="Hapus">
            {pending ? <Spinner small /> : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </button>
        </div>
      </div>
      <textarea className={inputCls + ' resize-none'} rows={2} value={description}
        onChange={e => setDescription(e.target.value)} disabled={pending} placeholder="Deskripsi singkat" />
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function TentangManager() {
  const { settings, saveSettings } = useSettings();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    aboutIntro: settings.content?.aboutIntro || '',
    vision:     settings.content?.vision     || '',
  });

  // Sync if settings loads async
  useEffect(() => {
    setForm({
      aboutIntro: settings.content?.aboutIntro || '',
      vision:     settings.content?.vision     || '',
    });
  }, [settings.content?.aboutIntro, settings.content?.vision]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings({
        aboutIntro: form.aboutIntro.trim(),
        visionText: form.vision.trim(),
      });
      setToast('Teks disimpan');
    } catch (err) {
      setToast({ message: err?.message || 'Gagal menyimpan', kind: 'error' });
    } finally { setSaving(false); }
  };

  const notify = (msg) => setToast(msg);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tentang Kami</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kelola narasi, visi, misi, dan nilai-nilai yang tampil di halaman Tentang Kami.
        </p>
      </div>

      {/* Teks Narasi */}
      <form onSubmit={handleSave}>
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Narasi & Visi</h2>
            <p className="text-sm text-slate-500 mt-0.5">Teks deskripsi organisasi dan pernyataan visi.</p>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Deskripsi / Siapa Kami" hint="Tampil di halaman Profil. Pisahkan paragraf dengan baris kosong.">
              <textarea rows={5} className={inputCls + ' resize-y'} value={form.aboutIntro}
                onChange={e => setForm({ ...form, aboutIntro: e.target.value })}
                placeholder="Sindikasi Pemilu dan Demokrasi (SPD) adalah organisasi masyarakat sipil yang berfokus pada penguatan demokrasi dan reformasi kepemiluan di Indonesia." />
            </Field>
            <Field label="Visi" hint="Tampil di halaman Visi & Misi.">
              <textarea rows={3} className={inputCls + ' resize-none'} value={form.vision}
                onChange={e => setForm({ ...form, vision: e.target.value })}
                placeholder="Menjadi pusat kerja kolaboratif multihak dalam memperkuat demokrasi dan kepemiluan yang inklusif di Indonesia." />
            </Field>
            <div className="pt-2">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
                {saving && <Spinner small />}
                {saving ? 'Menyimpan…' : 'Simpan Teks'}
              </button>
            </div>
          </div>
        </section>
      </form>

      {/* Misi */}
      <MissionsSection onNotify={notify} />

      {/* Core Values */}
      <CoreValuesSection onNotify={notify} />
    </div>
  );
}
