# HANDOFF: SPD Indonesia Website — Status & Bug Fix untuk Claude Code (Mac)

> Dokumen ini dibuat pada 2026-04-26 untuk melanjutkan pekerjaan dari Windows ke MacBook.
> Paste dokumen ini ke Claude Code di Mac sebagai konteks awal.

---

## STATUS WEBSITE SAAT INI

**Website: https://spdindonesia.org — MASIH DOWN (502 Bad Gateway)**
- Backend Express (PM2: `spd-backend`) crash-loop sejak penambahan fitur ElectionData
- Frontend (Vite/React build) OK, tersimpan di `/var/www/spd-website/dist/`
- Nginx OK, tapi backend tidak menjawab di port 5000

---

## STACK TEKNOLOGI

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Node.js + Express 4, Prisma ORM (SQLite), JWT httpOnly cookie |
| Server | VPS Ubuntu 24.04, IP: `76.13.196.172` |
| Process Manager | PM2 (`spd-backend`) |
| Web Server | Nginx reverse proxy → port 5000 |
| Project path di server | `/var/www/spd-website` |

---

## AKAR MASALAH (ROOT CAUSE)

### Masalah 1 — File `backend/src/routes/election-data.js` korup di server

File di server mengandung teks markdown link LITERAL `[router.post](http://router.post)` 
alih-alih `router.post` yang benar. Ini terjadi karena:
- Chat interface Claude mengkonversi `router.post` → hyperlink saat ditampilkan
- Ketika perintah di-copy-paste dari chat ke terminal SSH, teks markdown ikut tersalin
- `node --check` LOLOS (secara sintaks JS valid tapi perilaku runtime berbeda)
- Express error: `Route.post() requires a callback function but got [object Undefined]`

**Error log yang muncul:**
```
Error: Route.post() requires a callback function but got a [object Undefined]
at Object.<anonymous> (/var/www/spd-website/backend/src/routes/election-data.js:11:8)
```

### Masalah 2 — `backend/server.js` lokal masih ada baris korup

File lokal (`C:\Users\Asus\Desktop\spd-website\backend\server.js`) sudah DIPERBAIKI.
Server sudah punya versi yang benar (via Python fix langsung di server).
Tapi belum di-push ke GitHub karena ada git index.lock di Windows.

### Masalah 3 — Git index.lock di Windows

Git index terkunci di mesin Windows, tidak bisa commit/push dari sana.
**Solusi: push dari Mac setelah clone.**

---

## FILE YANG PERLU DIPERBAIKI

### File 1: `backend/src/routes/election-data.js`

**ISI YANG BENAR** (tulis ulang persis seperti ini):

```javascript
const router  = require('express').Router();
const ctrl    = require('../controllers/electionDataController');
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

const canAdmin = requireRole('admin');

router.get('/',       ctrl.list);
router.get('/:id',    ctrl.getOne);

router.post('/seed',  requireAuth, canAdmin, ctrl.seed);
router.post('/',      requireAuth, canAdmin, ctrl.create);
router.put('/:id',    requireAuth, canAdmin, ctrl.update);
router.delete('/:id', requireAuth, canAdmin, ctrl.remove);

module.exports = router;
```

**PENTING:** Jangan copy-paste kode di atas melalui interface chat! Gunakan cara berikut.

### File 2: `backend/server.js`

Sudah diperbaiki di lokal. Verifikasi baris terakhir file harus PERSIS:
```javascript
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
```
TIDAK boleh ada baris duplikat atau `shutdown('SIGTERM'));` orphan setelahnya.

---

## LANGKAH FIX DI MAC

### Langkah 1 — Clone & Cek Status Lokal

```bash
git clone git@github.com:USERNAME/spd-website.git
cd spd-website

# Cek isi file election-data.js lokal
cat backend/src/routes/election-data.js

# Cek akhir server.js
tail -5 backend/server.js
```

### Langkah 2 — Fix election-data.js Lokal (dari Mac)

Buka file `backend/src/routes/election-data.js` di editor dan **tulis ulang seluruh isi** menjadi:

```javascript
const router  = require('express').Router();
const ctrl    = require('../controllers/electionDataController');
const { requireAuth } = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');

const canAdmin = requireRole('admin');

router.get('/',       ctrl.list);
router.get('/:id',    ctrl.getOne);

router.post('/seed',  requireAuth, canAdmin, ctrl.seed);
router.post('/',      requireAuth, canAdmin, ctrl.create);
router.put('/:id',    requireAuth, canAdmin, ctrl.update);
router.delete('/:id', requireAuth, canAdmin, ctrl.remove);

module.exports = router;
```

Verifikasi dengan Node:
```bash
node --check backend/src/routes/election-data.js && echo "OK"
```

### Langkah 3 — Commit & Push

```bash
git add backend/src/routes/election-data.js backend/server.js
git commit -m "fix: correct election-data route — remove markdown link corruption"
git push origin main
```

