import Image from "next/image";
import { profile } from "@/data/profile";
import Reveal from "@/components/common/Reveal";
import Section from "@/components/common/Section";
import DarkReveal from "@/components/common/DarkReveal";
import styles from "./Profile.module.css";

/** Act I — The Performer : 프로필 소개 */
export default function Profile() {
  return (
    <Section id="performer" className={styles.stage}>
      <div className={styles.grid}>
        <Reveal className={styles.portraitWrap}>
          <figure className={styles.portrait}>
            {profile.photo ? (
              <Image src={profile.photo} alt={profile.name} fill sizes="(max-width: 860px) 70vw, 340px" />
            ) : (
              <span className={styles.initial} aria-hidden>
                {profile.nameEn.charAt(0)}
              </span>
            )}
            <figcaption className={styles.plate}>{profile.name}</figcaption>
          </figure>
        </Reveal>

        <div className={styles.text}>
          <Reveal delay={150}>
            <p className={styles.lead}>{profile.tagline}</p>
            {profile.intro.map((p) => (
              <p key={p} className={styles.body}>
                {p}
              </p>
            ))}
          </Reveal>

          <Reveal delay={300}>
            <dl className={styles.facts}>
              {profile.facts.map((f) => (
                <div key={f.label} className={styles.fact}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={450}>
            <blockquote className={styles.quote}>“{profile.quote}”</blockquote>
          </Reveal>
        </div>
      </div>

      {/* 손전등 효과 — 어둠 속에서 배우(나)를 찾아내는 연출 */}
      <DarkReveal hint="빛을 비춰 배우를 찾아보세요" />
    </Section>
  );
}
