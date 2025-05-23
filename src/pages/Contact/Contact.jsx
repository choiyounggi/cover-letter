import React from 'react'
import './Contact.css'

const Contact = () => {
  return (
    <main className="page-container">
      <section className="section contact-section">
        <div className="container">
          <h2 className="section-title">Get In Touch</h2>
          <div className="contact-content">
            <div className="contact-info">
              <p>Feel free to reach out to me for collaboration or just to say hi!</p>
              <p><strong>Email:</strong> your.email@example.com</p>
              <p><strong>Location:</strong> City, Country</p>
            </div>
            <form className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Your Email" />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Your Message"></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Contact
