import React, { useState, useEffect } from 'react';
import './Allbooks.css';
import { bookService } from '../api/bookService';

// use the book cover uploaded to public root
const DEFAULT_COVER = '/bookcover.png';

function Allbooks() {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // deduped source list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [totalBooks, setTotalBooks] = useState(0); 
  const pageSize = 20; // client-side page size
  const [categoryFilter, setCategoryFilter] = useState('');

  

  // Fetch full dataset when searchTerm changes (or on mount)
  useEffect(() => {
    setPage(1);
    fetchBooks();
    // eslint-disable-next-line
  }, [searchTerm]);

  // Recompute visible books when page, categoryFilter or allBooks change
  useEffect(() => {
    const filtered = categoryFilter ? allBooks.filter((x) => (x.category || '') === categoryFilter) : allBooks;
    setTotalBooks(filtered.length);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    const start = (page - 1) * pageSize;
    setBooks(filtered.slice(start, start + pageSize));
  }, [page, categoryFilter, allBooks]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      // Request entire dataset from backend (uses ?all=true)
      const resp = await bookService.getAllBooks({ all: true, search: searchTerm });
      if (resp && resp.success) {
        // Normalize documents from server to the shape the UI expects
        const normalized = (resp.data || []).map((doc) => ({
          _id: doc._id,
          title: doc.title || doc.name || doc.bookTitle || '',
          // capture possible isbn fields so we can dedupe reliably
          isbn: (doc.isbn || doc.ISBN || doc.isbn13 || doc.ISBN13 || '').toString(),
          author: doc.author || doc.authors || 'Unknown',
          category: doc.category || doc.subject || '',
          // Many of your Atlas documents use `slNo` and `isAvailable` instead of quantity/available
          quantity: doc.quantity != null ? doc.quantity : (doc.slNo != null ? 1 : 0),
          available: doc.available != null ? doc.available : (doc.isAvailable != null ? (doc.isAvailable ? 1 : 0) : 1),
          grade_level: doc.grade_level || doc.class || '',
          subject: doc.subject || '',
          cover_image: doc.cover_image || doc.coverImage || '/assets/images/bookcover.JPG',
          bookId: doc.bookId || doc._id,
          // Additional fields present in your 'test' DB
          slNo: doc.slNo != null ? doc.slNo : null,
          publication: doc.publication || '',
          edition: doc.edition || '',
          price: doc.price != null ? doc.price : null,
          condition: doc.condition || doc.book_condition || '',
          almirahNo: doc.almirahNo || '',
          reckNo: doc.reckNo || '',
          isAvailable: doc.isAvailable != null ? doc.isAvailable : (doc.available != null ? (doc.available > 0) : true),
          addedOn: doc.addedOn || doc.createdAt || null,
          // debug removed
        }));
        // Deduplicate client-side: prefer ISBN when available, otherwise title+slNo
        const makeKey = (b) => {
          const isbn = (b.isbn || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();
          if (isbn) return `isbn:${isbn}`;
          return `ttl:${(b.title || '').trim().toLowerCase()}|sl:${b.slNo != null ? b.slNo : ''}`;
        };

        const scoreBook = (b) => {
          let s = 0;
          if (b.isbn) s += 50;
          if (b.quantity && Number(b.quantity) > 0) s += Math.min(20, Number(b.quantity));
          if (b.available && Number(b.available) > 0) s += Math.min(10, Number(b.available));
          if (b.publication) s += 2;
          if (b.edition) s += 1;
          if (b.almirahNo) s += 1;
          return s;
        };

        const grouped = new Map();
        for (const b of normalized) {
          const key = makeKey(b);
          if (!grouped.has(key)) grouped.set(key, b);
          else {
            const existing = grouped.get(key);
            const keep = scoreBook(existing) >= scoreBook(b) ? existing : b;
            grouped.set(key, keep);
          }
        }

  const deduped = Array.from(grouped.values());

  setAllBooks(deduped);
        // totalBooks and pagination are handled in the page/category effect
        setTotalBooks(deduped.length);
      } else {
        setError(resp && resp.message ? resp.message : 'Failed to fetch books');
      }
    } catch (err) {
      setError(err && err.message ? err.message : 'Server unreachable');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading books from RMS Library...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="allbooks-container">
      <h1>RMS High School Balichela - Digital Library</h1>
      <div className="search-container">
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {Array.from(new Set(allBooks.map((b) => (b.category || '').trim()).filter(Boolean))).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input style={{flex: 1}} type="text" placeholder="Search by title or author" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="summary-row">
        <p className="total-books">Showing {books.length} books — Total in library: {totalBooks}</p>
      </div>

      <div className="books-grid" role="list">
        {books.length > 0 ? books.map((book) => (
          <article key={book._id || book.bookId} className="book-card" role="listitem" aria-label={book.title}>
            <div className="cover-wrap">
              <img loading="lazy" src={book.cover_image || DEFAULT_COVER} alt={`${book.title} cover`} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COVER; }} />
            </div>
            <div className="book-details">
              <h3 className="bookcard-title">{book.title || 'Untitled'}</h3>
              <div className="book-meta">
                <div className="book-author">{book.author}</div>
                <div className="book-category">{book.category}</div>
              </div>
              <div className="book-extra">
                <span><strong>Available:</strong> {book.available}/{book.quantity}</span>
                {book.slNo != null && <span><strong>SL:</strong> {book.slNo}</span>}
              </div>
              <div className="book-more">
                {book.publication && <div><strong>Publication:</strong> {book.publication}</div>}
                {book.edition && <div><strong>Edition:</strong> {book.edition}</div>}
                {book.almirahNo && <div><strong>Almirah No:</strong> {book.almirahNo}</div>}
                {book.reckNo && <div><strong>Rack No:</strong> {book.reckNo}</div>}
              </div>
            </div>
          </article>
        )) : (
          <div className="no-books">
            <p>No books found in the library database.</p>
            <p>Please contact the librarian if this seems incorrect.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}
    </div>
  );
}

export default Allbooks;
