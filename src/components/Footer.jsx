import React from 'react'
import '@/components/Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="copyright">© {new Date().getFullYear()} My Portfolio. All rights reserved.</p>
        <div className="social-links">
          <a href="https://github.com/choiyounggi" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://velog.io/@dch0202/posts" target="_blank" rel="noopener noreferrer">velog</a>
          <a href="https://www.linkly.kr/signin" target="_blank" rel="noopener noreferrer">LinklyChat</a>
          <a href="https://www.linkly.kr/n8n" target="_blank" rel="noopener noreferrer">n8n</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
