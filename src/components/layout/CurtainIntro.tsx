"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CurtainIntro.module.css";

export default function CurtainIntro() {
  const [done, setDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (done) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    let disposed = false;
    let disposeCloth: (() => void) | undefined;
    const finish = () => setDone(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);

    // CSS remains a complete fallback while the texture and renderer load.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      import("./curtain-cloth").then(({ createCurtainCloth }) => {
        if (disposed || !canvasRef.current) return;
        disposeCloth = createCurtainCloth(canvasRef.current, finish);
      }).catch(() => {
        // The CSS curtains still open if WebGL is unavailable.
      });
    }

    const timeout = window.setTimeout(finish, 7000);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      window.removeEventListener("keydown", onKeyDown);
      disposeCloth?.();
      html.style.overflow = previousOverflow;
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      className={styles.intro}
      onClick={() => setDone(true)}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setDone(true);
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.fallback} aria-hidden="true">
        <div className={`${styles.panel} ${styles.left}`} />
        <div className={`${styles.panel} ${styles.right}`} />
      </div>
      <div className={styles.valance} aria-hidden="true" />
      <div className={styles.spot} aria-hidden="true" />
      <button type="button" className={styles.skip} aria-label="인트로 건너뛰기">
        Click to skip
      </button>
    </div>
  );
}
