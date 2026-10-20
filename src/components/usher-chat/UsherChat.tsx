"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usherGreeting, usherSuggestions } from "@/data/chatbot";
import styles from "./UsherChat.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** 공연장 안내원 챗봇 : 오른쪽 아래 버튼으로 열고 포트폴리오에 대해 묻는다. */
export default function UsherChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const ask = async (question: string) => {
    const text = question.trim();
    if (!text || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await response.json()) as { answer?: string };
      if (!response.ok || !data.answer) throw new Error();
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages([...next, {
        role: "assistant",
        content: "죄송해요, 관객 여러분. 지금은 안내 데스크 연결이 원활하지 않아요. 잠시 후 다시 물어봐 주세요.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <div className={styles.usher} data-open={open}>
      {open && (
        <section
          className={styles.panel}
          role="dialog"
          aria-label="공연 안내 데스크 챗봇"
          onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        >
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>Information Desk</p>
              <h2 className={styles.title}>공연 안내원</h2>
            </div>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="안내 데스크 닫기">×</button>
          </header>

          <div ref={logRef} className={styles.log} aria-live="polite">
            <p className={`${styles.bubble} ${styles.assistant}`}>{usherGreeting}</p>
            {messages.map((message, index) => (
              <p key={index} className={`${styles.bubble} ${styles[message.role]}`}>{message.content}</p>
            ))}
            {loading && (
              <p className={`${styles.bubble} ${styles.assistant} ${styles.typing}`} aria-label="안내원이 답변을 준비하고 있어요">
                <span /><span /><span />
              </p>
            )}
            {messages.length === 0 && (
              <ul className={styles.suggestions} aria-label="추천 질문">
                {usherSuggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button type="button" onClick={() => ask(suggestion)}>{suggestion}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form className={styles.form} onSubmit={submit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={500}
              placeholder="안내원에게 물어보세요"
              aria-label="질문 입력"
            />
            <button type="submit" disabled={!input.trim() || loading}>보내기</button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "안내 데스크 닫기" : "공연 안내원에게 물어보기"}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4Z" />
          <path d="M9 9.5h6M9 12h6M9 14.5h3.5" />
        </svg>
        <span>{open ? "닫기" : "안내 데스크"}</span>
      </button>
    </div>
  );
}
