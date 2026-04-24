import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';

const EMPTY_FORM = { name: '', logoUrl: '', websiteUrl: '' };

function PartnerRow({ partner, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name:       partner.name,
    logoUrl:    partner.logoUrl    || '',
    websiteUrl: partner.websiteUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!form.name.trim()) {
      setError('Nama mitra wajib diisi');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onUpdate(partner.id, {
        name:       form.name.trim(),
        logoUrl:    form.logoUrl.trim(),
        websiteUrl: form.websiteUrl.trim(),
      });
      setEditing(false);
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm({
      name:       partner.name,
      logoUrl:    partner.logoUrl    || '',
      websiteUrl: partner.websiteUrl || '',
    });
    setError('');
    setEditing(false);
  };

  const preview = partner.logoUrl ? resolveMediaUrl(partner.logoUrl) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
      <div className="w-20 h-16 rounded-lg bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
        {preview ? (
          <img src={preview} alt={partner.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-[10px] text-slate-400 uppercase tracking-wide text-center px-1">Tanpa logo</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2.5">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nama mitra"
              className={inputCls}
              disabled={saving}
            />
            <input
              type="text"
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="URL logo (mis. /uploads/media/...png)"
              className={inputCls}
              disabled={saving}
            />
            <input
              type="text"
              value={form.websiteUrl}
              onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
              placeholder="URL website (opsional)"
              className={inputCls}
              disabled={saving}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-800 truncate">{partner.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {partner.websiteUrl || <span className="italic">tanpa website</span>}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
              {partner.logoUrl || '—'}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        {editing ? (
          <>
            <button onClick={save} disabled={saving} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md disabled:opacity-60 inline-flex items-center justify-center gap-1.5">
              {saving && <Spinner small />} Simpan
            </button>
            <button onClick={cancel} disabled={saving} className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
              Batal
            </button>
          </>
        ) : confirmDelete ? (
          <>
            <button
              onClick={() => { onDelete(partner.id); setConfirmDelete(false); }}
              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md"
            >
              Hapus
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-md border border-slate-200"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-md border border-orange-100 hover:border-orange-300"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-md border border-red-100 hover:border-red-300"
            >
              Hapus
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [toast,    setToast]    = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const rows = await api('/partners');
      setPartners(Array.isArray(rows) ? rows : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFormError('Nama mitra wajib diisi');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const created = await api('/partners', {
        method: 'POST',
        body: JSON.stringify({
          name:       form.name.trim(),
          logoUrl:    form.logoUrl.trim(),
          websiteUrl: form.websiteUrl.trim(),
        }),
      });
      setPartners((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setToast('Mitra ditambahkan');
    } catch (err) {
      setFormError(err?.message || 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, data) => {
    const updated = await api(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setPartners((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setToast('Mitra diperbarui');
    return updated;
  };

  const handleDelete = async (id) => {
    try {
      await api(`/partners/${id}`, { method: 'DELETE' });
      setPartners((prev) => prev.filter((p) => p.id !== id));
      setToast('Mitra dihapus');
    } catch (err) {
      setToast(err?.message || 'Gagal menghapus');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mitra</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola logo dan nama mitra yang tampil di halaman Mitra dan Tentang Kami.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setFormError(''); }}
            className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg shrink-0"
          >
            + Tambah mitra
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Nama mitra">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="cth: Universitas Indonesia"
                className={inputCls}
                disabled={submitting}
              />
            </Field>
            <Field label="URL logo" hint="Unggah via Media lalu salin URL-nya.">
              <input
                type="text"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="/uploads/media/..."
                className={inputCls}
                disabled={submitting}
              />
            </Field>
            <Field label="URL website (opsional)">
              <input
                type="text"
                value={form.websiteUrl}
                onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                placeholder="https://..."
                className={inputCls}
                disabled={submitting}
              />
            </Field>
          </div>

          {formError && <p className="text-xs text-red-500">{formError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              {submitting && <Spinner small />}
              {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormError(''); }}
              disabled={submitting}
              className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <ErrorState message="Gagal memuat daftar mitra" onRetry={load} />
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-20 h-16 bg-slate-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada mitra.</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan mitra pertama di atas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <PartnerRow key={p.id} partner={p} onUpdate={handleUpdate} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
