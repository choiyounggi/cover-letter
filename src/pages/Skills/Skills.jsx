import React from 'react'
import './Skills.css'

const Skills = () => {
  return (
    <main className="page-container">
      <section className="section skills-section">
        <div className="container">
          <h2 className="section-title">My Skills</h2>
          <div className="skills-container">
            <div className="skill-category">
              <h3>Frontend</h3>
              <ul className="skill-list">
                <li>React</li>
                <li>HTML5 & CSS3</li>
                <li>JavaScript (ES6+)</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            <div className="skill-category">
              <h3>Backend</h3>
              <ul className="skill-list">
                <li>Node.js</li>
                <li>Express</li>
                <li>MongoDB</li>
                <li>REST APIs</li>
              </ul>
            </div>
            <div className="skill-category">
              <h3>Tools & Others</h3>
              <ul className="skill-list">
                <li>Git & GitHub</li>
                <li>VS Code</li>
                <li>npm/yarn</li>
                <li>Agile Methodology</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Skills
