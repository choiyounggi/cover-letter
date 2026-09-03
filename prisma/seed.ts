import "dotenv/config";
import { prisma } from "../src/lib/db/prisma";
import type { Prisma, SkillCategory } from "../src/generated/prisma/client";

const profile = {
  id: "main",
  name: "최영기",
  title: "백엔드 엔지니어",
  tagline: "실전에 강한 백엔드 엔지니어",
  bio: [
    "실전에 강한 백엔드 엔지니어 🧠 Java + Spring Boot 중심으로 성장 중입니다.",
    "4년 동안 백엔드를 중심으로 설계부터 배포까지 전 과정을 경험했습니다.\nMsSQL, MySQL, Redis, MongoDB 등 다양한 DB를 다뤄봤고,\n대용량 트래픽을 고려한 구조 설계부터 Docker 기반 CI/CD 환경 구축까지 직접 해봤습니다.",
    "SKT AICC, 공공기관 수강/결제 시스템, 사내 채팅 솔루션 등 실제 서비스에서\n세션 동기화, 결제 트랜잭션, 메시지 유실 등 복잡한 문제를 해결하며 성장해 왔습니다.",
    "협업 도구는 Jira · Confluence · Trello, 프론트엔드는 React · JSP · Thymeleaf를 활용합니다.\n\"개발이란 결국 소통\"이라는 마음가짐으로, 함께 만드는 경험을 중요하게 생각합니다.",
    "새로운 기술을 배우고 바로 써먹는 걸 좋아합니다.\nKafka 기반 실시간 채팅, Raspberry Pi 서버에 SSL, 도메인, GitLab CI/CD, n8n까지\n실험하고 구축해보며 '내 것으로 만드는 과정'을 즐깁니다.",
    "초심을 잃지 않는다는 것이 결코 쉬운 일은 아니지만 노력해서 이뤄낸 결과 만큼 뿌듯한 것은 없다고 생각하며, 이러한 마음가짐에 가장 어울리는 직업이 개발자라고 생각합니다.",
    "오늘보다 내일이 기대되는 개발자, 팀에 긍정적인 에너지를 주는 사람이 되고 싶습니다.",
  ].join("\n\n"),
  avatarUrl: "/images/profileImage.jpg",
  email: "",
  location: "대한민국",
};

const links = [
  { label: "GitHub", url: "https://github.com/choiyounggi", sortOrder: 0 },
  { label: "velog", url: "https://velog.io/@dch0202/posts", sortOrder: 1 },
  { label: "LinklyChat", url: "https://www.linkly.kr/signin", sortOrder: 2 },
  { label: "n8n", url: "https://www.linkly.kr/n8n", sortOrder: 3 },
];

const skillNames: Record<SkillCategory, string[]> = {
  BACKEND: ["Java", "Spring Boot", "REST APIs", "RabbitMQ", "Kafka", "MongoDB", "Redis", "MySQL", "MsSQL"],
  FRONTEND: ["React", "HTML5 & CSS3", "JavaScript", "jQuery", "Thymeleaf", "Bootstrap", "JSP"],
  DEVOPS: [
    "Docker",
    "Docker Compose",
    "SSL",
    "도메인",
    "Nginx",
    "Apache",
    "CentOS",
    "Ubuntu",
    "Raspberry Pi",
    "AWS",
    "Naver Cloud",
    "Jenkins CI/CD",
    "GitLab CI/CD",
  ],
  TOOLS: [
    "Gitlab & GitHub",
    "IntelliJ IDEA",
    "STS",
    "VS Code",
    "Windsurf",
    "Docker Desktop",
    "Slack",
    "Teams",
    "Jira",
    "Confluence",
    "Trello",
    "Postman",
    "n8n",
    "macOS",
    "Windows",
    "Linux",
  ],
  OTHER: [],
};

const HIGH_LEVEL_BACKEND = new Set(["Java", "Spring Boot", "REST APIs", "MySQL", "Redis"]);

const skills = (Object.keys(skillNames) as SkillCategory[]).flatMap((category) =>
  skillNames[category].map((name, i) => ({
    name,
    category,
    level: category === "BACKEND" && HIGH_LEVEL_BACKEND.has(name) ? 4 : 3,
    sortOrder: i,
  }))
);

