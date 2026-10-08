import type { ReactNode } from "react";
import { getAct } from "@/data/acts";
import Reveal from "./Reveal";
import ParticleLabel from "@/components/particle-text/ParticleLabel";
import styles from "./Section.module.css";

/** 한 막(Act) = 한 화면(100vh) */
export default function Section({
  id,
  children,
  className = "",
  showHeading = true,
  particleText = false,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  showHeading?: boolean;
  particleText?: boolean;
}) {
  const act = getAct(id);

  return (
    <section id={id} className={`${styles.section} ${className}`} aria-labelledby={`${id}-title`}>
      {showHeading ? <Reveal className={styles.heading}>
        <p className={styles.act}>{particleText ? <ParticleLabel text={act.act} /> : act.act}</p>
        <h2 id={`${id}-title`} className={styles.title}>
          {particleText ? <ParticleLabel text={act.title} /> : act.title}
        </h2>
        <span className={styles.ornament} aria-hidden>
          ✦
        </span>
      </Reveal> : <h2 id={`${id}-title`} className={styles.srOnly}>{act.title}</h2>}
      {children}
    </section>
  );
}
