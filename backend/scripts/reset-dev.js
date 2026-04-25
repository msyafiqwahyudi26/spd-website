/**
 * Local dev environment recovery.
 *
 *   npm run dev:reset
 *
 * What it does (safely, idempotent):
 *  1. Kills whatever process is holding port 5000 (or PORT env).
 *  2. Removes node_modules/.prisma so the Windows query-engine DLL lock
 *     is released, then regenerates the Prisma client.
 *  3. Prints clear next-steps.
 *
 * Run this whenever you see:
 *   - "EPERM: operation not permitted, rename .../query_engine-*.dll.tmp"
 *   - "Error: listen EADDRINUSE: address already in use :::5000"
 *   - "PrismaClientInitializationError: ..."
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.env.PORT || '5000', 10);
const isWin = process.platform === 'win32';
const root = path.join(__dirname, '..');
const prismaClientDir = path.join(root, 'node_modules', '.prisma');

function section(title) {
  console.log('');
  console.log(`\x1b[36m── ${title} ──────────────────────────\x1b[0m`);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true, ...opts });
  return result.status === 0;
}

section(`1. Free port ${port}`);
run('node', ['scripts/kill-port.js', String(port)]);

section('2. Release Prisma engine lock');
if (fs.existsSync(prismaClientDir)) {
  try {
    fs.rmSync(prismaClientDir, { recursive: true, force: true });
    console.log(`[reset-dev] removed ${path.relative(root, prismaClientDir)}`);
  } catch (err) {
    console.warn(`[reset-dev] could not remove .prisma dir: ${err.message}`);
    console.warn('           A Node process still holds the engine DLL.');
    console.warn('           Close any running backend (or reboot), then re-run.');
    process.exit(1);
  }
} else {
  console.log('[reset-dev] no .prisma directory present (already clean)');
}

section('3. Regenerate Prisma client');
const ok = run('npx', ['prisma', 'generate']);
if (!ok) {
  console.error('[reset-dev] prisma generate failed — see output above');
  process.exit(1);
}

section('Done');
console.log('');
console.log('Next steps:');
console.log('  1. (if needed) npm run admin:reset');
console.log('  2. npm run dev       # backend on http://localhost:' + port);
console.log('  3. (in project root) npm run dev   # frontend on http://localhost:5173');
console.log('');
