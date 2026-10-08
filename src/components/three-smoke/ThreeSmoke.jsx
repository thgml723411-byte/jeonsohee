"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";
import styles from "./ThreeSmoke.module.css";

export default function ThreeSmoke({ className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 500);
    camera.position.z = 5;
    const target = new THREE.Vector3();

    const mouseTarget = new THREE.Vector2(0.5, 0.5);
    const mouse = new THREE.Vector2(0.5, 0.5);
    const resolution = new THREE.Vector2(1, 1);
    const theme = getComputedStyle(container);
    const themeColor = (token) => new THREE.Color(theme.getPropertyValue(token).trim()).convertLinearToSRGB();
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      depthTest: false,
      uniforms: {
        up: { value: new THREE.Vector3(0, 1, 0) },
        time: { value: 0 },
        uResolution: { value: resolution },
        uSmokeColor: { value: themeColor("--color-foreground") },
        uBackgroundColor: { value: themeColor("--color-background") },
        uRoseColor: { value: themeColor("--color-rose") },
        uVioletColor: { value: themeColor("--color-violet") },
      },
      vertexShader,
      fragmentShader,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = -100;
    camera.add(plane);
    scene.add(camera);

    const onPointerMove = (event) => {
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      mouseTarget.set(
        THREE.MathUtils.clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
        1 - THREE.MathUtils.clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
      );
    };

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      // Keep the canvas CSS size; update only its drawing buffer.
      renderer.setSize(width, height, false);
      resolution.set(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      plane.scale.set(camera.aspect * 100, 100, 100);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("pointermove", onPointerMove);

    const seed = Math.random() * 360000;
    let lastFrame = performance.now();

    renderer.setAnimationLoop((now) => {
      const elapsed = Math.max(now - lastFrame, 0);
      lastFrame = now;
      // Preserve the original smoothing at 60 fps, including after inactive tabs.
      mouse.lerp(mouseTarget, 1 - Math.pow(0.95, elapsed / (1000 / 60)));

      material.uniforms.time.value = now + seed;

      camera.position.set(
        Math.cos((mouse.x - 0.5) * Math.PI * 0.25) * 5,
        Math.sin(-(mouse.y - 0.5) * Math.PI * 0.25) * 5,
        Math.sin((mouse.x - 0.5) * Math.PI * 0.25) * 5,
      );
      camera.lookAt(target);
      renderer.render(scene, camera);
    });

    // Also runs during development's Strict Mode effect cleanup.
    return () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      scene.clear();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
