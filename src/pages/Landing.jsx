import Hero from '../components/sections/Hero';
import QuickEntry from '../components/sections/QuickEntry';
import FeatureCards from '../components/sections/FeatureCards';
import ProgramCards from '../components/sections/ProgramCards';
import PublikasiSection from '../components/sections/PublikasiSection';
import DashboardSection from '../components/sections/DashboardSection';
import ContactSection from '../components/sections/ContactSection';
import PhotoCollage from '../components/sections/PhotoCollage';
import Button from '../components/ui/Button';
import MEDIA from '../config/media';

// 8 slots: featured tile cycles through the first 3, the remaining 5
// populate static tiles. Captions come from the static media registry
// until the admin uploads real images via the Media manager.
const COLLAGE_FALLBACK = MEDIA.collage.slice(0, 8).map((c, i) => ({
  src: c.src,
  caption: c.caption || '',
  id: `fallback-${i}`,
}));

export default function Landing() {
  return (
    <>
      <Hero
        title="Sindikasi Pemilu dan Demokrasi"
        subtitle="Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia"
      >
        <Button href="/tentang-kami" variant="outline">Pelajari Lebih Lanjut</Button>
        <Button href="/program" variant="navy">Lihat Program Kami</Button>
      </Hero>
      <QuickEntry />
      <FeatureCards />
      <PublikasiSection />
      <ProgramCards limit={3} />
      <PhotoCollage
        fallback={COLLAGE_FALLBACK}
        title="Momen Kegiatan"
        subtitle="Cuplikan diskusi, sekolah, dan kolaborasi SPD di berbagai kota."
      />
      <DashboardSection />
      <ContactSection />
    </>
  );
}
