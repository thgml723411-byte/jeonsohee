import Section from "@/components/common/Section";
import TerminalRoom from "@/components/terminal-room/TerminalRoom";
import ParticleRibbons from "@/components/particle-ribbons/ParticleRibbons";
import styles from "./Skills.module.css";

export default function Skills() {
  return (
    <Section id="repertoire" showHeading={false} className={styles.section}>
      <ParticleRibbons />
      <div className={styles.content}>
        <TerminalRoom />
      </div>
    </Section>
  );
}
