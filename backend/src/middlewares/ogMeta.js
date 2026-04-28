/**
 * OG Meta Tag Middleware
 *
 * Social-media crawlers (WhatsApp, Telegram, Twitter, Facebook, etc.)
 * don't execute JavaScript, so they see the generic index.html meta tags.
 * This middleware runs BEFORE the React SPA is served: when a known bot
 * user-agent requests a content URL, we fetch the item from the DB and
 * return a minimal HTML page with correct Open Graph tags so link previews
 * show the article image + title + description.
 *
 * Nginx must proxy bot UA requests for /publikasi/*, /event/*, /program/*
 * to Express instead of serving the static dist/ files. See nginx-spd.conf.
 */

const prisma = require('../lib/prisma');

// Crawlers that need prerendered OG tags
const BOT_RE = /whatsapp|facebookexternalhit|facebot|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|googlebot|bingbot|applebot|pinterest|snapchat/i;

const BASE_URL = (process.env.FRONTEND_URL || 'https://spdindonesia.org').replace(/\/$/, '');
const FALLBACK_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Sindikasi Pemilu dan Demokrasi';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveImage(url) {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function ogHtml({ title, description, image, url, type = 'article' }) {
  const t  = esc(title || SITE_NAME);
  const d  = esc(description || 'Pusat kerja kolaboratif multihak dalam mempromosikan penguatan demokrasi dan reformasi kepemiluan Indonesia.');
  const im = esc(resolveImage(image));
  const u  = esc(url);
  const sn = esc(SITE_NAME);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${t} — ${sn}</title>
  <meta name="description" content="${d}">

  <!-- Open Graph -->
  <meta property="og:type"        content="${esc(type)}">
  <meta property="og:title"       content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image"       content="${im}">
  <meta property="og:url"         content="${u}">
  <meta property="og:site_name"   content="${sn}">
  <meta property="og:locale"      content="id_ID">

  <!-- Twitter / X -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image"       content="${im}">

  <!-- Redirect real browsers to the SPA -->
  <meta http-equiv="refresh" content="0; url=${u}">
  <link rel="canonical" href="${u}">
</head>
<body>
  <p>Memuat halaman... Jika tidak dialihkan secara otomatis, <a href="${u}">klik di sini</a>.</p>
</body>
</html>`;
}

module.exports = async function ogMeta(req, res, next) {
  const ua = req.headers['user-agent'] || '';
  if (!BOT_RE.test(ua)) return next();

  const p = req.path;

  // ── /publikasi/:slug ───────────────────────────────────────────────────
  const pubMatch = p.match(/^\/publikasi\/([^/]+)\/?$/);
  if (pubMatch) {
    try {
      const pub = await prisma.publication.findFirst({
        where:  { slug: pubMatch[1], status: 'published' },
        select: { title: true, description: true, image: true, slug: true },
      });
      if (pub) {
        return res.type('html').send(ogHtml({
          title:       pub.title,
          description: pub.description,
          image:       pub.image,
          url:         `${BASE_URL}/publikasi/${pub.slug}`,
        }));
      }
    } catch { /* fall through */ }
    return next();
  }

  // ── /event/:slug ───────────────────────────────────────────────────────
  const eventMatch = p.match(/^\/event\/([^/]+)\/?$/);
  if (eventMatch) {
    try {
      const ev = await prisma.event.findFirst({
        where:  { slug: eventMatch[1] },
        select: { title: true, description: true, image: true, slug: true, location: true },
      });
      if (ev) {
        return res.type('html').send(ogHtml({
          title:       ev.title,
          description: ev.description || (ev.location ? `Lokasi: ${ev.location}` : null),
          image:       ev.image,
          url:         `${BASE_URL}/event/${ev.slug}`,
        }));
      }
    } catch { /* fall through */ }
    return next();
  }

  // ── /program/:slug ─────────────────────────────────────────────────────
  const programMatch = p.match(/^\/program\/([^/]+)\/?$/);
  if (programMatch) {
    try {
      const prog = await prisma.program.findFirst({
        where:  { slug: programMatch[1] },
        select: { title: true, description: true, image: true, slug: true },
      });
      if (prog) {
        return res.type('html').send(ogHtml({
          title:       prog.title,
          description: prog.description,
          image:       prog.image,
          url:         `${BASE_URL}/program/${prog.slug}`,
        }));
      }
    } catch { /* fall through */ }
    return next();
  }

  next();
};
