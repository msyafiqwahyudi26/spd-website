import { useState } from 'react';
import Modal from '../ui/Modal';

// Shared avatar used by every team surface so the fallback silhouette is
// identical across pages. Accepts `src` (photo) and an optional `large`
// variant for featured members.
export function Avatar({ src, large = false }) {
  const size = large ? 'w-32 h-32' : 'w-24 h-24';
  if (src) {
    return (
      <div className={`${size} rounded-full overflow-hidden mx-auto bg-slate-100`}>
        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`${size} rounded-full bg-slate-700 overflow-hidden flex items-end justify-center mx-auto`}>
      <svg viewBox="0 0 100 110" className="w-full" aria-hidden="true">
        <circle cx="50" cy="36" r="22" fill="#64748b" />
        <ellipse cx="50" cy="115" rx="42" ry="34" fill="#64748b" />
      </svg>
    </div>
  );
}

// Clickable team card. Opens a bio modal via `onOpen`. Every place that
// renders a team member uses this so interaction is consistent.
export function TeamCard({ member, onOpen, large = false }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(member)}
      className="group text-center transition-transform duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 rounded-lg w-full"
      aria-label={`Lihat profil ${member.name}`}
    >
      <div className="transition-transform duration-300 ease-out group-hover:scale-105 inline-block">
        <Avatar src={member.src} large={large} />
      </div>
      <p className={`font-semibold text-slate-800 mt-3 transition-colors duration-200 group-hover:text-orange-600 ${large ? 'text-base' : 'text-sm'}`}>
        {member.name}
      </p>
    </button>
  );
}

export function TeamMemberModal({ member, onClose }) {
  return (
    <Modal open={!!member} onClose={onClose} title={member?.name} maxWidth="max-w-2xl">
      {member && (
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 items-start">
          <div className="w-40 sm:w-full mx-auto">
            <Avatar src={member.src} large />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
            <p className="text-sm font-semibold text-orange-500 mt-1 mb-4">{member.role}</p>
            {/* Preserve the admin's paragraph breaks — they write bios
                with blank lines between paragraphs; public output should
                render them as distinct paragraphs, not one mashed block. */}
            {member.bio && (
              <div className="text-sm text-slate-600 leading-relaxed mb-5 space-y-3">
                {member.bio.split(/\n\s*\n/).map((para, i) => (
                  <p key={i} className="whitespace-pre-line">{para}</p>
                ))}
              </div>
            )}
            {member.expertise && (
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                Fokus: <span className="font-semibold text-slate-700">{member.expertise}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

/**
 * Controller that wires a list of team cards to a shared modal. Drop this
 * in and you get identical interaction everywhere: click → modal with bio.
 *
 *   <TeamGrid featured={TEAM_FEATURED} members={TEAM_MEMBERS} />
 */
export default function TeamGrid({ featured, members = [] }) {
  const [selected, setSelected] = useState(null);
  return (
    <>
      {featured && (
        <div className="flex justify-center mb-10">
          <div className="text-center">
            <TeamCard member={featured} large onOpen={setSelected} />
          </div>
        </div>
      )}
      {members.length > 0 && (
        <div className={featured ? 'border-t border-slate-100 pt-10' : ''}>
          {featured && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-8">Staf</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {members.map((m) => (
              <TeamCard key={m.id} member={m} onOpen={setSelected} />
            ))}
          </div>
        </div>
      )}
      <TeamMemberModal member={selected} onClose={() => setSelected(null)} />
    </>
  );
}
