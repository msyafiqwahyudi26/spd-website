import Hero from '../components/sections/Hero';
import QuickEntry from '../components/sections/QuickEntry';
import Button from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import { useI18n } from '../i18n';

/**
 * Entry landing at `/`.
 *
 * Structurally a simplified Beranda: same header + footer shell (supplied
 * by the Layout route), but only two content sections — Hero with a clear
 * CTA, and QuickEntry with the most recent activity. Visitors who want
 * the full tour click "Masuk ke Situs Lengkap" → /beranda.
 *
 * Deliberately does NOT include FeatureCards, PublikasiSection,
 * ProgramCards, DashboardSection, ContactSection. Those live on
 * /beranda. Keeping entry lighter is the whole point.
 */

const DEFAULT_HERO_SUBTITLE =
  'Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia.';

export default function Entry() {
  const { settings } = useSettings();
  const { t } = useI18n();
  const subtitle = (settings.content?.heroSubtitle || '').trim() || DEFAULT_HERO_SUBTITLE;

  return (
    <>
      <Hero
        title={settings.siteName || 'Sindikasi Pemilu dan Demokrasi'}
        subtitle={subtitle}
      >
        <Button href="/beranda" variant="navy">Jelajahi Situs</Button>
        <Button href="/tentang-kami" variant="outline">{t('hero.learnMore')}</Button>
      </Hero>
      <QuickEntry />
    </>
  );
}
