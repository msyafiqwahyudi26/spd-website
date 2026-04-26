# CLAUDE.md — SPD Indonesia Website

Panduan lengkap arsitektur, konvensi kode, dan workflow untuk Claude Code agar dapat bekerja secara efisien di project ini.

---

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Node.js + Express 4, Prisma ORM (SQLite), JWT (httpOnly cookie) |
| Database | SQLite (file: `backend/prisma/dev.db`) |
| Process Manager | PM2 (`spd-backend`) |
| Web Server | Nginx (reverse proxy → port 5000) |
| Hosting | VPS 76.13.196.172, path `/var/www/spd-website` |

---

## Struktur Direktori

```
spd-website/
├── src/                        # React SPA
│   ├── App.jsx                 # Route definitions — edit here to add pages
│   ├── main.jsx
│   ├── index.css
│   ├── pages/
│   │   ├── Entry.jsx           # "/" — simplified landing
│   │   ├── Landing.jsx         # "/beranda" — full landing
│   │   ├── Program.jsx         # "/program" — list + category filter
│   │   ├── ProgramDetail.jsx   # "/program/:slug"
│   │   ├── Publikasi.jsx       # "/publikasi"
│   │   ├── PublikasiDetail.jsx # "/publikasi/:slug"
│   │   ├── Event.jsx           # "/event"
│   │   ├── EventDetail.jsx     # "/event/:slug"
│   │   ├── DataPemilu.jsx      # "/data-pemilu" — KPU data + infografis
│   │   ├── Kontak.jsx          # "/kontak"
│   │   ├── About.jsx           # "/tentang-kami" (hub)
│   │   ├── about/              # Sub-pages: Profil, VisiMisi, Struktur, Mitra, LaporanTahunan
│   │   ├── Login.jsx           # "/login"
│   │   ├── Dashboard.jsx       # "/dashboard" shell + sidebar
│   │   └── dashboard/          # All admin managers (see section below)
│   ├── components/
│   │   ├── layout/             # Header, Footer, Layout
│   │   ├── sections/           # Reusable page sections (Hero, ProgramCards, etc.)
│   │   ├── ui/                 # Generic UI atoms (Button, Modal, Skeleton, EmptyState)
│   │   ├── team/               # TeamProfile
│   │   └── charts/             # LineChart
│   ├── hooks/
│   │   ├── useAuth.js          # Auth state from cookie
│   │   ├── useSettings.js      # Global site settings hook
│   │   ├── useCountUp.js       # Animated counter
│   │   └── useIdleLogout.js    # Auto-logout after inactivity
│   ├── lib/
│   │   ├── api.js              # Fetch wrapper — ALWAYS use this
│   │   └── media.js            # resolveMediaUrl, useMediaUrl, loadMediaByKey
│   ├── config/
│   │   ├── media.js            # resolveMedia() helper (resolves relative URLs)
│   │   └── assets.js           # Static asset paths
│   ├── data/                   # Static fallback data (used when DB empty)
│   │   ├── about.jsx
│   │   ├── events.js
│   │   ├── publikasi.js
│   │   └── approachIcons.jsx
│   └── i18n/
│       └── index.jsx           # I18nProvider + useI18n hook (ID/EN)
│
├── backend/
│   ├── server.js               # Express app entry point
│   ├── prisma/
│   │   ├── schema.prisma       # DB schema — 20 models
│   │   └── dev.db              # SQLite database file
│   ├── uploads/                # Uploaded media files (served at /uploads)
│   ├── src/
│   │   ├── controllers/        # One file per resource
│   │   ├── routes/             # Express routers
│   │   ├── middlewares/        # auth.js, requireRole.js, rateLimit.js, upload.js
│   │   ├── lib/
│   │   │   ├── response.js     # ok() / fail() helpers
│   │   │   ├── validate.js     # validate() + v.string/email/oneOf/boolean
│   │   │   ├── prisma.js       # Singleton PrismaClient
│   │   │   ├── logger.js       # Activity logger (writes to Log model)
│   │   │   └── rateLimitStore.js
│   │   └── services/
│   │       ├── emailService.js # Nodemailer wrapper
│   │       └── authProviders.js
│   └── scripts/
│       ├── seed-all.js         # Migrate static data → DB (safe to re-run)
│       ├── seed-defaults.js
│       ├── seed-footer-links.js
│       ├── reset-admin.js      # Reset admin password
│       └── reset-dev.js
│
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── index.html                  # Vite entry — SEO meta tags here
├── vite.config.js
├── AUDIT-2026-04.md            # Comprehensive audit report
└── CLAUDE.md                   # This file
```

