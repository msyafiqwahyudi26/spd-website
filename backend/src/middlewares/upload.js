const multer = require('multer');
const path = require('path');
const fs = require('fs');

// sharp is optional — if not installed, images are saved as-is.
let sharp = null;
try { sharp = require('sharp'); } catch { /* sharp not installed — compression disabled */ }

// Use __dirname-relative path so uploads always resolve to backend/uploads/
// regardless of the process working directory (PM2 CWD may differ from __dirname).
// __dirname here = backend/src/middlewares; ../../ = backend/
const BASE = path.join(__dirname, '..', '..', 'uploads');

// New uploads sort into /images or /documents by mimetype. Legacy files
// under /media are still served by Express's static handler, so existing
// DB references (pre-split) keep resolving.
const IMAGES_DIR = path.join(BASE, 'images');
const DOCS_DIR   = path.join(BASE, 'documents');
const MEDIA_DIR  = path.join(BASE, 'media');

for (const dir of [IMAGES_DIR, DOCS_DIR, MEDIA_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// SVG intentionally excluded: SVG can contain inline script tags
// and would be served from the same domain, creating an XSS vector.
const ALLOWED = /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/;

function destinationFor(mime) {
  if (typeof mime === 'string' && mime === 'application/pdf') return DOCS_DIR;
  return IMAGES_DIR;
}

function publicPrefixFor(mime) {
  return mime === 'application/pdf' ? '/uploads/documents' : '/uploads/images';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destinationFor(file.mimetype)),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, unique + ext);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED.test(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Hanya file gambar (jpg, png, gif, webp) atau PDF yang diizinkan');
    err.status = 400;
    err.clientMessage = err.message;
    cb(err);
  }
}

const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB raw; sharp will compress images down
}).single('file');

/**
 * Compress uploaded images with sharp (if installed).
 * - Resizes to max 1920px on the longest side (never upscales)
 * - Converts to WebP at quality 82 — typically 60-80% smaller than the original
 * - Skips PDFs and any non-image mimetypes
 * - If sharp is missing or compression fails, the original file is kept as-is
 *
 * Must be placed AFTER the multer middleware in the route chain.
 */
async function compressUpload(req, res, next) {
  if (!req.file) return next();
  if (!sharp || !req.file.mimetype.startsWith('image/')) return next();

  const inputPath = req.file.path;
  const baseName  = path.basename(inputPath, path.extname(inputPath));
  const outName   = baseName + '.webp';
  const outPath   = path.join(path.dirname(inputPath), outName);

  try {
    await sharp(inputPath)
      .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    // Replace original with compressed file
    fs.unlinkSync(inputPath);
    req.file.path     = outPath;
    req.file.filename = outName;
    req.file.mimetype = 'image/webp';
    req.file.size     = fs.statSync(outPath).size;
  } catch (err) {
    // Non-fatal: log and continue with the original file
    console.error('[compress] sharp error, using original:', err.message);
  }

  next();
}

module.exports = { uploadImage, compressUpload, IMAGES_DIR, DOCS_DIR, MEDIA_DIR, publicPrefixFor };
