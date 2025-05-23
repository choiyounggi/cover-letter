import React from 'react'
import '@/components/Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="copyright">© {new Date().getFullYear()} My Portfolio. All rights reserved.</p>
        <div className="social-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
