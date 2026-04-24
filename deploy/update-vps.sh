#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# SPD Indonesia — Update script untuk VPS yang SUDAH berjalan
#
# Aman dijalankan pada VPS yang sudah ada data:
#   - Database (prod.db) dan uploads/ TIDAK disentuh
#   - Hanya update kode, deps, schema (additive only), dan rebuild frontend
#
# Cara pakai (di VPS sebagai root):
#   cd /var/www/spd-website
#   bash deploy/update-vps.sh
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/spd-website"
BACKEND_DIR="${APP_DIR}/backend"
DB_PATH="${BACKEND_DIR}/prisma/prod.db"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[UPDATE]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()  { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Sanity checks ─────────────────────────────────────────────────────
[[ "$(id -u)" -eq 0 ]] || die "Run as root: sudo bash deploy/update-vps.sh"
[[ -d "${APP_DIR}/.git" ]] || die "Git repo not found at ${APP_DIR}"
[[ -f "${BACKEND_DIR}/.env" ]] || die ".env not found at ${BACKEND_DIR}/.env — cannot continue"

# ── 1. Backup database sebelum apapun ────────────────────────────────
if [[ -f "${DB_PATH}" ]]; then
  BACKUP="${DB_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
  log "Backing up database → ${BACKUP}"
  cp "${DB_PATH}" "${BACKUP}"
  log "Backup done. Data aman."
else
  warn "Database belum ada di ${DB_PATH} — mungkin belum pernah dijalankan."
fi

# ── 2. Git pull ───────────────────────────────────────────────────────
log "Pulling latest code from GitHub..."
cd "${APP_DIR}"
git pull origin main
log "Code updated."

# ── 3. Backend deps + Prisma client ──────────────────────────────────
log "Updating backend dependencies..."
cd "${BACKEND_DIR}"
npm ci --omit=dev

log "Regenerating Prisma client..."
npx prisma generate

# ── 4. Schema migration (additive only — tidak hapus data) ───────────
log "Applying schema changes (additive only)..."
# db push tanpa --accept-data-loss: aman untuk add column, GAGAL jika ada
# perubahan destructive (melindungi data dari schema drift berbahaya).
npx prisma db push || die "prisma db push gagal — cek schema.prisma dan DATABASE_URL"

# ── 5. Jalankan migration scripts (idempotent) ────────────────────────
log "Running column migration scripts (safe to re-run)..."
node scripts/add-social-youtube.js  || warn "add-social-youtube.js gagal (mungkin kolom sudah ada)"
node scripts/add-icon-url.js        || warn "add-icon-url.js gagal (mungkin kolom sudah ada)"

# ── 6. Seed defaults HANYA jika tabel kosong ─────────────────────────
log "Running seed-defaults (skips tables that already have data)..."
node scripts/seed-defaults.js

# ── 7. Rebuild frontend ───────────────────────────────────────────────
log "Rebuilding frontend..."
cd "${APP_DIR}"
npm ci
VITE_API_URL=/api npm run build
log "Frontend rebuilt → ${APP_DIR}/dist"

# ── 8. Restart backend ───────────────────────────────────────────────
log "Restarting backend via PM2..."
pm2 restart spd-backend || pm2 start "${BACKEND_DIR}/ecosystem.config.cjs"
pm2 save

# ── 9. Reload nginx ───────────────────────────────────────────────────
log "Reloading nginx..."
nginx -t && systemctl reload nginx

# ── 10. Verifikasi cepat ──────────────────────────────────────────────
echo ""
log "Menunggu backend siap (3 detik)..."
sleep 3

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api || echo "000")
if [[ "${HTTP_STATUS}" == "200" ]]; then
  log "✅ Backend merespons dengan HTTP 200."
else
  warn "Backend merespons HTTP ${HTTP_STATUS} — cek: pm2 logs spd-backend"
fi

echo ""
echo -e "${GREEN}────────────────────────────────────────────────────────${NC}"
echo -e "${GREEN}  ✅  Update selesai!${NC}"
echo -e "${GREEN}────────────────────────────────────────────────────────${NC}"
echo ""
echo "  Cek log backend : pm2 logs spd-backend --lines 50"
echo "  Cek error nginx : tail -f /var/log/nginx/error.log"
if [[ -f "${DB_PATH}.backup-"* ]] 2>/dev/null; then
  echo "  Backup database  : ${DB_PATH}.backup-*"
fi
echo ""
