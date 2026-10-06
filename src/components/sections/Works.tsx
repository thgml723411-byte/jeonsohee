import { works } from "@/data/works";
import Reveal from "@/components/common/Reveal";
import Section from "@/components/common/Section";
import Ticket from "./Ticket";
import styles from "./Works.module.css";

/** Act III — The Program : 그동안의 작업물을 공연 티켓으로 (뜯어서 입장 · 뒤집어서 상세) */
export default function Works() {
  return (
    <Section id="program">
      <Reveal delay={150}>
        <ul className={styles.track}>
          {works.map((w) => (
            <Ticket key={w.no} work={w} />
          ))}
        </ul>
      </Reveal>
      <p className={styles.tip}>← 왼쪽 절취선을 뜯으면 입장 · 뒷면 보기로 상세 확인</p>
    </Section>
  );
}
