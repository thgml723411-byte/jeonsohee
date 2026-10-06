"use client";

import { useEffect, useState, type CSSProperties } from "react";
import styles from "./CurtainIntro.module.css";

// 커튼 한쪽을 몇 가닥으로 나눌지 — 많을수록 부드럽게 "샤라라" 걷힘
const STRIPS = 12;

/**
 * 인트로 — 막 위로 조명이 켜지고, 커튼이 양옆으로 걷히면
 * 뒤에서 첫 화면(Aperture Light 조명 애니메이션)이 드러난다.
 * 클릭하면 바로 건너뛴다.
 */
export default function CurtainIntro() {
  const [done, setDone] = useState(false);

  // 인트로 동안 페이지 스크롤 잠금
  useEffect(() => {
    if (done) return;
    const html = document.documentElement;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      className={styles.intro}
      onClick={() => setDone(true)}
      // 전체 시간(.intro 애니메이션)이 끝나면 인트로 제거
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setDone(true);
      }}
      aria-hidden
    >
      {(["left", "right"] as const).map((side) =>
        Array.from({ length: STRIPS }, (_, i) => (
          // i = 0 이 화면 가장자리, STRIPS-1 이 가운데(먼저 출발)
          <div
            key={`${side}-${i}`}
            className={`${styles.strip} ${styles[side]}`}
            style={{ "--i": i, "--n": STRIPS } as CSSProperties}
          />
        ))
      )}
      <div className={styles.valance} />
      <div className={styles.spot} />
      <p className={styles.skip}>Click to skip</p>
    </div>
  );
}
