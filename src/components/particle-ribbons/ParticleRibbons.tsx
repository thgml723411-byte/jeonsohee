"use client";

import { useEffect, useRef } from "react";
import styles from "./ParticleRibbons.module.css";

type Particle = { x: number; y: number; angle: number; color: string };
const SPEED = 3;
const POINTER_RADIUS = 100;
const RIBBON_DISTANCE = 150;

export default function ParticleRibbons() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const host = layer?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!layer || !canvas || !host || !ctx) return;

    // Keep the source's accumulated trails in a separate drawing surface.
    const offscreen = document.createElement("canvas");
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let visible = false;
    let frame = 0;
    let lastPaint = 0;
    let particles: Particle[] = [];
    const pointer = { x: 0, y: 0, inside: false };

    const makeParticle = (): Particle => {
      const opacity = Math.random();
      const colors = [
        `rgba(214, 187, 209, ${opacity})`,
        `rgba(173, 126, 145, ${opacity})`,
        "#836982",
        `rgba(131, 105, 130, ${opacity})`,
        `rgba(46, 40, 47, ${opacity})`,
      ];
      return { x: Math.random() * width, y: Math.random() * height, angle: Math.random() * Math.PI * 2, color: colors[Math.floor(Math.random() * colors.length)] };
    };

    const paint = (step: number) => {
      // Fade the trails to transparency so the section gradient stays visible.
      offCtx.globalCompositeOperation = "destination-out";
      offCtx.fillStyle = `rgba(0, 0, 0, ${1 - Math.pow(0.992, Math.max(step, 1))})`;
      offCtx.fillRect(0, 0, width, height);
      offCtx.globalCompositeOperation = "lighter";
      offCtx.lineWidth = 1;

      for (const particle of particles) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const nearPointer = dx * dx + dy * dy <= POINTER_RADIUS * POINTER_RADIUS;
        if (nearPointer) {
          offCtx.strokeStyle = particle.color;
          offCtx.beginPath();
          for (const other of particles) {
            if (particle === other) continue;
            const lineX = other.x - particle.x;
            const lineY = other.y - particle.y;
            if (lineX * lineX + lineY * lineY < RIBBON_DISTANCE * RIBBON_DISTANCE) {
              offCtx.moveTo(particle.x, particle.y);
              offCtx.lineTo(other.x, other.y);
            }
          }
          offCtx.stroke();
        }

        if (step > 0) {
          const angle = nearPointer ? Math.atan2(dy, dx) : particle.angle;
          const speed = SPEED * (nearPointer ? -2 : 1) * step;
          particle.x = (particle.x + speed * Math.cos(angle) + width) % width;
          particle.y = (particle.y + speed * Math.sin(angle) + height) % height;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(offscreen, 0, 0, width, height);
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || reducedMotion.matches) return;
      if (lastPaint === 0 || now - lastPaint >= 1000 / 30) {
        const step = lastPaint === 0 ? 1 : Math.min((now - lastPaint) / (1000 / 60), 3);
        lastPaint = now;
        paint(step);
      }
      frame = requestAnimationFrame(tick);
    };

    const syncAnimation = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastPaint = 0;
      if (!visible || document.hidden) return;
      if (reducedMotion.matches) paint(0);
      else frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const oldWidth = width;
      const oldHeight = height;
      width = Math.max(layer.clientWidth, 1);
      height = Math.max(layer.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = offscreen.width = Math.round(width * dpr);
      canvas.height = offscreen.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.length === 0) {
        particles = Array.from({ length: width < 600 ? 140 : 250 }, makeParticle);
      } else {
        for (const particle of particles) {
          particle.x *= width / oldWidth;
          particle.y *= height / oldHeight;
        }
      }
      if (!pointer.inside) { pointer.x = width / 2; pointer.y = height / 2; }
      paint(0);
      lastPaint = 0;
    };

    const onPointer = (event: PointerEvent) => {
      const bounds = layer.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.inside = true;
      if (reducedMotion.matches && visible) paint(0);
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.x = width / 2;
      pointer.y = height / 2;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(layer);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    }, { threshold: 0.01 });
    intersectionObserver.observe(layer);
    host.addEventListener("pointermove", onPointer);
    host.addEventListener("pointerdown", onPointer);
    host.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", syncAnimation);
    reducedMotion.addEventListener("change", syncAnimation);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      host.removeEventListener("pointermove", onPointer);
      host.removeEventListener("pointerdown", onPointer);
      host.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", syncAnimation);
      reducedMotion.removeEventListener("change", syncAnimation);
      offscreen.width = offscreen.height = 0;
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} data-particle-ribbons />
    </div>
  );
}
