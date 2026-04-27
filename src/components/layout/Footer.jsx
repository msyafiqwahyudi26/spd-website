import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-spd.svg';
import { useSettings } from '../../hooks/useSettings';
import { resolveMedia } from '../../config/media';
import { api } from '@/lib/api';
import { useI18n } from '@/i18n';

// Static fallbacks — shown only when the admin hasn't added any footer
// links via the dashboard. Keep labels stable so the page isn't empty
// on a fresh install.
const FALLBACK_NAV = [
  { id: 'nav-home',      label: 'Beranda',      url: '/beranda' },
  { id: 'nav-about',     label: 'Tentang Kami', url: '/tentang-kami' },
  { id: 'nav-program',   label: 'Program',      url: '/program' },
  { id: 'nav-publikasi', label: 'Publikasi',    url: '/publikasi' },
  { id: 'nav-event',     label: 'Kegiatan',     url: '/event' },
  { id: 'nav-kontak',    label: 'Kontak',       url: '/kontak' },
];
const FALLBACK_LAYANAN = [
  { id: 'srv-riset',         label: 'Riset & Analisis Kebijakan', url: '/publikasi' },
  { id: 'srv-kampanye',      label: 'Kampanye Digital',           url: '/program' },
  { id: 'srv-adv-publik',    label: 'Advokasi Publik',            url: '/tentang-kami' },
  { id: 'srv-adv-kebijakan', label: 'Advokasi Kebijakan',         url: '/publikasi' },
];

// Social icons are static SVGs; the href comes from settings.social.* and
// each link is rendered only when its URL is non-empty. Admin controls
// visibility + targets from the Settings page.
const SOCIAL_ICONS = {
  facebook: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  twitter: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  linkedin: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  instagram: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
};

const SOCIAL_LABELS = { facebook: 'Facebook', twitter: 'Twitter / X', linkedin: 'LinkedIn', instagram: 'Instagram' };

function NewsletterForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ kind: 'idle', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (status.kind === 'loading') return;
    const value = email.trim();
    if (!value) {
      setStatus({ kind: 'error', message: t('footer.emailRequired') });
      return;
    }
    setStatus({ kind: 'loading', message: '' });
    try {
      await api('/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email: value }),
      });
      setStatus({ kind: 'success', message: t('footer.subscribeSuccess') });
      setEmail('');
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err?.message || t('footer.subscribeFail'),
      });
    }
  };

  // After success, show a thank-you state briefly, then reset so a second
  // subscribe (different email, shared device) is still possible without reload.
  useEffect(() => {
    if (status.kind !== 'success') return undefined;
    const t = setTimeout(() => setStatus({ kind: 'idle', message: '' }), 4000);
    return () => clearTimeout(t);
  }, [status.kind]);

  const statusClass = {
    error: 'text-red-400',
    loading: 'text-slate-400',
  }[status.kind] || '';

  if (status.kind === 'success') {
    return (
      <div role="status" aria-live="polite" className="bg-slate-800/60 border border-emerald-500/30 rounded-md px-4 py-3 flex items-start gap-3">
        <svg className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-xs text-emerald-100 leading-snug">{status.message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2" noValidate>
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status.kind === 'loading'}
          placeholder={t('footer.emailPlaceholder')}
          className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2.5 rounded-l-md placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors duration-200 disabled:opacity-70"
        />
        <button
          type="submit"
          disabled={status.kind === 'loading'}
          aria-label="Kirim"
          className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 px-3.5 rounded-r-md transition-colors duration-200 flex items-center justify-center shrink-0 disabled:opacity-70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {status.message && (
        <p className={`text-xs ${statusClass}`} role="status" aria-live="polite">
          {status.message}
        </p>
      )}
    </form>
  );
}

export default function Footer() {
  const { settings } = useSettings();
  const { t } = useI18n();
  const logoSrc = resolveMedia(logo, settings.images?.logo);

  const [navLinks, setNavLinks] = useState(null);
  const [layananLinks, setLayananLinks] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/footer-links')
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setNavLinks(list.filter((r) => r.section === 'nav'));
        setLayananLinks(list.filter((r) => r.section === 'layanan'));
      })
      .catch(() => { if (!cancelled) { setNavLinks([]); setLayananLinks([]); } });
    return () => { cancelled = true; };
  }, []);

  // Fallback-on-empty: when admin hasn't populated links, use static so the
  // page doesn't feel unfinished. Once admin adds any link to a section, the
  // API list takes over for that section.
  const navItems     = (navLinks     && navLinks.length     > 0) ? navLinks     : FALLBACK_NAV;
  const layananItems = (layananLinks && layananLinks.length > 0) ? layananLinks : FALLBACK_LAYANAN;
  return (
    <footer className="bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — SPD Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-base font-bold text-white mb-3 leading-snug">
              {settings.siteName}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              {t('footer.tagline')}
            </p>
            <div className="flex gap-2">
              {['facebook', 'twitter', 'linkedin', 'instagram'].map((key) => {
                const url = settings.social?.[key];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[key]}
                    className="w-8 h-8 rounded-md bg-slate-700 hover:bg-orange-500 flex items-center justify-center text-white transition-colors duration-200"
                  >
                    {SOCIAL_ICONS[key]}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Navigasi */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              {t('footer.nav')}
            </h4>
            <ul className="space-y-2.5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    className="text-sm text-slate-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Layanan */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">
              {t('footer.services')}
            </h4>
            <ul className="space-y-2.5">
              {layananItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.url}
                    className="text-sm text-slate-400 hover:text-orange-500 transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3 tracking-wide">
              {t('footer.newsletter')}
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {t('footer.newsletterCopy')}
            </p>
            <NewsletterForm />
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-xs text-slate-500 text-center">
            {t('footer.copyright')}
          </p>
        </div>
      </div>

      {/* Tiny admin shortcut — visually invisible, accessible only to those who know */}
      <Link
        to="/login"
        className="absolute bottom-2 right-3 w-3 h-3 opacity-0 hover:opacity-5 transition-opacity"
        aria-label="Login"
        tabIndex={-1}
      />
    </footer>
  );
}
                                                                                                          