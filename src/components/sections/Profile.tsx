import Image from "next/image";
import { profile } from "@/data/profile";
import Reveal from "@/components/common/Reveal";
import ParticleLabel from "@/components/particle-text/ParticleLabel";
import SectionParticles from "@/components/particle-text/SectionParticles";
import PileOfHearts from "@/components/pile-of-hearts/PileOfHearts";
import { getAct } from "@/data/acts";
import portrait from "../../../public/images/profile-cutout.png";
import styles from "./Profile.module.css";

/** Act I — The Performer : 프로필 소개 */
export default function Profile() {
  const act = getAct("performer");

  return (
    <section id="performer" className={styles.stage} aria-labelledby="performer-title">
      <SectionParticles />
      <Reveal className={styles.heading}>
        <p className={styles.act}><ParticleLabel text={act.act} /></p>
        <h2 id="performer-title" className={styles.title}><ParticleLabel text={act.title} /></h2>
      </Reveal>

      <Reveal className={styles.composition}>
        <figure className={styles.portrait}>
          <PileOfHearts />
          <Image
            src={portrait}
            alt={`${profile.name}, 발레 의상을 입은 프로필 사진`}
            sizes="(max-width: 600px) 72vw, (max-width: 1100px) 42vw, 520px"
          />
        </figure>

        <p className={styles.identity}><ParticleLabel text={`${profile.name} · ${profile.role}`} /></p>
        <p className={styles.lead}><ParticleLabel text={profile.tagline} /></p>
        {profile.intro.map((p) => (
          <p key={p} className={styles.body}><ParticleLabel text={p} /></p>
        ))}

        <dl className={styles.facts}>
          {profile.facts.map((f) => (
            <div key={f.label} className={styles.fact}>
              <dt><ParticleLabel text={f.label} /></dt>
              <dd><ParticleLabel text={f.value} /></dd>
            </div>
          ))}
        </dl>

        <blockquote className={styles.quote}><ParticleLabel text={`“${profile.quote}”`} /></blockquote>
      </Reveal>
    </section>
  );
}