const companies = [
  { name: "첫 번째 회사 (관리자에서 수정)", sortOrder: 0 },
  { name: "두 번째 회사 (관리자에서 수정)", sortOrder: 1 },
];

const experiencesByCompany: Record<string, Omit<Prisma.ExperienceCreateManyInput, "companyId">> = {
  "첫 번째 회사 (관리자에서 수정)": {
    role: "개발 선임연구원",
    startDate: new Date("2021-07-01T00:00:00.000Z"),
    endDate: new Date("2023-01-31T00:00:00.000Z"),
    summary:
      "공공기관/체육센터 수강신청·결제 시스템의 REST API 개발과 PG 결제 연동, 보안 대응을 담당했습니다.",
    achievements: [
      "이지페이 PG 결제 모듈 연동 및 KISA 보안 취약점 대응",
      "갤럭시아머니트리 PG 결제 모듈 연동 및 관리자 기능 개발",
      "네이버/KB 예약 연동용 REST API 및 토큰 인증 로직 개발",
      "서비스 전체 REST API 신규 구축 및 JWT 유효성 검증",
    ],
    techStack: ["Java", "Spring Boot", "REST APIs", "MySQL", "MsSQL", "JWT"],
    sortOrder: 0,
  },
  "두 번째 회사 (관리자에서 수정)": {
    role: "개발 매니저",
    startDate: new Date("2023-02-01T00:00:00.000Z"),
    endDate: new Date("2025-04-30T00:00:00.000Z"),
    summary:
      "AI 챗봇/콜봇 플랫폼과 상담 솔루션의 프레임워크 설계, 백엔드 개발, 배포 파이프라인 구축을 리드했습니다.",
    achievements: [
      "iTalk 채팅 상담 솔루션 전체 프레임워크 설계 및 개발",
      "SKT AICC 콜봇 포털 데이터 수집/통계 시스템 구축",
      "GitLab Runner + ArgoCD 기반 배포 파이프라인 구축",
      "SK C&C AutoQA/AI KMS 챗봇 연동 및 JWT 인증 구현",
    ],
    techStack: ["Java", "Spring Boot", "RabbitMQ", "Redis", "JWT", "WebSocket", "Docker", "GitLab CI/CD"],
    sortOrder: 0,
  },
};

