import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import '@/components/Header.css'

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">저를 소개합니다😆</h1>
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>About</NavLink></li>
            <li><NavLink to="/skills" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Skills</NavLink></li>
            <li><NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Projects</NavLink></li>
            <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>Contact</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
