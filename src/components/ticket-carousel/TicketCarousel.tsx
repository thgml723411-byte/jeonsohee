"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Work } from "@/types/portfolio";
import Ticket from "@/components/sections/Ticket";
import styles from "./TicketCarousel.module.css";

const TAU = Math.PI * 2;

export default function TicketCarousel({ works }: { works: Work[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLOListElement>(null);
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const motion = useRef({
    theta: 0, target: null as number | null, velocity: 0,
    active: false, hover: false, focused: false,
    expanded: false, reduced: false, dragging: false, moved: false,
    pointerId: -1, startX: 0, startY: 0, lastX: 0, lastTime: 0,
    lastInteraction: 0, front: 0,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    const ring = ringRef.current;
    if (!viewport || !ring || works.length === 0) return;
    const state = motion.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    state.reduced = reduced.matches;
    const onMotionChange = () => { state.reduced = reduced.matches; };
    reduced.addEventListener("change", onMotionChange);
    const observer = new IntersectionObserver(([entry]) => {
      state.active = entry.isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(viewport);

    let frame = 0;
    let lastFrame = performance.now();
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      if (document.hidden || (!state.active && state.target === null)) return;

      if (state.target !== null) {
        state.theta += (state.target - state.theta) * (state.reduced ? 1 : 1 - Math.exp(-7 * dt));
        if (Math.abs(state.target - state.theta) < 0.0002) {
          state.theta = state.target;
          state.target = null;
        }
      } else if (!state.dragging && !state.expanded) {
        if (!state.reduced) {
          state.theta += state.velocity * dt;
          state.velocity *= Math.exp(-3 * dt);
        }
        if (!state.reduced && !state.hover && !state.focused && now - state.lastInteraction > 2500) {
          state.theta -= 0.14 * dt;
        }
      }

      // The original ring geometry remains; live HTML keeps tickets usable.
      ring.style.transform = `translateZ(calc(-1 * var(--radius))) rotateY(${state.theta}rad)`;
      Array.from(ring.children).forEach((card, index) => {
        const angle = (index / works.length) * TAU + state.theta;
        // A mild turn keeps side tickets readable as they orbit the center.
        (card as HTMLElement).style.setProperty("--facing", `${Math.sin(angle) * 0.5 - angle}rad`);
      });
      let front = state.front;
      let best = Math.cos((front / works.length) * TAU + state.theta);
      for (let i = 0; i < works.length; i++) {
        const facing = Math.cos((i / works.length) * TAU + state.theta);
        if (facing > best + 0.02) { front = i; best = facing; }
      }
      if (front !== state.front) {
        state.front = front;
        setSelected(front);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [works.length]);

  const goTo = useCallback((index: number) => {
    const state = motion.current;
    const next = (index + works.length) % works.length;
    const angle = (next / works.length) * TAU;
    state.target = -angle + Math.round((state.theta + angle) / TAU) * TAU;
    state.velocity = 0;
    state.lastInteraction = performance.now();
    state.expanded = false;
    setExpanded(false);
  }, [works.length]);

  const openTicket = () => {
    goTo(motion.current.front);
    motion.current.expanded = true;
    setExpanded(true);
  };

  const closeTicket = useCallback(() => {
    motion.current.expanded = false;
    motion.current.lastInteraction = performance.now();
    setExpanded(false);
  }, []);

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || motion.current.expanded || (event.target as HTMLElement).closest("button, a")) return;
    const state = motion.current;
    state.pointerId = event.pointerId;
    state.startX = state.lastX = event.clientX;
    state.startY = event.clientY;
    state.lastTime = performance.now();
    state.lastInteraction = state.lastTime;
    state.velocity = 0;
    state.target = null;
    state.dragging = true;
    state.moved = false;
  };

  const drag = (event: PointerEvent<HTMLDivElement>) => {
    const state = motion.current;
    if (!state.dragging || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved) {
      if (Math.hypot(dx, dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { state.dragging = false; return; }
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const now = performance.now();
    const delta = event.clientX - state.lastX;
    const sensitivity = 0.006;
    state.theta += delta * sensitivity;
    state.velocity = Math.max(-2, Math.min(2, delta * sensitivity / Math.max((now - state.lastTime) / 1000, 0.016)));
    state.lastX = event.clientX;
    state.lastTime = state.lastInteraction = now;
  };

  const stopDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = motion.current;
    if (state.pointerId !== event.pointerId) return;
    state.dragging = false;
    state.lastInteraction = performance.now();
    if (event.type === "pointercancel") state.velocity = 0;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (works.length === 0) return null;

  return (
    <div
      className={styles.carousel}
      data-ticket-carousel
      data-expanded={expanded}
      onFocusCapture={() => { motion.current.focused = true; }}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) motion.current.focused = false; }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          goTo(motion.current.front + (event.key === "ArrowRight" ? 1 : -1));
        } else if (event.key === "Escape") closeTicket();
      }}
    >
      <div
        ref={viewportRef}
        className={styles.viewport}
        tabIndex={0}
        role="region"
        aria-label="작업물 티켓 갤러리. 좌우로 드래그하거나 방향키로 티켓을 선택하세요."
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onPointerLeave={() => { motion.current.hover = false; }}
        onPointerEnter={() => { motion.current.hover = true; }}
      >
        <div className={styles.floor} aria-hidden="true" />
        <ol ref={ringRef} className={styles.ring}>
          {works.map((work, index) => (
            <li
              key={work.no}
              className={styles.card}
              style={{ "--angle": `${(index / works.length) * 360}deg` } as CSSProperties}
              data-front={selected === index}
              data-work-no={work.no}
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("button, a") || motion.current.moved) return;
                if (index !== motion.current.front) goTo(index);
                else if (!motion.current.expanded) openTicket();
              }}
            >
              <Ticket work={work} interactive={selected === index} />
            </li>
          ))}
        </ol>
        {expanded && <button type="button" className={styles.close} onClick={closeTicket} aria-label="티켓 확대 닫기">닫기 ×</button>}
      </div>
      <div className={styles.toolbar}>
        <button type="button" className={styles.arrow} onClick={() => goTo(motion.current.front - 1)} aria-label="이전 티켓">←</button>
        <div className={styles.current}>
          <span className={styles.counter}>{String(selected + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}</span>
          <span>{works[selected].title}</span>
        </div>
        <button type="button" className={styles.arrow} onClick={() => goTo(motion.current.front + 1)} aria-label="다음 티켓">→</button>
      </div>
      <ol className={styles.selector} aria-label="작업물 선택">
        {works.map((work, index) => (
          <li key={work.no}>
            <button type="button" aria-label={`${work.title} 티켓 선택`} aria-current={selected === index ? "true" : undefined} onClick={() => goTo(index)}>
              <span>No.{String(work.no).padStart(2, "0")}</span>
              <span>{work.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className={styles.hint}>사이트 보기로 작품 방문 · 상세 보기로 기능 확인<br />좌우로 드래그 · 티켓을 눌러 확대</p>
    </div>
  );
}
