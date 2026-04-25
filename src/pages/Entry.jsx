import Hero from '../components/sections/Hero';
import QuickEntry from '../components/sections/QuickEntry';
import ContactSection from '../components/sections/ContactSection';
import Button from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import { useI18n } from '../i18n';

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
        <Button href="/tentang-kami" variant="outline">{t('hero.learnMore')}</Button>
        <Button href="/beranda" variant="navy">Jelajahi Situs</Button>
      </Hero>
      <QuickEntry />
      <ContactSection />
    </>
  );
}
