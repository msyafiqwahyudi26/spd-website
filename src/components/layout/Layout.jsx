import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../ui/ScrollToTop';
import TopProgress from '../ui/TopProgress';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopProgress />
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
