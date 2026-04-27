import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Two behaviours:
 * 1. Route change → instantly reset scroll to top.
 * 2. After 300px scroll → floating button with:
 *    - Smooth spring enter/exit animation
 *    - Circular reading-progress ring around the button
 *    - Click bounce + arrow lift animation
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [clicking, setClicking] = useState(false);

  // Reset scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Track scroll position for visibility + progress ring
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollTop > 300);
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    setClicking(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setClicking(false), 600);
  };

  // SVG progress ring calculation
  const r = 19;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Kembali ke atas"
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2
        transition-[opacity,transform] duration-500
        ${visible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-5 scale-75 pointer-events-none'
        }
        ${clicking ? 'scale-90' : 'hover:scale-110 active:scale-95'}
      `}
      style={{
        boxShadow: visible
          ? '0 4px 24px rgba(249,115,22,0.45), 0 1px 6px rgba(0,0,0,0.12)'
          : 'none',
        transitionTimingFunction: visible
          ? 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'cubic-bezier(0.4, 0, 1, 1)',
      }}
    >
      {/* Progress ring SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 48 48"
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2.5"
        />
        {/* Progress arc */}
        <circle
          cx="24" cy="24" r={r}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.12s linear' }}
        />
      </svg>

      {/* Chevron arrow — lifts slightly on click */}
      <svg
        viewBox="0 0 24 24"
        className={`relative z-10 w-5 h-5 transition-transform duration-300 ease-out ${clicking ? '-translate-y-1' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}
