/**
 * DataPemiluManager.jsx
 * ─────────────────────
 * Dashboard admin: input & kelola statistik pemilu per tahun & jenis.
 * Data ini ditampilkan di halaman publik /data-pemilu (stat cards + trend chart).
 *
 * Endpoint: GET/POST/PUT/DELETE /api/election-data
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const fmt    = (n) => n == null ? '—' : Number(n).toLocaleString('id-ID');
const fmtPct = (n) => n == null ? '—' : `${Number(n).toFixed(2)}%`;

const JENIS_OPTIONS = [
  'Presiden',
  'DPR',
  'DPD',
  'DPRD Provinsi',
  'DPRD Kab/Kota',
];

const TAHUN_OPTIONS = [2024, 2019, 2014, 2009, 2004, 1999];

const EMPTY_FORM = {
  tahun: '2024',
  jenisPemilu: 'Presiden',
  partisipasi: '',
  suaraTidakSah: '',
  suaraSah: '',
  jumlahDPT: '',
  jumlahTPS: '',
  jumlahKabKota: '',
  jumlahProvinsi: '',
  catatan: '',
  sortOrder: '0',
};

/* ── Toast ────────────────────────────────────────────────────────────────── */
function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {toast.type === 'success' ? '✓' : '✕'} {toast.message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">×</button>
    </div>
  );
}

