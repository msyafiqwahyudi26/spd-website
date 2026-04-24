export default function EmptyState({ icon, title, message, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center fade-in-up">
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-sm transition-transform duration-300 hover:scale-105">
        {icon || (
          <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title || 'Tidak ada data'}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-semibold text-sm rounded-lg transition-colors inline-flex items-center gap-2"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
