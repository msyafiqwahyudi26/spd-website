/**
 * One-off migration: adds socialYoutube column to the Setting table.
 * Run with: node scripts/add-social-youtube.js
 * Safe to run multiple times (checks if column exists first).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    // Try a raw query — on SQLite this will error if column already exists.
    await prisma.$executeRawUnsafe(`ALTER TABLE "Setting" ADD COLUMN "socialYoutube" TEXT NOT NULL DEFAULT ""`);
    console.log('✓ Added socialYoutube column to Setting table');
  } catch (err) {
    if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
      console.log('✓ socialYoutube column already exists — nothing to do');
    } else {
      console.error('Migration error:', err.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

run();
