import React from 'react'
import './Skills.css'

const Skills = () => {
  return (
    <main className="page-container">
      <section className="section skills-section">
        <div className="container">
          <h2 className="section-title">Skills</h2>
          <div className="skills-container">
            <div className="skill-category">
              <h3>Backend</h3>
              <ul className="skill-list">
                <li>Java</li>
                <li>Spring Boot</li>
                <li>REST APIs</li>
                <li>RabbitMQ</li>
                <li>Kafka</li>
                <li>MongoDB</li>
                <li>Redis</li>
                <li>MySQL</li>
                <li>MsSQL</li>
              </ul>
            </div>
            <div className="skill-category">
              <h3>Frontend</h3>
              <ul className="skill-list">
                <li>React</li>
                <li>HTML5 & CSS3</li>
                <li>JavaScript</li>
                <li>jQuery</li>
                <li>Thymeleaf</li>
                <li>Bootstrap</li>
                <li>JSP</li>
              </ul>
            </div>
            <div className="skill-category">
              <h3>DevOps</h3>
              <ul className="skill-list">
                <li>Docker</li>
                <li>Docker Compose</li>
                <li>SSL</li>
                <li>도메인</li>
                <li>Nginx</li>
                <li>Apache</li>
                <li>CentOS</li>
                <li>Ubuntu</li>
                <li>Raspberry Pi</li>
                <li>AWS</li>
                <li>Naver Cloud</li>
                <li>Jenkins CI/CD</li>
                <li>GitLab CI/CD</li>
              </ul>
            </div>
            <div className="skill-category">
              <h3>Tools & Others</h3>
              <ul className="skill-list">
                <li>Gitlab & GitHub</li>
                <li>IntelliJ IDEA</li>
                <li>STS</li>
                <li>VS Code</li>
                <li>Windsurf</li>
                <li>Docker Desktop</li>
                <li>Slack</li>
                <li>Teams</li>
                <li>Jira</li>
                <li>Confluence</li>
                <li>Trello</li>
                <li>Postman</li>
                <li>n8n</li>
                <li>macOS</li>
                <li>Windows</li>
                <li>Linux</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Skills
