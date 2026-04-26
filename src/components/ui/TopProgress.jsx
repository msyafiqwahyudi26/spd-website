import { useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router-dom';

/**
 * Top-of-page loading bar that appears during route transitions.
 * Hooks into React Router v7's useNavigation() — no external deps needed.
 */
export default function TopProgress() {
  const navigation = useNavigation();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const completeRef = useRef(false);

  useEffect(() => {
    clearTimeout(timerRef.current);

    if (navigation.state === 'loading') {
      completeRef.current = false;
      setVisible(true);
      setWidth(15);
      // Simulate crawl toward 85% — never reaches 100% until done
      timerRef.current = setTimeout(() => setWidth(45), 150);
      timerRef.current = setTimeout(() => setWidth(72), 600);
      timerRef.current = setTimeout(() => setWidth(85), 1400);
    } else if (navigation.state === 'idle' && visible) {
      // Navigation done — snap to 100% then fade out
      completeRef.current = true;
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 350);
    }

    return () => clearTimeout(timerRef.current);
  }, [navigation.state]);

  if (!visible && width === 0) return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
      style={{
        width: `${width}%`,
        background: 'linear-gradient(90deg, #f97316, #fb923c)',
        boxShadow: '0 0 8px rgba(249,115,22,0.6)',
        transition: width === 100
          ? 'width 0.2s ease-out, opacity 0.35s ease 0.15s'
          : 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
