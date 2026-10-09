import "dotenv/config";
import { prisma } from "../src/lib/db/prisma";
import type { Prisma, SkillCategory } from "../src/generated/prisma/client";

const ym = (yearMonth: string) => new Date(`${yearMonth}-01T00:00:00.000Z`);

const profile = {
  id: "main",
  name: "최영기",
  title: "AI로 팀 속도를 높이는 풀스택 엔지니어",
  tagline: "Spring Boot · Next.js · AWS EKS · AI 에이전트",
  bio: [
    "백엔드를 중심으로 프론트엔드·클라우드 인프라·AI까지 직접 설계하고 운영하는 5년 차 풀스택 개발자입니다.\nJava·Kotlin(Spring Boot)과 TypeScript(Next.js)로 서비스를 만들고, AWS EKS 기반 CI/CD와 보안 점검 대응까지 책임져 왔습니다.",
    "\"반복되는 일은 자동화한다\"는 원칙으로, 팀의 업무 속도를 높이는 도구를 스스로 찾아 만들어 왔습니다.\n- 잠재매물 주간 추출 : 팀원이 매주 돌아가며 맡던 업무(무거운 쿼리 5종 추출 → 엑셀 생성 → Google Drive·NAS 업로드 → Jira 이슈 공유)를 무인화해, 이제 이 일을 하는 사람이 없습니다.\n- 사내 K8s 서버 : 흩어져 있던 자동화 봇 12종을 파드로 통합하고 GitOps 배포·Grafana 모니터링·Slack 알림을 연동했습니다.\n- 회의록 요약 앱, 배포·DB 변경 요청·Jira 스킬 등 팀원의 일상 업무를 자동화했습니다.",
    "업무 밖에서도 AI 에이전트 도구를 직접 만들어 오픈소스로 공개하고, 검증된 방식을 팀 개발 환경에 들여옵니다.\n2026년에만 개인 레포 20여 개, 커밋 2,400여 개를 쌓았습니다.",
    "개발자는 결과물로 말하는 직업이라고 생각합니다.\n새 기술은 개인 프로젝트에서 먼저 만들어 보며 검증하고, 실무에 맞게 다듬어 팀에 들여옵니다.\n앞으로도 팀원들과 서로의 강점은 키우고 약점은 보완하며 함께 성장하는 개발자가 되겠습니다.",
  ].join("\n\n"),
  avatarUrl: "/images/profileImage.jpg",
  email: "",
  location: "대한민국",
};

const links = [
  { label: "GitHub", url: "https://github.com/choiyounggi", sortOrder: 0 },
  { label: "velog", url: "https://velog.io/@dch0202", sortOrder: 1 },
  { label: "청약알리미", url: "https://chungyak.duckdns.org/login", sortOrder: 2 },
  { label: "한국 데이터 API", url: "https://api.korea-data.cloud/", sortOrder: 3 },
  { label: "메차카멜레온", url: "https://mecha.korea-data.cloud/", sortOrder: 4 },
];

const skillNames: Record<SkillCategory, string[]> = {
  BACKEND: [
    "Java",
    "Kotlin",
    "Spring Boot",
    "jOOQ",
    "MyBatis",
    "JPA",
    "Node.js",
    "NestJS",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "pgvector",
    "PostGIS",
    "MySQL",
    "MSSQL",
    "Oracle SQL",
    "Redis",
    "MongoDB",
    "RabbitMQ",
    "Kafka",
    "STOMP/WebSocket",
  ],
  FRONTEND: ["TypeScript", "Next.js", "React", "JavaScript", "JSP", "Thymeleaf", "jQuery", "Bootstrap"],
  DEVOPS: [
    "AWS EKS",
    "AWS EC2",
    "Elastic Beanstalk",
    "Route53",
    "S3 · CloudFront",
    "SSM Parameter Store",
    "Kubernetes",
    "Helm",
    "ArgoCD",
    "GitHub Actions",
    "External Secrets Operator",
    "Docker",
    "Jenkins",
    "GitLab CI/CD",
    "Grafana · Alertmanager",
    "Nginx",
    "NCP",
    "Linux",
  ],
  TOOLS: [
    "Claude Code",
    "Jira",
    "Confluence",
    "Notion",
    "Slack",
    "Teams",
    "GitHub",
    "GitLab",
    "SVN",
    "IntelliJ IDEA",
    "Gradle",
    "Maven",
  ],
  OTHER: [
    "RAG (하이브리드 검색 · Reranker)",
    "LLM 애플리케이션",
    "MCP 서버",
    "AI 에이전트 하네스",
    "YOLOv8 파인튜닝",
  ],
};

