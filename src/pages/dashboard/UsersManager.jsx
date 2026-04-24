import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { inputCls, Toast, Field, Spinner } from './shared';
import { useAuth } from '@/hooks/useAuth';

const ROLE_META = {
  admin:     { label: 'Admin',     cls: 'bg-slate-800 text-white' },
  publisher: { label: 'Publisher', cls: 'bg-blue-100 text-blue-700' },
};

function RoleBadge({ role }) {
  const m = ROLE_META[role] || ROLE_META.publisher;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

const EMPTY_FORM = { name: '', email: '', password: '', role: 'publisher' };

export default function UsersManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'publisher', password: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, role: u.role, password: '' });
    setEditError('');
  };
  const cancelEdit = () => { setEditingId(null); setEditError(''); };
  const saveEdit = async () => {
    if (!editForm.name.trim()) { setEditError('Nama diperlukan'); return; }
    if (editForm.password && editForm.password.length < 6) {
      setEditError('Password baru minimal 6 karakter (kosongkan jika tidak diubah)');
      return;
    }
    setEditSaving(true); setEditError('');
    try {
      const body = { name: editForm.name.trim(), role: editForm.role };
      if (editForm.password) body.password = editForm.password;
      const updated = await api(`/users/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
      setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      setEditingId(null);
      setToast('Pengguna diperbarui');
    } catch (err) {
      setEditError(err.message || 'Gagal memperbarui');
    } finally {
      setEditSaving(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await api('/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name     = 'Nama diperlukan';
    if (!form.email.trim()) e.email    = 'Email diperlukan';
    if (form.password.length < 6) e.password = 'Password minimal 6 karakter';
    return e;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSaving(true);
    try {
      const created = await api('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setUsers(prev => [...prev, created]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setErrors({});
      setToast('Pengguna berhasil ditambahkan');
    } catch (err) {
      setToast(err.message || 'Gagal membuat pengguna');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setDeletingId(id);
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== id));
      setToast('Pengguna dihapus');
    } catch (err) {
      setToast(err.message || 'Gagal menghapus pengguna');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID') : '—';

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setErrors({}); }}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Batal' : 'Tambah Pengguna'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-800 mb-5">Pengguna Baru</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nama Lengkap" error={errors.name}>
              <input
                className={inputCls}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nama lengkap"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@domain.com"
              />
            </Field>
            <Field label="Password" error={errors.password}>
              <input
                type="password"
                className={inputCls}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 karakter"
              />
            </Field>
            <Field label="Role">
              <select
                className={inputCls}
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin — akses penuh</option>
                <option value="publisher">Publisher — kelola konten saja</option>
              </select>
            </Field>
            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {saving && <Spinner small />}
                Tambah Pengguna
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User list */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Spinner /> <span className="text-sm">Memuat pengguna...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">Belum ada pengguna.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pengguna</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Bergabung</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                editingId === u.id ? (
                  <tr key={u.id} className="bg-orange-50/30">
                    <td className="px-6 py-4" colSpan={4}>
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Nama</label>
                            <input className={inputCls} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} disabled={editSaving} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
                            <select className={inputCls} value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} disabled={editSaving}>
                              <option value="admin">Admin</option>
                              <option value="publisher">Publisher</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Password baru (opsional)</label>
                            <input type="password" className={inputCls} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Kosongkan jika tidak diubah" disabled={editSaving} />
                          </div>
                        </div>
                        {editError && <p className="text-xs text-red-500">{editError}</p>}
                        <div className="flex items-center gap-2">
                          <button onClick={saveEdit} disabled={editSaving} className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60 px-3 py-1.5 rounded-md">
                            {editSaving && <Spinner small />} Simpan
                          </button>
                          <button onClick={cancelEdit} disabled={editSaving} className="text-xs font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-md border border-slate-200">
                            Batal
                          </button>
                          <p className="text-[11px] text-slate-400 ml-2">Email tidak dapat diubah.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-slate-400 hidden md:table-cell">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => startEdit(u)}
                          className="text-xs font-medium text-orange-500 hover:text-orange-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
                        >
                          Edit
                        </button>
                        {u.id !== currentUser?.id ? (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={deletingId === u.id}
                            className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                          >
                            {deletingId === u.id ? <Spinner small /> : 'Hapus'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 px-3 py-1.5">Akun Anda</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
