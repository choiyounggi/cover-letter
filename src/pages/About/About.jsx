import React from 'react'
import './About.css'

const About = () => {
  return (
    <main className="page-container">
      <section className="section about-section">
        <div className="container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-image">
              <div className="profile-placeholder">Profile Image</div>
            </div>
            <div className="about-text">
              <h3>Hello, I'm [Your Name]</h3>
              <p className="intro-text">
                I'm a passionate developer with expertise in web development.
                I love creating user-friendly applications and solving complex problems.
              </p>
              <p>
                With a background in [your background], I bring a unique perspective to every project.
                I'm constantly learning and expanding my skills to stay current with the latest technologies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
