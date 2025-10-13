import axios from 'axios';

// Use environment variable or fallback to localhost
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Debug log (remove after fixing)
console.log('🔧 API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // Increased to 30 seconds for Render cold starts
});

export const bookService = {
  getAllBooks: async (params = {}) => {
    console.log('📚 Calling getAllBooks with params:', params);
    const res = await api.get('/api/books', { params });
    return res.data;
  },
  getBookById: async (id) => {
    const res = await api.get(`/api/books/${id}`);
    return res.data;
  }
};

export default bookService;