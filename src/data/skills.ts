import type { SkillGroup } from "@/types/portfolio";

export const skills: SkillGroup[] = [
  {
    area: "Design",
    title: "디자인 · 프로토타입",
    items: ["Figma", "Photoshop", "Illustrator"],
    details: [
      "Figma 와이어프레임·프로토타입 제작 및 화면 흐름 구성 (L:CODE, FOR-LOG)",
      "컴포넌트·Auto Layout 기반 이벤트 페이지 UI 디자인 (L:CODE)",
      "레퍼런스 분석을 통한 화면 단계·참여 유도 장치 구성 (나의 TOP 10)",
      "이미지 보정·합성, 배너·아이콘 등 그래픽 제작",
    ],
  },
  {
    area: "Frontend",
    title: "마크업 · 스타일 · 스크립트",
    items: ["HTML", "CSS", "SCSS", "JavaScript", "바닐라 JS", "jQuery", "TypeScript basic"],
    details: [
      "시맨틱 마크업, Flex·Grid 반응형 레이아웃 – PC·모바일 대응",
      "바닐라 JS DOM 조작 – 공지 모달, FAQ 아코디언, 카카오맵 API 연동 (FOR-LOG)",
      "SCSS 모듈 스타일링",
    ],
  },
  {
    area: "Frontend",
    title: "React · Next.js",
    items: ["React", "Next.js basic", "TypeScript basic"],
    details: [
      "React 컴포넌트 분리, React Router 페이지 라우팅 (L:CODE, Bookly Admin)",
      "커스텀 Hook·Context API 상태 관리, localStorage 데이터 유지 (나의 TOP 10, Bookly Admin)",
      "외부 API 연동 – TMDB 작품 목록·검색, 디바운스 검색 처리 (나의 TOP 10)",
      "Next.js·TypeScript 기반 개인 포트폴리오 사이트 제작",
    ],
  },
  {
    area: "Frontend",
    title: "모션 · 그래픽",
    items: ["Canvas", "Chart.js", "Three.js", "GSAP", "Swiper"],
    details: [
      "Chart.js로 Line·Bar·Doughnut·Pie 대시보드 차트 구현 (Bookly Admin)",
      "GSAP 패널 전환 애니메이션",
      "Three.js 3D 배경·원형 갤러리 구현",
    ],
  },
  {
    area: "AI",
    title: "AI 활용",
    items: ["Claude", "Codex", "Gemini", "OpenAI"],
    details: [
      "Claude·Codex 바이브 코딩으로 컴포넌트 생성, 리팩터링 및 오류 디버깅",
      "OpenAI API 연동 – Next.js API Route로 React 학습 AI 챗봇 구현",
      "ChatGPT·Gemini를 활용한 서비스 리서치, 페르소나·UX 카피 초안 작성",
    ],
  },
  {
    area: "Collaboration",
    title: "협업 · 배포",
    items: ["Git", "GitHub", "Vercel", "GitHub Pages"],
    details: [
      "Git·GitHub 협업",
      "Vercel·GitHub Pages 배포",
    ],
  },
];