const HIGH_LEVEL_SKILLS = new Set([
  "Java",
  "Kotlin",
  "Spring Boot",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "RabbitMQ",
  "TypeScript",
  "Next.js",
  "React",
  "AWS EKS",
  "Kubernetes",
  "ArgoCD",
  "GitHub Actions",
  "Docker",
  "Claude Code",
  "AI 에이전트 하네스",
]);

const skills = (Object.keys(skillNames) as SkillCategory[]).flatMap((category) =>
  skillNames[category].map((name, i) => ({
    name,
    category,
    level: HIGH_LEVEL_SKILLS.has(name) ? 4 : 3,
    sortOrder: i,
  }))
);

const companies = [
  { name: "알스퀘어", logoUrl: "/images/logos/rsquare.png", url: "https://www.rsquare.co.kr", sortOrder: 0 },
  { name: "인포뱅크", logoUrl: "/images/logos/infobank.png", url: "https://www.infobank.net", sortOrder: 1 },
  { name: "대양씨아이에스", logoUrl: "/images/logos/dycis.png", url: "https://www.dycis.kr", sortOrder: 2 },
];

type SeedExperience = Omit<Prisma.ExperienceCreateManyInput, "companyId">;

const experiencesByCompany: Record<string, SeedExperience[]> = {
  알스퀘어: [
    {
      role: "사내 레거시 업무 시스템 통합 재구축 (신규 통합 플랫폼 개발)",
      startDate: ym("2026-03"),
      endDate: null,
      summary: "풀스택 · 선임",
      achievements: [
        "여러 레거시 사내 서비스로 분산된 부동산 업무 시스템을 단일 신규 통합 플랫폼으로 재구축, 전체 도메인 백엔드/프론트엔드 풀스택 개발",
        "데이터 모델 설계 및 레거시 데이터 정책 정합화, 마이그레이션·회귀 테스트로 전환 안정성 확보",
        "도메인 스키마 설계, DB 제약 조건 기반 데이터 무결성 보장",
        "기능 권한과 조직(관할부서) 범위를 결합한 2단계 권한 모델 설계·구현",
        "원자적 조건부 UPDATE 기반 상태 전이, 채번 구간 직렬화로 동시 요청 중복 오류 해소",
        "배치 큐 직렬화 락, heartbeat 기반 실행 리스로 배치 작업 중복 실행 차단",
        "사내 도면 데이터 수집·라벨링 및 검출 모델 파인튜닝 (mAP50 0.995, 정밀도 0.999, 재현율 1.0)",
        "6MB 경량 모델(YOLOv8n) 선정, 추론 이미지 경량화(약 3GB → 800MB)로 GPU 없이 CPU 파드 1개 운영 구조 설계",
        "도면 업로드 → AI 자동 추출 서비스 통합, 데이터 수집·학습·검증·배포 재학습 게이트 자동화",
        "AI 코딩 에이전트 기반 개발 자동화 파이프라인 구축 (이슈 분석 → 구현 계획 → 병렬 구현 → 독립 리뷰 게이트 → 테스트·e2e 검증 → PR 생성)",
        "격리 워크트리 기반 다중 이슈 병렬 개발, 테스트 실행 직렬화로 병렬 작업 간 테스트 경합 제거",
        "코드 리뷰 봇 지적 사항 자동 분류·반영 흐름 구성",
        "실제 PostgreSQL 연결 테스트 게이트 CI 도입",
      ],
      techStack: ["TypeScript", "Next.js", "PostgreSQL", "YOLOv8", "Claude Code"],
    },
    {
      role: "사내 레거시 업무 시스템 운영 장애 대응 및 기능 개발",
      startDate: ym("2025-09"),
      endDate: null,
      summary: "풀스택 개발 · 선임",
      achievements: [
        "상태 자동 변경 배치 트랜잭션·DB 락 적용으로 중복·부분 반영 방지",
        "미동작 배치 Slack 알림 복구 및 전체 배치 확대 적용, 엑셀 생성 임시파일 정리, 공공데이터 적재 배치 대체 경로 추가",
        "목록 조회 COUNT 쿼리 타임아웃 해결 (행 단위 함수 호출 → 서브쿼리)",
        "지도 면적 필터 중복 집계 오류 수정, 지도 범위 검색 필터 추가",
        "채번 구간 직렬화·행 잠금으로 연락처 관계 등록 동시성 중복키 오류 해소",
        "해외 서비스 메뉴 추가로 인한 사진 조회·업로드·다운로드 기능 개발, 앱 빌딩명 수정 오류 해결",
        "브랜드 리뉴얼에 따른 사내 서비스 및 문서 템플릿(엑셀·PPT) 일괄 전환",
        "백엔드 평문 시크릿 제거 및 주입 방식 전환, 배포 이미지 불변 태그 고정, API 키 정리",
        "정기 릴리즈 승격 및 운영 배포 수행",
      ],
      techStack: ["Kotlin", "jOOQ", "Java", "MyBatis", "PostgreSQL"],
    },
    {
      role: "해외 지사 업무 자동화 개발",
      startDate: ym("2026-09"),
      endDate: ym("2026-09"),
      summary: "풀스택 개발 · 선임",
      achievements: [
        "Google Apps Script 주기 호출용 배치 조회 API 개발 및 운영 배포 (요청당 최대 100건)",
        "무인 호출 특성에 맞춘 API Key 인증 설계 (상수시간 비교, 무중단 키 교체, 키 미설정 시 전면 거부) 및 선택적 IP 허용 목록 적용",
        "요청값·저장값 양방향 전화번호 정규화 비교로 표기 혼재(공백·하이픈) 데이터의 매칭 누락 해소",
      ],
      techStack: ["REST API", "Google Apps Script"],
    },
    {
      role: "해외 지사 크롤링 서비스 정확도·처리 속도 개선",
      startDate: ym("2026-09"),
      endDate: ym("2026-09"),
      summary: "풀스택 개발 · 선임",
      achievements: [
        "기업 단위·기업 내부 스크래핑/추출 병렬화, 프로세스 전역 요청 속도 제어 및 DB 계층 스레드 안전성 보강으로 처리 시간 2.09배 단축 (동일 조건 벤치마크 168초 → 80초)",
        "유료 외부 크롤링·AI API(Firecrawl·Gemini·Serper) 의존 제거, 검색 API·자체 스크래퍼·LLM 추출 단일 구조로 정리",
        "세금코드 기반 페이지 신원 검증으로 본사·지사·지역 구분",
        "사업자 등록정보 조회 기반 폐업 기업 사전 제외 게이트 구현",
        "전화번호 표준 키 정규화, 디렉터리 사이트 공용 번호 배제 기반 대표번호 선정 로직 구현",
        "이메일 오프라인 검증(문법·국제화 도메인·MX) 구현",
        "스프레드시트 기반 대상 기업 일괄 등록(중복 후보 리포트 포함), 콜 결과 재반영 흐름 및 결과 Excel 리포트 확장",
        "외부 API 장애 대비 재시도 상한, 서킷 브레이커, 실행 전 키 점검 적용",
      ],
      techStack: ["Python", "LLM", "Web Scraping"],
    },
    {
      role: "지도 기반 매물 검색 서비스 배포 인프라·CI/CD 구축",
      startDate: ym("2025-11"),
      endDate: ym("2025-12"),
      summary: "풀스택 · 선임",
      achievements: [
        "EKS 기반 DEV/STG/PRD 환경의 Helm 차트와 ArgoCD 배포 파이프라인 구축",
        "서비스별 노드 분리, health check, External API ingress 구성",
        "GitHub Actions CI(AWS IAM Role) 구성, 빌드 결과·버전을 Slack으로 공유하는 웹훅 연동",
      ],
      techStack: ["AWS EKS", "Helm", "ArgoCD", "GitHub Actions"],
    },
    {
      role: "지도 검색 서비스 운영 장애 대응 및 성능 개선",
      startDate: ym("2025-10"),
      endDate: ym("2026-06"),
      summary: "풀스택 · 선임",
      achievements: [
        "입주가능시기가 지난 매물의 상태 변경 배치에 트랜잭션·DB 락 적용, 동작하지 않던 배치 Slack 알림을 복구해 전체 배치에 적용",
        "목록 COUNT 쿼리 타임아웃 해결(함수 호출 → 서브쿼리), External API CrashLoopBackOff 복구(startupProbe 조정)",
        "물류 지도 면적 필터의 행 중복(row multiplication) 버그 수정, jOOQ 기반 쿼리 속도 개선",
        "사진 업로드 500 장애(S3 버킷 리전 불일치) 원인 규명·해결",
      ],
      techStack: ["Kotlin", "jOOQ", "Kubernetes", "AWS S3"],
    },
    {
      role: "AI 회의록 요약 앱 개발 및 고도화",
      startDate: ym("2025-12"),
      endDate: ym("2026-07"),
      summary: "풀스택 · 선임",
      achievements: [
        "녹취 요약용 청킹·프롬프트·마크다운 변환 파이프라인 개발",
        "로컬 모델 추론을 사내 GPU 서버 서빙으로 전환해 배포 패키지를 85MB → 11MB로 축소",
      ],
      techStack: ["STT", "LLM", "Notion API"],
    },
    {
      role: "문서 렌더링 서버 개발",
      startDate: ym("2026-03"),
      endDate: ym("2026-03"),
      summary: "풀스택 · 선임",
      achievements: [
        "템플릿 기반 문서 렌더링 서버 개발, 국가별 차이를 교체할 수 있는 인터페이스로 설계해 해외 서비스 확장 대비",
        "callbackUrl 검증, SQS visibility timeout 조정, 이미지 S3 업로드 지원으로 안정성·보안 보강",
      ],
      techStack: ["AWS SQS", "AWS S3"],
    },
    {
      role: "팀 개발 생산성 도구 구축",
      startDate: ym("2026-03"),
      endDate: ym("2026-08"),
      summary: "풀스택 · 선임",
      achievements: [
        "LLM Wiki(팀 AI 도구가 정책·도메인 지식을 조회하는 원천) RAG·지식 엔진 구축",
        "맨데이·스토리포인트 산정 알고리즘 확정, 팀원 457건 산정 리포트, 평일 자동 산정·기입 job 구축",
        "팀 공용 도구: DEV/STG 환경 배포 자동화 스킬 파이프라인 구축",
        "팀 공용 도구: DB 작업 요청 쿼리(실행·확인·롤백) 생성 및 Jira 연동 자동화 스킬 구축",
        "팀 공용 도구: PM용 Jira 분석·생성 스킬 구축",
        "팀 공용 도구: PR Decision Log 게이트, 필수 리뷰어 자동 지정 하네스 구축",
        "팀 공용 도구: 운영 DB 부하 방지 가드(RDS CPU·풀스캔 차단) 하네스 구축",
      ],
      techStack: ["RAG", "MCP", "Claude Code", "Jira"],
    },
    {
      role: "보안 취약점(ISMS) 조치 및 클라우드 스토리지 접근 통제",
      startDate: ym("2026-04"),
      endDate: ym("2026-07"),
      summary: "풀스택 · 선임",
      achievements: [
        "ISMS 취약점 조치: XSS, 정보 누출(Server 헤더 제거·405 응답 마스킹), 권한 검증 미흡, 입력값 sanitize",
        "기안서 서비스의 S3 직접 URL을 presigned URL로 전환하고, 한글 파일명 서명 오류 수정",
        "서비스 환경별 계정 15개의 퍼블릭 S3 버킷을 점검·잠금, 이미지 관련 버킷은 CloudFront OAC로 전환해 서빙을 유지한 채 익명 접근 차단",
        "이미지에 서버측 권한 마스킹 적용 (외부 API 호출을 백엔드 프록시로 이관)",
      ],
      techStack: ["AWS S3", "CloudFront OAC", "ISMS"],
    },
    {
      role: "사내 서버 Kubernetes 플랫폼 구축 및 데이터 추출 자동화 안정화",
      startDate: ym("2026-07"),
      endDate: ym("2026-09"),
      summary: "풀스택 · 선임",
      achievements: [
        "사내 서버에 로컬 Kubernetes(OrbStack)를 구축하고 주간 데이터 추출, QueryPie 에이전트, 팀 봇 12종을 파드로 전환",
        "main 푸시 시 자동 반영되는 GitOps 배포, Grafana 대시보드, Alertmanager Slack 알림 규격(심각도 3단계) 구축",
        "메모리 포화에 대비한 PriorityClass 자동 선점, cgroup 기반 CPU 스로틀링 관측 구축",
        "주간 추출이 연속 0건이던 사고의 근본 원인(대량 전송이 세션 갱신을 늦춰 세션 만료)을 규명하고, 키셋 청크 분할로 재발 방지",
      ],
      techStack: ["Kubernetes", "OrbStack", "Grafana", "Alertmanager"],
    },
  ],
  인포뱅크: [
    {
      role: "SKT NTF 챗봇/채팅 상담 서비스 개발",
      startDate: ym("2025-04"),
      endDate: ym("2025-09"),
      summary: "풀스택 · 매니저",
      achievements: [
        "웹소켓 연결 health check·자동 재연결, 브라우저 탭 비활성화 대응, 채팅 상태 변경 TransactionalEventListener 방어 로직 구현",
        "GitLab Runner로 도커 이미지 자동 빌드 → Jenkins가 ECR에 푸시 → EKS의 ArgoCD가 배포하는 파이프라인 구성",
        "Amazon SNS SMS 인증으로 기존 1단계 로그인을 MFA로 전환, SMS 실패 시 예외 처리로 SSO 연동 안정성 확보",
        "RabbitMQ Fanout Exchange·Broadcast Queue로 전체 알림 구현",
        "RabbitMQ HealthCheck Queue로 20초 간격 연결 확인, 응답이 없으면 웹소켓 연결 해제 후 큐 재구독",
        "상담사 파일 전송 제어, 비회원 대화 이력 저장, 카테고리별 운영시간 안내 메시지 제어 기능 API·UI 개발",
        "템플릿 엑셀 업로드에 매직 넘버 검사를 넣어 xls 형식까지 지원",
        "보안 점검 대응: XSS/CSRF, SQL Injection, 파일 업로드 MIME·확장자 검사, Authorization 전달 방식 변경(Header → Body), WebSocket 이벤트 JWT 검증, 취약 계정 정책",
      ],
      techStack: ["Java", "Spring Boot", "RabbitMQ", "WebSocket", "GitLab CI", "Jenkins", "ArgoCD", "Amazon SNS"],
    },
    {
      role: "SK C&C AutoQA, AI KMS 포털 구축",
      startDate: ym("2024-11"),
      endDate: ym("2025-03"),
      summary: "풀스택 · 매니저",
      achievements: [
        "개발 전 라이브러리 조사(Python PDF 변환), API 목록 정리, SKT AICC 통합 포털 연동용 JWT SSO 로그인 설계",
        "퍼블리셔용 GitLab 프로젝트와 기본 React 프레임워크 구축",
        "Keycloak 로그인 콜백에서 JWT를 발급하는 로직과 로그인 서버 API(Access/Refresh 발급, 로그아웃) 개발",
        "Axios 공통 인터셉터로 Access Token 만료 시 Refresh 토큰으로 자동 교체",
        "시스템 관리 API(권한, 메뉴 권한, 사용자 관리) 개발",
        "wavesurfer 녹취 재생, 파일 업로드/다운로드·PDF 미리보기, HTML 추출 기능 구현",
        "내부 KMS 연동 키워드·대화형 검색, 상담 이력 검색 하이라이트·포커스 구현",
        "개발 서버 GitLab CI/CD 연동과 Nginx 설정용 Dockerfile 수정",
      ],
      techStack: ["React", "Java", "Spring Boot", "Keycloak", "JWT", "GitLab CI"],
    },
    {
      role: "채팅 상담 솔루션 SKT 메시징 플랫폼 챗봇 연동 시연 개발",
      startDate: ym("2024-10"),
      endDate: ym("2024-11"),
      summary: "풀스택 · 매니저",
      achievements: [
        "Chatting Key 규칙 정리, 챗봇 → 채팅 상담 전환에 따른 채널 연동 및 RabbitMQ WebStomp 연동(구독, 구독 취소, 발행)",
        "파일·이미지 처리 API와 화면, 챗봇 상담 이력 조회 페이지 백엔드·프론트엔드 개발",
        "채팅 상담 솔루션 템플릿을 메시징 플랫폼과 통일",
        "개발·운영 서버 세팅 (프론트·백엔드 서버 다중화, VIP 서버 Nginx 프록시 설정)",
      ],
      techStack: ["RabbitMQ", "WebStomp", "Nginx"],
    },
    {
      role: "채팅 상담 솔루션 개발 (iTalk)",
      startDate: ym("2024-02"),
      endDate: ym("2024-10"),
      summary: "풀스택 · 매니저",
      achievements: [
        "메시지 브로커 선정, DB 테이블 설계, 프로젝트 프레임워크 개발 등 전체 프로젝트 설계·구축",
        "RabbitMQ + Spring Boot WebStomp 실시간 채팅: exchange 라우팅 패턴으로 큐 배분, 메시지 타입(메시지·시스템 알림·이벤트) 규정",
        "JWT 발급·검증·재발급, 서버 다중화를 고려한 sessionRegistry/Redis Cluster 세션 저장 옵션화, 중복 로그인 방지",
        "공통 예외·에러 코드, CORS 허용 host 옵션화, 로그인 필터·TokenProvider, Spring Security 권한별 접근 규칙",
        "권한별 2depth 메뉴 DB화 등 관리 페이지와 서비스별 실시간 채팅 현황 대시보드 개발",
        "라이선스 파일 암호화·전자서명 검증, jasypt 프로퍼티 암호화, 셸·jar 모니터링, Java·React 소스 난독화",
        "채팅 자동완성 기능 추가",
        "NCloud 개발/운영 서버에 Docker로 MySQL·Redis Cluster·RabbitMQ·Jenkins·Nginx 구성, GitLab + Jenkins CI/CD, ACG·방화벽·SSL·Nginx 프록시 설정",
      ],
      techStack: ["Java", "Spring Boot", "RabbitMQ", "WebStomp", "Redis Cluster", "MySQL", "Jenkins", "NCP"],
    },
    {
      role: "SKT AICC 콜봇 통합 포털 솔루션 개발",
      startDate: ym("2023-06"),
      endDate: ym("2024-01"),
      summary: "풀스택 · 매니저",
      achievements: [
        "DB 테이블 설계와 프로젝트 프레임워크 설계·개발",
        "JWT 기반 타 서비스 SSO 로그인, 서버 다중화를 고려한 Redis Cluster 세션 저장, 중복 로그인 방지",
        "RabbitMQ로 GateWay 서버 로그의 콜 데이터 JSON을 추출해 DB에 적재",
        "실시간 통계, 서비스별 통계 페이지·엑셀 다운로드, 진행 중인 콜의 실시간 대화 내용 확인 기능 개발",
        "메뉴 DB화 기반 권한별 메뉴 관리, 코드·IP 관리 등 시스템 관리 기능 개발",
        "WebHook 서버 기본 API 셋 개발, 개발 서버 MariaDB → MySQL 교체",
      ],
      techStack: ["Java", "Spring Boot", "RabbitMQ", "Redis Cluster", "MySQL", "JWT"],
    },
    {
      role: "카카오 스킬 서버 OpenAI API 연동 개발",
      startDate: ym("2023-05"),
      endDate: ym("2023-06"),
      summary: "백엔드 · 매니저",
      achievements: ["카카오 스킬 서버에 OpenAI LLM API를 연동해, 기존 챗봇의 특정 블록에서 ChatGPT 답변을 받도록 개발"],
      techStack: ["OpenAI API", "MyBatis", "MySQL", "Maven"],
    },
    {
      role: "카카오 스킬 서버 네이버 Clova AICall 연동 개발",
      startDate: ym("2023-04"),
      endDate: ym("2023-06"),
      summary: "백엔드 · 매니저",
      achievements: [
        "인바운드 콜의 STT 결과로 기간계 DB를 조회·수정·저장하고, 알맞은 답변을 TTS로 AICall이 응답하도록 연동",
      ],
      techStack: ["Clova AICall", "STT", "TTS"],
    },
    {
      role: "KB증권 카카오 챗봇 어드민 구축",
      startDate: ym("2023-02"),
      endDate: ym("2023-06"),
      summary: "풀스택 · 매니저",
      achievements: [
        "Java/Spring·MySQL 버전 선정, DB 테이블 설계, 부트스트랩 템플릿 가공, 프로젝트 프레임워크 개발",
        "Spring Security sessionManagement 기반 중복 로그인 방지, 사내 SMS API 로그인 인증, 접근 허용 IP 관리",
        "인증 필터, 권한별 인가 인터셉터 개발",
        "시스템·사용자·부서 관리, 접속·로그인 로그(IP·OS·브라우저·성공 여부), 카카오 블록·그룹 관리 개발",
      ],
      techStack: ["Java", "Spring Security", "MySQL", "Bootstrap"],
    },
  ],
  대양씨아이에스: [
    {
      role: "국립수목원 예약/결제 백엔드 서버 API 개발",
      startDate: ym("2022-11"),
      endDate: ym("2023-01"),
      summary: "풀스택 · 선임연구원",
      achievements: [
        "개방플랫폼(네이버, KB) 신청/결제 연동을 위한 기존 시스템 REST API화 및 추가 API 개발",
        "토큰 발급·재발급과 인증 Validation 체크 로직 추가",
      ],
      techStack: ["REST API", "JWT"],
    },
    {
      role: "진명스포아트 수강신청 및 결제 포털 개발",
      startDate: ym("2022-09"),
      endDate: ym("2022-11"),
      summary: "풀스택 · 선임연구원",
      achievements: [
        "갤럭시아머니트리 PG 결제 모듈 연동, 수강 신청/결제 CRUD 및 쿼리 작성",
        "관리자 페이지 구현 (이미지 파일 등록/수정, 토스트 웹에디터 기반 메인 페이지 편집, 공지사항)",
      ],
      techStack: ["Java", "PG 결제"],
    },
    {
      role: "화성남부국민체육센터 수강신청 및 결제 백엔드 서버 API 개발",
      startDate: ym("2022-04"),
      endDate: ym("2022-09"),
      summary: "풀스택 · 선임연구원",
      achievements: [
        "서비스 통합을 위한 전체 서비스 REST API 신규 개발",
        "CORS 대응, IP 체크 및 제한 로직, JWT 유효성·만료·권한 검증 로직 구현",
      ],
      techStack: ["REST API", "JWT", "CORS"],
    },
    {
      role: "수원도시공사 수강신청 및 결제 포털 개발 및 유지보수",
      startDate: ym("2021-07"),
      endDate: ym("2023-01"),
      summary: "풀스택 · 선임연구원",
      achievements: [
        "레거시 쿼리 성능 개선 (인덱스 추가, 불필요한 join 제거, 프로시저 재사용 구조)으로 응답 속도 12초 → 1초 미만",
        "이지페이 PG 결제 연동, 트랜잭션 기반 중복 결제 방지로 하루 20건 이상이던 오류 문의 → 0건",
        "KISA 보안 취약점 대응 (프로퍼티 파일 암호화, XSS 방어, 이미지 파일명 UUID 변경)",
        "시설 추가에 따른 추가 개발, 주차 결제 페이지 개발, 주민등록번호 조회 API 연동(국가보훈 대상자 확인)",
        "레거시 스파게티 코드 리팩토링 및 재사용 공통 코드 분리",
        "운영 서버 배포, 수강 담당자 에러·요청사항 대응",
      ],
      techStack: ["Java", "PG 결제", "SQL 튜닝", "보안"],
    },
  ],
};

