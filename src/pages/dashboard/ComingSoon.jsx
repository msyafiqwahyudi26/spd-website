export default function ComingSoon({ title = 'Segera Hadir', description }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {description || 'Halaman ini sedang dipersiapkan.'}
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm py-16 text-center">
        <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 7.5h6M9 11.25h6m-6 3.75h3m3.75 4.5H7.125a2.625 2.625 0 01-2.625-2.625V6.375A2.625 2.625 0 017.125 3.75h9.75A2.625 2.625 0 0119.5 6.375v12.75a2.625 2.625 0 01-2.625 2.625z" />
        </svg>
        <p className="text-sm text-slate-500">
          Infrastruktur untuk halaman ini telah disiapkan di backend.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Antarmuka akan diaktifkan pada iterasi berikutnya.
        </p>
      </div>
    </div>
  );
}
