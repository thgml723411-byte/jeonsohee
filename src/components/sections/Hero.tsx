import { profile } from "@/data/profile";
import ApertureLight from "@/components/aperture/ApertureLight";
import styles from "./Hero.module.css";

/** Prologue — 플레어가 한 줄기 빛으로 모이며 이름이 등장 */
export default function Hero() {
  return (
    <section id="prologue" className={styles.hero} aria-label="프롤로그">
      <ApertureLight className={styles.aperture} keyboard={false} controls={false} />

      <div className={styles.content}>
        <p className={styles.overline}>Prologue · Now Showing</p>
        <h1 className={styles.name}>{profile.nameEn}</h1>
        <p className={styles.role}>
          {profile.name} <span aria-hidden>—</span> {profile.role}
        </p>
        <p className={styles.tagline}>{profile.tagline}</p>
      </div>
    </section>
  );
}
