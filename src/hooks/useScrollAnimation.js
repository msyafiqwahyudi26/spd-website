import { useEffect, useRef, useState } from 'react';

/**
 * useScrollAnimation — trigger a CSS class when an element scrolls into view.
 *
 * Usage:
 *   const [ref, visible] = useScrollAnimation({ threshold: 0.15 });
 *   <div ref={ref} className={visible ? 'animate-fade-up' : 'opacity-0'}>
 *
 * The element starts invisible (opacity-0) and transitions to visible+animated
 * once it crosses the viewport threshold. Once triggered it stays visible.
 */
export function useScrollAnimation({ threshold = 0.12, rootMargin = '0px 0px -60px 0px' } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the element is already in view on mount (e.g. above the fold), show it immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // Once visible, stop observing
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}

/**
 * useStaggerAnimation — returns an array of [ref, visible] pairs for
 * animating a list of items with stagger delays.
 *
 * Usage:
 *   const refs = useStaggerAnimation(items.length, { staggerMs: 80 });
 *   items.map((item, i) => (
 *     <div ref={refs[i][0]} className={refs[i][1] ? 'animate-fade-up' : 'opacity-0'}
 *          style={{ animationDelay: `${i * 80}ms` }}>
 *   ))
 */
export function useStaggerAnimation(count, options = {}) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, visible };
}
