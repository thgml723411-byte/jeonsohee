import type { CSSProperties } from "react";
import styles from "./WaveText.module.css";

/** Animate glyphs without changing the line wrapping around the portrait. */
export default function WaveText({ text }: { text: string }) {
  let characterIndex = 0;

  return (
    <span className={styles.wave}>
      <span className={styles.accessible}>{text}</span>
      <span aria-hidden="true">
        {text.split(/(\s+)/u).map((word, wordIndex) => {
          if (/^\s+$/u.test(word)) return word;

          return (
            <span key={wordIndex} className={styles.word}>
              {Array.from(word).map((character) => {
                const index = characterIndex++;
                return (
                  <span
                    key={index}
                    className={styles.character}
                    style={{ "--wave-index": index } as CSSProperties}
                  >
                    {character}
                  </span>
                );
              })}
            </span>
          );
        })}
      </span>
    </span>
  );
}
