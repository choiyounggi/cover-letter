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
              <img src={`${import.meta.env.BASE_URL}/images/profileImage.jpg`} alt="Profile" className="profile-image" />
            </div>
            <div className="about-text">
              <h3>👋 안녕하세요, 백엔드 개발자 <strong>최영기</strong>입니다.</h3>
              <p className="intro-text">
                Java + Spring Boot 기반의 실전형 백엔드 엔지니어 🧠
              </p>
              <p>
                4년간 백엔드 중심으로 소프트웨어를 설계하고 구축해왔습니다.<br />
                MySQL, Redis, MongoDB 등 다양한 데이터베이스를 다뤄본 경험과 함께,
                대용량 트래픽을 견디는 구조 설계, 클라우드 인프라 운영, Docker 기반 CI/CD 파이프라인까지 한 손에 익혔습니다.
              </p>
              <br/>
              <p>
                SKT AICC, 공공기관 체육시설 수강/결제 시스템, 사내 채팅 상담 솔루션 등 다양한 프로젝트를 경험하며,
                트래픽 이슈, 세션 동기화, 결제 정합성 등 실제 문제를 해결해본 개발자입니다.
              </p>
              <br/>
              <p>
                협업은 Jira·Confluence·Trello로, 프론트는 React·JSP·Thymeleaf로.<br />
                개발이란 결국 소통이라고 믿기에, 기술 외에도 함께 만드는 과정을 중요하게 여깁니다.
              </p>
              <br/>
              <p>
                새 기술을 배우고, 내 것으로 만들어 실무에 적용하는 걸 좋아합니다.<br />
                Kafka와 MongoDB 기반 실시간 채팅부터, 라즈베리파이 위에 SSL·도메인·GitLab CI/CD까지 직접 구성해보며 끊임없이 도전해왔습니다.
              </p>
              <br/>
              <p>
                "좋은 개발자는 처음보다 <strong>끝이 더 멋진 사람</strong>이라 생각합니다."<br />
                저는 오늘보다 내일 더 성장한 개발자이고 싶고, 팀에 긍정적인 에너지를 전할 수 있는 사람이 되고 싶습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
