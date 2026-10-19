"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { skills } from "@/data/skills";
import styles from "./TerminalRoom.module.css";

const sides = ["front", "right", "back", "left", "top", "bottom"] as const;
const AUTO_SPEED = 0.012; // deg per ms
const DRAG_THRESHOLD = 5;

export default function TerminalRoom() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const rotation = useRef({ x: -12, y: -24 });
  const drag = useRef<{ id: number; startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  const applyRotation = () => {
    const { x, y } = rotation.current;
    if (cubeRef.current) {
      cubeRef.current.style.transform = `translateZ(calc(var(--cube-size) / -2)) rotateX(${x}deg) rotateY(${y}deg)`;
    }
  };

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(stage);
    applyRotation();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(now - last, 50);
      last = now;
      if (!drag.current) {
        rotation.current.y += AUTO_SPEED * delta;
        rotation.current.x += AUTO_SPEED * 0.35 * delta;
        applyRotation();
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, paused]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    if (!state.moved && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) > DRAG_THRESHOLD) {
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (!state.moved) return;
    rotation.current.y += (event.clientX - state.lastX) * 0.4;
    rotation.current.x -= (event.clientY - state.lastY) * 0.4;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    applyRotation();
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    drag.current = null;
    if (!state.moved) setPaused((value) => !value);
  };

  const handlePointerCancel = () => {
    drag.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, [number, number]> = {
      ArrowLeft: [0, -90],
      ArrowRight: [0, 90],
      ArrowUp: [90, 0],
      ArrowDown: [-90, 0],
    };
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setPaused((value) => !value);
      return;
    }
    const move = step[event.key];
    if (!move) return;
    event.preventDefault();
    setPaused(true);
    rotation.current.x += move[0];
    rotation.current.y += move[1];
    applyRotation();
  };

  return (
    <div ref={stageRef} className={styles.stage}>
      <div
        className={styles.cubeContainer}
        tabIndex={0}
        role="group"
        aria-label="기술 스택 큐브. 클릭하거나 스페이스 키로 회전을 멈추고 다시 재생합니다. 드래그하거나 방향키로 다른 면을 볼 수 있습니다."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div ref={cubeRef} className={styles.cube}>
          {skills.map((group, index) => (
            <article
              key={group.title}
              className={`${styles.face} ${styles[sides[index]]}`}
              data-skill-area={group.area}
              aria-labelledby={`skill-cube-title-${index}`}
            >
              <div className={styles.faceContent}>
                <div className={styles.faceHead}>
                  <span className={styles.num}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.area}>{group.area}</span>
                </div>
                <h3 id={`skill-cube-title-${index}`} className={styles.title}>{group.title}</h3>
                <ul className={styles.items} aria-label="사용 기술">
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <ul className={styles.details} aria-label="주요 내용">
                  {group.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
