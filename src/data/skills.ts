import type { SkillGroup } from "@/types/portfolio";

export const skills: SkillGroup[] = [
  {
    category: "Markup & Style",
    note: "무대의 뼈대와 의상",
    items: ["HTML5", "CSS3", "Flex / Grid", "Responsive", "Animation"],
  },
  {
    category: "Script",
    note: "배우의 움직임",
    items: ["JavaScript (ES6+)", "DOM", "Event", "Fetch / JSON", "TypeScript"],
  },
  {
    category: "Visual & Sound",
    note: "조명과 음향",
    items: ["Canvas API", "Web Audio", "SVG", "Transition"],
  },
  {
    category: "Framework",
    note: "무대 연출",
    items: ["React", "Next.js (App Router)", "CSS Modules"],
  },
  {
    category: "Tools",
    note: "무대 뒤 스태프",
    items: ["Git / GitHub", "VS Code", "Figma", "Vercel"],
  },
];
