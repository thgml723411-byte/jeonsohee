import { profile } from "@/data/profile";
import Reveal from "@/components/common/Reveal";
import Section from "@/components/common/Section";
import styles from "./Contact.module.css";

/** Finale — Curtain Call : 인사와 연락처 */
export default function Contact() {
  return (
    <Section id="curtain-call" className={styles.contact}>
      <Reveal delay={100} className={styles.inner}>
        <p className={styles.thanks}>Thank you for watching</p>
        <p className={styles.message}>
          끝까지 관람해 주셔서 감사합니다.
          <br />
          다음 무대를 함께 만들 분을 기다립니다.
        </p>

        {/* 공연 전 배우끼리 건네는 "행운을 빌어"라는 관용구 */}
        <p className={styles.cheer}>
          <span lang="en">Break a leg!</span>
          <small>당신의 무대에도 행운을 빕니다</small>
        </p>

        <ul className={styles.links}>
          {profile.links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className={styles.link}
                {...(l.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#prologue" className={styles.encore}>
          Encore ↑
        </a>
      </Reveal>

      <footer className={styles.footer}>
        © {new Date().getFullYear()} {profile.nameEn}. All the world&apos;s a stage.
      </footer>
    </Section>
  );
}
