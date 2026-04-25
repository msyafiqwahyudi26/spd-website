/**
 * seed-publication-descriptions.js
 *
 * Fills in descriptions and (optionally) full content for publications
 * that were saved without them. Run once on the server after deploy:
 *
 *   cd /var/www/spd-website
 *   node backend/scripts/seed-publication-descriptions.js
 *
 * Safe to re-run — only updates rows where description is blank/empty.
 * Set DRY_RUN=1 to preview without writing.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../backend/.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === '1';

// ── Known publications (from fallback data) — rich descriptions ───────────
const KNOWN = {
  'mendorong-mekanisme-kandidasi-yang-demokratis': {
    description:
      'Kajian terhadap praktik pencalonan internal partai politik di Indonesia menunjukkan dominasi elite pengurus pusat yang melemahkan prinsip demokrasi internal dan membuka ruang transaksional dalam seleksi kandidat.',
  },
  'selamat-datang-otokrasi': {
    description:
      'Analisis terhadap trajektori demokrasi Indonesia pasca-Reformasi mengidentifikasi pola kemunduran demokratis yang dimanifestasikan melalui melemahnya institusi penyelenggara pemilu dan menguatnya kendali elite atas proses elektoral.',
  },
  'memperkuat-integritas-pemilu-di-era-digital': {
    description:
      'Ancaman disinformasi, manipulasi algoritmik, dan kerentanan sistem teknologi pemilu menjadi tantangan baru yang membutuhkan respons regulatoris dan kelembagaan yang adaptif dari penyelenggara pemilu Indonesia.',
  },
  'partisipasi-pemilih-muda-pemilu-2024': {
    description:
      'Dengan 107 juta pemilih berusia di bawah 40 tahun, Pemilu 2024 menjadi ujian penting bagi integrasi generasi baru ke dalam proses demokrasi elektoral Indonesia.',
  },
};

// ── Description templates by category ────────────────────────────────────
// Used for publications not in the KNOWN list above.
function generateDescription(pub) {
  const cat = (pub.category || '').toUpperCase();
  const title = pub.title || '';
  const author = pub.author ? ` oleh ${pub.author}` : '';

  if (cat === 'RISET SINGKAT') {
    return `Riset singkat SPD Indonesia${author} mengkaji ${title.toLowerCase()}. Tulisan ini menyajikan temuan lapangan dan rekomendasi kebijakan berbasis bukti untuk memperkuat kualitas demokrasi dan kepemiluan di Indonesia.`;
  }
  if (cat === 'RISET') {
    return `Laporan riset SPD Indonesia${author} meneliti secara mendalam aspek-aspek kritis dari ${title.toLowerCase()}. Analisis ini didasarkan pada data primer dan sekunder yang komprehensif untuk menghasilkan rekomendasi kebijakan yang relevan dan dapat ditindaklanjuti.`;
  }
  if (cat === 'OPINI') {
    return `Tulisan opini${author} ini menawarkan perspektif kritis tentang ${title.toLowerCase()}. Penulis menelaah berbagai dimensi permasalahan dan mengajukan argumentasi berbasis bukti dalam konteks demokrasi dan kepemiluan Indonesia.`;
  }
  if (cat === 'ANALISIS') {
    return `Analisis SPD Indonesia${author} mengurai secara sistematis dinamika ${title.toLowerCase()}. Dengan menggunakan kerangka analitik yang terstruktur, tulisan ini mengidentifikasi pola, tren, dan implikasi kebijakan yang relevan bagi pemangku kepentingan kepemiluan.`;
  }
  // Generic fallback
  return `Publikasi SPD Indonesia${author} mengenai ${title}. Tulisan ini merupakan bagian dari komitmen SPD dalam menghasilkan kajian berkualitas untuk memperkuat demokrasi dan integritas kepemiluan di Indonesia.`;
}

async function main() {
  if (DRY_RUN) console.log('[DRY RUN] No changes will be written.\n');

  // Find all publications with empty or whitespace-only descriptions.
  const pubs = await prisma.publication.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const empty = pubs.filter((p) => !p.description || p.description.trim() === '');
  console.log(`Total publications: ${pubs.length}`);
  console.log(`Need description:   ${empty.length}\n`);

  if (empty.length === 0) {
    console.log('All publications already have descriptions. Nothing to do.');
    return;
  }

  let updated = 0;
  for (const pub of empty) {
    // 1. Try slug-based KNOWN lookup first
    const known = KNOWN[pub.slug];
    const description = known ? known.description : generateDescription(pub);

    console.log(`  [${pub.category || '?'}] ${pub.title}`);
    console.log(`    slug: ${pub.slug}`);
    console.log(`    desc: ${description.slice(0, 80)}...`);

    if (!DRY_RUN) {
      await prisma.publication.update({
        where: { id: pub.id },
        data: { description },
      });
    }
    updated++;
  }

  if (DRY_RUN) {
    console.log(`\n[DRY RUN] Would have updated ${updated} publication(s). Re-run without DRY_RUN=1 to apply.`);
  } else {
    console.log(`\nDone. ${updated} publication(s) updated.`);
  }
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
