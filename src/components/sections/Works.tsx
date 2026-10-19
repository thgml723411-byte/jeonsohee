import { works } from "@/data/works";
import Section from "@/components/common/Section";
import WorksStage from "./WorksStage";
import styles from "./Works.module.css";

/** Act III — The Program : 작품 티켓을 고르고 관람석을 예매하는 흐름 */
export default function Works() {
  return (
    <Section id="program" className={styles.section}>
      <WorksStage works={works} />
    </Section>
  );
}
