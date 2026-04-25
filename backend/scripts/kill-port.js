/**
 * Cross-platform port killer.
 *
 *   node scripts/kill-port.js          # defaults to PORT env or 5000
 *   node scripts/kill-port.js 5001
 *
 * Exits 0 even when nothing was listening — intended to be safe to call
 * before `npm run dev` every time.
 */

const { execSync } = require('child_process');

const isWin = process.platform === 'win32';
const port = parseInt(process.argv[2] || process.env.PORT || '5000', 10);

if (!Number.isFinite(port) || port <= 0 || port > 65535) {
  console.error(`[kill-port] invalid port: ${process.argv[2]}`);
  process.exit(1);
}

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function findPids(p) {
  const pids = new Set();

  if (isWin) {
    const out = run(`netstat -ano -p tcp | findstr :${p}`);
    for (const line of out.split(/\r?\n/)) {
      const parts = line.trim().split(/\s+/);
      // Typical line: "TCP  0.0.0.0:5000  0.0.0.0:0  LISTENING  12345"
      if (parts.length >= 5 && parts[1] && parts[1].endsWith(`:${p}`)) {
        const pid = parts[parts.length - 1];
        if (/^\d+$/.test(pid)) pids.add(pid);
      }
    }
  } else {
    const out = run(`lsof -ti tcp:${p}`);
    for (const pid of out.split(/\s+/).filter(Boolean)) pids.add(pid);
  }

  return [...pids];
}

function killPid(pid) {
  if (isWin) {
    run(`taskkill /F /PID ${pid}`);
  } else {
    run(`kill -9 ${pid}`);
  }
}

const pids = findPids(port);
if (pids.length === 0) {
  console.log(`[kill-port] nothing listening on :${port}`);
  process.exit(0);
}

for (const pid of pids) {
  killPid(pid);
  console.log(`[kill-port] killed PID ${pid} on :${port}`);
}
