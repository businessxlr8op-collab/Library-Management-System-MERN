import axios from 'axios';

// Simple and straightforward API configuration
// In production (Netlify): uses REACT_APP_API_URL from environment variables
// In development (local): falls back to localhost:5000
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const bookService = {
  getAllBooks: async (params = {}) => {
    const res = await api.get('/api/books', { params });
    return res.data;
  },
  getBookById: async (id) => {
    const res = await api.get(`/api/books/${id}`);
    return res.data;
  }
};

export default bookService;