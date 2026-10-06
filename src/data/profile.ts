import type { Profile } from "@/types/portfolio";

// TODO: 본인 정보로 교체하세요.
export const profile: Profile = {
  name: "SOHEE JEON",
  nameEn: "Built to Perform",
  role: "Frontend Developer",
  tagline: "한 장면, 한 장면 무대를 짓듯 웹을 만듭니다.",
  intro: [
    "화면 뒤의 구조는 단단하게, 관객이 보는 무대는 섬세하게. 사용자가 머무르고 싶은 경험을 고민합니다.",
  ],
  quote: "좋은 무대는 막이 내린 뒤에도 오래 남는다.",
  photo: "/images/my.jpg", // public 폴더 기준 경로
  facts: [
    { label: "Role", value: "Frontend Developer" },
    { label: "Based in", value: "Seoul, Korea" },
    { label: "Training", value: "웹 퍼블리싱 · 프론트엔드 과정" },
    { label: "Interest", value: "Interaction · Motion · UI" },
  ],
  links: [
    { label: "Email", href: "mailto:your@email.com" },
    { label: "GitHub", href: "https://github.com/" },
    { label: "Blog", href: "#" },
  ],
};
