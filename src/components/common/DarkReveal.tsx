"use client";

import { useEffect, useRef } from "react";
import styles from "./DarkReveal.module.css";

/**
 * 손전등 효과 — 섹션 전체를 어둠으로 덮고, 마우스 주변만 동그랗게 비춘다.
 * 부모 요소(섹션) 안에 마지막 자식으로 넣으면 그 섹션 크기만큼 덮는다.
 * 부모에는 position: relative 가 필요하다.
 */
export default function DarkReveal({ hint = "빛을 비춰 무대를 찾아보세요" }: { hint?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mask = ref.current;
    const host = mask?.parentElement;
    if (!mask || !host) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // clientX/Y는 화면 기준이라, 섹션 기준 좌표로 바꿔야 스크롤해도 어긋나지 않음
        const rect = mask.getBoundingClientRect();
        mask.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
        mask.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
      });
    };
    const onEnter = (e: PointerEvent) => {
      onMove(e);
      mask.dataset.lit = "true";
    };
    const onLeave = () => {
      mask.dataset.lit = "false";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className={styles.mask} data-lit="false" aria-hidden>
      <p className={styles.hint}>{hint}</p>
    </div>
  );
}