const projects = [
  {
    title: "dev-loop",
    imageUrl: "/images/projects/dev-loop.png",
    summary:
      "여러 Claude Code 세션을 병렬로 돌려 계획 → TDD → 독립 감사 → 리뷰까지 진행하는 오케스트레이터 플러그인 (91회 릴리스, 테스트 74개 CI)",
    techStack: ["Claude Code", "Shell", "bats", "GitHub Actions"],
    repoUrl: "https://github.com/choiyounggi/dev-loop",
    startDate: ym("2026-07"),
    featured: true,
    sortOrder: 0,
  },
  {
    title: "groundwork",
    imageUrl: "/images/projects/groundwork.png",
    summary: "위험 명령 차단·기억 오염 방지 등 AI 에이전트 안전장치 플러그인 4종을 묶은 Claude Code 마켓플레이스",
    techStack: ["Claude Code", "MCP", "Shell"],
    repoUrl: "https://github.com/choiyounggi/groundwork",
    startDate: ym("2026-07"),
    featured: true,
    sortOrder: 1,
  },
  {
    title: "cliclaw",
    imageUrl: "/images/projects/cliclaw.png",
    summary: "폰(텔레그램)에서 Claude Code·Codex·Gemini를 원격 조종하고, 위험 명령은 버튼으로 승인받는 CLI (npm 배포)",
    techStack: ["TypeScript", "Bun", "Telegram Bot API", "npm"],
    repoUrl: "https://github.com/choiyounggi/cliclaw",
    liveUrl: "https://www.npmjs.com/package/@younggichoi/cliclaw",
    startDate: ym("2026-05"),
    featured: true,
    sortOrder: 2,
  },
  {
    title: "linkly",
    imageUrl: "/images/projects/linkly.png",
    summary:
      "규칙만 선언하면 실행 가능한 백엔드가 되는 LLM 친화 프로그래밍 언어. 인터프리터와 MLIR 기반 네이티브 컴파일러 구현, RFC 63편·테스트 5,200여 개로 검증 (실험 프로젝트)",
    techStack: ["Python", "MLIR", "LLVM", "MCP"],
    repoUrl: "https://github.com/choiyounggi/linkly",
    startDate: ym("2026-07"),
    featured: true,
    sortOrder: 3,
  },
  {
    title: "Apply Mate",
    imageUrl: "/images/projects/apply-mate.png",
    summary: "채용 공고에 맞춘 이력서·면접 가이드 앱. 지어낸 경력을 걸러내는 필터, 개인정보를 가린 뒤 LLM 전송",
    techStack: ["NestJS", "Prisma", "PostgreSQL", "Expo", "Claude API"],
    startDate: ym("2026-09"),
    featured: false,
    sortOrder: 4,
  },
  {
    title: "kis-trader",
    imageUrl: "/images/projects/kis-trader.png",
    summary: "LLM 매매 판단에 비율 상한·주문 금액 상한·전역 정지를 적용한 주식 자동매매 엔진 (npm 배포)",
    techStack: ["Python", "TypeScript", "SQLAlchemy", "KIS OpenAPI"],
    repoUrl: "https://github.com/choiyounggi/auto-trading-bot",
    startDate: ym("2026-08"),
    featured: false,
    sortOrder: 5,
  },
  {
    title: "청약 알리미",
    imageUrl: "/images/projects/chungyak-alimi.png",
    summary: "공공 API로 청약 공고를 모아 조건에 맞으면 텔레그램 알림, 라즈베리파이에 CI 자동 배포·HTTPS로 운영 중",
    techStack: ["FastAPI", "PostgreSQL", "GitHub Actions", "Raspberry Pi"],
    repoUrl: "https://github.com/choiyounggi/chungyak-alimi",
    liveUrl: "https://chungyak.duckdns.org/login",
    startDate: ym("2026-07"),
    featured: false,
    sortOrder: 6,
  },
  {
    title: "한국 공공데이터 API",
    imageUrl: "/images/projects/korea-data.png",
    summary: "공휴일·실거래가 API를 MCP 서버로 만들어 PyPI·MCP Registry에 자동 배포",
    techStack: ["FastAPI", "MCP", "PyPI", "Cloudflare Tunnel"],
    repoUrl: "https://github.com/choiyounggi/korea-data-suite",
    liveUrl: "https://api.korea-data.cloud/",
    startDate: ym("2026-07"),
    featured: false,
    sortOrder: 7,
  },
  {
    title: "메차카멜레온 웹",
    imageUrl: "/images/projects/mechameleon.png",
    summary: "아무 웹페이지 스크린샷 위에서 졸라맨을 위장시켜 숨고 찾는 실시간 멀티플레이 게임",
    techStack: ["TypeScript", "Socket.io", "Playwright", "Canvas"],
    repoUrl: "https://github.com/choiyounggi/mechameleon-web",
    liveUrl: "https://mecha.korea-data.cloud/",
    startDate: ym("2026-08"),
    featured: false,
    sortOrder: 8,
  },
];

