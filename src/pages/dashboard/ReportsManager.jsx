import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Toast, Spinner, Field, ErrorState, inputCls } from './shared';
import MediaPicker from './MediaPicker';

function FileField({ value, onChange, disabled, label = 'File laporan' }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={disabled}
          className="text-xs font-semibold text-orange-500 hover:text-orange-600 border border-orange-100 hover:border-orange-300 px-3 py-1.5 rounded-md disabled:opacity-60"
        >
          Pilih PDF dari Media
        </button>
        {value && (
          <>
            <span className="text-[11px] font-mono text-slate-500 truncate max-w-[50%]" title={value}>{value}</span>
            <button
              type="button"
              onClick={() => onChange('')}
              disabled={disabled}
              className="text-xs font-medium text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-md border border-slate-200 disabled:opacity-60"
            >
              Hapus
            </button>
          </>
        )}
      </div>
      {!value && (
        <p className="mt-1 text-xs text-slate-400">Kosongkan untuk menampilkan "Segera tersedia" di halaman publik.</p>
      )}
      <MediaPicker
        open={pickerOpen}
        filter="pdf"
        onClose={() => setPickerOpen(false)}
        onSelect={(m) => onChange(m.url)}
      />
    </div>
  );
}

const currentYear = new Date().getFullYear();
const EMPTY = { year: String(currentYear), title: '', summary: '', fileUrl: '' };

function toPayload(f) {
  return {
    year: Number.parseInt(f.year, 10),
    title: f.title.trim(),
    summary: f.summary.trim(),
    fileUrl: f.fileUrl.trim(),
  };
}

function Row({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    year: String(item.year), title: item.title, summary: item.summary, fileUrl: item.fileUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    const year = Number.parseInt(form.year, 10);
    if (!Number.isFinite(year) || year < 1900 || year > 2100) { setErr('Tahun tidak valid'); return; }
    if (!form.title.trim()) { setErr('Judul wajib diisi'); return; }
    setSaving(true); setErr('');
    try { await onUpdate(item.id, toPayload(form)); setEditing(false); }
    catch (e) { setErr(e?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4">
      <div className="shrink-0 w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
        <span className="text-white text-sm font-bold">{item.year}</span>
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-2.5">
              <input className={inputCls} type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} disabled={saving} />
              <input className={inputCls} placeholder="Judul laporan" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} disabled={saving} />
            </div>
            <textarea className={inputCls} rows={3} placeholder="Ringkasan" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} disabled={saving} />
            <FileField value={form.fileUrl} onChange={(v) => setForm({ ...form, fileUrl: v })} disabled={saving} />
            {err && <p className="text-xs text-red-500">{err}</p>}
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            {item.summary && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.summary}</p>}
            <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">{item.fileUrl || '— belum ada file —'}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">
        {editing ? (
          <>
            <button onClick={save} disabled={saving} className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md disabled:opacity-60 inline-flex items-center gap-1.5">
              {saving && <Spinner small />} Simpan
            </button>
            <button onClick={() => { setForm({ year: String(item.year), title: item.title, summary: item.summary, fileUrl: item.fileUrl || '' }); setErr(''); setEditing(false); }} disabled={saving} className="text-xs font-medium text-slate-500 px-3 py-1.5 rounded-md border border-slate-200">Batal</button>
          </>
        ) : confirmDel ? (
          <>
            <button onClick={() => { onDelete(item.id); setConfirmDel(false); }} className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md">Hapus</button>
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
  );
}

export default function ReportsManager() {
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
    try { const rows = await api('/annual-reports'); setList(Array.isArray(rows) ? rows : []); }
    catch { setError(true); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const year = Number.parseInt(form.year, 10);
    if (!Number.isFinite(year) || year < 1900 || year > 2100) { setFormError('Tahun tidak valid'); return; }
    if (!form.title.trim()) { setFormError('Judul wajib diisi'); return; }
    setSubmitting(true); setFormError('');
    try {
      const created = await api('/annual-reports', { method: 'POST', body: JSON.stringify(toPayload(form)) });
      setList(prev => [created, ...prev.filter(r => r.year !== created.year)]);
      setForm(EMPTY); setShowForm(false);
      setToast('Laporan ditambahkan');
    } catch (err) { setFormError(err?.message || 'Gagal menyimpan'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id, data) => {
    const updated = await api(`/annual-reports/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    setList(prev => prev.map(r => r.id === id ? updated : r).sort((a,b) => b.year - a.year));
    setToast('Laporan diperbarui');
    return updated;
  };

  const handleDelete = async (id) => {
    try {
      await api(`/annual-reports/${id}`, { method: 'DELETE' });
      setList(prev => prev.filter(r => r.id !== id));
      setToast('Laporan dihapus');
    } catch (err) { setToast(err?.message || 'Gagal menghapus'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Tahunan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola laporan tahunan yang tampil di halaman publik.</p>
        </div>
        {!showForm && <button onClick={() => { setShowForm(true); setFormError(''); }} className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg">+ Tambah laporan</button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4">
            <Field label="Tahun"><input className={inputCls} type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} disabled={submitting} /></Field>
            <Field label="Judul"><input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Laporan Tahunan SPD 2024" disabled={submitting} /></Field>
          </div>
          <Field label="Ringkasan"><textarea className={inputCls} rows={3} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} disabled={submitting} /></Field>
          <FileField value={form.fileUrl} onChange={(v) => setForm({ ...form, fileUrl: v })} disabled={submitting} />
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {submitting && <Spinner small />} {submitting ? 'Menyimpan…' : 'Simpan'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); setFormError(''); }} disabled={submitting} className="text-sm font-medium text-slate-600 px-4 py-2">Batal</button>
          </div>
        </form>
      )}

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm"><ErrorState message="Gagal memuat laporan" onRetry={load} /></div>
      ) : loading ? (
        <div className="space-y-3">{[1,2,3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse flex gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-xl" />
            <div className="flex-1 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/3" /><div className="h-2.5 bg-slate-100 rounded w-2/3" /></div>
          </div>
        ))}</div>
      ) : list.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada laporan.</p>
          <p className="text-xs text-slate-400 mt-1">Tambahkan laporan pertama di atas.</p>
        </div>
      ) : (
        <div className="space-y-3">{list.map(r => <Row key={r.id} item={r} onUpdate={handleUpdate} onDelete={handleDelete} />)}</div>
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
