import { useSearchParams } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import PublikasiSection from '../components/sections/PublikasiSection';
import { useI18n } from '@/i18n';

export default function Publikasi() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const tipe = searchParams.get('tipe');

  const TIPE_MAP = {
    riset: { contentType: 'research', title: t('pub.riset.title'), subtitle: t('pub.riset.subtitle') },
    buku:  { contentType: 'book',     title: t('pub.buku.title'),  subtitle: t('pub.buku.subtitle') },
  };

  const filter = TIPE_MAP[tipe] || null;

  return (
    <>
      <Hero
        title={filter ? filter.title : t('pub.hero.title')}
        subtitle={filter ? filter.subtitle : t('pub.hero.subtitle')}
      />
      <PublikasiSection isPage={true} contentTypeFilter={filter?.contentType || null} />
    </>
  );
}
