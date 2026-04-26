import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';

const JENIS_OPTIONS = ['Presiden', 'DPR', 'DPD', 'DPRD Provinsi', 'DPRD Kab/Kota'];
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

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {toast.message}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-gray-800 font-medium mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Batal</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function DataPemiluManager() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null); // null=list, {}=form
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [seeding, setSeeding]     = useState(false);
  const [toast, setToast]         = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [filterTahun, setFilterTahun] = useState('all');

  const showToast = (type, message) => setToast({ type, message });

  const load = () => {
    setLoading(true);
    api('/election-data')
      .then(setItems)
      .catch(() => showToast('error', 'Gagal memuat data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (filterTahun === 'all') return items;
    return items.filter(i => String(i.tahun) === filterTahun);
  }, [items, filterTahun]);

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditing({});
  };

  const openEdit = (item) => {
    setForm({
      tahun:         String(item.tahun),
      jenisPemilu:   item.jenisPemilu,
      partisipasi:   item.partisipasi ?? '',
      suaraTidakSah: item.suaraTidakSah ?? '',
      suaraSah:      item.suaraSah ?? '',
      jumlahDPT:     item.jumlahDPT ?? '',
      jumlahTPS:     item.jumlahTPS ?? '',
      jumlahKabKota: item.jumlahKabKota ?? '',
      jumlahProvinsi:item.jumlahProvinsi ?? '',
      catatan:       item.catatan ?? '',
      sortOrder:     String(item.sortOrder ?? 0),
    });
    setEditing(item);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        tahun:          String(form.tahun),
        jenisPemilu:    form.jenisPemilu,
        partisipasi:    form.partisipasi !== '' ? String(form.partisipasi) : '',
        suaraTidakSah:  form.suaraTidakSah !== '' ? String(form.suaraTidakSah) : '',
        suaraSah:       form.suaraSah !== '' ? String(form.suaraSah) : '',
        jumlahDPT:      form.jumlahDPT !== '' ? String(form.jumlahDPT) : '',
        jumlahTPS:      form.jumlahTPS !== '' ? String(form.jumlahTPS) : '',
        jumlahKabKota:  form.jumlahKabKota !== '' ? String(form.jumlahKabKota) : '',
        jumlahProvinsi: form.jumlahProvinsi !== '' ? String(form.jumlahProvinsi) : '',
        catatan:        form.catatan,
        sortOrder:      String(form.sortOrder || 0),
      };

      if (editing.id) {
        await api(`/election-data/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        showToast('success', 'Data berhasil diperbarui');
      } else {
        await api('/election-data', { method: 'POST', body: JSON.stringify(payload) });
        showToast('success', 'Data berhasil ditambahkan');
      }
      setEditing(null);
      load();
    } catch (err) {
      showToast('error', err.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api(`/election-data/${id}`, { method: 'DELETE' });
      showToast('success', 'Data berhasil dihapus');
      load();
    } catch (err) {
      showToast('error', err.message || 'Gagal menghapus');
    } finally {
      setConfirmId(null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await api('/election-data/seed', { method: 'POST' });
      showToast('success', `Seed selesai: ${result.created} ditambahkan, ${result.skipped} sudah ada`);
      load();
    } catch (err) {
      showToast('error', err.message || 'Gagal seed data');
    } finally {
      setSeeding(false);
    }
  };

  const field = (key, label, type = 'text', hint = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{hint && <span className="text-gray-400 font-normal ml-1 text-xs">{hint}</span>}</label>
      <input
        type={type}
        step={type === 'number' ? 'any' : undefined}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );

  if (editing !== null) {
    return (
      <div className="max-w-2xl mx-auto">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">{editing.id ? 'Edit Data Pemilu' : 'Tambah Data Pemilu'}</h2>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select value={form.tahun} onChange={e => setForm(f => ({ ...f, tahun: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                <option value="custom">Lainnya</option>
              </select>
              {form.tahun === 'custom' && (
                <input type="number" placeholder="Masukkan tahun" onChange={e => setForm(f => ({ ...f, tahun: e.target.value }))} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pemilu</label>
              <select value={form.jenisPemilu} onChange={e => setForm(f => ({ ...f, jenisPemilu: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                {JENIS_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Statistik Partisipasi (%)</p>
            <div className="grid grid-cols-3 gap-4">
              {field('partisipasi',   'Partisipasi', 'number', '0–100')}
              {field('suaraTidakSah', 'Suara Tidak Sah', 'number', '0–100')}
              {field('suaraSah',      'Suara Sah', 'number', '0–100')}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Data Pemilih & Lokasi</p>
            <div className="grid grid-cols-2 gap-4">
              {field('jumlahDPT',     'Jumlah DPT', 'number')}
              {field('jumlahTPS',     'Jumlah TPS', 'number')}
              {field('jumlahKabKota', 'Kab/Kota',   'number')}
              {field('jumlahProvinsi','Provinsi',    'number')}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan / Sumber Data</label>
            <textarea
              value={form.catatan}
              onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Contoh: Sumber: KPU RI, Pemilu 14 Februari 2024"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {confirmId && (
        <ConfirmDialog
          message="Hapus data pemilu ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Statistik Pemilu</h2>
          <p className="text-sm text-gray-500 mt-0.5">Data partisipasi, suara sah/tidak sah, DPT, TPS, kab/kota per tahun pemilu</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-60 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            {seeding ? 'Seeding…' : 'Seed Data Historis'}
          </button>
          <button onClick={openNew} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah Data
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...TAHUN_OPTIONS.map(String)].map(t => (
          <button key={t} onClick={() => setFilterTahun(t)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filterTahun === t ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'all' ? 'Semua' : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Memuat…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-2">Belum ada data</p>
          <p className="text-sm text-gray-400">Klik <strong>Seed Data Historis</strong> untuk mengisi data 1999–2024 secara otomatis</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Tahun</th>
                  <th className="px-4 py-3">Jenis</th>
                  <th className="px-4 py-3 text-right">Partisipasi</th>
                  <th className="px-4 py-3 text-right">Suara Tdk Sah</th>
                  <th className="px-4 py-3 text-right">DPT</th>
                  <th className="px-4 py-3 text-right">TPS</th>
                  <th className="px-4 py-3 text-right">Kab/Kota</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-900">{item.tahun}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">{item.jenisPemilu}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {item.partisipasi != null ? `${item.partisipasi.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.suaraTidakSah != null ? `${item.suaraTidakSah.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.jumlahDPT != null ? Number(item.jumlahDPT).toLocaleString('id-ID') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {item.jumlahTPS != null ? item.jumlahTPS.toLocaleString('id-ID') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.jumlahKabKota ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setConfirmId(item.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