### Langkah 4 — Deploy ke Server

```bash
ssh root@76.13.196.172
```

Di server:
```bash
cd /var/www/spd-website

# Pull perubahan
git stash        # simpan perubahan lokal server jika ada
git pull origin main
git stash drop   # buang stash lama

# Jalankan ulang backend
pm2 restart spd-backend
sleep 5
pm2 status

# Test
curl -s http://localhost:5000/api
```

Jika berhasil, output curl akan menampilkan:
```json
{"success":true,"data":{"status":"ok","message":"SPD Backend is running","version":"1.1.0"}}
```

### Langkah 5 — Fix Langsung di Server (jika git pull gagal)

Gunakan Python untuk menulis file tanpa masalah copy-paste:

```bash
python3 << 'PYEOF'
content = (
    "const router  = require('express').Router();\n"
    "const ctrl    = require('../controllers/electionDataController');\n"
    "const { requireAuth } = require('../middlewares/auth');\n"
    "const requireRole = require('../middlewares/requireRole');\n"
    "\n"
    "const canAdmin = requireRole('admin');\n"
    "\n"
    "router.get('/',       ctrl.list);\n"
    "router.get('/:id',    ctrl.getOne);\n"
    "\n"
    "router.post('/seed',  requireAuth, canAdmin, ctrl.seed);\n"
    "router.post('/',      requireAuth, canAdmin, ctrl.create);\n"
    "router.put('/:id',    requireAuth, canAdmin, ctrl.update);\n"
    "router.delete('/:id', requireAuth, canAdmin, ctrl.remove);\n"
    "\n"
    "module.exports = router;\n"
)
path = '/var/www/spd-website/backend/src/routes/election-data.js'
open(path, 'w').write(content)
print("Ditulis:", len(content), "bytes")
print(repr(content[:100]))
PYEOF

node --check /var/www/spd-website/backend/src/routes/election-data.js && echo "SYNTAX OK"
pm2 restart spd-backend
sleep 5
pm2 status
curl -s http://localhost:5000/api
```

---

## SETELAH BACKEND ONLINE

### Seed Data Pemilu Historis

Login ke dashboard admin: https://spdindonesia.org/login
- Klik menu **"Statistik Pemilu"** di sidebar
- Klik tombol **"Seed Data Historis"** → akan mengisi 20 data pemilu 1955–2024

Atau via API langsung dari terminal:
```bash
curl -s -X POST http://localhost:5000/api/election-data/seed \
  -H "Cookie: spd_token=TOKEN_DARI_LOGIN" | python3 -m json.tool
```

### Prisma DB Push (jika tabel ElectionData belum ada)

```bash
cd /var/www/spd-website/backend
npx prisma db push
```

---

## FITUR BARU YANG SUDAH DIBUAT (belum bisa ditest karena down)

| Fitur | File | Status |
|---|---|---|
| ElectionData model | `backend/prisma/schema.prisma` | ✅ Ada di schema |
| Backend CRUD + seed | `backend/src/controllers/electionDataController.js` | ✅ Lengkap |
| Route API | `backend/src/routes/election-data.js` | ⚠️ KORUP di server |
| Dashboard Manager | `src/pages/dashboard/DataPemiluManager.jsx` | ✅ Dibuat |
| Public page | `src/pages/DataPemilu.jsx` | ✅ Updated |
| Beranda stats | `src/components/sections/DashboardSection.jsx` | ✅ CSS bar chart |

---

## CREDENTIALS

| Item | Value |
|---|---|
| Server IP | 76.13.196.172 |
| SSH user | root |
| PM2 process | spd-backend |
| Admin email | admin@spdindonesia.org |
| Website | https://spdindonesia.org |
| Project path server | /var/www/spd-website |

---

## CHECKLIST SETELAH FIX

- [ ] `pm2 status` → spd-backend **online**
- [ ] `curl http://localhost:5000/api` → response JSON ok
- [ ] https://spdindonesia.org → tidak 502
- [ ] Login ke /login → berhasil masuk dashboard
- [ ] Seed data pemilu historis dari dashboard
- [ ] Cek /data-pemilu → tampil grafik & statistik
- [ ] Push semua file yang sudah fix ke GitHub

---

## KONTEKS TAMBAHAN

**Kenapa file election-data.js korup berulang kali:**
Setiap perintah yang ditulis via SSH menggunakan heredoc (`cat > file << 'EOF'`) 
yang di-copy dari chat Claude, interface chat mengubah `router.post` menjadi 
hyperlink markdown `[router.post](http://router.post)`. Teks literal ini masuk ke file.
`node --check` lolos karena sintaks valid secara teknis, tapi Express error saat runtime
karena expression `[router.post]` menghasilkan array, bukan function call.

**Solusi permanen:** Selalu gunakan Python string concatenation (bukan heredoc) 
untuk menulis file JS dari SSH, ATAU push dari local editor (VS Code/Mac) via git.
