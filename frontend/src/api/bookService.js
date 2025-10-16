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
const sessionGet = (key) => {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    return null;
  }
};
const sessionSet = (key, val) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(val));
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
      return inMemoryCache.get(key);
    }
    // Then check sessionStorage
    const s = sessionGet(key);
    if (s) {
      inMemoryCache.set(key, s);
      return s;
    }

    // Not cached: fetch from API and store result in both caches
    const res = await api.get('/api/books', { params });
    const payload = res.data;
    inMemoryCache.set(key, payload);
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