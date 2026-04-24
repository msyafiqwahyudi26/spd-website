const FEATURES = [
  {
    id: 1,
    title: 'Kolaborasi Multi-Pihak',
    description:
      'Program advokasi politik untuk pemilih muda dalam rangka mempromosikan dialog yang konstruktif, partisipatif aktif, dan harapan perbedaan melalui proses politik elektoral.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12">
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
  },
  {
    id: 2,
    title: 'Pusat Data Pemilu',
    description:
      'Mengembangkan program pusat data pemilu dan inisiatif platform data untuk mendukung transparansi informasi.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <rect x="6" y="30" width="8" height="12" rx="2" fill="#F97316"/>
        <rect x="20" y="20" width="8" height="22" rx="2" fill="#F97316" opacity="0.7"/>
        <rect x="34" y="12" width="8" height="30" rx="2" fill="#F97316" opacity="0.4"/>
        <polyline points="10,28 24,18 38,10" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="28" r="2" fill="#F97316"/>
        <circle cx="24" cy="18" r="2" fill="#F97316"/>
        <circle cx="38" cy="10" r="2" fill="#F97316"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Youth Hub Community',
    description:
      'Memfasilitasi ruang partisipasi bagi generasi muda dalam politik melalui pengembangan Youth Hub Community in Politica.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <circle cx="24" cy="14" r="5" fill="#F97316"/>
        <circle cx="10" cy="18" r="4" fill="#F97316" opacity="0.6"/>
        <circle cx="38" cy="18" r="4" fill="#F97316" opacity="0.6"/>
        <path d="M14 38c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M4 40c0-4 2.686-7.371 6.381-8.508" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
        <path d="M44 40c0-4-2.686-7.371-6.381-8.508" stroke="#F97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      </svg>
    ),
  },
];

function FeatureCard({ icon, title, description }) {
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
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
