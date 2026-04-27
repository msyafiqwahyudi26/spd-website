const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');
const { publicPrefixFor, IMAGES_DIR, DOCS_DIR, MEDIA_DIR } = require('../middlewares/upload');

const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,63}$/;

// Allowed upload root directories — used to prevent path-traversal attacks
const ALLOWED_DIRS = [IMAGES_DIR, DOCS_DIR, MEDIA_DIR].map(d => path.resolve(d));

/**
 * Safely delete a file referenced by a /uploads/... URL.
 * Guards against path-traversal (e.g. url = '/uploads/../../etc/passwd').
 */
function safeUnlink(url) {
  try {
    const rel = (url || '').replace(/^\/uploads\//, '');
    // Resolve to an absolute path — path.join won't normalise '../..'
    const target = path.resolve(path.join(__dirname, '..', '..', 'uploads'), rel);
    // Only delete if the resolved path sits inside one of our known upload dirs
    const inAllowed = ALLOWED_DIRS.some(dir => target.startsWith(dir + path.sep) || target === dir);
    if (!inAllowed) {
      console.warn('[media] Rejected unsafe delete path:', target);
      return;
    }
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (e) {
    console.warn('[media] safeUnlink error:', e.message);
  }
}

function toPublic(row) {
  return {
    id: row.id,
    key: row.key,
    url: row.url,
    type: row.type,
    filename: row.filename,
    size: row.size,
    createdAt: row.createdAt,
  };
}

exports.list = async (req, res, next) => {
  try {
    const rows = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, rows.map(toPublic));
  } catch (err) {
    next(err);
  }
};

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 400, 'Tidak ada file yang diunggah');

    const rawKey = typeof req.body.key === 'string' ? req.body.key.trim().toLowerCase() : '';
    let key = null;
    if (rawKey) {
      if (!KEY_RE.test(rawKey)) {
        // Remove the uploaded file on invalid key to avoid orphans.
        try { fs.unlinkSync(req.file.path); } catch {}
        return fail(res, 400, 'Key hanya boleh huruf kecil, angka, titik, tanda hubung, dan garis bawah');
      }
      key = rawKey;
    }

    // URL matches the directory multer picked based on mimetype:
    //   image/* → /uploads/images/<file>
    //   application/pdf → /uploads/documents/<file>
    const url = `${publicPrefixFor(req.file.mimetype)}/${req.file.filename}`;

    // If a key is being (re)bound to this new upload, remove the previous
    // row + file so only one asset holds the key at a time.
    let previous = null;
    if (key) {
      previous = await prisma.media.findUnique({ where: { key } });
    }

    const created = await prisma.media.create({
      data: {
        key,
        url,
        type: req.file.mimetype || '',
        filename: req.file.originalname || req.file.filename,
        size: req.file.size || 0,
      },
    });

    if (previous && previous.id !== created.id) {
      try { await prisma.media.delete({ where: { id: previous.id } }); } catch {}
      // Physical file removal is best-effort.
      safeUnlink(previous.url);
    }

    log('media_upload', 'media', {
      entityId: created.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  `${key || 'unkeyed'} (${req.file.mimetype})`,
    });

    return ok(res, toPublic(created), 201);
  } catch (err) {
    // Clean up the uploaded file if DB write failed.
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    next(err);
  }
};

exports.setKey = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rawKey = typeof req.body.key === 'string' ? req.body.key.trim().toLowerCase() : '';
    const key = rawKey === '' ? null : rawKey;

    if (key && !KEY_RE.test(key)) {
      return fail(res, 400, 'Key hanya boleh huruf kecil, angka, titik, tanda hubung, dan garis bawah');
    }

    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Media tidak ditemukan');

    // Free the key on any other media first.
    if (key) {
      await prisma.media.updateMany({
        where: { key, NOT: { id } },
        data: { key: null },
      });
    }

    const updated = await prisma.media.update({
      where: { id },
      data: { key },
    });

    log('media_set_key', 'media', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  key || '(cleared)',
    });

    return ok(res, toPublic(updated));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Media tidak ditemukan');

    await prisma.media.delete({ where: { id } });

    // Best-effort delete of the physical file (path-traversal safe).
    safeUnlink(existing.url);

    log('media_delete', 'media', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.key || existing.filename,
    });

    return ok(res, { message: 'Media dihapus' });
  } catch (err) {
    next(err);
  }
};

exports.getByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    if (!KEY_RE.test(key || '')) return fail(res, 400, 'Key tidak valid');

    const row = await prisma.media.findUnique({ where: { key } });
    if (!row) return fail(res, 404, 'Media dengan key tersebut tidak ditemukan');
    return ok(res, toPublic(row));
  } catch (err) {
    next(err);
  }
};
