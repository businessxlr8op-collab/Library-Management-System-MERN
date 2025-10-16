import axios from 'axios';

// Use environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Increased to 30 seconds for Render cold starts
});

// Simple in-memory cache with sessionStorage persistence (cleared when tab is closed).
const inMemoryCache = new Map();
const CACHE_TTL_MS = parseInt(process.env.REACT_APP_BOOKS_CACHE_TTL_MS || String(1000 * 60 * 10), 10); // default 10m

const sessionGet = (key) => {
  try {
    const v = sessionStorage.getItem(key);
    if (!v) return null;
    const parsed = JSON.parse(v);
    if (!parsed || typeof parsed !== 'object') return null;
    const { ts, payload } = parsed;
    if (!ts || Date.now() - ts > CACHE_TTL_MS) {
      try { sessionStorage.removeItem(key); } catch (e) {}
      return null;
    }
    return payload;
  } catch (e) {
    return null;
  }
};
const sessionSet = (key, val) => {
  try {
    const obj = { ts: Date.now(), payload: val };
    sessionStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    // ignore storage errors
  }
};

const cacheKeyForParams = (params = {}) => {
  // ignore ephemeral params like timestamp; keep key stable for identical queries
  return `books_cache:${JSON.stringify(params || {})}`;
};

export const bookService = {
  getAllBooks: async (params = {}) => {
    const key = cacheKeyForParams(params);
    // Check in-memory first
    if (inMemoryCache.has(key)) {
      const cached = inMemoryCache.get(key);
      // cached is stored as { ts, payload } for in-memory as well
      if (cached && cached.ts && Date.now() - cached.ts <= CACHE_TTL_MS) return cached.payload;
      inMemoryCache.delete(key);
    }
    // Then check sessionStorage
    const s = sessionGet(key);
    if (s) {
      inMemoryCache.set(key, { ts: Date.now(), payload: s });
      return s;
    }

    // Not cached: fetch from API and store result in both caches
    const res = await api.get('/api/books', { params });
    const payload = res.data;
  const storeObj = { ts: Date.now(), payload };
  inMemoryCache.set(key, storeObj);
  sessionSet(key, payload);
    return payload;
  },
  getBookById: async (id) => {
    // No caching for single book yet
    const res = await api.get(`/api/books/${id}`);
    return res.data;
  },
  clearCache: (params) => {
    if (params) {
      const key = cacheKeyForParams(params);
      inMemoryCache.delete(key);
      try { sessionStorage.removeItem(key); } catch (e) {}
      return;
    }
    // clear all book cache entries
    for (const k of Array.from(inMemoryCache.keys())) {
      if (k.startsWith('books_cache:')) inMemoryCache.delete(k);
    }
    try {
      // remove session keys that match prefix
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && k.startsWith('books_cache:')) sessionStorage.removeItem(k);
      }
    } catch (e) {}
  }
};

export default bookService;