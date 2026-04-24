import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * Icon registry — fixed set, keyed by string. Admin picks one of these
 * when creating an Approach in the dashboard. We keep icons as inline
 * SVG (not uploaded assets) so the visual vocabulary stays deliberate.
 */
const ICONS = {
  collaboration: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
      <circle cx="16" cy="16" r="6" fill="#F97316" opacity="0.2"/>
      <circle cx="32" cy="16" r="6" fill="#F97316" opacity="0.2"/>
      <circle cx="24" cy="30" r="6" fill="#F97316" opacity="0.2"/>
      <circle cx="16" cy="16" r="4" fill="#F97316"/>
      <circle cx="32" cy="16" r="4" fill="#F97316"/>
      <circle cx="24" cy="30" r="4" fill="#F97316"/>
      <line x1="16" y1="16" x2="32" y2="16" stroke="#F97316" strokeWidth="2"/>
      <line x1="16" y1="16" x2="24" y2="30" stroke="#F97316" strokeWidth="2"/>
      <line x1="32" y1="16" x2="24" y2="30" stroke="#F97316" strokeWidth="2"/>
    </svg>
  ),
  data: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
      <rect x="6" y="30" width="8" height="12" rx="2" fill="#F97316"/>
      <rect x="20" y="20" width="8" height="22" rx="2" fill="#F97316" opacity="0.7"/>
      <rect x="34" y="12" width="8" height="30" rx="2" fill="#F97316" opacity="0.4"/>
      <polyline points="10,28 24,18 38,10" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="28" r="2" fill="#F97316"/>
      <circle cx="24" cy="18" r="2" fill="#F97316"/>
      <circle cx="38" cy="10" r="2" fill="#F97316"/>
    </svg>
  ),
  youth: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
      <circle cx="24" cy="14" r="5" fill="#F97316"/>
      <circle cx="10" cy="18" r="4" fill="#F97316" opacity="0.6"/>
      <circle cx="38" cy="18" r="4" fill="#F97316" opacity="0.6"/>
      <path d="M14 38c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M4 40c0-4 2.686-7.371 6.381-8.508" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M44 40c0-4-2.686-7.371-6.381-8.508" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
    </svg>
  ),
  policy: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12" aria-hidden="true">
      <path d="M12 6h18l6 6v30H12z" fill="#F97316" opacity="0.15" />
      <path d="M12 6h18l6 6v30H12z" stroke="#F97316" strokeWidth="2" fill="none" />
      <line x1="18" y1="20" x2="30" y2="20" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="26" x2="30" y2="26" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="32" x2="26" y2="32" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

// Fallback content matching the original three cards so the homepage is
// never blank before the admin populates approaches.
const FALLBACK = [
  {
    id: 'fb-1',
    iconKey: 'collaboration',
    title: 'Kolaborasi Multi-Pihak',
    description:
      'Program advokasi politik untuk pemilih muda dalam rangka mempromosikan dialog yang konstruktif, partisipatif aktif, dan harapan perbedaan melalui proses politik elektoral.',
  },
  {
    id: 'fb-2',
    iconKey: 'data',
    title: 'Pusat Data Pemilu',
    description: 'Mengembangkan program pusat data pemilu dan inisiatif platform data untuk mendukung transparansi informasi.',
  },
  {
    id: 'fb-3',
    iconKey: 'youth',
    title: 'Youth Hub Community',
    description: 'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik melalui pengembangan Youth Hub Community in Politica.',
  },
];

function FeatureCard({ iconKey, title, description }) {
  const icon = ICONS[iconKey] || ICONS.collaboration;
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-100/60 hover:border-orange-100">
      <div className="mb-4 transition-transform duration-300 ease-out group-hover:scale-110">
        {icon}
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
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