const timelineEvents = [
  {
    title: "용인송담대학교 전자과 졸업",
    date: ym("2015-03"),
    endDate: ym("2020-01"),
    category: "EDUCATION" as const,
  },
  {
    title: "트리플(컴퍼스6) 투어·액티비티 상품 MD",
    description: "투어·액티비티 상품의 POI 매핑, 상품 소개 문구 가독성 개선",
    date: ym("2019-05"),
    endDate: ym("2020-04"),
    category: "CAREER" as const,
  },
  {
    title: "KG IT BANK Java 기반 웹 교육 취업반 수료",
    description: "단과반 Java, Python, JSP 수업 수강",
    date: ym("2020-12"),
    category: "EDUCATION" as const,
  },
  {
    title: "한양사이버대학교 응용소프트웨어공학과 입학 (재학 중)",
    date: ym("2025-08"),
    category: "EDUCATION" as const,
  },
  {
    title: "첫 AI 에이전트 오픈소스 cliclaw 공개",
    date: ym("2026-05"),
    category: "MILESTONE" as const,
  },
  {
    title: "Claude Code 플러그인 마켓플레이스 groundwork 공개",
    date: ym("2026-07"),
    category: "PROJECT" as const,
  },
];

const settings = [
  { key: "telegram.botToken" as const, value: "" },
  { key: "telegram.chatId" as const, value: "" },
  { key: "site.ogImageUrl" as const, value: "" },
];