/* ── Form ─────────────────────────────────────────────────────────────────── */
function ElectionForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const fieldClass = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identitas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tahun Pemilu *</label>
          <select value={form.tahun} onChange={e => set('tahun', e.target.value)} className={fieldClass} required>
            {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jenis Pemilu *</label>
          <select value={form.jenisPemilu} onChange={e => set('jenisPemilu', e.target.value)} className={fieldClass} required>
            {JENIS_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
      </div>

      {/* Persentase */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Persentase (%)</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tingkat Partisipasi</label>
            <input
              type="number" step="0.01" min="0" max="100"
              placeholder="81.78"
              value={form.partisipasi} onChange={e => set('partisipasi', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Suara Tidak Sah</label>
            <input
              type="number" step="0.01" min="0" max="100"
              placeholder="2.49"
              value={form.suaraTidakSah} onChange={e => set('suaraTidakSah', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Suara Sah</label>
            <input
              type="number" step="0.01" min="0" max="100"
              placeholder="97.51"
              value={form.suaraSah} onChange={e => set('suaraSah', e.target.value)}
              className={fieldClass}
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Isi manual atau biarkan kosong</p>
          </div>
        </div>
      </div>

      {/* Jumlah */}
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Jumlah</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className={labelClass}>DPT (Pemilih)</label>
            <input
              type="number" min="0"
              placeholder="204807222"
              value={form.jumlahDPT} onChange={e => set('jumlahDPT', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Jumlah TPS</label>
            <input
              type="number" min="0"
              placeholder="823220"
              value={form.jumlahTPS} onChange={e => set('jumlahTPS', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Kabupaten/Kota</label>
            <input
              type="number" min="0"
              placeholder="514"
              value={form.jumlahKabKota} onChange={e => set('jumlahKabKota', e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Provinsi</label>
            <input
              type="number" min="0"
              placeholder="38"
              value={form.jumlahProvinsi} onChange={e => set('jumlahProvinsi', e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Catatan & sortOrder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className={labelClass}>Catatan / Sumber Data</label>
          <input
            type="text"
            placeholder="Sumber: KPU RI, final"
            value={form.catatan} onChange={e => set('catatan', e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input
            type="number" min="0"
            value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit" disabled={saving}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button" onClick={onCancel}
          className="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

/* ── Row ──────────────────────────────────────────────────────────────────── */
function DataRow({ row, onEdit, onDelete }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-orange-50/30 transition-colors">
      <td className="px-4 py-3 font-bold text-slate-800 tabular-nums">{row.tahun}</td>
      <td className="px-4 py-3 text-slate-700">{row.jenisPemilu}</td>
      <td className="px-4 py-3 text-right tabular-nums">
        {row.partisipasi != null
          ? <span className={`font-semibold ${row.partisipasi >= 80 ? 'text-emerald-600' : row.partisipasi >= 70 ? 'text-orange-500' : 'text-red-500'}`}>
              {fmtPct(row.partisipasi)}
            </span>
          : <span className="text-slate-300">—</span>
        }
      </td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{fmtPct(row.suaraTidakSah)}</td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{fmt(row.jumlahDPT)}</td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{fmt(row.jumlahTPS)}</td>
      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{row.jumlahKabKota ?? '—'}</td>
      <td className="px-4 py-3">
        <p className="text-xs text-slate-400 truncate max-w-32">{row.catatan || '—'}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="text-xs px-2.5 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          >Edit</button>
          <button
            onClick={() => onDelete(row)}
            className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >Hapus</button>
        </div>
      </td>
    </tr>
  );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function DataPemiluManager() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // null = list | 'new' | {row}
  const [saving,  setSaving]  = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [toast,   setToast]   = useState(null);
  const [filter,  setFilter]  = useState('');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await api('/election-data');
      setItems(data);
    } catch {
      showToast('error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      const payload = {
        tahun:          form.tahun,
        jenisPemilu:    form.jenisPemilu,
        partisipasi:    form.partisipasi  || null,
        suaraTidakSah:  form.suaraTidakSah || null,
        suaraSah:       form.suaraSah     || null,
        jumlahDPT:      form.jumlahDPT    || null,
        jumlahTPS:      form.jumlahTPS    || null,
        jumlahKabKota:  form.jumlahKabKota || null,
        jumlahProvinsi: form.jumlahProvinsi || null,
        catatan:        form.catatan,
        sortOrder:      form.sortOrder,
      };

      if (editing?.id) {
        await api(`/election-data/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('success', 'Data diperbarui');
      } else {
        await api('/election-data', { method: 'POST', body: JSON.stringify(payload) });
        showToast('success', 'Data ditambahkan');
      }
      setEditing(null);
      load();
    } catch (err) {
      showToast('error', err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Hapus data ${row.tahun} – ${row.jenisPemilu}?`)) return;
    try {
      await api(`/election-data/${row.id}`, { method: 'DELETE' });
      showToast('success', 'Data dihapus');
      load();
    } catch (err) {
      showToast('error', err.message || 'Gagal menghapus');
    }
  };

  const handleSeed = async () => {
    if (!confirm('Seed data pemilu historis (1999–2024)? Data yang sudah ada tidak akan ditimpa.')) return;
    setSeeding(true);
    try {
      const result = await api('/election-data/seed', { method: 'POST' });
      showToast('success', `Seed selesai: ${result.created} ditambah, ${result.skipped} dilewati`);
      load();
    } catch (err) {
      showToast('error', err.message || 'Gagal seed data');
    } finally {
      setSeeding(false);
    }
  };

  const toFormValues = (row) => ({
    tahun:         String(row.tahun),
    jenisPemilu:   row.jenisPemilu,
    partisipasi:   row.partisipasi    != null ? String(row.partisipasi)    : '',
    suaraTidakSah: row.suaraTidakSah  != null ? String(row.suaraTidakSah)  : '',
    suaraSah:      row.suaraSah       != null ? String(row.suaraSah)       : '',
    jumlahDPT:     row.jumlahDPT      != null ? String(row.jumlahDPT)      : '',
    jumlahTPS:     row.jumlahTPS      != null ? String(row.jumlahTPS)      : '',
    jumlahKabKota: row.jumlahKabKota  != null ? String(row.jumlahKabKota)  : '',
    jumlahProvinsi:row.jumlahProvinsi != null ? String(row.jumlahProvinsi) : '',
    catatan:       row.catatan || '',
    sortOrder:     String(row.sortOrder ?? 0),
  });

  const filtered = items.filter(r =>
    !filter || String(r.tahun) === filter
  );

  const years = [...new Set(items.map(r => r.tahun))].sort((a, b) => b - a);

  /* ── Form view ──────────────────────────────────────────────────────────── */
  if (editing !== null) {
    const isNew = editing === 'new';
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700">←</button>
          <h1 className="text-xl font-bold text-slate-800">
            {isNew ? 'Tambah Data Pemilu' : `Edit: ${editing.tahun} – ${editing.jenisPemilu}`}
          </h1>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
          <strong>Catatan:</strong> Data ini bersumber dari laporan resmi KPU pasca-pemilu.
          Pastikan angka sudah diverifikasi sebelum menyimpan — data ini ditampilkan langsung di halaman publik.
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <ElectionForm
            initial={isNew ? EMPTY_FORM : toFormValues(editing)}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        </div>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  /* ── List view ──────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Statistik Pemilu</h1>
          <p className="text-sm text-slate-500 mt-1">
            Data resmi KPU per tahun & jenis pemilu · ditampilkan di halaman publik{' '}
            <a href="/data-pemilu" target="_blank" className="text-orange-500 hover:underline">/data-pemilu</a>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSeed} disabled={seeding}
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {seeding ? 'Memuat...' : '↓ Seed Data 1999–2024'}
          </button>
          <button
            onClick={() => setEditing('new')}
            className="text-sm px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
          >
            + Tambah Data
          </button>
        </div>
      </div>

      {/* Filter */}
      {years.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors
              ${!filter ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
          >Semua</button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setFilter(String(y))}
              className={`text-xs px-3 py-1 rounded-full border transition-colors
                ${filter === String(y) ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >{y}</button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm mb-3">Belum ada data pemilu</p>
            <button
              onClick={handleSeed}
              className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              ↓ Seed Data Awal (1999–2024)
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Tahun</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Jenis</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">Partisipasi</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">Tdk Sah</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">DPT</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">TPS</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">Kab/Kota</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">Catatan</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <DataRow key={row.id} row={row} onEdit={(r) => setEditing(r)} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        {filtered.length} entri{filter ? ` (Pemilu ${filter})` : ''} · Data dikelola manual dari laporan resmi KPU
      </p>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
