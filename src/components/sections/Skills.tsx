import { skills } from "@/data/skills";
import Reveal from "@/components/common/Reveal";
import Section from "@/components/common/Section";
import styles from "./Skills.module.css";

/** Act II — Repertoire : 공연 프로그램북처럼 보여주는 기술 스택 */
export default function Skills() {
  return (
    <Section id="repertoire">
      <ol className={styles.list}>
        {skills.map((group, i) => (
          <li key={group.category}>
            <Reveal delay={i * 110} className={styles.card}>
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <h3 className={styles.category}>{group.category}</h3>
              <p className={styles.note}>{group.note}</p>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
