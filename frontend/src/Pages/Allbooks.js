// Almirah/category mapping for display
const ALMIRAH_CATEGORY_MAP = {
  '1': 'FICTIONS',
  '2': 'ISC BOOKS',
  '3': 'MATHEMATICS',
  '4': 'SCIENCE',
  '5': 'ENGLISH',
  '6': 'HINDI LITERATURE',
  '7': 'HINDI LANGUAGE',
  '8': 'SOCIAL SCIENCE',
  '9': 'SPRITUAL/ PRE-PRIMARY',
};
// Allbooks.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { bookService } from "../api/bookService";
import SearchBar from "../Components/SearchBar";
import "./Allbooks.css"; // optional, inline styles below override if needed

const DEFAULT_COVER = "/bookcover.png";

function Allbooks() {
  // Data & UI state
  const [allBooks, setAllBooks] = useState([]); // full deduped dataset
  const [books, setBooks] = useState([]); // visible page slice
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Input vs actual query:
  const [searchTerm, setSearchTerm] = useState(""); // controlled input shown in SearchBar
  const [query, setQuery] = useState(""); // actual debounced query used for API

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");

  const location = useLocation();
  const history = useHistory();

  // Initialize query & searchTerm from URL on mount AND when user navigates back/forward
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search") || "";
    setQuery(q);
    setSearchTerm(q);
    setPage(1);
    // listen to changes of location.search (so back/forward works)
  }, [location.search]);

  /**
   * Fetch books from backend whenever `query` changes.
   * Note: this no longer runs on every keystroke (searchTerm).
   */
  const fetchBooks = useCallback(
    async (q) => {
      setLoading(true);
      setError(null);
      try {
        // request entire dataset from backend; backend expected to accept `search` param
        const resp = await bookService.getAllBooks({ all: true, search: q || "" });

        if (!resp || !resp.success) {
          setAllBooks([]);
          setTotalBooks(0);
          setError(resp?.message || "Failed to fetch books");
          return;
        }

        // Normalize fields defensively
          const normalized = (resp.data || []).map((doc = {}) => {
            // Always map almirahNo/category to reference values
            let almirahNo = (doc.almirahNo || "").toString().trim();
            let category = (doc.category || doc.subject || "").toString().trim();
            // If almirahNo matches reference, force category
            if (ALMIRAH_CATEGORY_MAP[almirahNo]) {
              category = ALMIRAH_CATEGORY_MAP[almirahNo];
            } else {
              // Try to infer almirahNo from category text
              for (const [refNo, refCat] of Object.entries(ALMIRAH_CATEGORY_MAP)) {
                if (category.toLowerCase().includes(refCat.toLowerCase())) {
                  almirahNo = refNo;
                  category = refCat;
                  break;
                }
              }
              // If still not mapped, blank out
              if (!ALMIRAH_CATEGORY_MAP[almirahNo]) {
                almirahNo = '';
                category = '';
              }
            }
            return {
              _id: doc._id || doc.bookId || `${Math.random().toString(36).slice(2, 9)}`,
              title: (doc.title || doc.name || doc.bookTitle || "").trim(),
              isbn: (doc.isbn || doc.ISBN || doc.isbn13 || doc.ISBN13 || "")?.toString().trim(),
              author: (doc.author || doc.authors || "Unknown") + "",
              category,
              quantity: doc.quantity != null ? Number(doc.quantity) : doc.slNo != null ? 1 : 0,
              available:
                doc.available != null
                  ? Number(doc.available)
                  : doc.isAvailable != null
                  ? doc.isAvailable
                    ? 1
                    : 0
                  : 1,
              cover_image: doc.cover_image || doc.coverImage || DEFAULT_COVER,
              slNo: doc.slNo != null ? doc.slNo : null,
              publication: doc.publication || "",
              edition: doc.edition || "",
              almirahNo,
              reckNo: doc.reckNo || doc.rackNo || "",
              addedOn: doc.addedOn || doc.createdAt || null,
              raw: doc, // keep original if needed
            };
          });

        // Safer dedupe strategy:
        // - If a clean ISBN exists -> dedupe by ISBN (cleaned).
        // - Otherwise preserve each record (use _id) — do not aggressively merge different records w/ missing ISBN.
        const grouped = new Map();
        for (const b of normalized) {
          const isbnClean = (b.isbn || "").replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
          const key = isbnClean ? `isbn:${isbnClean}` : `id:${b._id}`;
          if (!grouped.has(key)) {
            // store first occurrence
            grouped.set(key, { ...b });
          } else {
            // if same ISBN, merge conservative fields: keep highest quantity/available and prefer non-empty fields
            const existing = grouped.get(key);
            existing.quantity = Math.max(Number(existing.quantity || 0), Number(b.quantity || 0));
            existing.available = Math.max(Number(existing.available || 0), Number(b.available || 0));
            if (!existing.title && b.title) existing.title = b.title;
            if (!existing.author && b.author) existing.author = b.author;
            if (!existing.cover_image && b.cover_image) existing.cover_image = b.cover_image;
            // keep other fields if missing
            existing.publication = existing.publication || b.publication;
            existing.edition = existing.edition || b.edition;
            existing.almirahNo = existing.almirahNo || b.almirahNo;
            existing.reckNo = existing.reckNo || b.reckNo;
            grouped.set(key, existing);
          }
        }

        const deduped = Array.from(grouped.values());

        // Save dataset and reset pagination metadata (page will be validated in downstream effect)
        setAllBooks(deduped);
        setTotalBooks(deduped.length);
      } catch (err) {
        setError(err?.message || "Server unreachable");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // fetch when query changes
  useEffect(() => {
    fetchBooks(query);
  }, [query, fetchBooks]);

  // derive category options more robustly: split compound categories and normalize
  const categoryOptions = useMemo(() => {
    const setCats = new Set();
    for (const b of allBooks) {
      const raw = (b.category || "").toString();
      if (!raw) continue;
      // split by common delimiters and also allow multiple categories
      const parts = raw.split(/[,;\/|\\]+/);
      for (let p of parts) {
        p = p.trim();
        if (!p) continue;
        // normalize casing but keep original style (titlecase)
        setCats.add(p);
      }
    }
    return Array.from(setCats).sort((a, b) => a.localeCompare(b));
  }, [allBooks]);

  // recompute visible books when allBooks, categoryFilter or page changes
  useEffect(() => {
    let filtered = allBooks;
    if (categoryFilter) {
      filtered = allBooks.filter((x) => {
        const raw = (x.category || "").toString();
        if (!raw) return false;
        // allow multi-category matching (split and compare)
        const parts = raw.split(/[,;\/|\\]+/).map((s) => s.trim());
        return parts.some((p) => p === categoryFilter);
      });
    }
    const total = filtered.length;
    setTotalBooks(total);
    const pages = Math.max(1, Math.ceil(total / pageSize));
    setTotalPages(pages);

    // If current page is out of range after filter change, reset to 1
    if (page > pages) {
      setPage(1);
      const start = 0;
      setBooks(filtered.slice(start, start + pageSize));
    } else {
      const start = (page - 1) * pageSize;
      setBooks(filtered.slice(start, start + pageSize));
    }
  }, [allBooks, categoryFilter, page, pageSize]);

  // Handle SearchBar's debounced "onSearch(value, signal)" -> set query and URL
  const handleSearchBar = useCallback(
    (val /*, signal - ignored here */) => {
      const v = (val || "").trim();
      setQuery(v);
      setPage(1);
      // update URL (replace, not push)
      const params = new URLSearchParams(location.search);
      if (v) params.set("search", v);
      else params.delete("search");
      const qs = params.toString();
      history.replace(`/books${qs ? `?${qs}` : ""}`);
    },
    [location.search, history]
  );

  // when clear is clicked from SearchBar: clear input + query + URL + reset page
  const handleClear = useCallback(() => {
    setSearchTerm("");
    setQuery("");
    setPage(1);
    const params = new URLSearchParams(location.search);
    params.delete("search");
    const qs = params.toString();
    history.replace(`/books${qs ? `?${qs}` : ""}`);
  }, [location.search, history]);

  // Immediate search button (non-debounced) - triggers same as handleSearchBar
  const handleImmediateSearch = useCallback(() => {
    handleSearchBar(searchTerm);
  }, [searchTerm, handleSearchBar]);

  // Ensure keys are stable when rendering
  const renderKey = (b, idx) => b._id || b.bookId || `${b.title}-${idx}`;

  /* =======================
     Inline Styles (override) - glassmorphism & stable layout
     ======================= */
  const inlineCSS = `
    /* high-specificity overrides */
    .allbooks-container { position: relative; padding: 28px; max-width: 1200px; margin: 0 auto; font-family: system-ui, -apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial; }
    .search-panel { display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:center; padding:18px; border-radius:16px;
        background: rgba(255,255,255,0.22); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.35); box-shadow: 0 8px 32px rgba(0,0,0,0.06); margin-bottom:22px;
    }
    .search-panel select { padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,0.35); background: rgba(255,255,255,0.28); color:#111; font-weight:600; min-width:160px; cursor:pointer; }
    .search-panel select:focus { outline:none; box-shadow: 0 0 0 4px rgba(0,102,255,0.12); }
    .search-controls { flex:1 1 360px; max-width:600px; display:flex; align-items:center; gap:8px; position:relative; }
    .search-btn { display:inline-flex; align-items:center; justify-content:center; padding:8px 10px; border-radius:10px; border:1px solid rgba(0,0,0,0.06); background: rgba(0,102,255,0.08); color:#0447b6; cursor:pointer; font-weight:700; }
    .search-summary { text-align:center; margin-bottom:18px; font-weight:600; color:#222; }
    .books-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap:18px; align-items:start; }
    .book-card { background:#fff; border-radius:12px; padding:12px; display:flex; gap:12px; box-shadow:0 8px 20px rgba(15,15,15,0.06); transition:transform 180ms ease, box-shadow 180ms ease; }
    .book-card:hover{ transform:translateY(-6px); box-shadow:0 18px 40px rgba(15,15,15,0.08); }
    .cover-wrap img{ width:88px; height:120px; object-fit:cover; border-radius:6px; }
    .bookcard-title{ font-size:15px; font-weight:700; margin:0 0 6px 0; color:#111; }
    .book-meta, .book-extra, .book-more { font-size:13px; color:#444; display:flex; gap:10px; flex-wrap:wrap; }
    .no-books { padding:32px; text-align:center; color:#777; }
    .pagination { display:flex; gap:12px; justify-content:center; align-items:center; margin-top:18px; }
    .pagination button { padding:8px 12px; border-radius:8px; border:1px solid rgba(0,0,0,0.06); background:rgba(255,255,255,0.9); cursor:pointer; font-weight:600; }
    .pagination button[disabled] { opacity:0.6; cursor:not-allowed; transform:none; }
    .loading-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.6); border-radius:12px; pointer-events:none; }
    @media (max-width:640px) {
      .search-panel { padding:12px; gap:10px; }
      .search-controls { width:100%; }
    }
  `;

  return (
    <div className="allbooks-container">
      <style>{inlineCSS}</style>

      <h1 style={{ textAlign: "center", margin: "6px 0 14px 0", fontSize: 22, fontWeight: 800 }}>
        RMS High School Balichela — Digital Library
      </h1>

      <div className="search-panel" role="region" aria-label="Search & filter books">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <div className="search-controls">
          <SearchBar
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)} // input-only
            onSearch={handleSearchBar} // debounced => triggers query & URL update
            debounceMs={800}
            placeholder="Search by title or author"
            aria-label="Search books"
            autoFocus={true}
            onClear={handleClear}
          />
          <button
            type="button"
            className="search-btn"
            onClick={handleImmediateSearch}
            aria-label="Run search immediately"
            title="Run search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4-4m0 0A7 7 0 104 4a7 7 0 0013 13z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="search-summary">
        Showing {books.length} books — Total in library: {totalBooks}
      </div>

      <div style={{ position: "relative" }}>
        {/* local overlay (not fixed) to avoid jumping the scroll position */}
        {loading && (
          <div className="loading-overlay" aria-hidden="true">
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.9)", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}>
              <div className="loading loading-spinner loading-md" style={{ width: 48, height: 48 }} />
            </div>
          </div>
        )}

        <div className="books-grid" role="list">
          {books.length > 0 ? (
            books.map((book, i) => (
              <article key={renderKey(book, i)} className="book-card" role="listitem" aria-label={book.title || "Book"}>
                <div className="cover-wrap" aria-hidden="false">
                  <img
                    loading="lazy"
                    src={book.cover_image || DEFAULT_COVER}
                    alt={`${book.title || "Book"} cover`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_COVER;
                    }}
                  />
                </div>

                <div className="book-details" style={{ flex: 1 }}>
                  <h3 className="bookcard-title">{book.title || "Untitled"}</h3>

                  <div className="book-meta">
                    <div>{book.author}</div>
                    <div>
                      {(() => {
                        // Prefer mapped category if almirahNo matches
                        const mapped = ALMIRAH_CATEGORY_MAP[String(book.almirahNo)?.trim()];
                        return mapped || book.category;
                      })()}
                    </div>
                  </div>

                  <div className="book-extra">
                    <span>
                      <strong>Available:</strong> {book.available}/{book.quantity}
                    </span>
                    {book.slNo != null && (
                      <span>
                        <strong>SL:</strong> {book.slNo}
                      </span>
                    )}
                  </div>

                  <div className="book-more" style={{ marginTop: 6 }}>
                    {book.publication && (
                      <div>
                        <strong>Publication:</strong> {book.publication}
                      </div>
                    )}
                    {book.edition && (
                      <div>
                        <strong>Edition:</strong> {book.edition}
                      </div>
                    )}
                    <div>
                      <strong>Almirah No:</strong> {book.almirahNo ? `${book.almirahNo} - ${ALMIRAH_CATEGORY_MAP[String(book.almirahNo)?.trim()] || book.category}` : 'N/A'}
                    </div>
                    {book.reckNo && (
                      <div>
                        <strong>Rack No:</strong> {book.reckNo}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="no-books">
              <p>No books found in the library database.</p>
              <p>Please contact the librarian if this seems incorrect.</p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination" aria-label="Pagination controls" style={{ marginTop: 22 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </button>
          <span style={{ fontWeight: 700 }}>
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Allbooks;
