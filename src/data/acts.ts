import type { Act } from "@/types/portfolio";

/** 섹션(막) 순서 — 헤더 네비게이션과 각 섹션이 함께 사용 */
export const acts: Act[] = [
  { id: "prologue", act: "Prologue", title: "Now Showing", label: "프롤로그" },
  { id: "performer", act: "Act I", title: "The Performer", label: "프로필" },
  { id: "repertoire", act: "Act II", title: "Repertoire", label: "기술" },
  { id: "program", act: "Act III", title: "The Program", label: "작업물" },
  { id: "curtain-call", act: "Finale", title: "Curtain Call", label: "연락처" },
];

export const getAct = (id: string) => {
  const act = acts.find((a) => a.id === id);
  if (!act) throw new Error(`Unknown act: ${id}`);
  return act;
};
