import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NotFound() {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl font-extrabold text-orange-500 mb-4">404</p>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">{t('notfound.title')}</h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">{t('notfound.body')}</p>
        <p className="text-xs text-slate-400 font-mono bg-white border border-slate-200 rounded-md px-3 py-2 mb-8 break-all">
          {location.pathname}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/beranda"
            className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {t('notfound.home')}
          </Link>
          <Link
            to="/kontak"
            className="inline-flex items-center justify-center bg-white border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-600 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {t('notfound.contact')}
          </Link>
        </div>
      </div>
    </section>
  );
}
