import React from 'react'
import './Projects.css'

const Projects = () => {
  return (
    <main className="page-container">
      <section className="section projects-section">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <div className="project-image">프로젝트1</div>
              <h3>프로젝트명1</h3>
              <p>서브타이틀1</p>
              <div className="project-links">
                <a href="#" className="project-link">링크1-1</a>
                <a href="#" className="project-link">링크1-2</a>
              </div>
            </div>
            <div className="project-card">
              <div className="project-image">프로젝트 2</div>
              <h3>프로젝트명2</h3>
              <p>서브타이틀2</p>
              <div className="project-links">
                <a href="#" className="project-link">링크2-1</a>
                <a href="#" className="project-link">링크2-2</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Projects
