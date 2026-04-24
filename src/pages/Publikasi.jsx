import { useSearchParams } from 'react-router-dom';
import Hero from '../components/sections/Hero';
import PublikasiSection from '../components/sections/PublikasiSection';

const TIPE_MAP = {
  riset: { contentType: 'research', title: 'Hasil Riset SPD', subtitle: 'Laporan riset, kajian, dan studi empiris Sindikasi Pemilu dan Demokrasi.' },
  buku:  { contentType: 'book',     title: 'Buku SPD',        subtitle: 'Koleksi buku dan e-book yang diterbitkan oleh Sindikasi Pemilu dan Demokrasi.' },
};

export default function Publikasi() {
  const [searchParams] = useSearchParams();
  const tipe = searchParams.get('tipe');
  const filter = TIPE_MAP[tipe] || null;

  return (
    <>
      <Hero
        title={filter ? filter.title : 'Publikasi dan Analisis'}
        subtitle={filter ? filter.subtitle : 'Artikel, riset, dan analisis SPD tentang pemilu dan demokrasi di Indonesia.'}
      />
      <PublikasiSection isPage={true} contentTypeFilter={filter?.contentType || null} />
    </>
  );
}
