import React from 'react';

const IS_DEV = import.meta.env && import.meta.env.DEV;

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Stack trace stays in the console; never shown to end users.
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  handleReload = () => {
    try { window.location.reload(); } catch {}
  };

  handleHome = () => {
    try { window.location.href = '/'; } catch {}
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h1>
          <p className="text-sm text-slate-500 mb-6">
            Halaman ini gagal dimuat. Silakan coba muat ulang atau kembali ke halaman utama.
          </p>

          {IS_DEV && this.state.error && (
            <pre className="text-xs text-red-600 text-left bg-red-50 p-3 rounded-md overflow-auto mb-6 max-h-40">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg text-sm hover:bg-orange-600 transition-colors"
            >
              Muat Ulang
            </button>
            <button
              onClick={this.handleHome}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }
}
