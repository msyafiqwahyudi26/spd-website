const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok, fail } = require('../lib/response');

function makeSlug(title) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Date.now()
  );
}

function parseArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

function format(pub) {
  return {
    ...pub,
    fullContent: parseArray(pub.fullContent),
    gallery:     parseArray(pub.gallery),
    href: `/publikasi/${pub.slug}`,
  };
}

// SQLite stores Json-ish values as TEXT, so the column type is String and we
// stringify at the boundary. Always returns a JSON string representing an array.
function toJsonArray(val) {
  return JSON.stringify(parseArray(val));
}

exports.getAll = async (req, res, next) => {
  try {
    const publications = await prisma.publication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, publications.map(format));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pub = await prisma.publication.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!pub) return fail(res, 404, 'Publikasi tidak ditemukan');
    return ok(res, format(pub));
  } catch (err) {
    next(err);
  }
};

exports.incrementView = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.publication.updateMany({
      where: { OR: [{ id }, { slug: id }] },
      data: { views: { increment: 1 } },
    });
    return ok(res, { counted: true });
  } catch (err) {
    next(err);
  }
};

const ALLOWED_CONTENT_TYPES = ['article', 'research', 'book'];
function normalizeContentType(val) {
  return ALLOWED_CONTENT_TYPES.includes(val) ? val : 'article';
}

/** Allow relative /uploads/... paths, absolute https?:// URLs, or empty. */
function isValidUrlOrPath(url) {
  if (!url) return true;
  return /^https?:\/\//i.test(url) || url.startsWith('/');
}

exports.create = async (req, res, next) => {
  try {
    const title       = (req.body.title       || '').trim().slice(0, 300);
    const category    = (req.body.category    || '').trim().slice(0, 64);
    const description = (req.body.description || '').trim().slice(0, 2000);
    const author      = (req.body.author      || '').trim().slice(0, 200);
    const readTime    = (req.body.readTime    || '').trim().slice(0, 64);
    const date        = (req.body.date        || '').trim().slice(0, 64);
    const contentType = normalizeContentType(req.body.contentType);
    const pdfUrl      = typeof req.body.pdfUrl === 'string' ? req.body.pdfUrl.trim().slice(0, 500) : '';
    const { fullContent, image, gallery } = req.body;

    if (!title || !category) {
      return fail(res, 400, 'Judul dan kategori diperlukan');
    }

    // Validate URLs
    if (!isValidUrlOrPath(image)) return fail(res, 400, 'URL gambar tidak valid');
    if (!isValidUrlOrPath(pdfUrl)) return fail(res, 400, 'URL PDF tidak valid');

    // Size guard on rich content (prevents storing multi-MB blobs in SQLite)
    const fullContentStr = toJsonArray(fullContent);
    if (fullContentStr.length > 200000) return fail(res, 400, 'Konten terlalu besar (maks 200KB)');

    // Books are curated institutional assets — only admin can publish them.
    // Publishers attempting to set contentType='book' get a 403 rather than
    // a silent downgrade, because silent behavior is harder to debug.
    if (contentType === 'book' && req.user?.role !== 'admin') {
      return fail(res, 403, 'Hanya admin yang dapat menerbitkan buku');
    }

    const pub = await prisma.publication.create({
      data: {
        title,
        slug: makeSlug(title),
        category,
        contentType,
        description,
        author,
        readTime,
        date,
        fullContent: fullContentStr,
        image: image || null,
        pdfUrl: pdfUrl || null,
        gallery: toJsonArray(gallery),
      },
    });

    log('create_publication', 'publication', {
      entityId: pub.id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  title,
    });

    return ok(res, format(pub), 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Publikasi tidak ditemukan');

    const { title, category, description, author, readTime, date, fullContent, image, gallery, contentType, pdfUrl } = req.body;

    // Validate URLs when provided
    if (image !== undefined && !isValidUrlOrPath(image)) return fail(res, 400, 'URL gambar tidak valid');
    if (pdfUrl !== undefined && !isValidUrlOrPath(pdfUrl)) return fail(res, 400, 'URL PDF tidak valid');

    // Same rule on update: publishers can't flip an existing publication
    // to contentType='book', nor can they modify one that's already a book.
    if (contentType === 'book' && req.user?.role !== 'admin') {
      return fail(res, 403, 'Hanya admin yang dapat menetapkan tipe buku');
    }
    if (existing.contentType === 'book' && req.user?.role !== 'admin') {
      return fail(res, 403, 'Hanya admin yang dapat menyunting buku');
    }

    const pub = await prisma.publication.update({
      where: { id },
      data: {
        title:       title       !== undefined ? (title       || '').trim().slice(0, 300)  : existing.title,
        category:    category    !== undefined ? (category    || '').trim().slice(0, 64)   : existing.category,
        contentType: contentType !== undefined ? normalizeContentType(contentType)         : existing.contentType,
        description: description !== undefined ? (description || '').trim().slice(0, 2000) : existing.description,
        author:      author      !== undefined ? (author      || '').trim().slice(0, 200)  : existing.author,
        readTime:    readTime    !== undefined ? (readTime    || '').trim().slice(0, 64)   : existing.readTime,
        date:        date        !== undefined ? (date        || '').trim().slice(0, 64)   : existing.date,
        fullContent: fullContent !== undefined ? toJsonArray(fullContent)         : existing.fullContent,
        image:       image       !== undefined ? (image || null)                  : existing.image,
        pdfUrl:      pdfUrl      !== undefined ? ((typeof pdfUrl === 'string' ? pdfUrl.trim() : '') || null) : existing.pdfUrl,
        gallery:     gallery     !== undefined ? toJsonArray(gallery)             : existing.gallery,
      },
    });

    log('update_publication', 'publication', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.title,
    });

    return ok(res, format(pub));
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.publication.findUnique({ where: { id } });
    if (!existing) return fail(res, 404, 'Publikasi tidak ditemukan');

    await prisma.publication.delete({ where: { id } });

    log('delete_publication', 'publication', {
      entityId: id,
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  existing.title,
    });

    return ok(res, { message: 'Publikasi berhasil dihapus' });
  } catch (err) {
    next(err);
  }
};
