import type { Work } from "@/types/portfolio";

// 티켓으로 보여줄 작업물.
// 앞면: category · title · description · tags  /  뒷면: features
// 왼쪽 절취선(stub)을 뜯으면 href(배포 주소)로 입장할 수 있다.
export const works: Work[] = [
  {
    no: 1,
    title: "흔적 보관소 · 방명록",
    period: "2026.07",
    category: "Guestbook",
    description: "나만의 캐릭터를 골라 방명록을 남기는 Firebase 기반 웹앱.",
    tags: ["React", "Firebase", "Zustand", "React Router", "Sass"],
    features: [
      "Firebase 회원가입 · 로그인",
      "캐릭터 아바타를 골라 방명록 작성",
      "자동으로 넘어가는 메인 영상 슬라이드",
      "Zustand로 로그인 상태 관리",
    ],
    href: "https://guestbooks-nu.vercel.app",
  },
  {
    no: 2,
    title: "Bloomly · 플라워 쇼핑몰",
    period: "2026.07",
    category: "E-commerce",
    description: "꽃 상품 탐색부터 주문, 관리자 페이지까지 갖춘 플라워 쇼핑몰.",
    tags: ["React", "Firebase", "Zustand", "React Router", "Sass"],
    features: [
      "상품 목록 · 상세 · 검색",
      "장바구니 · 찜 · 주문 · 마이페이지",
      "관리자: 상품 · 주문 · 회원 · 공지 관리",
      "Firebase 인증과 데이터베이스 연동",
    ],
    href: "https://bloomly-ashy.vercel.app",
  },
  {
    no: 3,
    title: "Bookly · 출판 관리 대시보드",
    period: "2026.10",
    category: "Admin Dashboard",
    description: "온라인 출판사를 위한 관리자 대시보드.",
    tags: ["React", "Chart.js", "GSAP", "React Router", "Sass"],
    features: [
      "Chart.js로 방문자 · 판매 통계 시각화",
      "도서 · 회원 · 게시판 관리 화면",
      "GSAP 인터랙션 애니메이션",
      "테마 컬러 커스터마이징",
    ],
    href: "https://bookly-admin-olive.vercel.app",
  },
  {
    no: 4,
    title: "나의 TOP 10 · 콘텐츠 랭킹",
    period: "2026.06",
    category: "Web App",
    description: "영화·드라마·예능을 골라 나만의 TOP 10 카드를 만들고 이미지로 저장하는 앱.",
    tags: ["React", "TMDB API", "Three.js", "html-to-image", "Custom Hook"],
    features: [
      "TMDB 트렌딩 · 영화 · 드라마 · 예능 카테고리 탐색",
      "디바운스 검색으로 작품 찾기",
      "TOP 10 공유 카드 색 테마 선택 · PNG 저장",
      "localStorage 컬렉션 보관 · Three.js 3D 배경",
    ],
    href: "https://movie-top10-bice.vercel.app",
  },
  {
    no: 5,
    title: "L:CODE · 여행 일정 큐레이션",
    period: "팀 프로젝트",
    category: "Team Project",
    description: "여행 일정 큐레이션 서비스를 React로 구현하고 GitHub로 협업한 팀 프로젝트.",
    tags: ["React", "Firebase", "React Router", "Leaflet", "MapLibre", "GSAP", "Recharts", "Sass"],
    features: [
      "여행 일정 큐레이션과 장소 지도 제공",
      "Leaflet · MapLibre 기반 여행 지도",
      "Firebase 인증과 여행 데이터 관리",
      "GSAP 인터랙션 · GitHub 팀 협업",
    ],
    href: "https://lcode-2.vercel.app/",
  },
  {
    no: 6,
    title: "React AI Study · 학습 챗봇",
    period: "2026.10",
    category: "AI Learning",
    description: "AI 개념 설명과 퀴즈, 힌트, 이용 안내 챗봇을 제공하는 React 학습 서비스.",
    tags: ["Next.js", "TypeScript", "OpenAI", "Sass", "OpenWeather API"],
    features: [
      "React 개념 설명 · AI 퀴즈 · 힌트 제공",
      "학습 안내 문서 검색 기반 이용 안내 챗봇",
      "Next.js Route Handler에서 OpenAI 호출",
      "OpenWeather API로 지역별 날씨 확인",
    ],
    href: "https://chatbot-bay-eight-31.vercel.app/",
  },
];
