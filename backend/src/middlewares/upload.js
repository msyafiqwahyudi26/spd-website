const multer = require('multer');
const path = require('path');
const fs = require('fs');

const BASE = path.join(process.cwd(), 'uploads');
const MEDIA_DIR = path.join(BASE, 'media');

if (!fs.existsSync(MEDIA_DIR)) {
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
}

// Images for team/media uploads, plus PDF for annual reports. Anything
// else is rejected at the multer layer so nothing unexpected lands on disk.
const ALLOWED = /^(image\/(jpeg|png|gif|webp|svg\+xml)|application\/pdf)$/;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    cb(null, `media-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED.test(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Hanya file gambar (jpg, png, gif, webp, svg) atau PDF yang diizinkan');
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

module.exports = { uploadImage, MEDIA_DIR };
