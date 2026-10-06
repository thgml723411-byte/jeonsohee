import type { Work } from "@/types/portfolio";

// 티켓으로 보여줄 작업물.
// 앞면: category · title · description · tags  /  뒷면: features
// 왼쪽 절취선(stub)을 뜯으면 href(배포 주소)로 입장할 수 있다.
export const works: Work[] = [
  {
    no: 1,
    title: "캐릭터 방명록",
    period: "2026.07",
    category: "Guestbook",
    description: "나만의 캐릭터를 골라 방명록을 남기는 Firebase 기반 웹앱.",
    tags: ["React", "Firebase", "Zustand", "Sass"],
    features: [
      "Firebase 회원가입 · 로그인",
      "캐릭터 아바타를 골라 방명록 작성",
      "자동으로 넘어가는 메인 영상 슬라이드",
      "Zustand로 로그인 상태 관리",
    ],
    href: "https://guestbook01-nu.vercel.app",
  },
  {
    no: 2,
    title: "Fire Shopping",
    period: "2026.07",
    category: "E-commerce",
    description: "상품 탐색부터 주문, 관리자 페이지까지 갖춘 쇼핑몰.",
    tags: ["React", "Firebase", "Zustand", "React Router"],
    features: [
      "상품 목록 · 상세 · 검색",
      "장바구니 · 찜 · 주문 · 마이페이지",
      "관리자: 상품 · 주문 · 회원 · 공지 관리",
      "Firebase 인증과 데이터베이스 연동",
    ],
    href: "https://shop01-ashy.vercel.app",
  },
  {
    no: 3,
    title: "Bookly 출판 관리자",
    period: "2026.10",
    category: "Admin Dashboard",
    description: "온라인 출판사를 위한 관리자 대시보드.",
    tags: ["React", "Chart.js", "GSAP", "Sass"],
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
    title: "Movie Top 10",
    period: "2026.06",
    category: "Web App",
    description: "인생 영화 10편을 골라 순위를 매기고 이미지로 저장하는 앱.",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    features: [
      "영화 검색 후 최대 10편 선택",
      "1위~10위 순위 편집",
      "배경 · 숫자 테마 선택",
      "완성된 Top 10을 PNG로 저장",
    ],
    href: "https://move-bice.vercel.app",
  },
];
