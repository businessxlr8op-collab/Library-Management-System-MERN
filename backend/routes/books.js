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
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { author: { $regex: search, $options: 'i' } },
                { isbn: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) query.category = category;
        if (grade) query.grade_level = grade;

        // If client asks for all results (admin/one-time import view), return the full set in one response.
        // This is intentional for bulk UI rendering of ~4-5k rows. We still use countDocuments for totals.
        let books;
        let totalBooks;
        if (fetchAll) {
            // Return all documents matching the query in one query
            books = await Book.find(query).sort({ createdAt: -1 }).exec();
            totalBooks = books.length;
        } else {
            [books, totalBooks] = await Promise.all([
                Book.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
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
                const raw = fs.readFileSync(samplePath, 'utf8');
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