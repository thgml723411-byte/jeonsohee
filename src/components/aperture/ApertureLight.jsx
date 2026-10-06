"use client";

import { useEffect, useRef } from "react";
import { mountAperture } from "./aperture-engine";
import "./aperture.css";

export default function ApertureLight({ className = "", keyboard = true, controls = true }) {
  const rootRef = useRef(null);

  useEffect(() => {
    try {
      return mountAperture(rootRef.current, { keyboard, controls });
    } catch (error) {
      // WebGL 2 미지원 등 — 애니메이션 없이 검은 배경만 남김
      console.error(error);
    }
  }, [keyboard, controls]);

  return (
    <div ref={rootRef} className={`aperture-light ${className}`} data-clean={String(!controls)}>
      <div className="aperture-light__canvas" role="img"
        aria-label="A flare contracts into a light beam above a curved glass rim." />
      <div className="aperture-light__controls" role="group" aria-label="Animation playback">
        <button className="aperture-light__toggle" type="button" data-playing="true"
          aria-label="Pause animation" title="Play / pause · Space">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path className="aperture-light__play-icon" d="M6 3.5 16 10 6 16.5Z" fill="currentColor" />
            <path className="aperture-light__pause-icon" d="M7 4v12M13 4v12"
              stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="aperture-light__play-label">Play</span>
          <span className="aperture-light__pause-label">Pause</span>
        </button>
        <button className="aperture-light__replay" type="button"
          aria-label="Replay animation" title="Replay · R">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"
            strokeWidth="1.25" aria-hidden="true">
            <path d="M4 7a6.5 6.5 0 1 1-.4 5M4 2.5V7h4.5" />
          </svg>
        </button>
        <div className="aperture-light__timeline" style={{ "--progress": "0%" }}>
          <span className="aperture-light__rail" aria-hidden="true"><span /></span>
          <span className="aperture-light__ticks" aria-hidden="true" />
          <input type="range" min="0" max="14.066666666666666"
            step="0.03333333333333333" aria-label="Animation time in seconds"
            aria-valuetext="0.00 seconds" defaultValue="0" />
        </div>
        <div className="aperture-light__time">
          <output aria-live="off">00:00:00</output>
          <span aria-label="Duration 14 seconds and 2 frames">/ 00:14:02</span>
        </div>
      </div>
    </div>
  );
}
