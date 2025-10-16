import express from "express"
import Book from "../models/Book.js"
import fs from 'fs'
import path from 'path'

const router = express.Router()

// GET /api/books?page=1&limit=20&search=&category=&grade=
router.get('/', async (req, res) => {
    try {
        console.log('📖 GET /api/books called', { query: req.query });
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const fetchAll = String(req.query.all || '').toLowerCase() === 'true';
        const search = (req.query.search || '').trim();
        const category = (req.query.category || '').trim();
        const grade = (req.query.grade || '').trim();

        const query = {};
        if (search) {
            // search across multiple name/title fields and author/isbn
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { bookTitle: { $regex: search, $options: 'i' } },
                { book_name: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { authors: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } },
                { ISBN: { $regex: search, $options: 'i' } }
            ];
            // if search looks numeric, also match slNo / serial number fields
            if (/^\d+$/.test(search)) {
                query.$or.push({ slNo: Number(search) });
            }
        }
        if (category) query.category = category;
        if (grade) query.grade_level = grade;

        // If client asks for all results, be defensive: cap to a reasonable maximum to avoid OOM/timeouts.
        // Use lean() to avoid hydration overhead and maxTimeMS to abort long-running queries.
        const MAX_FETCH_ALL = 5000; // safety cap
        const maxTimeMS = parseInt(process.env.MONGO_QUERY_MAX_MS || '5000', 10); // default 5s

        let books;
        let totalBooks;
        if (fetchAll) {
            // Return up to MAX_FETCH_ALL documents matching the query
            totalBooks = await Book.countDocuments(query);
            books = await Book.find(query).sort({ createdAt: -1 }).limit(MAX_FETCH_ALL).maxTimeMS(maxTimeMS).lean();
        } else {
            [books, totalBooks] = await Promise.all([
                Book.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).maxTimeMS(maxTimeMS).lean(),
                Book.countDocuments(query)
            ]);
        }

        console.log(`📚 Found ${books.length} books (total matching: ${totalBooks})`);

        res.json({ success: true, data: books, totalPages: Math.ceil(totalBooks / limit), currentPage: page, totalBooks });
    } catch (err) {
            console.error('Error in GET /api/books:', err && err.message ? err.message : err);
            // Fallback: return sample data so frontend can still function while DB/auth is being fixed
            try {
                const samplePath = path.join(process.cwd(), 'backend', 'data', 'sampleBooks.json');
                const raw = await fs.promises.readFile(samplePath, 'utf8');
                const sample = JSON.parse(raw);
                return res.json({ success: true, data: sample, totalPages: 1, currentPage: 1, totalBooks: sample.length });
            } catch (e) {
                return res.status(500).json({ success: false, message: 'Failed to fetch books', error: err && err.message ? err.message : String(err) });
            }
    }
});

// GET single book by id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ success: false, message: 'Book not found' });
        res.json({ success: true, data: book });
    } catch (err) {
        console.error('Error in GET /api/books/:id', err && err.message ? err.message : err);
        res.status(500).json({ success: false, message: 'Server error', error: err && err.message ? err.message : String(err) });
    }
});

export default router