"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CopyButton.module.css";

/** 텍스트를 클립보드에 복사하고 잠깐 완료 안내를 띄운다. */
export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 클립보드 API를 쓸 수 없는 환경(비보안 연결 등)용 대체 방법
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span className={styles.wrap}>
      <button type="button" className={styles.button} onClick={copy} aria-label={label} title={label}>
        {copied ? (
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
            <path d="M15.5 8.5V5.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3" />
          </svg>
        )}
      </button>
      <span className={styles.toast} data-show={copied} role="status" aria-live="polite">
        {copied ? "이메일 주소가 복사되었습니다" : ""}
      </span>
    </span>
  );
}
