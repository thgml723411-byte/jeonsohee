"use client";

import { useEffect, useRef } from "react";
import { createCurtainRain } from "./curtain-rain";
import styles from "./CurtainRain.module.css";

export default function CurtainRain() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const section = layer?.parentElement;
    if (!layer || !canvas || !section) return;
    return createCurtainRain(canvas, section);
  }, []);

  return (
    <div ref={layerRef} className={styles.layer} data-curtain-rain aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
