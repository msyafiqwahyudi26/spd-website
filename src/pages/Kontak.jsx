import Hero from '../components/sections/Hero';
import ContactSection from '../components/sections/ContactSection';
import { useI18n } from '@/i18n';

export default function Kontak() {
  const { t } = useI18n();
  return (
    <>
      <Hero
        title={t('kontak.hero.title')}
        subtitle={t('kontak.hero.subtitle')}
      />
      <ContactSection hideTitle />
    </>
  );
}
