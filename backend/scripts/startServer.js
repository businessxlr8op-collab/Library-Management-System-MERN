#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 5000;
console.log(`Auto-start helper: ensuring port ${PORT} is free`);
try {
  // Find any process listening on the port (platform-agnostic using lsof)
  const out = execSync(`lsof -i :${PORT} -sTCP:LISTEN -Pn || true`, { stdio: ['pipe', 'pipe', 'inherit'] }).toString();
  if (out && out.trim()) {
    // Extract PID(s)
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

// Start the server detached
const serverPath = path.join(__dirname, '..', 'server.js');
const child = spawn(process.execPath, [serverPath], {
  detached: true,
  stdio: 'ignore',
  env: { ...process.env },
});
child.unref();
console.log('Server started (detached).');
