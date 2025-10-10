import React, { useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDebounce } from "./useDebounce";

/**
 * Professional Glassmorphism SearchBar
 * - Built-in CSS (auto-overrides global styles)
 * - Debounced search logic with AbortController
 * - Accessible, responsive, and polished
 */

const SearchBar = React.memo(function SearchBar({
  value,
  onChange,
  onSearch,
  debounceMs = 500,
  placeholder = "Search...",
  className = "",
  autoFocus = false,
  onClear,
  "aria-label": ariaLabel = "Search",
}) {
  const inputRef = useRef(null);
  const abortController = useRef(null);

  // Debounced search trigger
  useDebounce(
    () => {
      if (onSearch) {
        if (abortController.current) abortController.current.abort();
        abortController.current = new AbortController();
        onSearch(value, abortController.current.signal);
      }
    },
    [value],
    debounceMs
  );

  // Keyboard interactions
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (onSearch) {
          if (abortController.current) abortController.current.abort();
          abortController.current = new AbortController();
          onSearch(value, abortController.current.signal);
        }
      } else if (e.key === "Escape") {
        if (onClear) onClear();
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [onSearch, onClear, value]
  );

  // Optional autofocus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <>
      {/* Inline Style (Overrides all other styles) */}
      <style>{`
        /* === FORCE-APPLIED SearchBar Glassmorphism Styles === */
        form.searchbar-container, .searchbar-container * {
          all: unset;
          box-sizing: border-box;
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
        }

        form.searchbar-container {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          padding: 6px !important;
          margin: 0 auto !important;
          position: relative !important;
        }

        .searchbar-inner {
          display: flex !important;
          align-items: center !important;
          position: relative !important;
          width: 100% !important;
          max-width: 400px !important;
          background: rgba(255, 255, 255, 0.25) !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-radius: 14px !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
          transition: all 0.3s ease !important;
        }

        .searchbar-inner:hover {
          background: rgba(255, 255, 255, 0.35) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
        }

        .search-icon {
          width: 20px !important;
          height: 20px !important;
          color: rgba(60, 60, 60, 0.8) !important;
          margin-left: 14px !important;
          flex-shrink: 0 !important;
        }

        .search-input {
          flex: 1 !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          padding: 10px 40px 10px 10px !important;
          color: #111 !important;
          font-size: 15px !important;
          font-weight: 500 !important;
        }

        .search-input::placeholder {
          color: rgba(90, 90, 90, 0.6) !important;
        }

        .clear-btn {
          position: absolute !important;
          right: 12px !important;
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          color: rgba(60, 60, 60, 0.7) !important;
          font-size: 16px !important;
          transition: all 0.2s ease !important;
        }

        .clear-btn:hover {
          color: #000 !important;
          transform: scale(1.15) !important;
        }

        @media (max-width: 600px) {
          .searchbar-inner {
            max-width: 90% !important;
          }
          .search-input {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* SearchBar Structure */}
      <form
        role="search"
        aria-label={ariaLabel}
        tabIndex={-1}
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearch) {
            if (abortController.current) abortController.current.abort();
            abortController.current = new AbortController();
            onSearch(value, abortController.current.signal);
          }
        }}
        className={`searchbar-container ${className}`}
      >
        <div className="searchbar-inner">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="search-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
            aria-label={ariaLabel}
          />

          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear search"
              className="clear-btn"
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </>
  );
});

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  debounceMs: PropTypes.number,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  autoFocus: PropTypes.bool,
  onClear: PropTypes.func,
  "aria-label": PropTypes.string,
};

export default SearchBar;
