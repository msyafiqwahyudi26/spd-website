import Hero from '../components/sections/Hero';
import PublikasiSection from '../components/sections/PublikasiSection';

export default function Publikasi() {
  return (
    <>
      <Hero
        title="Publikasi dan Analisis"
        subtitle="Artikel, riset, dan analisis SPD tentang pemilu dan demokrasi di Indonesia."
      />
      <PublikasiSection isPage={true} />
    </>
  );
}
