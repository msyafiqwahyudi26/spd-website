import { useEffect, useState } from 'react';
import Hero from '../../components/sections/Hero';
import AboutSubNav from './SubNav';
import TeamGrid from '../../components/team/TeamProfile';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { TEAM_FEATURED, TEAM_MEMBERS } from '../../data/about';

// Reshape the API row (name, role, expertise, bio, photoUrl, featured) into
// the shape the shared <TeamGrid> expects ({ id, name, role, expertise, bio, src }).
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

  // Until the API has responded (null), show the static fallback so the
  // page isn't empty on first paint. If the admin has added no members,
  // data.members is [] and we still show the fallback static list so the
  // page isn't blank.
  const useFallback = !data || (!data.featured && data.members.length === 0);
  const featured = useFallback ? TEAM_FEATURED : data.featured;
  const members  = useFallback ? TEAM_MEMBERS  : data.members;

  return (
    <>
      <Hero
        title="Struktur Organisasi"
        subtitle="Tim yang berdedikasi di balik kerja-kerja demokrasi SPD."
        bgImage={null}
      />
      <AboutSubNav />

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800">Tim Kami</h2>
            <p className="mt-2 text-sm text-slate-500">
              Klik salah satu kartu untuk melihat profil singkat.
            </p>
          </div>
          <TeamGrid featured={featured} members={members} />
        </div>
      </section>
    </>
  );
}
