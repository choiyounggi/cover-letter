import React from 'react'
import './Projects.css'

const Projects = () => {
  return (
    <main className="page-container">
      <section className="section projects-section">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">Project 1 Image</div>
              <h3>Project One</h3>
              <p>A brief description of the project, what technologies were used, and what problems it solves.</p>
              <div className="project-links">
                <a href="#" className="project-link">View Demo</a>
                <a href="#" className="project-link">Source Code</a>
              </div>
            </div>
            <div className="project-card">
              <div className="project-image">Project 2 Image</div>
              <h3>Project Two</h3>
              <p>A brief description of the project, what technologies were used, and what problems it solves.</p>
              <div className="project-links">
                <a href="#" className="project-link">View Demo</a>
                <a href="#" className="project-link">Source Code</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Projects
