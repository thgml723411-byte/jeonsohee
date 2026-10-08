"use client";

import { useEffect, useRef } from "react";
import styles from "./PileOfHearts.module.css";

export default function PileOfHearts() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const abort = new AbortController();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scene;
    let initializing = false;
    let visible = false;

    const sync = async () => {
      const running = visible && !document.hidden && !motion.matches;
      if (scene) return scene.setRunning(running);
      if (!running || initializing || abort.signal.aborted) return;
      initializing = true;
      try {
        const { createHeartsScene } = await import("./hearts-scene");
        if (abort.signal.aborted) return;
        const created = await createHeartsScene(container, canvas, abort.signal);
        if (abort.signal.aborted) return created?.dispose();
        scene = created;
        scene?.setRunning(visible && !document.hidden && !motion.matches);
      } catch (error) {
        if (!abort.signal.aborted) {
          container.dataset.state = "unavailable";
          console.warn("Profile heart animation could not start", error);
        }
      } finally {
        initializing = false;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(container);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);

    return () => {
      abort.abort();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      scene?.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.container} data-profile-hearts="true" aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
