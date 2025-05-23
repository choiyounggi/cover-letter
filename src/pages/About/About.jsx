import React from 'react'
import './About.css'

const About = () => {
  return (
    <main className="page-container">
      <section className="section about-section">
        <div className="container">
          <h2 className="section-title">About me...</h2>
          <div className="about-content">
            <div className="about-image">
              <div className="profile-placeholder">Profile Image</div>
            </div>
            <div className="about-text">
              <h3>안녕, 내 이름은 [최영기]</h3>
              <p className="intro-text">
                서브타이틀
              </p>
              <p>
                소개 내용
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
