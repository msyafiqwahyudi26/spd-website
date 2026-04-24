/**
 * One-off migration: adds iconUrl column to Approach and CoreValue tables.
 * Run with: node scripts/add-icon-url.js
 * Safe to run multiple times (checks if column exists first).
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addColumn(table, column) {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" ADD COLUMN "${column}" TEXT NOT NULL DEFAULT ""`
    );
    console.log(`✓ Added ${column} to ${table}`);
  } catch (err) {
    if (err.message?.includes('duplicate column') || err.message?.includes('already exists')) {
      console.log(`✓ ${table}.${column} already exists — skipping`);
    } else {
      throw err;
    }
  }
}

async function run() {
  try {
    await addColumn('Approach',  'iconUrl');
    await addColumn('CoreValue', 'iconUrl');
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
