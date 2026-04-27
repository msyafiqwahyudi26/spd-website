import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import TeamGrid from '../../components/team/TeamProfile';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { TEAM_FEATURED, TEAM_MEMBERS } from '../../data/about';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useI18n } from '@/i18n';

function toCardShape(row) {
  return {
    id:        row.id,
    name:      row.name,
    role:      row.role,
    expertise: row.expertise,
    bio:       row.bio,
    src:       row.photoUrl ? resolveMediaUrl(row.photoUrl) : null,
  };
}

export default function Struktur() {
  const { t } = useI18n();
  const [animRef, visible] = useScrollAnimation();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/team')
      .then(rows => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        if (list.length === 0) { setData({ featured: null, members: [] }); return; }
        const mapped = list.map(toCardShape);
        const featured = mapped.find(m => list.find(r => r.id === m.id)?.featured) || null;
        const members  = mapped.filter(m => m.id !== featured?.id);
        setData({ featured, members });
      })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, []);

  const useFallback = !data || (!data.featured && data.members.length === 0);
  const featured = useFallback ? TEAM_FEATURED : data.featured;
  const members  = useFallback ? TEAM_MEMBERS  : data.members;

  return (
    <>
      <Hero
        title={t('about.struktur')}
        subtitle={t('about.struktur.hero.subtitle')}
        bgImage={null}
      />
      <AboutSubNav />

      <section
        ref={animRef}
        className={`py-16 px-4 bg-white ${visible ? 'animate-fade-up' : 'opacity-0'}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">{t('about.struktur.team.title')}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {t('about.struktur.team.subtitle')}
            </p>
          </div>
          <TeamGrid featured={featured} members={members} />
        </div>
      </section>
    </>
  );
}
