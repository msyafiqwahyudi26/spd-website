/**
 * BerandaManager — dedicated CMS untuk halaman Beranda
 * Mengelola: Hero subtitle, tombol CTA, kartu Pendekatan, dan Statistik banner
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { inputCls, Toast, Field, Spinner } from './shared';
import { ICON_KEYS, ICON_COMPONENTS } from '../../data/approachIcons';

/* ── Icon Picker ────────────────────────────────────────────────────────── */
function IconPicker({ iconKey, iconUrl, onIconKey, onIconUrl, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadErr('');
    try {
      const fd = new FormData(); fd.append('file', file);
      const created = await api('/media', { method: 'POST', body: fd });
      onIconUrl(created.url);
    } catch (err) { setUploadErr(err?.message || 'Gagal mengunggah'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
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
            <button key={key} type="button" disabled={disabled||uploading}
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
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px]">×</button>
          </div>
        )}
        <label className={`w-10 h-10 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 ${(disabled||uploading)?'opacity-50 pointer-events-none':''}`}>
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

/* ── Pendekatan (Approaches) CRUD ───────────────────────────────────────── */
function PendekatanSection({ onNotify }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/approaches').then(rows => { if (!cancelled) setItems(Array.isArray(rows) ? rows : []); })
      .catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const title = form.title.trim(); if (!title) return;
    setSaving(true);
    try {
      const created = await api('/approaches', {
        method: 'POST',
        body: JSON.stringify({ iconKey: form.iconKey, iconUrl: form.iconUrl, title, description: form.description.trim() }),
      });
      setItems(prev => [...prev, created]);
      setForm({ iconKey: 'collaboration', iconUrl: '', title: '', description: '' });
      onNotify('Pendekatan ditambahkan');
    } catch (err) { onNotify({ message: err.message || 'Gagal menambah', kind: 'error' }); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/approaches/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setItems(prev => prev.map(a => a.id === id ? updated : a));
      onNotify('Pendekatan diperbarui');
    } catch (err) { onNotify({ message: err.message || 'Gagal memperbarui', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/approaches/${id}`, { method: 'DELETE' });
      setItems(prev => prev.filter(a => a.id !== id));
      onNotify('Pendekatan dihapus');
    } catch (err) { onNotify({ message: err.message || 'Gagal menghapus', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Kartu Pendekatan</h2>
        <p className="text-sm text-slate-500 mt-0.5">Kartu pilar yang tampil di halaman Beranda (Fitur Unggulan).</p>
      </div>
      <div className="p-6 space-y-4">
        <form onSubmit={add} className="space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tambah Pendekatan Baru</p>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3 items-end">
            <IconPicker iconKey={form.iconKey} iconUrl={form.iconUrl}
              onIconKey={k => setForm({ ...form, iconKey: k })}
              onIconUrl={u => setForm({ ...form, iconUrl: u })} disabled={saving} />
            <Field label="Judul">
              <input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="cth: Kolaborasi Multi-Pihak" disabled={saving} />
            </Field>
            <button type="submit" disabled={saving || !form.title.trim()}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
              {saving && <Spinner small />} Tambah
            </button>
          </div>
          <Field label="Deskripsi">
            <textarea className={inputCls + ' resize-none'} rows={2} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Penjelasan singkat pilar ini" disabled={saving} />
          </Field>
        </form>
        {loading ? (
          <p className="text-sm text-slate-400 italic">Memuat…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Belum ada pendekatan — tambahkan di atas.</p>
        ) : (
          <div className="space-y-3">
            {items.map(a => <PendekatanRow key={a.id} item={a} pending={pendingId === a.id} onCommit={commit} onDelete={remove} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function PendekatanRow({ item, pending, onCommit, onDelete }) {
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
        <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} disabled={pending} placeholder="Judul pendekatan" />
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

/* ── Statistik Banner CRUD ──────────────────────────────────────────────── */
function StatistikSection({ onNotify }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ value: '', label: '' });
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/stats').then(rows => { if (!cancelled) setStats(Array.isArray(rows) ? rows : []); })
      .catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const add = async (e) => {
    e.preventDefault();
    const value = form.value.trim(); const label = form.label.trim();
    if (!value || !label) return;
    setSaving(true);
    try {
      const created = await api('/stats', { method: 'POST', body: JSON.stringify({ value, label }) });
      setStats(prev => [...prev, created]); setForm({ value: '', label: '' });
      onNotify('Statistik ditambahkan');
    } catch (err) { onNotify({ message: err.message || 'Gagal menambah', kind: 'error' }); }
    finally { setSaving(false); }
  };

  const commit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/stats/${id}`, { method: 'PUT', body: JSON.stringify(patch) });
      setStats(prev => prev.map(s => s.id === id ? updated : s));
      onNotify('Statistik diperbarui');
    } catch (err) { onNotify({ message: err.message || 'Gagal memperbarui', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/stats/${id}`, { method: 'DELETE' });
      setStats(prev => prev.filter(s => s.id !== id));
      onNotify('Statistik dihapus');
    } catch (err) { onNotify({ message: err.message || 'Gagal menghapus', kind: 'error' }); }
    finally { setPendingId(null); }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">Statistik Banner</h2>
        <p className="text-sm text-slate-500 mt-0.5">Angka yang tampil di banner oranye halaman Tentang Kami (mis. 9 Tahun Pengalaman).</p>
      </div>
      <div className="p-6 space-y-4">
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-[120px_1fr_auto] gap-3 items-end bg-slate-50 border border-slate-200 rounded-lg p-4">
          <Field label="Nilai"><input className={inputCls} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="9 atau 100+" disabled={saving} /></Field>
          <Field label="Label"><input className={inputCls} value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="Tahun Pengalaman" disabled={saving} /></Field>
          <button type="submit" disabled={saving || !form.value.trim() || !form.label.trim()}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
            {saving && <Spinner small />} Tambah
          </button>
        </form>
        {loading ? (
          <p className="text-sm text-slate-400 italic">Memuat…</p>
        ) : stats.length === 0 ? (
          <p className="text-sm text-slate-500 italic">Belum ada statistik.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.map(s => <StatRow key={s.id} stat={s} pending={pendingId === s.id} onCommit={commit} onDelete={remove} />)}
          </div>
        )}
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
      <input className="w-20 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white font-bold text-slate-800"
        value={value} onChange={e => setValue(e.target.value)} disabled={pending} />
      <input className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
        value={label} onChange={e => setLabel(e.target.value)} disabled={pending} />
      {dirty && (
        <button onClick={() => onCommit(stat.id, { value: value.trim(), label: label.trim() })}
          disabled={pending || !value.trim() || !label.trim()}
          className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md">Simpan</button>
      )}
      <button onClick={() => onDelete(stat.id)} disabled={pending}
        className="text-slate-400 hover:text-red-500 disabled:opacity-50 p-1" title="Hapus">
        {pending ? <Spinner small /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
      </button>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function BerandaManager() {
  const { settings, saveSettings } = useSettings();
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    heroSubtitle: settings.hero?.subtitle || settings.content?.heroSubtitle || '',
    cta1Label:    settings.hero?.cta1?.label || '',
    cta1Href:     settings.hero?.cta1?.href  || '',
    cta2Label:    settings.hero?.cta2?.label || '',
    cta2Href:     settings.hero?.cta2?.href  || '',
  });

  useEffect(() => {
    setForm({
      heroSubtitle: settings.hero?.subtitle || settings.content?.heroSubtitle || '',
      cta1Label:    settings.hero?.cta1?.label || '',
      cta1Href:     settings.hero?.cta1?.href  || '',
      cta2Label:    settings.hero?.cta2?.label || '',
      cta2Href:     settings.hero?.cta2?.href  || '',
    });
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings({
        heroSubtitle: form.heroSubtitle.trim(),
        heroCta1Label: form.cta1Label.trim(),
        heroCta1Href:  form.cta1Href.trim(),
        heroCta2Label: form.cta2Label.trim(),
        heroCta2Href:  form.cta2Href.trim(),
      });
      setToast('Pengaturan beranda disimpan');
    } catch (err) {
      setToast({ message: err?.message || 'Gagal menyimpan', kind: 'error' });
    } finally { setSaving(false); }
  };

  const notify = (msg) => setToast(msg);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Halaman Beranda</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kelola teks hero, tombol CTA, kartu pendekatan, dan angka statistik.
        </p>
      </div>

      {/* Hero & CTA */}
      <form onSubmit={handleSave}>
        <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">Hero & Tombol CTA</h2>
            <p className="text-sm text-slate-500 mt-0.5">Teks subjudul dan tombol yang muncul di bagian atas halaman Beranda.</p>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Subjudul Hero" hint="Kalimat deskripsi di bawah nama situs.">
              <textarea rows={3} className={inputCls + ' resize-none'} value={form.heroSubtitle}
                onChange={e => setForm({ ...form, heroSubtitle: e.target.value })}
                placeholder="Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia" />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Tombol 1 (Outline)</p>
                <Field label="Label Tombol 1">
                  <input className={inputCls} value={form.cta1Label} onChange={e => setForm({ ...form, cta1Label: e.target.value })} placeholder="cth: Pelajari Lebih Lanjut" />
                </Field>
                <Field label="URL Tombol 1">
                  <input className={inputCls} value={form.cta1Href} onChange={e => setForm({ ...form, cta1Href: e.target.value })} placeholder="/tentang-kami" />
                </Field>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Tombol 2 (Utama)</p>
                <Field label="Label Tombol 2">
                  <input className={inputCls} value={form.cta2Label} onChange={e => setForm({ ...form, cta2Label: e.target.value })} placeholder="cth: Lihat Program" />
                </Field>
                <Field label="URL Tombol 2">
                  <input className={inputCls} value={form.cta2Href} onChange={e => setForm({ ...form, cta2Href: e.target.value })} placeholder="/program" />
                </Field>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
                {saving && <Spinner small />}
                {saving ? 'Menyimpan…' : 'Simpan Hero & CTA'}
              </button>
            </div>
          </div>
        </section>
      </form>

      {/* Pendekatan */}
      <PendekatanSection onNotify={notify} />

      {/* Statistik */}
      <StatistikSection onNotify={notify} />
    </div>
  );
}
