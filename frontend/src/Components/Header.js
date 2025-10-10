import React, { useState, useEffect } from 'react'
import { Link, useHistory, useLocation } from 'react-router-dom'
import './Header.css'

import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';


function Header() {

    const [menutoggle, setMenutoggle] = useState(false)
    const history = useHistory()
    const location = useLocation()

    const Toggle = () => {
        setMenutoggle(!menutoggle)
    }

    const closeMenu = () => {
        setMenutoggle(false)
    }


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
