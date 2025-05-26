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
                실전에 강한 백엔드 엔지니어 🧠 Java + Spring Boot 중심으로 성장 중입니다.
              </p>

              <p>
                4년 동안 백엔드를 중심으로 설계부터 배포까지 전 과정을 경험했습니다.<br />
                MsSQL, MySQL, Redis, MongoDB 등 다양한 DB를 다뤄봤고,<br />
                대용량 트래픽을 고려한 구조 설계부터 Docker 기반 CI/CD 환경 구축까지 직접 해봤습니다.
              </p>

              <br />

              <p>
                SKT AICC, 공공기관 수강/결제 시스템, 사내 채팅 솔루션 등 실제 서비스에서<br />
                세션 동기화, 결제 트랜잭션, 메시지 유실 등 복잡한 문제를 해결하며 성장해 왔습니다.
              </p>

              <br />

              <p>
                협업 도구는 Jira · Confluence · Trello, 프론트엔드는 React · JSP · Thymeleaf를 활용합니다.<br />
                "개발이란 결국 소통"이라는 마음가짐으로, 함께 만드는 경험을 중요하게 생각합니다.
              </p>

              <br />

              <p>
                새로운 기술을 배우고 바로 써먹는 걸 좋아합니다.<br />
                Kafka 기반 실시간 채팅, Raspberry Pi 서버에 SSL, 도메인, GitLab CI/CD, n8n까지<br />
                실험하고 구축해보며 '내 것으로 만드는 과정'을 즐깁니다.
              </p>

              <br />

              <p>
                <em>초심을 잃지 않는다는 것이 결코 쉬운 일은 아니지만 노력해서 이뤄낸 결과 만큼 뿌듯한 것은 없다고 생각하며, 이러한 마음가짐에 가장 어울리는 직업이 개발자라고 생각합니다.</em><br />
              </p>

              <br />

              <p>
                오늘보다 내일이 기대되는 개발자, 팀에 긍정적인 에너지를 주는 사람이 되고 싶습니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default About
