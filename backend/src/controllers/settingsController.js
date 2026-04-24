const prisma = require('../lib/prisma');
const { log } = require('../lib/logger');
const { ok } = require('../lib/response');

const DEFAULTS = {
  siteName: 'SPD Indonesia',
  email: 'kontak@spdindonesia.org',
  logoUrl: '',
  heroUrl: '',
  placeholderUrl: '',
  visionText: '',
  aboutIntro: '',
  heroSubtitle: '',
  heroCta1Label: '',
  heroCta1Href:  '',
  heroCta2Label: '',
  heroCta2Href:  '',
  socialFacebook: '',
  socialTwitter: '',
  socialLinkedin: '',
  socialInstagram: '',
};

function toPublic(row) {
  const src = row || DEFAULTS;
  return {
    siteName: src.siteName,
    email:    src.email,
    images: {
      logo:        src.logoUrl || '',
      hero:        src.heroUrl || '',
      placeholder: src.placeholderUrl || '',
    },
    content: {
      vision:       src.visionText   || '',
      aboutIntro:   src.aboutIntro   || '',
      heroSubtitle: src.heroSubtitle || '',
    },
    hero: {
      cta1: { label: src.heroCta1Label || '', href: src.heroCta1Href || '' },
      cta2: { label: src.heroCta2Label || '', href: src.heroCta2Href || '' },
    },
    social: {
      facebook:  src.socialFacebook  || '',
      twitter:   src.socialTwitter   || '',
      linkedin:  src.socialLinkedin  || '',
      instagram: src.socialInstagram || '',
    },
  };
}

async function getRow() {
  let row = await prisma.setting.findFirst({ where: { id: 1 } });
  if (!row) {
    try {
      row = await prisma.setting.create({ data: { id: 1, ...DEFAULTS } });
    } catch {
      // Race: another request created it first — just re-read.
      row = await prisma.setting.findFirst({ where: { id: 1 } });
    }
  }
  return row;
}

exports.get = async (req, res, next) => {
  try {
    const row = await getRow();
    return ok(res, toPublic(row));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const body = req.body || {};
    const images  = body.images  || {};
    const content = body.content || {};
    const social  = body.social  || {};
    const hero    = body.hero    || {};

    const data = {};
    if (typeof body.siteName === 'string') data.siteName = body.siteName.trim().slice(0, 200);
    if (typeof body.email === 'string')    data.email    = body.email.trim().slice(0, 200);
    if (typeof images.logo === 'string')        data.logoUrl        = images.logo.trim().slice(0, 2000);
    if (typeof images.hero === 'string')        data.heroUrl        = images.hero.trim().slice(0, 2000);
    if (typeof images.placeholder === 'string') data.placeholderUrl = images.placeholder.trim().slice(0, 2000);
    if (typeof content.vision === 'string')     data.visionText     = content.vision.trim().slice(0, 2000);
    if (typeof content.aboutIntro === 'string') data.aboutIntro     = content.aboutIntro.trim().slice(0, 5000);
    if (typeof content.heroSubtitle === 'string') data.heroSubtitle = content.heroSubtitle.trim().slice(0, 500);
    if (hero.cta1 && typeof hero.cta1.label === 'string') data.heroCta1Label = hero.cta1.label.trim().slice(0, 80);
    if (hero.cta1 && typeof hero.cta1.href  === 'string') data.heroCta1Href  = hero.cta1.href.trim().slice(0, 500);
    if (hero.cta2 && typeof hero.cta2.label === 'string') data.heroCta2Label = hero.cta2.label.trim().slice(0, 80);
    if (hero.cta2 && typeof hero.cta2.href  === 'string') data.heroCta2Href  = hero.cta2.href.trim().slice(0, 500);
    if (typeof social.facebook  === 'string') data.socialFacebook  = social.facebook.trim().slice(0, 500);
    if (typeof social.twitter   === 'string') data.socialTwitter   = social.twitter.trim().slice(0, 500);
    if (typeof social.linkedin  === 'string') data.socialLinkedin  = social.linkedin.trim().slice(0, 500);
    if (typeof social.instagram === 'string') data.socialInstagram = social.instagram.trim().slice(0, 500);

    const existing = await getRow();
    const updated = await prisma.setting.update({
      where: { id: existing.id },
      data,
    });

    log('update_settings', 'setting', {
      entityId: String(updated.id),
      userId:   req.user?.userId,
      userName: req.user?.name || '',
      details:  Object.keys(data).join(', ') || 'no-op',
    });

    return ok(res, toPublic(updated));
  } catch (err) {
    next(err);
  }
};
