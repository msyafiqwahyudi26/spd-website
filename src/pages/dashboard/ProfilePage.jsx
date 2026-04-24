import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '@/lib/api';
import { inputCls, Toast, Field, Spinner } from './shared';

export default function ProfilePage() {
  const ctx = useOutletContext();
  const [me, setMe] = useState(ctx?.user || null);
  const [name, setName] = useState(ctx?.user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Pull the freshest copy in case sidebar context is stale.
    api('/auth/me').then((u) => {
      if (u) { setMe(u); setName(u.name || ''); }
    }).catch(() => { /* ignore */ });
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setError('');
    const body = {};
    if (name.trim() && name.trim() !== me?.name) body.name = name.trim();
    if (Object.keys(body).length === 0) {
      setToast('Tidak ada perubahan');
      return;
    }
    setSaving(true);
    try {
      const updated = await api('/auth/me', { method: 'PATCH', body: JSON.stringify(body) });
      setMe(updated);
      setToast('Profil diperbarui');
    } catch (err) {
      setError(err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword) { setError('Masukkan password saat ini.'); return; }
    if (newPassword.length < 8) { setError('Password baru minimal 8 karakter.'); return; }
    if (newPassword !== newPasswordConfirm) { setError('Konfirmasi password tidak cocok.'); return; }
    setSaving(true);
    try {
      await api('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword(''); setNewPassword(''); setNewPasswordConfirm('');
      setToast('Password berhasil diubah');
    } catch (err) {
      setError(err.message || 'Gagal mengubah password');
    } finally {
      setSaving(false);
    }
  };

  if (!me) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {toast && <Toast message={toast} onDone={() => setToast('')} />}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Akun Saya</h1>
        <p className="text-sm text-slate-500 mt-0.5">Kelola nama tampilan dan password pribadi Anda.</p>
      </div>

      {/* Identity card */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-bold shrink-0">
            {me.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-500">Email</p>
            <p className="text-sm font-medium text-slate-800">{me.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Peran: <span className="font-semibold text-slate-600">{me.role === 'admin' ? 'Admin' : 'Publisher'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Nama Tampilan">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
          </Field>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving || name.trim() === me.name}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              {saving && <Spinner small />} Simpan Nama
            </button>
          </div>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Ubah Password</h2>
        <p className="text-sm text-slate-500 mb-5">Masukkan password saat ini untuk memverifikasi. Minimal 8 karakter untuk password baru.</p>

        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Password Saat Ini">
            <input type="password" className={inputCls} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={saving} autoComplete="current-password" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password Baru">
              <input type="password" className={inputCls} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={saving} autoComplete="new-password" />
            </Field>
            <Field label="Konfirmasi Password Baru">
              <input type="password" className={inputCls} value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} disabled={saving} autoComplete="new-password" />
            </Field>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving || !currentPassword || !newPassword}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              {saving && <Spinner small />} Ubah Password
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
