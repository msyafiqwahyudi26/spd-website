import Hero from '../components/sections/Hero';
import QuickEntry from '../components/sections/QuickEntry';
import FeatureCards from '../components/sections/FeatureCards';
import ProgramCards from '../components/sections/ProgramCards';
import PublikasiSection from '../components/sections/PublikasiSection';
import DashboardSection from '../components/sections/DashboardSection';
import ContactSection from '../components/sections/ContactSection';
import Button from '../components/ui/Button';
import { useI18n } from '../i18n';
import { useSettings } from '../hooks/useSettings';

const DEFAULT_HERO_SUBTITLE =
  'Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia';

export default function Landing() {
  const { t } = useI18n();
  const { settings } = useSettings();
  const heroSubtitle = (settings.content?.heroSubtitle || '').trim() || DEFAULT_HERO_SUBTITLE;

  // CTAs: admin-editable via Settings → Hero tab. Fall back to i18n
  // defaults when the admin hasn't set anything. CTA1 is the outline
  // "learn more"-style button; CTA2 is the filled primary action.
  const cta1Label = settings.hero?.cta1?.label?.trim() || t('hero.learnMore');
  const cta1Href  = settings.hero?.cta1?.href?.trim()  || '/tentang-kami';
  const cta2Label = settings.hero?.cta2?.label?.trim() || t('hero.viewPrograms');
  const cta2Href  = settings.hero?.cta2?.href?.trim()  || '/program';

  return (
    <>
      <Hero
        title={settings.siteName || 'Sindikasi Pemilu dan Demokrasi'}
        subtitle={heroSubtitle}
      >
        <Button href={cta1Href} variant="outline">{cta1Label}</Button>
        <Button href={cta2Href} variant="navy">{cta2Label}</Button>
      </Hero>
      <QuickEntry />
      <FeatureCards />
      <PublikasiSection />
      <ProgramCards limit={3} />
      <DashboardSection />
      <ContactSection />
    </>
  );
}