---

## Perintah Pengembangan

### Frontend
```bash
# Di project root
npm run dev          # Dev server → http://localhost:5173
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

### Backend
```bash
# Di folder backend/
npm run dev          # Nodemon dev server → port 5000
npm run dev:clean    # Kill port 5000 dulu, baru start
npm run start        # Production (tanpa nodemon)

# Database
npx prisma db push   # Sync schema → DB (tidak hapus data)
npx prisma studio    # GUI database browser
npm run admin:reset  # Reset password admin
npm run seed         # Seed data awal
node scripts/seed-all.js  # Seed semua static data (idempotent)
```

### Deploy ke Server
```bash
# Di server (SSH: ssh root@76.13.196.172)
cd /var/www/spd-website

git pull origin main
cd backend && npx prisma db push && cd ..
npm run build
pm2 restart spd-backend
# Optional: re-seed if schema changed
cd backend && node scripts/seed-all.js
```

### Git Workflow
```bash
git add -A
git commit -m "feat: deskripsi perubahan"
git push origin main
# Lalu SSH ke server dan jalankan deploy di atas
```

---

## Environment Variables

### Frontend (`.env` di root)
```
VITE_API_URL=http://localhost:5000/api   # Dev
VITE_API_URL=https://spdindonesia.org/api  # Production
```

### Backend (`backend/.env`)
```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=<string minimal 32 karakter>
NODE_ENV=production
FRONTEND_URL=https://spdindonesia.org
PORT=5000
TRUST_PROXY=1

# Email (opsional — tanpa ini, form kontak tidak kirim notif)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=user@example.com
EMAIL_PASS=password
EMAIL_FROM="SPD Indonesia <noreply@spdindonesia.org>"
EMAIL_TO=admin@spdindonesia.org
```

> **PENTING:** Jika `JWT_SECRET` tidak di-set atau < 32 karakter, server **langsung exit** saat startup. Ini by design (security).

---

## Pola Backend (Konvensi Wajib)

### Response Helpers
Semua controller HARUS menggunakan `ok()` dan `fail()` dari `backend/src/lib/response.js`:

```js
const { ok, fail } = require('../lib/response');

// Sukses
return ok(res, data);              // 200 + { success: true, data }
return ok(res, data, 201);         // 201 Created

// Gagal
return fail(res, 400, 'Pesan error');   // 400 + { success: false, message }
return fail(res, 404, 'Tidak ditemukan');
return fail(res, 403, 'Akses ditolak');
```

### Validasi Input
```js
const { validate, v } = require('../lib/validate');

const { errors, data } = validate(req.body, {
  title:   v.string({ required: true, max: 500 }),
  email:   v.email({ required: true }),
  status:  v.oneOf(['published', 'draft']),
  active:  v.boolean(),
});
if (errors) return fail(res, 400, errors);
// Gunakan data.title, data.email, dll (sudah trim + clean)
```

### Middleware Auth & Role
```js
const { requireAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/requireRole');

// Hanya perlu login
router.get('/', requireAuth, handler);

// Hanya admin
router.delete('/:id', requireAuth, requireRole('admin'), handler);

// Admin atau publisher
router.post('/', requireAuth, requireRole('admin', 'publisher'), handler);
```

### Struktur Controller Standar
```js
const { ok, fail } = require('../lib/response');
const { validate, v } = require('../lib/validate');
const prisma = require('../lib/prisma');

// Helper: parse JSON field safely
const safeJson = (v, fallback = []) => {
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v) || fallback; } catch { return fallback; }
};

