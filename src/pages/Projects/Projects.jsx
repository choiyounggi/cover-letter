import React from 'react'
import './Projects.css'

const Projects = () => {
  return (
    <main className="page-container">
      <section className="section projects-section">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          <div class="projects-grid">
            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/SKT.png`} alt="SKT NTF 챗봇" className="project-img" />
              </div>
              <h3>SKT NTF 챗봇/채팅 상담</h3>
              <p>실시간 상담 시스템 고도화</p>
              <p>2025.04 · 개발 매니저</p>
              <br />
              <p>웹소켓 헬스체크, MFA 로그인, 상담사 제어 API, GitLab Runner + ArgoCD 파이프라인 구축</p>
            </div>
            
            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/SKC&C.jpg`} alt="SKC&C AutoQA/KMS" className="project-img" />
              </div>
              <h3>SK C&C AutoQA / AI KMS</h3>
              <p>챗봇 ↔ 상담 솔루션 연동 개발</p>
              <p>2024.11 ~ 2025.03 · 개발 매니저</p>
              <br />
              <p>JWT 인증, 인터셉터 구현, 녹취 재생, PDF 미리보기, 내부 KMS 검색 연동</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/SKT.png`} alt="SKT 챗봇 연동" className="project-img" />
              </div>
              <h3>채팅상담솔루션 SKT 챗봇 연동</h3>
              <p>AI 포털 구축 및 API 설계</p>
              <p>2024.10 ~ 2024.11 · 개발 매니저</p>
              <br />
              <p>RabbitMQ 채널 연동, 템플릿 메시지 통합, 시연 백오피스, 다중 서버 환경 구성</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/italk.png`} alt="iTalk 채팅" className="project-img" />
              </div>
              <h3>iTalk 채팅 상담 솔루션</h3>
              <p>실시간 채팅 솔루션 구축</p>
              <p>2024.02 ~ 2024.10 · 개발 매니저</p>
              <br />
              <p>전체 프레임워크 설계/개발, WebStomp+RabbitMQ 채팅 개발, JWT 인증, 세션 공유, Jenkins CI/CD, 권한/메뉴 관리, 대시보드, 보안 암호화 구성</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/SKT.png`} alt="SKT 콜봇 포털" className="project-img" />
              </div>
              <h3>SKT AICC 콜봇 포털</h3>
              <p>콜봇 데이터 수집 및 통계 포털 구축</p>
              <p>2023.06 ~ 2024.01 · 개발 매니저</p>
              <br />
              <p>전체 프레임워크 설계/개발, Redis 세션, RabbitMQ 기반 콜봇 로그에서 데이터 추출 및 적재, JWT 인증, 실시간 대화 확인, Webhook, 통계 다운로드 기능 구현</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/infobank.png`} alt="ChatGPT 연동" className="project-img" />
              </div>
              <h3>카카오 OpenAI 연동</h3>
              <p>OpenAI API 연동 챗봇 구축</p>
              <p>2023.05 ~ 2023.06 · 개발 매니저</p>
              <br />
              <p>카카오 스킬 서버와 OpenAI 연동, GPT 응답 API 설계 및 연계</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/infobank.png`} alt="Clova AICall" className="project-img" />
              </div>
              <h3>네이버 Clova Callbot + Kakao 챗봇 연동</h3>
              <p>콜봇 + 챗봇 연동 구축</p>
              <p>2023.04 ~ 2023.06 · 개발 매니저</p>
              <br />
              <p>콧봇 + 챗봇 연동 (콜 상담중 STT로 받기 어려운 데이터 챗봇 연동으로 입력 받아 DB 저장 및 콜봇 응답), STT → DB 처리 → TTS 흐름 구성, 기간계 연동 로직 구축</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/kb.png`} alt="KB 챗봇 어드민" className="project-img" />
              </div>
              <h3>KB 챗봇 어드민</h3>
              <p>카카오 챗봇 관리 포털 구축</p>
              <p>2023.02 ~ 2023.06 · 개발 매니저</p>
              <br />
              <p>전체 프레임워크 설계/개발, SpringSecurity 로그인/권한관리, SMS 인증, 접속 로그 관리, 블록/그룹 관리</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/국립수목원.png`} alt="국립수목원" className="project-img" />
              </div>
              <h3>국립수목원 예약/결제 백엔드</h3>
              <p>예약 API 및 인증 로직 개선</p>
              <p>2022.11 ~ 2023.01 · 개발 선임연구원</p>
              <br />
              <p>네이버/KB 예약 연동용 REST API 개발, 토큰 발급 및 인증 검증 로직 구현</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/jinmyung.png`} alt="진명스포아트" className="project-img" />
              </div>
              <h3>진명스포아트 수강신청/결제</h3>
              <p>PG 결제 + 관리자 기능 개발</p>
              <p>2022.09 ~ 2022.11 · 개발 선임연구원</p>
              <br />
              <p>갤럭시아머니트리 PG 결제 모듈 연동, REST API 개발, 관리자 페이지 이미지 업로드 및 공지 수정 기능 구현</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/hu.png`} alt="화성남부체육센터" className="project-img" />
              </div>
              <h3>화성남부 체육센터 수강/결제</h3>
              <p>REST API 신규 구축</p>
              <p>2022.04 ~ 2022.09 · 개발 선임연구원</p>
              <br />
              <p>서비스 전체 REST API 개발, IP 제한, JWT 유효성 검증 및 CrossOrigin 대응</p>
            </div>

            <div class="project-card">
              <div class="project-image">
                <img src={`${import.meta.env.BASE_URL}/images/su.png`} alt="수원도시공사" className="project-img" />
              </div>
              <h3>수원도시공사 수강/결제 포털</h3>
              <p>지속적인 유지보수 및 리팩토링</p>
              <p>2021.07 ~ 2023.01 · 개발 선임연구원</p>
              <br />
              <p>이지페이 PG 결제 모듈 연동, KISA 보안 취약점 대응, 쿼리 성능 개선, 주민번호 조회 API 연동, 운영 배포 대응</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Projects
