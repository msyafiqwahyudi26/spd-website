import { useState } from 'react';
import { api } from '@/lib/api';
import { useSettings } from '@/hooks/useSettings';
import { useI18n } from '@/i18n';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const LOCATION = {
  label: 'Alamat',
  value:
    'Jl. Tebet Barat Dalam II C No.14, RT.2/RW.3, Tebet Barat, Kec. Tebet, Kota Jakarta Selatan, DKI Jakarta 12810',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.142 17 12.621 17 9A7 7 0 1 0 3 9c0 3.621 1.698 6.142 3.354 7.585.829.799 1.654 1.38 2.274 1.765.311.193.571.337.757.433a5.741 5.741 0 0 0 .281.14l.018.008.006.003ZM10 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" clipRule="evenodd" />
    </svg>
  ),
};

const EMAIL_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
  </svg>
);

export default function ContactSection({ hideTitle = false }) {
  const { t } = useI18n();
  const [animRef, visible] = useScrollAnimation();
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ kind: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus({ kind: 'error', message: 'Mohon lengkapi semua field.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ kind: 'loading', message: t('kontak.sending') });
    try {
      await api('/contacts', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      setStatus({ kind: 'success', message: t('kontak.success') });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err?.message || t('kontak.error'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactEmail = settings?.email || 'kontak@spdindonesia.org';
  const contactPhone = settings?.phone || '';

  const statusClass = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    error:   'bg-red-50 text-red-600 border-red-100',
    loading: 'bg-slate-100 text-slate-600 border-slate-200',
  }[status.kind] || '';

  return (
    <section
      ref={animRef}
      className={`py-16 px-4 bg-white ${visible ? 'animate-fade-up' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto">
        {!hideTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">{t('kontak.title')}</h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto leading-relaxed">
              {t('kontak.subtitle')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          <div>
            <h3 className="text-base font-semibold text-slate-800 mb-6">
              {t('kontak.address')}
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="shrink-0 w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white mt-0.5">
                  {LOCATION.icon}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                    {t('kontak.address')}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{LOCATION.value}</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="shrink-0 w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white mt-0.5">
                  {EMAIL_ICON}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                    {t('kontak.email')}
                  </p>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm text-slate-700 leading-relaxed hover:text-orange-500 transition-colors break-all"
                  >
                    {contactEmail}
                  </a>
                </div>
              </li>
              {contactPhone && (
                <li className="flex items-start gap-4">
                  <span className="shrink-0 w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center text-white mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                      {t('kontak.phone')}
                    </p>
                    <a
                      href={`https://wa.me/${contactPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-700 leading-relaxed hover:text-orange-500 transition-colors"
                    >
                      {contactPhone}
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-orange-500 mb-6">
              {t('kontak.send')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {status.kind !== 'idle' && (
                <div className={`p-3 rounded-lg text-sm font-medium border ${statusClass}`}>
                  {status.message}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('kontak.name')}
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t('kontak.namePlaceholder')}
                  maxLength={200}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('kontak.email')}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@example.com"
                  maxLength={200}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t('kontak.message')}
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={t('kontak.messagePlaceholder')}
                  maxLength={5000}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors duration-200 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isSubmitting ? t('kontak.sending') : t('kontak.send')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
