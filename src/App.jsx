import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { I18nProvider } from './i18n';
import Entry from './pages/Entry';
import Landing from './pages/Landing';
import About from './pages/About';
import AboutProfil from './pages/about/Profil';
import AboutVisiMisi from './pages/about/VisiMisi';
import AboutStruktur from './pages/about/Struktur';
import AboutMitra from './pages/about/Mitra';
import AboutLaporan from './pages/about/LaporanTahunan';
import Program from './pages/Program';
import ProgramDetail from './pages/ProgramDetail';
import Publikasi from './pages/Publikasi';
import PublikasiDetail from './pages/PublikasiDetail';
import Event from './pages/Event';
import EventDetail from './pages/EventDetail';
import DataPemilu from './pages/DataPemilu';
import Kontak from './pages/Kontak';
import NotFound from './pages/NotFound';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequireAdmin from './components/RequireAdmin';
import DashboardOverview from './pages/dashboard/Overview';
import PublikasiManager from './pages/dashboard/PublikasiManager';
import EventManager from './pages/dashboard/EventManager';
import ProgramManager from './pages/dashboard/ProgramManager';
import SettingsManager from './pages/dashboard/SettingsManager';
import MessagesManager from './pages/dashboard/MessagesManager';
import UsersManager from './pages/dashboard/UsersManager';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import LogsPage from './pages/dashboard/LogsPage';
import MediaManager from './pages/dashboard/MediaManager';
import PartnersManager from './pages/dashboard/PartnersManager';
import TeamManager from './pages/dashboard/TeamManager';
import TimelineManager from './pages/dashboard/TimelineManager';
import ReportsManager from './pages/dashboard/ReportsManager';
import SubscribersManager from './pages/dashboard/SubscribersManager';
import InfografisManager from './pages/dashboard/InfografisManager';
import BerandaManager from './pages/dashboard/BerandaManager';
import TentangManager from './pages/dashboard/TentangManager';
import ProfilePage from './pages/dashboard/ProfilePage';
import ComingSoon from './pages/dashboard/ComingSoon';


export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes with Layout (Header + Footer) */}
          <Route element={<Layout />}>
            {/* Entry = simplified Beranda (same shell, fewer sections). */}
            <Route index element={<Entry />} />
            <Route path="/beranda" element={<Landing />} />

            {/* Tentang Kami */}
            <Route path="/tentang-kami" element={<About />} />
            <Route path="/tentang-kami/profil" element={<AboutProfil />} />
            <Route path="/tentang-kami/visi-misi" element={<AboutVisiMisi />} />
            <Route path="/tentang-kami/struktur" element={<AboutStruktur />} />
            <Route path="/tentang-kami/mitra" element={<AboutMitra />} />
            <Route path="/tentang-kami/laporan-tahunan" element={<AboutLaporan />} />

            {/* Program */}
            <Route path="/program" element={<Program />} />
            <Route path="/program/:slug" element={<ProgramDetail />} />

            {/* Publikasi */}
            <Route path="/publikasi" element={<Publikasi />} />
            <Route path="/publikasi/:slug" element={<PublikasiDetail />} />

            {/* Event */}
            <Route path="/event" element={<Event />} />
            <Route path="/event/:slug" element={<EventDetail />} />

            {/* Lainnya */}
            <Route path="/data-pemilu" element={<DataPemilu />} />
            <Route path="/kontak" element={<Kontak />} />

            {/* Catch-all within the layout so unknown public URLs render
                the 404 inside the site frame (header + footer). */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index              element={<DashboardOverview />} />
            {/* Content routes — accessible to admin and publisher */}
            <Route path="publikasi"   element={<PublikasiManager />} />
            <Route path="event"       element={<EventManager />} />
            <Route path="program"     element={<ProgramManager />} />
            <Route path="akun"        element={<ProfilePage />} />
            {/* Admin-only routes — publishers get redirected to /dashboard */}
            <Route element={<RequireAdmin />}>
              <Route path="settings"    element={<SettingsManager />} />
              <Route path="beranda"     element={<BerandaManager />} />
              <Route path="tentang"     element={<TentangManager />} />
              <Route path="pesan"       element={<MessagesManager />} />
              <Route path="pengguna"    element={<UsersManager />} />
              <Route path="analitik"    element={<AnalyticsPage />} />
              <Route path="logs"        element={<LogsPage />} />
              <Route path="media"       element={<MediaManager />} />
              <Route path="mitra"       element={<PartnersManager />} />
              <Route path="tim"         element={<TeamManager />} />
              <Route path="perjalanan"  element={<TimelineManager />} />
              <Route path="laporan"     element={<ReportsManager />} />
              <Route path="subscribers" element={<SubscribersManager />} />
              <Route path="infografis"  element={<InfografisManager />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      </I18nProvider>
    </ErrorBoundary>
  );
}
