"use client";

import { useEffect, useRef } from "react";
import { startSectionParticles } from "./section-particles-engine";
import styles from "./SectionParticles.module.css";

export default function SectionParticles({ background = false }: { background?: boolean }) {
  const textRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = textRef.current;
    const section = canvas?.parentElement;
    if (!canvas || !section) return;
    return startSectionParticles(section, canvas, backgroundRef.current);
  }, [background]);

  return (
    <>
      {background && <canvas ref={backgroundRef} className={styles.background} data-section-particle-background aria-hidden="true" />}
      <canvas ref={textRef} className={styles.text} data-section-particle-text aria-hidden="true" />
    </>
  );
}
