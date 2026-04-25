/**
 * One-time seed: add Event and Kontak to the footer nav section.
 * Run on the server after deploy:
 *   node backend/scripts/seed-footer-links.js
 *
 * Safe to run multiple times — skips entries that already exist.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const NAV_LINKS = [
  { label: 'Beranda',      url: '/beranda',      sortOrder: 0 },
  { label: 'Tentang Kami', url: '/tentang-kami', sortOrder: 1 },
  { label: 'Program',      url: '/program',      sortOrder: 2 },
  { label: 'Publikasi',    url: '/publikasi',    sortOrder: 3 },
  { label: 'Kegiatan',     url: '/event',        sortOrder: 4 },
  { label: 'Kontak',       url: '/kontak',       sortOrder: 5 },
];

const LAYANAN_LINKS = [
  { label: 'Riset & Analisis Kebijakan', url: '/publikasi',    sortOrder: 0 },
  { label: 'Kampanye Digital',           url: '/program',      sortOrder: 1 },
  { label: 'Advokasi Publik',            url: '/tentang-kami', sortOrder: 2 },
  { label: 'Advokasi Kebijakan',         url: '/publikasi',    sortOrder: 3 },
];

async function main() {
  const existing = await prisma.footerLink.findMany();
  const existingKeys = new Set(existing.map(r => `${r.section}:${r.url}`));

  let created = 0;

  for (const link of NAV_LINKS) {
    const key = `nav:${link.url}`;
    if (existingKeys.has(key)) {
      console.log(`  skip (exists): nav — ${link.label}`);
      continue;
    }
    await prisma.footerLink.create({ data: { section: 'nav', ...link } });
    console.log(`  created: nav — ${link.label}`);
    created++;
  }

  for (const link of LAYANAN_LINKS) {
    const key = `layanan:${link.url}`;
    if (existingKeys.has(key)) {
      console.log(`  skip (exists): layanan — ${link.label}`);
      continue;
    }
    await prisma.footerLink.create({ data: { section: 'layanan', ...link } });
    console.log(`  created: layanan — ${link.label}`);
    created++;
  }

  console.log(`\nDone. ${created} link(s) added.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
