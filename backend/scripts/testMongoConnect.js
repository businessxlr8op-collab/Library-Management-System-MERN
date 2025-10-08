import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load .env explicitly from this backend folder and override any inherited env vars
dotenv.config({ path: './.env', override: true });

let mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL || '';
if (!mongoUri && process.env.RMS_MONGO_USER && process.env.RMS_MONGO_PASS && process.env.RMS_MONGO_HOST) {
  const user = process.env.RMS_MONGO_USER;
  const pass = encodeURIComponent(process.env.RMS_MONGO_PASS);
  const host = process.env.RMS_MONGO_HOST;
  const db = process.env.RMS_MONGO_DB || 'rms_library';
  mongoUri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority&appName=Cluster0`;
}

if (!mongoUri) {
  console.error('No Mongo URI available. Set RMS_MONGODB_URI or RMS_MONGO_* env vars.');
  process.exit(2);
}
// If URI lacks a DB path (ends with host/ or host?...) insert default DB name
const ensureDbInUri = (uri, defaultDb = 'rms_library') => {
  if (typeof uri !== 'string') return uri;
  try {
    // find first '/' after the protocol
    const protoSep = uri.indexOf('://');
    const afterProto = protoSep >= 0 ? uri.indexOf('/', protoSep + 3) : uri.indexOf('/');
    if (afterProto === -1) return uri; // nothing to do
    const pathAndQuery = uri.slice(afterProto + 1);
    if (!pathAndQuery || pathAndQuery.startsWith('?')) {
      return uri.slice(0, afterProto + 1) + defaultDb + (pathAndQuery.startsWith('?') ? pathAndQuery : '');
    }
    return uri;
  } catch (e) {
    return uri;
  }
};

mongoUri = ensureDbInUri(mongoUri, process.env.RMS_MONGO_DB || 'rms_library');

try {
  let display = mongoUri;
  const atIdx = typeof mongoUri === 'string' ? mongoUri.indexOf('@') : -1;
  if (atIdx > -1) display = mongoUri.substring(atIdx + 1);
  console.log('Testing Mongo connection to:', display);
} catch (e) {
  console.log('Testing Mongo connection (masked)');
}

// Normalize URI to URL-encode password if it contained '@'
const normalizeMongoUri = (uri) => {
  if (typeof uri !== 'string') return uri;
  try {
    const protoSep = uri.indexOf('://');
    if (protoSep === -1) return uri;
    const protocol = uri.slice(0, protoSep);
    const rest = uri.slice(protoSep + 3);
    const atCount = (rest.match(/@/g) || []).length;
    if (atCount <= 1) return uri;
    const parts = rest.split('@');
    const hostPart = parts[parts.length - 1];
    const userInfo = parts.slice(0, parts.length - 1).join('@');
    const colonIdx = userInfo.indexOf(':');
    if (colonIdx === -1) return uri;
    const user = userInfo.slice(0, colonIdx);
    const pass = userInfo.slice(colonIdx + 1);
    const encPass = encodeURIComponent(pass);
    return `${protocol}://${user}:${encPass}@${hostPart}`;
  } catch (e) { return uri; }
};

mongoUri = normalizeMongoUri(mongoUri);

(async () => {
  try {
    // Use short timeout for quick diagnostics
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 });
    console.log('Mongo connection: OK');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mongo connection: FAILED');
    if (err && err.message) console.error(err.message);
    else if (err) {
      try {
        console.error(String(err));
      } catch (e) {
        console.error('Unknown error object from driver');
      }
    } else console.error('Unknown error');
    process.exit(1);
  }
})();
