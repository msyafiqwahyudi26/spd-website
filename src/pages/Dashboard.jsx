import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useIdleLogout } from '../hooks/useIdleLogout';
import { api } from '@/lib/api';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const Icon = ({ path, className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  overview:  'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  doc:       'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  calendar:  'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  chat:      'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  users:     'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  chart:     'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  log:       'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z',
  settings:  'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  logout:    'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
  external:  'M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25',
  media:     'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6A2.25 2.25 0 014.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6z',
  mail:      'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
};

/* ── Nav groups ─────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'KONTEN',
    items: [
      { name: 'Overview',  path: '/dashboard',            exact: true, icon: 'overview' },
      { name: 'Publikasi', path: '/dashboard/publikasi',               icon: 'doc'      },
      { name: 'Event',     path: '/dashboard/event',                   icon: 'calendar' },
      { name: 'Program',   path: '/dashboard/program',                 icon: 'chart'    },
    ],
  },
  {
    label: 'HALAMAN',
    adminOnly: true,
    items: [
      { name: 'Beranda',        path: '/dashboard/beranda',     icon: 'overview'  },
      { name: 'Tentang Kami',   path: '/dashboard/tentang',     icon: 'doc'       },
      { name: 'Tim & Struktur', path: '/dashboard/tim',         icon: 'users'     },
      { name: 'Perjalanan',     path: '/dashboard/perjalanan',  icon: 'calendar'  },
      { name: 'Laporan Tahunan',path: '/dashboard/laporan',     icon: 'doc'       },
      { name: 'Mitra',          path: '/dashboard/mitra',       icon: 'users'     },
      { name: 'Infografis Pemilu', path: '/dashboard/infografis', icon: 'media'   },
    ],
  },
  {
    label: 'KOMUNIKASI',
    adminOnly: true,
    items: [
      { name: 'Pesan',      path: '/dashboard/pesan',       badge: 'unread', icon: 'chat' },
      { name: 'Pelanggan',  path: '/dashboard/subscribers',                  icon: 'mail' },
    ],
  },
  {
    label: 'SISTEM',
    adminOnly: true,
    items: [
      { name: 'Pustaka Media', path: '/dashboard/media',      icon: 'media'    },
      { name: 'Pengguna',      path: '/dashboard/pengguna',   icon: 'users'    },
      { name: 'Analitik',      path: '/dashboard/analitik',   icon: 'chart'    },
      { name: 'Log Sistem',    path: '/dashboard/logs',       icon: 'log'      },
      { name: 'Pengaturan',    path: '/dashboard/settings',   icon: 'settings' },
    ],
  },
];

/* ── Sidebar nav link ───────────────────────────────────────────────────── */
function NavLink({ item, location, unread }) {
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  const badge = item.badge === 'unread' && unread > 0 ? unread : null;

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
        isActive
          ? 'bg-orange-50 text-orange-600'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
    >
      <Icon
        path={ICONS[item.icon]}
        className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-slate-600'}`}
      />
      <span className="flex-1">{item.name}</span>
      {badge && (
        <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

/* ── Main layout ────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  const isAdmin = user?.role === 'admin';

  useIdleLogout({ enabled: !!user, logout });

  useEffect(() => {
    if (!user || !isAdmin) return;
    api('/contacts/stats')
      .then(d => setUnread(d?.unread ?? 0))
      .catch(() => {});
  }, [user, isAdmin, location.pathname]);

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 fixed inset-y-0 left-0 z-10">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">SPD Indonesia</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Admin Panel</p>
            </div>
            <Icon path={ICONS.external} className="w-3 h-3 text-slate-300 group-hover:text-slate-400 ml-auto" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_GROUPS.map((group) => {
            if (group.adminOnly && !isAdmin) return null;
            return (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(item => (
                    <NavLink key={item.path} item={item} location={location} unread={unread} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-100 p-3 space-y-1">
          <Link
            to="/dashboard/akun"
            className="px-3 py-2 flex items-center gap-3 rounded-lg hover:bg-slate-50 transition-colors"
            title="Kelola akun Anda"
          >
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
              {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
              <p className={`text-[10px] font-medium ${isAdmin ? 'text-slate-500' : 'text-blue-500'}`}>
                {isAdmin ? 'Admin' : 'Publisher'} · Kelola akun
              </p>
            </div>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Icon path={ICONS.logout} className="w-4 h-4 shrink-0" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content — offset for fixed sidebar */}
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
