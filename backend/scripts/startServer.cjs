const { spawnSync } = require('child_process');
// This file is intended to be run via `node scripts/startServer.cjs` or `npm run start:auto`.
/* eslint-disable no-console */
const path = require('path');
const script = path.join(__dirname, 'autoFixAndStart.cjs');
console.log('Running auto-fix...');
const r = spawnSync('node', [script], { stdio: 'inherit', cwd: path.join(__dirname, '..') });
if (r.status !== 0) {
  console.error('autoFixAndStart failed or exited with non-zero status; check logs.');
  process.exit(r.status || 2);
}
console.log('auto-fix completed. Backend should be running.');
const { execSync, spawn } = require('child_process');

const PORT = process.env.PORT || 5000;
console.log(`Auto-start helper: ensuring port ${PORT} is free`);
try {
  const out = execSync(`lsof -i :${PORT} -sTCP:LISTEN -Pn || true`, { stdio: ['pipe', 'pipe', 'inherit'] }).toString();
  if (out && out.trim()) {
    const lines = out.trim().split('\n').slice(1);
    const pids = lines.map(l => l.trim().split(/\s+/)[1]).filter(Boolean);
    pids.forEach(pid => {
      try {
        process.kill(parseInt(pid, 10), 'SIGTERM');
        console.log(`Stopped process ${pid} on port ${PORT}`);
      } catch (e) {
        console.log(`Failed to stop PID ${pid}: ${e.message}`);
      }
    });
  }
} catch (e) {
  console.log('Port check failed (lsof may not be available). Proceeding to start server.');
}

const serverPath = path.join(__dirname, '..', 'server.js');
const child = spawn(process.execPath, [serverPath], {
  detached: true,
  stdio: 'ignore',
  env: { ...process.env },
});
child.unref();
console.log('Server started (detached).');
