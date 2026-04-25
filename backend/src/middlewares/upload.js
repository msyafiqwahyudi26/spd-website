const multer = require('multer');
const path = require('path');
const fs = require('fs');

const BASE = path.join(process.cwd(), 'uploads');
// New uploads sort into /images or /documents by mimetype. Legacy files
// under /media are still served by Express's static handler, so existing
// DB references (pre-split) keep resolving.
const IMAGES_DIR = path.join(BASE, 'images');
const DOCS_DIR   = path.join(BASE, 'documents');
const MEDIA_DIR  = path.join(BASE, 'media'); // legacy, kept for `prefers`

for (const dir of [IMAGES_DIR, DOCS_DIR, MEDIA_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// SVG intentionally excluded — SVG can contain inline <script> tags and
// would be served from the same domain, creating a stored-XSS vector.
const ALLOWED = /^(image\/(jpeg|png|gif|webp)|application\/pdf)$/;

function destinationFor(mime) {
  if (typeof mime === 'string' && mime === 'application/pdf') return DOCS_DIR;
  return IMAGES_DIR;
}

// Public URL fragment matching the destination directory. The mediaController
// builds the final URL with this prefix + the filename.
function publicPrefixFor(mime) {
  return mime === 'application/pdf' ? '/uploads/documents' : '/uploads/images';
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destinationFor(file.mimetype)),
  filename: (req, file, cb) => {
    // Clean naming: <timestamp>-<random><ext>. No user-controlled path
    // segments; extension slice protects against long-ext abuse.
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `${unique}${ext}`);
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('file');

module.exports = { uploadImage, IMAGES_DIR, DOCS_DIR, MEDIA_DIR, publicPrefixFor };
