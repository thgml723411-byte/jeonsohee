import type { ReactNode } from "react";
import { getAct } from "@/data/acts";
import Reveal from "./Reveal";
import styles from "./Section.module.css";

/** 한 막(Act) = 한 화면(100vh) */
export default function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const act = getAct(id);

  return (
    <section id={id} className={`${styles.section} ${className}`} aria-labelledby={`${id}-title`}>
      <Reveal className={styles.heading}>
        <p className={styles.act}>{act.act}</p>
        <h2 id={`${id}-title`} className={styles.title}>
          {act.title}
        </h2>
        <span className={styles.ornament} aria-hidden>
          ✦
        </span>
      </Reveal>
      {children}
    </section>
  );
}
