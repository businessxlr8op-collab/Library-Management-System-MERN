import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import bookRoutes from "./routes/books.js";
import transactionRoutes from "./routes/transactions.js";
import categoryRoutes from "./routes/categories.js";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import winston from 'winston';

/* App Config */
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// In some hosted/dev environments X-Forwarded-For is set — enable trust proxy so express-rate-limit works
// Use a safer trust proxy setting: only treat local loopback as trusted when running in dev container
// This avoids express-rate-limit complaining about a permissive trust proxy setting.
app.set('trust proxy', 'loopback');

/* Middlewares */
app.use(express.json());
// Allow CORS from configured school domains in production
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin }));
// Security headers
app.use(helmet());
// Rate limiting — use req.ip as key and keep moderate limits
const limiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 200, keyGenerator: (req) => req.ip });
app.use(limiter);
// Logging
app.use(morgan('combined'));

// Basic winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()],
});

/* API Routes */
app.use("/api/auth", authRoutes);
app.use("/api/students", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);

// simple request logger using winston
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url });
  next();
});

/* MongoDB connection */
// Prefer a full URI. If not provided, build one from components and encode the password to avoid issues with special chars.
let mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL || '';
if (!mongoUri && process.env.RMS_MONGO_USER && process.env.RMS_MONGO_PASS && process.env.RMS_MONGO_HOST) {
  const user = process.env.RMS_MONGO_USER;
  const pass = encodeURIComponent(process.env.RMS_MONGO_PASS);
  const host = process.env.RMS_MONGO_HOST; // e.g. cluster0.bdgjs.mongodb.net
  const db = process.env.RMS_MONGO_DB || 'rms_library';
  mongoUri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority&appName=Cluster0`;
  console.log('Mongo URI constructed from environment components (user + host)');
}
if (!mongoUri) {
  console.error('Missing MongoDB connection string. Set RMS_MONGODB_URI in your .env');
  process.exit(1);
}

// Ensure URI includes a database name; some URIs in .env may omit the DB segment and cause driver errors
const ensureDbInUri = (uri, defaultDb = 'rms_library') => {
  if (typeof uri !== 'string') return uri;
  try {
    const protoSep = uri.indexOf('://');
    const afterProto = protoSep >= 0 ? uri.indexOf('/', protoSep + 3) : uri.indexOf('/');
    if (afterProto === -1) return uri;
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

// Normalize URI: if password contains unencoded '@' it will break parsing. Detect multiple '@' and encode password.
const normalizeMongoUri = (uri) => {
  if (typeof uri !== 'string') return uri;
  try {
    const protoSep = uri.indexOf('://');
    if (protoSep === -1) return uri;
    const protocol = uri.slice(0, protoSep);
    const rest = uri.slice(protoSep + 3);
    const atCount = (rest.match(/@/g) || []).length;
    if (atCount <= 1) return uri; // normal
    // join all parts except last as userinfo (handles @ in password)
    const parts = rest.split('@');
    const hostPart = parts[parts.length - 1];
    const userInfo = parts.slice(0, parts.length - 1).join('@');
    // userInfo should be user:pass
    const colonIdx = userInfo.indexOf(':');
    if (colonIdx === -1) return uri; // unexpected
    const user = userInfo.slice(0, colonIdx);
    const pass = userInfo.slice(colonIdx + 1);
    const encPass = encodeURIComponent(pass);
    return `${protocol}://${user}:${encPass}@${hostPart}`;
  } catch (e) {
    return uri;
  }
};

mongoUri = normalizeMongoUri(mongoUri);

let totalRetryCount = 0;
const MAX_TOTAL_RETRIES = parseInt(process.env.MAX_MONGO_RETRIES || '10', 10);

const connectWithRetry = (retries = 5, delayMs = 2000) => {
  mongoose
    .connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || '45000', 10),
    })
    .then(() => {
      try {
        const dbName = mongoose.connection && mongoose.connection.name ? mongoose.connection.name : process.env.RMS_MONGO_DB || 'rms_library';
        console.log(`MONGODB CONNECTED (DB: ${dbName})`);
      } catch (e) {
        console.log('MONGODB CONNECTED');
      }
    })
    .catch((err) => {
      totalRetryCount += 1;
      const shortMsg = err && err.message ? err.message : String(err);
      console.error(`MongoDB connection error: ${shortMsg}`);
      if (totalRetryCount >= MAX_TOTAL_RETRIES) {
        console.error(`Reached maximum total Mongo retries (${MAX_TOTAL_RETRIES}). Will stop retrying but keep server running.`);
        console.error('Check your RMS_MONGODB_URI or RMS_MONGO_* credentials, and confirm Atlas user has DB access and your network is allowed.');
        return; // do not exit; keep server alive
      }
      if (retries <= 0) {
        console.log(`Local retry window exhausted; will wait ${delayMs}ms before next attempt. Total attempts so far: ${totalRetryCount}`);
        setTimeout(() => connectWithRetry(5, delayMs * 2), delayMs);
        return;
      }
      console.log(`Retrying MongoDB connection in ${delayMs}ms... (local attempts left: ${retries - 1}, total attempts: ${totalRetryCount})`);
      setTimeout(() => connectWithRetry(retries - 1, Math.min(delayMs * 2, 60000)), delayMs);
    });
};

connectWithRetry();

mongoose.connection.on('error', (err) => {
  // compact error to avoid printing huge driver stack traces repeatedly
  const short = err && err.message ? err.message : String(err);
  console.error('Mongoose connection error:', short);
});
mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected.');
  if (totalRetryCount >= MAX_TOTAL_RETRIES) {
    console.error('Reached maximum reconnect attempts, not attempting further reconnects.');
    return;
  }
  console.log('Scheduling reconnect attempt...');
  setTimeout(() => connectWithRetry(), 2000);
});

app.get('/', (req, res) => {
  res.status(200).send('RMS HIGH SCHOOL BALICHELA - Digital Library API');
});

// global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  res.status(500).json({ message: 'Internal Server Error' });
});

/* Port Listening In */
const server = app.listen(port, () => {
  console.log(`Server is running on PORT ${port}`);
});

// Set a server timeout to avoid hanging requests; default Node timeout is 2 minutes.
server.setTimeout(parseInt(process.env.SERVER_TIMEOUT_MS || '60000', 10)); // 60s

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Another process may be running. Exiting.`);
    process.exit(1);
  }
  // For other errors, rethrow so it's visible in logs
  throw err;
});
