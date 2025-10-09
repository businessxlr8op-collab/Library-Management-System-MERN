import React, { useState, useEffect } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import './Header.css'

import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';


function Header() {

    const [menutoggle, setMenutoggle] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const history = useHistory()
    const location = useLocation()
    const searchInputRef = React.useRef(null)
    // Debounce timer ref
    const debounceRef = React.useRef(null)

    const Toggle = () => {
        setMenutoggle(!menutoggle)
    }

    const closeMenu = () => {
        setMenutoggle(false)
    }

    // Only update header search box value from URL when navigation occurs (not on every keystroke)
    useEffect(() => {
        try {
            const params = new URLSearchParams(location.search)
            const q = params.get('q') || ''
            setSearchValue(q)
        } catch (err) {
            // ignore
        }
        // Refocus input after navigation
        setTimeout(() => {
            if (searchInputRef.current) searchInputRef.current.focus();
        }, 100);
    }, [location.search])

    // Debounce navigation: only search after user stops typing for 500ms
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const q = (searchValue || '').trim();
            // Only navigate if searchValue is non-empty
            if (q) {
                history.push(`/books?search=${encodeURIComponent(q)}`);
                setTimeout(() => {
                    if (searchInputRef.current) searchInputRef.current.focus();
                }, 100);
            }
        }, 500);
        return () => clearTimeout(debounceRef.current);
    }, [searchValue]);

    // Remove Enter navigation: debounce handles search
    const onHeaderSearchKeyDown = () => {} // No-op

    return (
        <header className="header" role="navigation" aria-label="Main navigation">
            <div className="logo-nav">
                <Link to='/' className="logo-link">
                    <div className="logo-content">
                        <img src="/assets/images/rmslogo.png" alt="RMS Logo" className="logo-image" />
                        <div className="logo-text">
                            <div className="logo-title">RMS HIGH SCHOOL BALICHELA</div>
                            <div className="logo-sub">Digital Library</div>
                        </div>
                    </div>
                </Link>
            </div>

            <div className='nav-right'>
                <label htmlFor="site-search" className="sr-only">Search books</label>
                <input
                    id="site-search"
                    className='search-input'
                    type='search'
                    placeholder='Search a Book'
                    aria-label="Search books"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    onKeyDown={onHeaderSearchKeyDown}
                    ref={searchInputRef}
                />

                <ul className={menutoggle ? "nav-options active" : "nav-options"}>
                    <li className="option" onClick={() => { closeMenu() }}>
                        <Link to='/' className="nav-link">
                            <span>Home</span>
                        </Link>
                    </li>
                    <li className="option" onClick={() => { closeMenu() }}>
                        <Link to='/books' className="nav-link">
                            <span>Books</span>
                        </Link>
                    </li>
                    <li className="option" onClick={() => { closeMenu() }}>
                        <Link to='/about' className="nav-link">
                            <span>About School</span>
                        </Link>
                    </li>
                    <li className="option" onClick={() => { closeMenu() }}>
                        <Link to='/contact' className="nav-link">
                            <span>Contact</span>
                        </Link>
                    </li>
                    <li className="option mobile-only" onClick={() => { closeMenu() }}>
                        <Link to='/signin' className="nav-link">
                            <span>Login</span>
                        </Link>
                    </li>
                </ul>
                {/* Login CTA kept outside of the nav <ul> to avoid clipping */}
                <Link to="/signin" className="nav-cta" style={{ marginLeft: 8 }}>Login</Link>
            </div>

            <button className="mobile-menu" onClick={() => { Toggle() }} aria-label="Toggle menu">
                {menutoggle ? (
                    <ClearIcon className="menu-icon" style={{ fontSize: 34 }} />
                ) : (
                    <MenuIcon className="menu-icon" style={{ fontSize: 34 }} />
                )}
            </button>
        </header>
    )
}

export default Header
