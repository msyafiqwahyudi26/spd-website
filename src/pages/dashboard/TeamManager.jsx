import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';
import MediaPicker from './MediaPicker';

// Photo field with embedded picker button. Reused by the create form and
// the per-row edit form so the behavior is identical in both places.
function PhotoField({ value, onChange, disabled, label = 'Foto' }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const url = value ? resolveMediaUrl(value) : null;

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {url ? (
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400 uppercase">—</span>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex gap-2">
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

const EMPTY = { name: '', role: '', expertise: '', bio: '', photoUrl: '', featured: false };

function trimAll(f) {
  return {
    name:      f.name.trim(),
    role:      f.role.trim(),
    expertise: f.expertise.trim(),
    bio:       f.bio.trim(),
    photoUrl:  f.photoUrl.trim(),
    featured:  !!f.featured,
  };
}

function Row({ member, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: member.name, role: member.role, expertise: member.expertise,
    bio: member.bio, photoUrl: member.photoUrl || '', featured: !!member.featured,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState('');

  const photo = member.photoUrl ? resolveMediaUrl(member.photoUrl) : null;

  const save = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      setErr('Nama dan peran wajib diisi');
      return;
    }
    setSaving(true); setErr('');
    try {
      await onUpdate(member.id, trimAll(form));
      setEditing(false);
    } catch (e) {
      setErr(e?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm({
      name: member.name, role: member.role, expertise: member.expertise,
      bio: member.bio, photoUrl: member.photoUrl || '', featured: !!member.featured,
    });
    setErr(''); setEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
          {photo ? (
            <img src={photo} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400 uppercase tracking-wide text-center px-1">No foto</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                <input className={inputCls} placeholder="Nama" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={saving} />
                <input className={inputCls} placeholder="Peran / role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} disabled={saving} />
              </div>
              <input className={inputCls} placeholder="Fokus / keahlian" value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} disabled={saving} />
              <textarea className={inputCls} rows={3} placeholder="Bio singkat" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} disabled={saving} />
              <PhotoField value={form.photoUrl} onChange={(v) => setForm({ ...form, photoUrl: v })} disabled={saving} label="Foto (opsional)" />
              <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} disabled={saving} />
                Jadikan pimpinan (hanya satu yang aktif)
              </label>
              {err && <p className="text-xs text-red-500">{err}</p>}
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {member.name}
                {member.featured && (
                  <span className="ml-2 text-[10px] bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded align-middle">PIMPINAN</span>
                )}
              </p>
              <p className="text-xs text-orange-500 mt-0.5">{member.role}</p>
              {member.expertise && <p className="text-xs text-slate-500 mt-1">Fokus: {member.expertise}</p>}
              {member.bio && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{member.bio}</p>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5">
                {saving && <Spinner small />} Simpan
              </button>
              <button onClick={cancel} disabled={saving} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">Batal</button>
            </>
          ) : confirmDel ? (
            <>
              <button onClick={() => { onDelete(member.id); setConfirmDel(false); }} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md">Hapus</button>
              <button onClick={() => setConfirmDel(false)} className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-md border border-slate-200">Batal</button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="text-xs font-semibold text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-md border border-orange-100 hover:border-orange-300">Edit</button>
              <button onClick={() => setConfirmDel(true)} className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md border border-red-100 hover:border-red-300">Hapus</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeamManager() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const rows = await api('/team');
      setList(Array.isArray(rows) ? rows : []);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      setFormError('Nama dan peran wajib diisi'); return;
    }
    setSubmitting(true); setFormError('');
    try {
      const created = await api('/team', { method: 'POST', body: JSON.stringify(trimAll(form)) });
      // Reload instead of local splice — server may have cleared featured flags.
      await load();
      setForm(EMPTY); setShowForm(false);
      setToast('Anggota tim ditambahkan');
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    const updated = await api(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    // If featured was toggled on, the server cleared it elsewhere — reload for truth.
    if (data.featured) await load();
    else setList(prev => prev.map(m => m.id === id ? updated : m));
    setToast('Anggota tim diperbarui');
    return updated;
  };

  const handleDelete = async (id) => {
    try {
      await api(`/team/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(m => m.id !== id));
      setToast('Anggota tim dihapus');
    } catch (err) { setToast({ message: err?.message || 'Gagal menghapus', kind: 'error' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tim</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola anggota tim yang tampil di halaman Struktur Organisasi.</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setFormError(''); }} className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">+ Tambah anggota</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nama"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={submitting} /></Field>
            <Field label="Peran / role"><input className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="cth: Peneliti" disabled={submitting} /></Field>
            <Field label="Fokus / keahlian"><input className={inputCls} value={form.expertise} onChange={e => setForm({ ...form, expertise: e.target.value })} placeholder="cth: Studi Partai Politik" disabled={submitting} /></Field>
            <div><PhotoField value={form.photoUrl} onChange={(v) => setForm({ ...form, photoUrl: v })} disabled={submitting} /></div>
          </div>
          <Field label="Bio"><textarea className={inputCls} rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} disabled={submitting} /></Field>
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} disabled={submitting} />
            Jadikan pimpinan (akan menggeser pimpinan yang ada)
          </label>
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {submitting && <Spinner small />} {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); setFormError(''); }} disabled={submitting} className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2">Batal</button>
          </div>
        </form>
      )}

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm"><ErrorState message="Gagal memuat tim" onRetry={load} /></div>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
            <div className="w-20 h-20 bg-slate-100 rounded-full" />
            <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-2.5 bg-slate-100 rounded w-1/4" /></div>
          </div>
        ))}</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada anggota tim.</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan anggota pertama di atas.</p>
        </div>
      ) : (
        <div className="space-y-3">{list.map(m => <Row key={m.id} member={m} onUpdate={handleUpdate} onDelete={handleDelete} />)}</div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