const projects = [
  {
    title: "SKT NTF 챗봇/채팅 상담",
    summary: "실시간 상담 시스템 고도화",
    techStack: ["WebSocket", "MFA", "REST APIs", "GitLab CI/CD", "ArgoCD"],
    imageUrl: "/images/SKT.png",
    startDate: new Date("2025-04-01T00:00:00.000Z"),
    endDate: null,
    sortOrder: 0,
  },
  {
    title: "SK C&C AutoQA / AI KMS",
    summary: "챗봇 ↔ 상담 솔루션 연동 개발",
    techStack: ["JWT", "REST APIs"],
    imageUrl: "/images/SKC&C.jpg",
    startDate: new Date("2024-11-01T00:00:00.000Z"),
    endDate: new Date("2025-03-01T00:00:00.000Z"),
    sortOrder: 1,
  },
  {
    title: "채팅상담솔루션 SKT 챗봇 연동",
    summary: "AI 포털 구축 및 API 설계",
    techStack: ["RabbitMQ", "REST APIs"],
    imageUrl: "/images/SKT.png",
    startDate: new Date("2024-10-01T00:00:00.000Z"),
    endDate: new Date("2024-11-01T00:00:00.000Z"),
    sortOrder: 2,
  },
  {
    title: "iTalk 채팅 상담 솔루션",
    summary: "실시간 채팅 솔루션 구축",
    techStack: ["WebStomp", "RabbitMQ", "JWT", "Jenkins CI/CD"],
    imageUrl: "/images/italk.png",
    startDate: new Date("2024-02-01T00:00:00.000Z"),
    endDate: new Date("2024-10-01T00:00:00.000Z"),
    sortOrder: 3,
  },
  {
    title: "SKT AICC 콜봇 포털",
    summary: "콜봇 데이터 수집 및 통계 포털 구축",
    techStack: ["Redis", "RabbitMQ", "JWT", "Webhook"],
    imageUrl: "/images/SKT.png",
    startDate: new Date("2023-06-01T00:00:00.000Z"),
    endDate: new Date("2024-01-01T00:00:00.000Z"),
    sortOrder: 4,
  },
  {
    title: "카카오 OpenAI 연동",
    summary: "OpenAI API 연동 챗봇 구축",
    techStack: ["OpenAI API", "REST APIs"],
    imageUrl: "/images/infobank.png",
    startDate: new Date("2023-05-01T00:00:00.000Z"),
    endDate: new Date("2023-06-01T00:00:00.000Z"),
    sortOrder: 5,
  },
  {
    title: "네이버 Clova Callbot + Kakao 챗봇 연동",
    summary: "콜봇 + 챗봇 연동 구축",
    techStack: ["STT", "TTS", "REST APIs"],
    imageUrl: "/images/infobank.png",
    startDate: new Date("2023-04-01T00:00:00.000Z"),
    endDate: new Date("2023-06-01T00:00:00.000Z"),
    sortOrder: 6,
  },
  {
    title: "KB 챗봇 어드민",
    summary: "카카오 챗봇 관리 포털 구축",
    techStack: ["Spring Security", "SMS 인증"],
    imageUrl: "/images/kb.png",
    startDate: new Date("2023-02-01T00:00:00.000Z"),
    endDate: new Date("2023-06-01T00:00:00.000Z"),
    sortOrder: 7,
  },
  {
    title: "국립수목원 예약/결제 백엔드",
    summary: "예약 API 및 인증 로직 개선",
    techStack: ["REST APIs", "OAuth"],
    imageUrl: "/images/국립수목원.png",
    startDate: new Date("2022-11-01T00:00:00.000Z"),
    endDate: new Date("2023-01-01T00:00:00.000Z"),
    sortOrder: 8,
  },
  {
    title: "진명스포아트 수강신청/결제",
    summary: "PG 결제 + 관리자 기능 개발",
    techStack: ["PG 결제", "REST APIs"],
    imageUrl: "/images/jinmyung.png",
    startDate: new Date("2022-09-01T00:00:00.000Z"),
    endDate: new Date("2022-11-01T00:00:00.000Z"),
    sortOrder: 9,
  },
  {
    title: "화성남부 체육센터 수강/결제",
    summary: "REST API 신규 구축",
    techStack: ["REST APIs", "JWT", "CORS"],
    imageUrl: "/images/hu.png",
    startDate: new Date("2022-04-01T00:00:00.000Z"),
    endDate: new Date("2022-09-01T00:00:00.000Z"),
    sortOrder: 10,
  },
  {
    title: "수원도시공사 수강/결제 포털",
    summary: "지속적인 유지보수 및 리팩토링",
    techStack: ["PG 결제", "보안", "SQL 튜닝"],
    imageUrl: "/images/su.png",
    startDate: new Date("2021-07-01T00:00:00.000Z"),
    endDate: new Date("2023-01-01T00:00:00.000Z"),
    sortOrder: 11,
  },
];

const timelineEvents = [
  { title: "백엔드 개발자 커리어 시작", date: new Date("2021-07-01T00:00:00.000Z"), category: "CAREER" as const },
  { title: "개발 매니저로 이직", date: new Date("2023-02-01T00:00:00.000Z"), category: "CAREER" as const },
  {
    title: "iTalk 채팅 상담 솔루션 프레임워크 설계",
    date: new Date("2024-02-01T00:00:00.000Z"),
    category: "PROJECT" as const,
  },
  { title: "SKT NTF 챗봇 고도화 리드", date: new Date("2025-04-01T00:00:00.000Z"), category: "MILESTONE" as const },
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

  for (const [companyName, experience] of Object.entries(experiencesByCompany)) {
    const company = companyByName.get(companyName);
    if (!company) throw new Error(`Unknown seed company: ${companyName}`);
    await prisma.experience.deleteMany({ where: { companyId: company.id } });
    await prisma.experience.create({ data: { ...experience, companyId: company.id } });
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
