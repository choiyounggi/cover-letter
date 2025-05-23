import React from 'react'
import './Contact.css'

const Contact = () => {
  return (
    <main className="page-container">
      <section className="section contact-section">
        <div className="container">
          <h2 className="section-title">How to contact?</h2>
          <div className="contact-content">
            <div className="contact-info">
              <p>[채용 문의]</p>
              <p><strong>Email:</strong> dch0202@naver.com</p>
              <p><strong>Phone:</strong> 010-2213-5825</p>
            </div>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">이름</label>
                <input type="text" id="name" placeholder="홍길동" />
              </div>
              <div className="form-group">
                <label htmlFor="name">회사명</label>
                <input type="text" id="company" placeholder="네이버" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="test@naver.com" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="원하는 내용을 적어줘"></textarea>
              </div>
              <button type="submit" className="submit-btn">전송</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Contact
