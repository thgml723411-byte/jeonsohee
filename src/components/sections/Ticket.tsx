"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Work } from "@/types/portfolio";
import styles from "./Ticket.module.css";

const TEAR_DISTANCE = 70; // 이만큼(px) 끌어당기면 뜯어짐

/**
 * 공연 티켓 한 장.
 * - 왼쪽 절취선(stub)을 끌어당기거나 클릭하면 뜯어지고, 그 자리에 "입장" 링크가 나타남
 * - "뒷면 보기"를 누르면 3D로 뒤집혀 주요 기능을 보여줌
 */
export default function Ticket({ work }: { work: Work }) {
  const [flipped, setFlipped] = useState(false);
  const [torn, setTorn] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const start = useRef<{ x: number; y: number } | null>(null);

  const no = String(work.no).padStart(2, "0");
  const external = work.href?.startsWith("http");
  const linkProps = external ? { target: "_blank", rel: "noreferrer" } : {};

  // ───── 뜯기: 끌어당기는 거리만큼 절취선을 축으로 기울어짐 ─────
  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (torn || !work.href) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  };
  const onPointerUp = () => {
    if (!start.current) return;
    const distance = Math.hypot(drag.x, drag.y);
    start.current = null;
    setDrag({ x: 0, y: 0 });
    // 충분히 당겼거나, 거의 안 움직였으면(=클릭) 뜯기
    if (distance > TEAR_DISTANCE || distance < 5) setTorn(true);
  };

  const pull = Math.min(Math.hypot(drag.x, drag.y), TEAR_DISTANCE);
  const stubStyle = {
    "--tilt": `${-pull * 0.35}deg`,
    "--dx": `${Math.min(0, drag.x) * 0.25}px`,
    "--dy": `${Math.max(0, drag.y) * 0.25}px`,
  } as CSSProperties;

  return (
    <li className={styles.ticket} data-flipped={flipped} data-torn={torn}>
      <div className={styles.inner}>
        {/* ───────── 앞면 ───────── */}
        <div className={styles.front} inert={flipped}>
          <div className={styles.slot}>
            {/* 뜯기 전엔 stub 아래에 숨어 있는 입장 링크 */}
            {work.href ? (
              <div className={styles.entry}>
                <a href={work.href} className={styles.enter} {...linkProps} tabIndex={torn ? 0 : -1}>
                  Enter →
                </a>
                <button
                  type="button"
                  className={styles.reset}
                  onClick={() => setTorn(false)}
                  tabIndex={torn ? 0 : -1}
                  aria-label="티켓 다시 붙이기"
                >
                  ↺
                </button>
              </div>
            ) : (
              <span className={styles.soon}>Soon</span>
            )}

            <button
              type="button"
              className={styles.stub}
              style={stubStyle}
              data-dragging={pull > 0}
              disabled={!work.href}
              tabIndex={torn ? -1 : 0}
              aria-label={`${work.title} 티켓 뜯고 입장하기`}
              title="끌어당기거나 클릭해서 뜯기"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setTorn(true);
                }
              }}
            >
              <span className={styles.admit}>Admit One</span>
              <span className={styles.no}>No.{no}</span>
              <span className={styles.period}>{work.period}</span>
            </button>
          </div>

          <div className={styles.body}>
            <p className={styles.category}>{work.category}</p>
            <h3 className={styles.title}>{work.title}</h3>
            <p className={styles.desc}>{work.description}</p>
            <ul className={styles.tags}>
              {work.tags.map((t) => (
                <li key={t}>#{t}</li>
              ))}
            </ul>
            <div className={styles.actions}>
              <span className={styles.hint}>{torn ? "입장권 확인 완료" : "← 뜯어서 입장"}</span>
              <button type="button" className={styles.flip} onClick={() => setFlipped(true)}>
                뒷면 보기 ↻
              </button>
            </div>
          </div>
        </div>

        {/* ───────── 뒷면 ───────── */}
        <div className={styles.back} inert={!flipped}>
          <p className={styles.backHead}>
            <span>Program Notes</span>
            <span>No.{no}</span>
          </p>
          <h3 className={styles.title}>{work.title}</h3>
          {work.features && (
            <ul className={styles.features}>
              {work.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          <div className={styles.actions}>
            {work.href && (
              <a href={work.href} className={styles.visit} {...linkProps}>
                {external ? "사이트 방문 ↗" : "처음으로 ↑"}
              </a>
            )}
            <button type="button" className={styles.flip} onClick={() => setFlipped(false)}>
              앞면 보기 ↻
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
