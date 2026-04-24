import { useEffect, useState, useCallback } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { api } from '@/lib/api';
import { inputCls, Toast, Field, Spinner } from './shared';

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
      const created = await api('/stats', {
        method: 'POST',
        body: JSON.stringify({ value, label }),
      });
      setStats((prev) => [...prev, created]);
      setForm({ value: '', label: '' });
      onNotify('Statistik ditambahkan');
    } catch (err) {
      onNotify(err.message || 'Gagal menambah statistik');
    } finally {
      setSaving(false);
    }
  };

  const commitEdit = async (id, patch) => {
    setPendingId(id);
    try {
      const updated = await api(`/stats/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setStats((prev) => prev.map((s) => (s.id === id ? updated : s)));
      onNotify('Statistik diperbarui');
    } catch (err) {
      onNotify(err.message || 'Gagal memperbarui');
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (id) => {
    setPendingId(id);
    try {
      await api(`/stats/${id}`, { method: 'DELETE' });
      setStats((prev) => prev.filter((s) => s.id !== id));
      onNotify('Statistik dihapus');
    } catch (err) {
      onNotify(err.message || 'Gagal menghapus');
    } finally {
      setPendingId(null);
    }
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
            <input
              className={inputCls}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="9 atau 100+"
              disabled={saving}
            />
          </Field>
          <Field label="Label">
            <input
              className={inputCls}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Tahun Pengalaman"
              disabled={saving}
            />
          </Field>
          <button
            type="submit"
            disabled={saving || !form.value.trim() || !form.label.trim()}
            className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap"
          >
            {saving && <Spinner small />}
            Tambah
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
                <StatRow
                  key={s.id}
                  stat={s}
                  pending={pendingId === s.id}
                  onCommit={commitEdit}
                  onDelete={remove}
                />
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
      <input
        className="w-20 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={pending}
      />
      <input
        className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={pending}
      />
      {dirty && (
        <button
          onClick={() => onCommit(stat.id, { value: value.trim(), label: label.trim() })}
          disabled={pending || !value.trim() || !label.trim()}
          className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-2.5 py-1.5 rounded-md"
        >
          Simpan
        </button>
      )}
      <button
        onClick={() => onDelete(stat.id)}
        disabled={pending}
        className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
        title="Hapus"
      >
        {pending ? (
          <Spinner small />
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </div>
  );
}


export default function SettingsManager() {
  const { settings, categories, saveSettings, addCategory, deleteCategory } = useSettings();

  const [form, setForm] = useState({
    siteName: settings.siteName,
    email:    settings.email,
    logo:     settings.images.logo,
    hero:     settings.images.hero,
    placeholder: settings.images.placeholder,
    vision:    settings.content?.vision || '',
    facebook:  settings.social?.facebook  || '',
    twitter:   settings.social?.twitter   || '',
    linkedin:  settings.social?.linkedin  || '',
    instagram: settings.social?.instagram || '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Re-sync the form when settings load from the API for the first time.
  useEffect(() => {
    setForm({
      siteName: settings.siteName,
      email:    settings.email,
      logo:     settings.images.logo,
      hero:     settings.images.hero,
      placeholder: settings.images.placeholder,
      vision:    settings.content?.vision || '',
      facebook:  settings.social?.facebook  || '',
      twitter:   settings.social?.twitter   || '',
      linkedin:  settings.social?.linkedin  || '',
      instagram: settings.social?.instagram || '',
    });
  }, [settings]);

  const [catInput, setCatInput] = useState('');
  const [catColor, setCatColor] = useState('text-slate-500');
  const [catBg,    setCatBg]    = useState('bg-slate-100');
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState(null);

  const [toast, setToast] = useState(null);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
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
        content: {
          vision: form.vision,
        },
        social: {
          facebook:  form.facebook,
          twitter:   form.twitter,
          linkedin:  form.linkedin,
          instagram: form.instagram,
        },
      });
      setToast('Pengaturan berhasil disimpan');
    } catch (err) {
      setToast(err.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const value = catInput.trim();
    if (!value) return;
    setSavingCat(true);
    try {
      await addCategory({ value, color: catColor, bg: catBg });
      setCatInput('');
      setToast('Kategori ditambahkan');
    } catch (err) {
      setToast(err.message || 'Gagal menambah kategori');
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setDeletingCatId(id);
    try {
      await deleteCategory(id);
      setToast('Kategori dihapus');
    } catch (err) {
      setToast(err.message || 'Gagal menghapus kategori');
    } finally {
      setDeletingCatId(null);
    }
  };

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* Site Settings & Media */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Pengaturan Situs & Media</h2>
          <p className="text-sm text-slate-500 mt-1">Ubah nama situs, kontak, dan gambar global di sini.</p>
        </div>

        <form onSubmit={handleSaveSettings} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Field label="Nama Situs">
              <input
                className={inputCls}
                value={form.siteName}
                onChange={e => setForm({ ...form, siteName: e.target.value })}
              />
            </Field>

            <Field label="Email Kontak">
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="URL Logo Situs" hint="Biarkan kosong untuk menggunakan logo default SPD">
              <input
                className={inputCls}
                value={form.logo}
                onChange={e => setForm({ ...form, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </Field>

            <Field label="URL Gambar Hero" hint="Gambar latar belakang untuk halaman Beranda">
              <input
                className={inputCls}
                value={form.hero}
                onChange={e => setForm({ ...form, hero: e.target.value })}
                placeholder="https://example.com/hero.jpg"
              />
            </Field>

            <Field label="URL Gambar Fallback" hint="Gambar yang muncul jika gambar publikasi/event gagal dimuat">
              <input
                className={inputCls}
                value={form.placeholder}
                onChange={e => setForm({ ...form, placeholder: e.target.value })}
                placeholder="https://example.com/placeholder.jpg"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <Field label="Visi" hint="Teks visi yang tampil di halaman Visi & Misi.">
              <textarea
                rows={3}
                className={inputCls + ' resize-none'}
                value={form.vision}
                onChange={e => setForm({ ...form, vision: e.target.value })}
                placeholder="Menjadi pusat kerja kolaboratif multihak..."
              />
            </Field>
          </div>

          <div className="border-t border-slate-100 pt-6 mb-8">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Tautan Media Sosial</h3>
            <p className="text-xs text-slate-500 mb-4">Kosongkan untuk menyembunyikan ikon dari footer.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Facebook"><input className={inputCls} value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
              <Field label="Twitter / X"><input className={inputCls} value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="https://x.com/..." /></Field>
              <Field label="LinkedIn"><input className={inputCls} value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/..." /></Field>
              <Field label="Instagram"><input className={inputCls} value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {savingSettings && <Spinner small />}
              {savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </section>

      {/* Category Manager */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Kategori Publikasi</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola kategori yang digunakan dalam filter publikasi dan riset.</p>
        </div>

        <div className="p-6 flex flex-col md:flex-row gap-8">

          <form onSubmit={handleAddCategory} className="w-full md:w-1/3 space-y-4">
            <Field label="Nama Kategori Baru">
              <input
                className={inputCls}
                value={catInput}
                onChange={e => setCatInput(e.target.value)}
                placeholder="cth: ARTIKEL"
              />
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

            <button
              type="submit"
              disabled={!catInput.trim() || savingCat}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              {savingCat && <Spinner small />}
              {savingCat ? 'Menambahkan...' : 'Tambah Kategori'}
            </button>
          </form>

          <div className="flex-1 bg-slate-50 rounded-lg p-5 border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Daftar Kategori ({categories.length})</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map(c => (
                <div key={c.id} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                  <span className={`text-xs font-bold tracking-wide px-2 py-0.5 rounded ${c.bg} ${c.color}`}>
                    {c.value}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    disabled={deletingCatId === c.id}
                    className="text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors ml-2"
                    title="Hapus"
                  >
                    {deletingCatId === c.id ? (
                      <Spinner small />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-slate-500 italic">Belum ada kategori.</p>
              )}
            </div>
          </div>

        </div>
      </section>

      <StatsSection onNotify={setToast} />
      <MissionSection onNotify={setToast} />
    </div>
  );
}

function MissionSection({ onNotify }) {
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
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">Poin Misi</h2>
        <p className="text-sm text-slate-500 mt-1">Daftar misi yang tampil di halaman Visi &amp; Misi.</p>
      </div>
      <div className="p-6 space-y-6">
        <form onSubmit={add} className="flex gap-3 items-end">
          <Field label="Poin misi baru">
            <input className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="Tambahkan kalimat misi…" disabled={saving} />
          </Field>
          <button type="submit" disabled={saving || !text.trim()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap">
            {saving && <Spinner small />} Tambah
          </button>
        </form>
        <div className="border-t border-slate-100 pt-5">
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
      </div>
    </section>
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
