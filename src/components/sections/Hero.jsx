import { resolveMedia } from '@/config/media';
import { getSettingsSync } from '@/hooks/useSettings';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Hero({ title, subtitle, children, bgImage }) {
  const settings = getSettingsSync();
  const [headlineRef, headlineVisible] = useScrollAnimation({ threshold: 0.3 });
  const [subtitleRef, subtitleVisible] = useScrollAnimation({ threshold: 0.3 });
  const [childrenRef, childrenVisible] = useScrollAnimation({ threshold: 0.3 });

  // Dashboard may override settings.images.hero; the `bgImage` prop is a
  // per-page default that still wins over the bundled placeholder.
  const finalBg = resolveMedia(bgImage || '', settings.images?.hero);

  return (
    <section className="relative bg-gradient-to-br from-orange-500 to-orange-600 py-20 sm:py-24 px-4 overflow-hidden">
      {/* Optional background image with overlay */}
      {finalBg && (
        <img
          src={finalBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          loading="eager"
        />
      )}

      {/* Decorative circles — subtle warm atmosphere */}
      <span className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 pointer-events-none" aria-hidden="true" />
      <span className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto text-center">
        <h1
          ref={headlineRef}
          className={`text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-sm ${
            headlineVisible ? 'animate-fade-up' : 'opacity-0'
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            ref={subtitleRef}
            className={`mt-5 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed ${
              subtitleVisible ? 'animate-fade-up delay-100' : 'opacity-0'
            }`}
          >
            {subtitle}
          </p>
        )}
        {children && (
          <div
            ref={childrenRef}
            className={`mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 ${
              childrenVisible ? 'animate-fade-up delay-200' : 'opacity-0'
            }`}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
