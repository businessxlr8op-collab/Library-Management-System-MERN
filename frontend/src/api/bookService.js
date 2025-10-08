import axios from 'axios';

// Determine API base URL safely:
// - Prefer a relative '/api' when running in the browser served from a non-localhost host
//   (for example Codespaces / GitHub.dev preview) so requests are proxied by the dev server.
// - Allow an explicit absolute REACT_APP_API_URL when developing locally or in production.
const envUrl = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim();
let API_URL = '/api';
try {
  if (envUrl) {
    // If the env URL points to localhost but the app is served from a non-localhost hostname
    // (Codespaces preview like app.github.dev), prefer the relative '/api' so the browser doesn't try
    // to reach the host machine's localhost (which would be unreachable from the preview).
    const isEnvAbsolute = /^https?:\/\//i.test(envUrl);
    const servedOnNonLocalhost = (typeof window !== 'undefined') && (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
    if (isEnvAbsolute && servedOnNonLocalhost && envUrl.includes('localhost')) {
      API_URL = '/api';
    } else {
      API_URL = envUrl.replace(/\/+$/g, '');
    }
  }
} catch (e) {
  // fall back to relative '/api'
  API_URL = '/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const bookService = {
  getAllBooks: async (params = {}) => {
    const res = await api.get('/books', { params });
    return res.data;
  },
  getBookById: async (id) => {
    const res = await api.get(`/books/${id}`);
    return res.data;
  }
};

export default bookService;
