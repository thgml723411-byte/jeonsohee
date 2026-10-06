"use client";

import { useEffect, useState } from "react";
import { acts } from "@/data/acts";
import styles from "./Header.module.css";

export default function Header() {
  const [active, setActive] = useState(acts[0].id);

  // 현재 화면 중앙에 있는 섹션을 활성화
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    acts.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.header}>
      <a href="#prologue" className={styles.logo}>
        STAGE<span>.</span>
      </a>
      <nav className={styles.nav} aria-label="섹션">
        {acts.map((a) => (
          <a
            key={a.id}
            href={`#${a.id}`}
            className={styles.link}
            aria-current={active === a.id ? "true" : undefined}
          >
            <small>{a.act}</small>
            {a.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