// Transform DB row → public shape
const toPublic = (r) => ({
  id: r.id,
  // ... field yang diekpos ke frontend
});

exports.list = async (req, res) => { /* ... */ };
exports.getOne = async (req, res) => { /* ... */ };
exports.create = async (req, res) => { /* ... */ };
exports.update = async (req, res) => { /* ... */ };
exports.remove = async (req, res) => { /* ... */ };
```

### Logging Aktivitas
```js
const { logAction } = require('../lib/logger');

await logAction({
  action: 'CREATE',    // CREATE | UPDATE | DELETE | LOGIN | LOGOUT
  entity: 'Program',
  entityId: program.id,
  userId: req.user?.id,
  userName: req.user?.name || '',
  details: program.title,
});
```

---

## Pola Frontend (Konvensi Wajib)

### API Calls — Selalu Gunakan `api()`
```js
import { api } from '@/lib/api';

// GET
const data = await api('/programs');

// POST
const result = await api('/programs', {
  method: 'POST',
  body: JSON.stringify(payload),
});

// PUT dengan FormData (upload file)
const form = new FormData();
form.append('image', file);
await api('/media/upload', { method: 'POST', body: form });
```

Catatan: `api()` otomatis:
- Mengirim httpOnly cookie (`credentials: 'include'`)
- Menambah `Content-Type: application/json` kecuali FormData
- Membuka wrapper `{ success, data }` → mengembalikan `data` langsung
- Dispatch event `auth:expired` pada 401

### useEffect Pattern (Async + Cleanup)
```js
useEffect(() => {
  let cancelled = false;
  const load = async () => {
    try {
      const data = await api('/endpoint');
      if (!cancelled) setState(data);
    } catch {
      if (!cancelled) setState([]);
    }
  };
  load();
  return () => { cancelled = true; };
}, []);
```

Selalu gunakan flag `cancelled` untuk menghindari state update setelah unmount.

### Media URL Resolution
```js
import { resolveMediaUrl } from '@/lib/media';
import { resolveMedia } from '@/config/media';

// Untuk URL dari DB (bisa relative /uploads/... atau absolute https://...)
const fullUrl = resolveMediaUrl(relativeUrl);

// Untuk field image dari API response
const src = resolveMedia('', program.image);
```

### useSettings Hook
```js
import { useSettings } from '@/hooks/useSettings';

function MyComponent() {
  const { settings, loading } = useSettings();
  // settings.siteName, settings.logoUrl, settings.heroSubtitle, dll
}
```

### Format Content Blocks (Rich Text)
Publikasi, Program, dan Event menggunakan JSON array of blocks untuk rich content:

```js
// Format di DB: JSON string
// Format di frontend: array of objects
const blocks = [
  { type: 'lead',       text: 'Paragraf pembuka (bold, besar)' },
  { type: 'heading',    text: 'Judul Bagian H2' },
  { type: 'subheading', text: 'Sub-judul H3' },
  { type: 'paragraph',  text: 'Isi paragraf biasa.' },
];
```

Serialisasi di editor (textarea → blocks):
```js
// Konversi textarea markdown-lite → blocks
function serialiseContent(raw) {
  return raw.trim().split(/\n{2,}/).filter(Boolean).map((chunk, i) => {
    const t = chunk.trim();
    if (t.startsWith('## ')) return { type: 'heading',    text: t.slice(3).trim() };
    if (t.startsWith('# '))  return { type: 'subheading', text: t.slice(2).trim() };
    if (i === 0)              return { type: 'lead',       text: t };
    return { type: 'paragraph', text: t };
  });
}

