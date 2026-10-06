/** 네비게이션 · 섹션 한 막(Act) 정보 */
export interface Act {
  id: string;
  act: string; // 영문 막 이름 (예: "Act I")
  title: string; // 영문 제목
  label: string; // 한글 라벨
}

export interface ProfileFact {
  label: string;
  value: string;
}

export interface Profile {
  name: string;
  nameEn: string;
  role: string;
  tagline: string;
  intro: string[];
  quote: string;
  photo?: string; // public 폴더 기준 경로. 없으면 이니셜 플레이스홀더
  facts: ProfileFact[];
  links: { label: string; href: string }[];
}

export interface SkillGroup {
  category: string;
  note: string;
  items: string[];
}

export interface Work {
  no: number;
  title: string;
  period: string;
  category: string;
  description: string;
  tags: string[];
  href?: string; // 없으면 "Coming Soon"
  features?: string[]; // 티켓 뒷면에 보여줄 주요 기능
}

