const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

module.exports = { uploadImage, IMAGES_DIR, DOCS_DIR, MEDIA_DIR, publicPrefixFor };
