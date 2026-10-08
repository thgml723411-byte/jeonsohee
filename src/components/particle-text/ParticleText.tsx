"use client";

import { useEffect, useRef } from "react";
import { startParticleText } from "./particle-text-engine";
import styles from "./ParticleText.module.css";

export default function ParticleText() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const input = inputRef.current;
    const hint = hintRef.current;
    const save = saveRef.current;
    if (!canvas || !input || !hint || !save) return;

    return startParticleText({ canvas, input, hint, save });
  }, []);

  return (
    <main className={styles.scene} aria-label="Interactive particle text">
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Move to disturb the particles and click to detonate"
      />
      <div className={styles.bloom} aria-hidden="true" />
      <div className={styles.vig} aria-hidden="true" />

      <div ref={hintRef} className={styles.hint}>
        move to disturb &nbsp;·&nbsp; click to detonate
      </div>

      <div className={styles.ui}>
        <input
          ref={inputRef}
          className={styles.input}
          maxLength={42}
          placeholder="type anything…"
          aria-label="Particle text"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          ref={saveRef}
          className={styles.save}
          type="button"
          title="Save PNG"
          aria-label="Save PNG"
        >
          ↓
        </button>
      </div>
    </main>
  );
}
