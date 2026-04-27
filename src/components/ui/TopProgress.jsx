import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Top-of-page loading bar that appears during route transitions.
 * Uses useLocation() — compatible with both BrowserRouter and createBrowserRouter.
 */
export default function TopProgress() {
  const location = useLocation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Skip the initial mount — we only want to show the bar on navigation
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // Clear any in-progress timers
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Start progress animation
    setVisible(true);
    setWidth(20);
    timers.current.push(setTimeout(() => setWidth(55), 150));
    timers.current.push(setTimeout(() => setWidth(80), 500));
    timers.current.push(setTimeout(() => {
      setWidth(100);
      timers.current.push(setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300));
    }, 900));

    return () => timers.current.forEach(clearTimeout);
  }, [location.pathname]);

  if (!visible && width === 0) return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
      style={{
        width: `${width}%`,
        background: 'linear-gradient(90deg, #f97316, #fb923c)',
        boxShadow: '0 0 8px rgba(249,115,22,0.5)',
        transition: width === 100
          ? 'width 0.2s ease-out'
          : 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
