export default function Hero({ title, subtitle, children }) {
  return (
    <section className="bg-orange-500 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
