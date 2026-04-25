import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Toast, Spinner } from './shared';

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const STATUS_META = {
  unread:  { label: 'Baru',    cls: 'bg-orange-100 text-orange-600' },
  read:    { label: 'Dibaca',  cls: 'bg-slate-100 text-slate-600'   },
  replied: { label: 'Dibalas', cls: 'bg-emerald-100 text-emerald-700' },
};

function ReplyForm({ msg, onSent, onCancel }) {
  const [subject, setSubject] = useState(`Re: Pesan dari ${msg.name}`);
  const [body, setBody]       = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!subject.trim() || !body.trim()) {
      setError('Subjek dan isi balasan wajib diisi.');
      return;
    }
    setSending(true);
    try {
      await api(`/contacts/${msg.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
      });
      onSent();
    } catch (err) {
      setError(err.message || 'Gagal mengirim balasan');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Kepada</label>
        <input
          type="text"
          value={`${msg.name} <${msg.email}>`}
          disabled
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Subjek</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">Isi Balasan</label>
        <textarea
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-300 bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y"
          placeholder="Tulis balasan di sini..."
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={sending}
          className="px-4 py-1.5 rounded-md text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {sending ? 'Mengirim...' : 'Kirim Balasan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={sending}
          className="px-4 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-200"
        >
          Batal
        </button>
      </div>
    </form>
  );
}

function MessageRow({ msg, onMarkRead, onReplied }) {
  const [open, setOpen]           = useState(false);
  const [replying, setReplying]   = useState(false);
  const isUnread = msg.status === 'unread';
  const statusMeta = STATUS_META[msg.status] || STATUS_META.read;

  return (
    <div className={`border-b border-slate-100 last:border-0 transition-colors ${isUnread ? 'bg-orange-50/40' : 'bg-white'}`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="mt-0.5 flex-shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full block mt-1 ${isUnread ? 'bg-orange-500' : 'bg-slate-200'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-semibold ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>
              {msg.name}
            </span>
            <span className="text-xs text-slate-400">{msg.email}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
              {statusMeta.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 truncate pr-8">{msg.message}</p>
        </div>
        <div className="text-xs text-slate-400 shrink-0">{formatDate(msg.createdAt)}</div>
        <svg
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-5 pt-1 ml-10 border-l-2 border-orange-200">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white border border-slate-100 rounded-lg p-4">
            {msg.message}
          </p>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {!replying && (
              <button
                onClick={(e) => { e.stopPropagation(); setReplying(true); }}
                className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors px-3 py-1.5 rounded-lg"
              >
                Balas via Email
              </button>
            )}
            {isUnread && (
              <button
                onClick={(e) => { e.stopPropagation(); onMarkRead(msg.id); }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg"
              >
                Tandai Sudah Dibaca
              </button>
            )}
          </div>
          {replying && (
            <ReplyForm
              msg={msg}
              onSent={() => { setReplying(false); onReplied(msg.id); }}
              onCancel={() => setReplying(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function MessagesManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [toast, setToast]       = useState(null);

  const fetchMessages = async () => {
    try {
      const data = await api('/contacts');
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api(`/contacts/${id}/read`, { method: 'PATCH' });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));
      setToast('Ditandai sudah dibaca');
    } catch {
      setToast('Gagal memperbarui status');
    }
  };

  const handleReplied = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'replied' } : m));
    setToast('Balasan berhasil dikirim');
  };

  const displayed = filter === 'unread'
    ? messages.filter(m => m.status === 'unread')
    : messages;

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pesan Masuk</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Semua pesan sudah dibaca'}
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[['all', 'Semua'], ['unread', 'Belum Dibaca']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === val
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
            {val === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <Spinner /> <span className="text-sm">Memuat pesan...</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <p className="text-sm font-medium">
              {filter === 'unread' ? 'Tidak ada pesan baru' : 'Belum ada pesan masuk'}
            </p>
          </div>
        ) : (
          displayed.map(msg => (
            <MessageRow
              key={msg.id}
              msg={msg}
              onMarkRead={handleMarkRead}
              onReplied={handleReplied}
            />
          ))
        )}
      </div>
    </div>
  );
}
