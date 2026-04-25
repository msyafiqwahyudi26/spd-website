import { useEffect, useRef } from 'react';

/**
 * Accessible modal dialog.
 *
 * Props:
 *   open       — boolean; renders nothing when false
 *   onClose    — called on Esc, backdrop click, or close button click
 *   title      — optional aria-labelled title (screen readers)
 *   maxWidth   — Tailwind class for max width (default: max-w-xl)
 *   children   — modal body
 *
 * Interactions:
 *   - Esc closes
 *   - Click outside the panel closes
 *   - Body scroll locked while open
 *   - Initial focus moves to the close button for keyboard users
 */
export default function Modal({ open, onClose, title, maxWidth = 'max-w-xl', children }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
