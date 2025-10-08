#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env'), override: true });

const ENV_PATH = path.join(__dirname, '../.env');
let origUri = process.env.RMS_MONGODB_URI || process.env.MONGODB_URI || '';
if (!origUri) {
  console.error('No RMS_MONGODB_URI found in backend/.env. Aborting.');
  process.exit(1);
}

function stripDbFromUri(uri) {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)(\/[^?]*)?(\?.*)?$/);
  if (!m) return uri;
  return (m[1] || uri) + (m[3] || '');
}

function buildUriWithDb(uri, dbName) {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/[^\/]+)(\/[^?]*)?(\?.*)?$/);
  const q = (m && m[3]) ? m[3] : '';
  return `${m[1]}/${dbName}${q}`;
}

(async () => {
  try {
    console.log('1) Normalizing URI and connecting to cluster (no DB path)...');
    const baseUri = stripDbFromUri(origUri);
    const client = new MongoClient(baseUri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 });
    await client.connect();
    console.log('Connected to cluster, listing databases...');
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();
    let foundDb = null;
    for (const dbInfo of databases) {
      const name = dbInfo.name;
      try {
        const db = client.db(name);
        const cols = await db.listCollections({ name: 'books' }, { nameOnly: true }).toArray();
        if (cols.length === 0) continue;
        const count = await db.collection('books').countDocuments();
        console.log(`  - ${name}: books collection exists, count=${count}`);
        if (count > 0) {
          foundDb = name;
          break;
        }
      } catch (err) {
        // ignore per-db errors
      }
    }
    await client.close();

    if (!foundDb) {
      console.log('No database with populated "books" collection found. Exiting without changes.');
      process.exit(0);
    }

    console.log(`2) Found DB with books: ${foundDb}. Updating backend/.env...`);
    const newUri = buildUriWithDb(origUri, foundDb);
    const envText = fs.readFileSync(ENV_PATH, 'utf8');
    const replaced = envText.replace(/^(RMS_MONGODB_URI\s*=).*/m, `RMS_MONGODB_URI=${newUri}`);
    fs.writeFileSync(ENV_PATH, replaced, 'utf8');
    console.log(`Updated RMS_MONGODB_URI to use /${foundDb}`);

    function killPort(port) {
      try {
        const pids = execSync(`lsof -t -i :${port} || true`).toString().split(/\s+/).filter(Boolean);
        if (pids.length) {
          console.log(`Killing processes on port ${port}: ${pids.join(', ')}`);
          for (const pid of pids) {
            try { process.kill(Number(pid), 'SIGKILL'); } catch (e) {}
          }
        } else {
          console.log(`No process found on port ${port}`);
        }
      } catch (e) {
        console.warn('Could not check/kill port', port, e.message);
      }
    }

    console.log('3) Restarting backend (port 5000)...');
    killPort(5000);
    const backendDir = path.join(__dirname, '..');
    const out = fs.openSync(path.join(backendDir, 'server.out.log'), 'a');
    const err = fs.openSync(path.join(backendDir, 'server.err.log'), 'a');
    const backendProc = spawn('node', ['server.js'], {
      cwd: backendDir,
      detached: true,
      stdio: ['ignore', out, err],
    });
    backendProc.unref();
    console.log(`Backend restarted, PID ${backendProc.pid} (logs: backend/server.out.log)`);

    console.log('4) Restarting frontend dev server (port 3000)...');
    const frontendDir = path.join(__dirname, '..', '..', 'frontend');
    killPort(3000);
    if (fs.existsSync(path.join(frontendDir, 'package.json'))) {
      const fout = fs.openSync(path.join(frontendDir, 'frontend.out.log'), 'a');
      const ferr = fs.openSync(path.join(frontendDir, 'frontend.err.log'), 'a');
      const frontendProc = spawn('npm', ['start'], {
        cwd: frontendDir,
        detached: true,
        stdio: ['ignore', fout, ferr],
        shell: true
      });
      frontendProc.unref();
      console.log(`Frontend restart attempted, PID ${frontendProc.pid} (logs: frontend/frontend.out.log)`);
    } else {
      console.log('No frontend package.json found; skipping frontend start.');
    }

    console.log('5) Verifying backend /api/books endpoint (one-shot)...');
    try {
      await new Promise(r => setTimeout(r, 3000));
      const curl = execSync('curl -sS http://localhost:5000/api/books || true').toString();
      if (!curl) {
        console.log('No response from http://localhost:5000/api/books (backend may still be starting).');
      } else {
        console.log('Sample response (truncated):\n', curl.slice(0, 2000));
      }
    } catch (e) {
      console.log('Could not curl backend:', e.message);
    }

    console.log('Auto-fix complete. If frontend still does not show books, hard-refresh the browser and check developer console/network.');
  } catch (err) {
    console.error('Auto-fix failed:', err && err.message ? err.message : err);
    process.exit(2);
  }
})();
