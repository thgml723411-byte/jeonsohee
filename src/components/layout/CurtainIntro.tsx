"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CurtainIntro.module.css";

export default function CurtainIntro() {
  const [done, setDone] = useState(false);
  const introRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const intro = introRef.current;
    if (done || !intro) return;
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    let disposed = false;
    let playing = false;
    let disposeCloth: (() => void) | undefined;
    let fallbackTimer: number | undefined;
    let completionTimer: number | undefined;
    const finish = () => setDone(true);
    const start = (renderer: "css" | "webgl") => {
      // Commit to one renderer before either curtain starts moving.
      if (disposed || playing) return false;
      playing = true;
      window.clearTimeout(fallbackTimer);
      intro.dataset.renderer = renderer;
      intro.dataset.state = "playing";
      completionTimer = window.setTimeout(finish, 7000);
      return true;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);

    // Hold the closed CSS curtain while preparing the first 3D frame.
    // Slow devices keep the CSS version for the entire opening.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      fallbackTimer = window.setTimeout(() => start("css"), 500);
      import("./curtain-cloth").then(({ createCurtainCloth }) => {
        if (disposed || playing || !canvasRef.current) return;
        disposeCloth = createCurtainCloth(canvasRef.current, finish, () => start("webgl"));
      }).catch(() => {
        start("css");
      });
    } else {
      start("css");
    }

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(completionTimer);
      window.removeEventListener("keydown", onKeyDown);
      disposeCloth?.();
      intro.dataset.state = "loading";
      delete intro.dataset.renderer;
      html.style.overflow = previousOverflow;
    };
  }, [done]);

  if (done) return null;

  return (
    <div
      ref={introRef}
      className={styles.intro}
      data-state="loading"
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
      <button type="button" className={styles.skip} aria-label="인트로 건너뛰기">
        Click to skip
      </button>
    </div>
  );
}