async function main() {
  await prisma.profile.upsert({ where: { id: profile.id }, create: profile, update: profile });

  for (const link of links) {
    await prisma.link.upsert({
      where: { url: link.url },
      create: link,
      update: link,
    });
  }

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name_category: { name: skill.name, category: skill.category } },
      create: skill,
      update: skill,
    });
  }

  const companyByName = new Map<string, { id: string }>();
  for (const company of companies) {
    const row = await prisma.company.upsert({
      where: { name: company.name },
      create: company,
      update: company,
    });
    companyByName.set(company.name, row);
  }

  for (const [companyName, experiences] of Object.entries(experiencesByCompany)) {
    const company = companyByName.get(companyName);
    if (!company) throw new Error(`Unknown seed company: ${companyName}`);
    await prisma.experience.deleteMany({ where: { companyId: company.id } });
    await prisma.experience.createMany({
      data: experiences.map((experience, i) => ({ ...experience, companyId: company.id, sortOrder: i })),
    });
  }

  for (const project of projects) {
    await prisma.project.upsert({
      where: { title: project.title },
      create: project,
      update: project,
    });
  }

  for (const event of timelineEvents) {
    await prisma.timelineEvent.upsert({
      where: { title_date: { title: event.title, date: event.date } },
      create: event,
      update: event,
    });
  }

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      create: setting,
      update: setting,
    });
  }

  const counts = {
    profile: await prisma.profile.count(),
    links: await prisma.link.count(),
    skills: await prisma.skill.count(),
    companies: await prisma.company.count(),
    experiences: await prisma.experience.count(),
    projects: await prisma.project.count(),
    events: await prisma.timelineEvent.count(),
    settings: await prisma.setting.count(),
  };
  console.log("Seed counts:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