function parseContent(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(b => {
    if (b.type === 'heading')    return `## ${b.text}`;
    if (b.type === 'subheading') return `# ${b.text}`;
    return b.text;
  }).join('\n\n');
}
```

### Dashboard Manager Pattern
Setiap manager mengikuti pola yang sama:

```jsx
// State
const [items, setItems] = useState([]);
const [editing, setEditing] = useState(null);  // null = list, item = edit form
const [toast, setToast] = useState(null);

// Load
useEffect(() => { api('/resource').then(setItems).catch(() => {}); }, []);

// Save
const handleSave = async (payload) => {
  try {
    if (editing.id) {
      await api(`/resource/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await api('/resource', { method: 'POST', body: JSON.stringify(payload) });
    }
    setEditing(null);
    // Re-fetch
    api('/resource').then(setItems);
    setToast({ type: 'success', message: 'Disimpan' });
  } catch (err) {
    setToast({ type: 'error', message: err.message });
  }
};
```

### MediaPicker
```jsx
import MediaPicker from './MediaPicker';

<MediaPicker
  value={form.image}
  onChange={(url) => setForm(f => ({ ...f, image: url }))}
  label="Cover Image"
  accept="image/*"
/>
```

---

## Database Models (Ringkasan)

| Model | Deskripsi | Utama Fields |
|---|---|---|
| User | Admin/publisher login | email, password, role, provider |
| Publication | Artikel, riset, buku | title, slug, category, contentType, fullContent, pdfUrl |
| Program | Program jangka panjang | title, slug, status, category, fullContent, gallery |
| Event | Kegiatan terjadwal | title, slug, date, startsAt, location |
| Contact | Pesan dari form kontak | name, email, message, status |
| Setting | Konfigurasi global (1 row) | siteName, logoUrl, heroUrl, socialFacebook, dll |
| Media | File yang diupload | key (semantic), url, type, filename, size |
| Partner | Logo mitra kolaborasi | name, logoUrl, websiteUrl, sortOrder |
| TeamMember | Profil tim | name, role, expertise, bio, photoUrl, featured |
| Milestone | Timeline perjalanan | year, tag, title, description, sortOrder |
| MissionItem | Butir misi | text, sortOrder |
| CoreValue | Nilai-nilai inti | iconKey, iconUrl, title, description |
| Approach | Pendekatan kerja | iconKey, iconUrl, title, description |
| FooterLink | Link di footer | section, label, url, sortOrder |
| Stat | Statistik (angka) | value, label, sortOrder |
| Category | Kategori publikasi | value, color, bg |
| Log | Activity log | action, entity, entityId, userId |
| AnnualReport | Laporan tahunan | year, title, fileUrl |
| Subscriber | Subscriber newsletter | email, status |
| Infografis | Gambar infografis | title, imageUrl, caption |

> **Catatan:** `Setting` hanya punya 1 baris (id=1). Selalu `upsert` bukan `create`.

---

## API Endpoints (Ringkasan)

### Public (Tanpa Auth)
```
GET  /api/programs            # List published programs
GET  /api/programs/:slug      # Detail program
GET  /api/publications        # List publikasi
GET  /api/publications/:slug  # Detail publikasi
GET  /api/events              # List event
GET  /api/events/:slug        # Detail event
GET  /api/partners            # List mitra
GET  /api/stats               # Statistik
GET  /api/team                # Tim
GET  /api/milestones          # Timeline
GET  /api/missions            # Misi
GET  /api/core-values         # Nilai inti
GET  /api/approaches          # Pendekatan
GET  /api/settings            # Konfigurasi publik (tanpa field sensitif)
GET  /api/infografis          # Infografis pemilu
GET  /api/kpu/partisipasi     # Data partisipasi dari KPU (proxy + cache)
GET  /api/media/by-key/:key   # Media by semantic key
POST /api/contacts            # Kirim pesan kontak
POST /api/subscribers         # Subscribe newsletter
GET  /api/subscribers/unsubscribe?token=... # Unsubscribe
POST /api/auth/login          # Login → set httpOnly cookie
POST /api/auth/logout         # Clear cookie
GET  /api/auth/me             # Cek session (dari cookie)
```

### Protected (Perlu Login)
```
GET/POST/PUT/DELETE /api/publications/:id
GET/POST/PUT/DELETE /api/programs/:id
GET/POST/PUT/DELETE /api/events/:id
GET/PUT             /api/settings
GET/POST/PUT/DELETE /api/media
GET/POST/PUT/DELETE /api/partners
GET/POST/PUT/DELETE /api/team
GET/POST/PUT/DELETE /api/milestones
... (semua CRUD entity)
GET                 /api/contacts     # Lihat pesan masuk (admin)
GET                 /api/logs         # Activity logs (admin)
GET/POST/PUT/DELETE /api/users        # Manajemen user (admin only)
GET                 /api/analytics    # Data analytics (admin only)
```

---

## Dashboard Admin (Route `/dashboard/...`)

| Route | Komponen | Akses |
|---|---|---|
| `/dashboard` | Overview.jsx | Semua |
| `/dashboard/publikasi` | PublikasiManager | Admin + Publisher |
| `/dashboard/event` | EventManager | Admin + Publisher |
| `/dashboard/program` | ProgramManager | Admin + Publisher |
| `/dashboard/akun` | ProfilePage | Semua |
| `/dashboard/beranda` | BerandaManager | Admin only |
| `/dashboard/tentang` | TentangManager | Admin only |
| `/dashboard/settings` | SettingsManager | Admin only |
| `/dashboard/pesan` | MessagesManager | Admin only |
| `/dashboard/pengguna` | UsersManager | Admin only |
| `/dashboard/analitik` | AnalyticsPage | Admin only |
| `/dashboard/logs` | LogsPage | Admin only |
| `/dashboard/media` | MediaManager | Admin only |
| `/dashboard/mitra` | PartnersManager | Admin only |
| `/dashboard/tim` | TeamManager | Admin only |
| `/dashboard/perjalanan` | TimelineManager | Admin only |
| `/dashboard/laporan` | ReportsManager | Admin only |
| `/dashboard/subscribers` | SubscribersManager | Admin only |
| `/dashboard/infografis` | InfografisManager | Admin only |

---

## Pola Umum Yang Sering Diulang

### Tambah Route Publik Baru
1. Buat `src/pages/NamaPage.jsx`
2. Import di `src/App.jsx`
3. Tambah `<Route path="/path" element={<NamaPage />} />` di dalam `<Route element={<Layout />}>`

### Tambah Dashboard Manager Baru
1. Buat `src/pages/dashboard/NamaManager.jsx` (ikuti pola yang ada)
2. Import di `src/App.jsx`
3. Tambah route di dalam `<Route path="/dashboard" element={<Dashboard />}>`
4. Tambah menu item di `src/pages/Dashboard.jsx` (sidebar)
5. Jika admin-only: letakkan di dalam `<Route element={<RequireAdmin />}>`

### Tambah Model DB Baru
1. Tambah model di `backend/prisma/schema.prisma`
2. `cd backend && npx prisma db push` (dev) atau `npx prisma migrate deploy` (prod)
3. Buat `backend/src/controllers/namaController.js`
4. Buat `backend/src/routes/nama.js`
5. Register di `backend/server.js`: `app.use('/api/nama', require('./src/routes/nama'))`

### Tambah Field ke Model Existing
1. Edit schema.prisma — pastikan field baru punya default value agar backward-compatible
2. `npx prisma db push`
3. Update `toPublic()` di controller
4. Update frontend form di manager
5. Jika ada seed data, update `backend/scripts/seed-all.js`

---

## Gotchas & Hal Penting

### SQLite vs PostgreSQL
Project menggunakan SQLite. Cocok untuk skalanya saat ini. Jika traffic meningkat, migrasi ke PostgreSQL dengan mengubah `datasource` di `schema.prisma` dan `DATABASE_URL`.

### Prisma Generate Wajib Setelah Install
`postinstall` di `backend/package.json` sudah menjalankan `prisma generate` otomatis. Tapi jika schema berubah, jalankan manual: `cd backend && npx prisma generate`.

### Windows CRLF vs Linux LF
File yang diedit di Windows bisa punya CRLF. Server Linux (production) menggunakan LF. Git sudah dikonfigurasi untuk handle ini, tapi perhatikan saat debug brace-count atau line-count di bash.

### Git Index Lock
Jika muncul error `.git/index.lock exists`, jalankan di PowerShell:
```powershell
Remove-Item "C:\Users\Asus\Desktop\spd-website\.git\index.lock" -Force
```

### httpOnly Cookie Auth
JWT disimpan sebagai httpOnly cookie (`spd_token`), bukan localStorage. Ini artinya:
- JavaScript tidak bisa membaca token
- `api()` harus selalu menggunakan `credentials: 'include'`
- CORS backend harus mengizinkan origin frontend dengan `credentials: true`

### KPU Proxy Cache
`/api/kpu/partisipasi` menggunakan in-memory Map cache dengan TTL. Jika data KPU tidak update, cache mungkin perlu di-flush (restart backend).

### Seed Script Idempotent
`backend/scripts/seed-all.js` aman dijalankan berulang. Jika tabel sudah ada datanya, script skip. Gunakan ini setelah deploy ke server baru.

### Email Tidak Dikonfigurasi
Saat ini SMTP belum dikonfigurasi di production. Form kontak tetap menyimpan pesan ke DB, tapi tidak ada email notifikasi. Setup `EMAIL_*` env vars di server untuk mengaktifkan.

### Static Fallback Data
`src/data/about.jsx`, `src/data/events.js`, `src/data/publikasi.js` adalah data statis yang digunakan sebagai fallback jika API kosong atau gagal. Data ini sudah di-seed ke DB via `seed-all.js`. Jangan hapus file ini — mereka juga berguna untuk development offline.

### sortOrder Convention
Semua model yang tampil berurutan menggunakan field `sortOrder: Int @default(0)`. Query selalu `orderBy: { sortOrder: 'asc' }`. Frontend manager belum support drag-and-drop reorder — admin ubah sortOrder lewat input number di form edit.

### Media Semantic Keys
Media dengan key semantik (misal `homepage.hero`, `footer.logo`) bisa diambil via:
```js
const url = useMediaUrl('homepage.hero', fallbackUrl);
// atau
const row = await loadMediaByKey('homepage.hero');
```
Ini memungkinkan admin mengganti gambar hero/logo tanpa mengubah kode.

---

## File Penting Yang Sering Diedit

| File | Kapan Diedit |
|---|---|
| `src/App.jsx` | Tambah/hapus route |
| `src/pages/Dashboard.jsx` | Tambah menu sidebar |
| `backend/prisma/schema.prisma` | Perubahan struktur DB |
| `backend/server.js` | Tambah route group baru |
| `backend/.env` | Konfigurasi environment |
| `index.html` | Meta tags SEO |
| `public/sitemap.xml` | Tambah URL baru ke sitemap |

---

## Informasi Akun & Server

- **URL Production:** https://spdindonesia.org  
- **Server IP:** 76.13.196.172  
- **Project path di server:** `/var/www/spd-website`  
- **PM2 process:** `spd-backend` (backend Express)  
- **Admin email:** admin@spdindonesia.org  
- **Default admin reset:** `cd backend && node scripts/reset-admin.js`
