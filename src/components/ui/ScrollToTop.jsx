import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Two behaviours in one component:
 * 1. On route change → instantly scroll the page to the top.
 * 2. After the user scrolls down 300px → show a floating button that
 *    scrolls back up smoothly when clicked.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // Reset scroll position on every navigation.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Show/hide the floating button.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visible ? (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-orange-500 text-white shadow-lg flex items-center justify-center hover:bg-orange-600 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  ) : null;
}
