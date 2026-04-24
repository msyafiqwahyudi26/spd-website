import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ApproachIcon } from '../../data/approachIcons';
import { resolveMediaUrl } from '@/lib/media';

// Fallback content — shown before the admin populates approaches in the DB.
const FALLBACK = [
  {
    id: 'fb-1',
    iconKey: 'collaboration',
    iconUrl: '',
    title: 'Kolaborasi Multi-Pihak',
    description:
      'Program advokasi politik untuk pemilih muda dalam rangka mempromosikan dialog yang konstruktif, partisipatif aktif, dan harapan perbedaan melalui proses politik elektoral.',
  },
  {
    id: 'fb-2',
    iconKey: 'data',
    iconUrl: '',
    title: 'Pusat Data Pemilu',
    description: 'Mengembangkan program pusat data pemilu dan inisiatif platform data untuk mendukung transparansi informasi.',
  },
  {
    id: 'fb-3',
    iconKey: 'youth',
    iconUrl: '',
    title: 'Youth Hub Community',
    description: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik melalui pengembangan Youth Hub Community in Politica.',
  },
];

function FeatureCard({ iconKey, iconUrl, title, description }) {
  const resolvedUrl = iconUrl ? resolveMediaUrl(iconUrl) : '';
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-100/60 hover:border-orange-100">
      <div className="mb-4 transition-transform duration-300 ease-out group-hover:scale-110">
        <ApproachIcon iconKey={iconKey} iconUrl={resolvedUrl} className="w-12 h-12 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-3 transition-colors duration-200 group-hover:text-orange-600">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default function FeatureCards() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/approaches')
      .then((rows) => { if (!cancelled) setItems(Array.isArray(rows) ? rows : []); })
      .catch(()    => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  const list = items === null || items.length === 0 ? FALLBACK : items;

  return (
    <section className="py-16 px-4 bg-white fade-in-up">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">Pendekatan Kami</h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Tiga pilar yang membedakan cara SPD bekerja — kolaborasi multihak,
            data terbuka, dan ruang bagi generasi muda dalam politik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {list.map((item) => (
            <FeatureCard
              key={item.id}
              iconKey={item.iconKey || 'collaboration'}
              iconUrl={item.iconUrl || ''}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
