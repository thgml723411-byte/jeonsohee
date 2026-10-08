import type { Metadata } from "next";
import ThreeSmoke from "@/components/three-smoke/ThreeSmoke";
import styles from "@/components/three-smoke/ThreeSmoke.module.css";

export const metadata: Metadata = {
  title: "Three.js Smoke",
  description: "Three.js 연기 배경 애니메이션",
};

export default function ThreeSmokePage() {
  return (
    <main>
      <ThreeSmoke className={styles.fullscreen} />
    </main>
  );
}
