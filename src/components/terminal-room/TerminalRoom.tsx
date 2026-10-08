"use client";

import { useEffect, useRef, useState } from "react";
import { skills } from "@/data/skills";
import styles from "./TerminalRoom.module.css";

const sides = ["front", "right", "back", "left", "top"] as const;

export default function TerminalRoom() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={stageRef} className={styles.stage} data-active={active}>
      <div
        className={styles.cubeContainer}
        tabIndex={0}
        role="group"
        aria-label="기술 스택 큐브. 마우스를 올리거나 키보드로 선택하면 회전이 멈춥니다."
      >
        <div className={styles.cube}>
          {skills.map((group, index) => (
            <article
              key={group.category}
              className={`${styles.face} ${styles[sides[index]]}`}
              data-skill-category={group.category}
              aria-labelledby={`skill-cube-title-${index}`}
            >
              <div className={styles.faceContent}>
                <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
                <h3 id={`skill-cube-title-${index}`} className={styles.category}>{group.category}</h3>
                <p className={styles.note}>{group.note}</p>
                <ul className={styles.items}>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
          <div className={`${styles.face} ${styles.bottom}`} aria-hidden="true">
            <div className={styles.faceContent} />
          </div>
        </div>
      </div>
    </div>
  );
}
