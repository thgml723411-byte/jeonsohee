"use client";

import { useState } from "react";
import styles from "./SeatBooking.module.css";

const rows = ["A", "B", "C", "D", "E", "F"];
const occupiedSeats = new Set([11, 12, 22, 23, 35, 36, 44, 45, 46]);

export default function SeatBooking() {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const seatNames = [...selectedSeats]
    .sort((a, b) => a - b)
    .map((index) => `${rows[Math.floor(index / 8)]}${index % 8 + 1}`);

  const toggleSeat = (index: number) => {
    if (occupiedSeats.has(index)) return;
    setSelectedSeats((selected) => selected.includes(index)
      ? selected.filter((seat) => seat !== index)
      : [...selected, index]);
  };

  return (
    <div className={styles.booking} data-seat-booking>
      <div className={styles.introduction}>
        <h3>공연 관람</h3>
        <p>작품을 둘러보고, 원하는 관람석을 골라보세요.</p>
      </div>

      <ul className={styles.legend} aria-label="좌석 상태 안내">
        <li><span className={styles.seat} aria-hidden="true" /><small>선택 가능</small></li>
        <li><span className={`${styles.seat} ${styles.selected}`} aria-hidden="true" /><small>선택</small></li>
        <li><span className={`${styles.seat} ${styles.occupied}`} aria-hidden="true" /><small>선택 불가</small></li>
      </ul>

      <fieldset className={styles.theater}>
        <legend className={styles.srOnly}>공연 관람석 선택</legend>
        <div className={styles.stage} aria-hidden="true"><span>STAGE</span></div>
        <div className={styles.seats}>
          {rows.map((row, rowIndex) => (
            <div key={row} className={styles.row} role="group" aria-label={`${row}열`}>
              {Array.from({ length: 8 }, (_, columnIndex) => {
                const index = rowIndex * 8 + columnIndex;
                const occupied = occupiedSeats.has(index);
                const selected = selectedSeats.includes(index);
                const name = `${row}${columnIndex + 1}`;
                return (
                  <button
                    key={name}
                    type="button"
                    className={styles.seatButton}
                    disabled={occupied}
                    aria-label={`${name}${occupied ? " · 선택 불가" : ""}`}
                    aria-pressed={occupied ? undefined : selected}
                    title={`${name}${occupied ? " · 선택 불가" : ""}`}
                    onClick={() => toggleSeat(index)}
                  >
                    <span className={`${styles.seat} ${selected ? styles.selected : ""} ${occupied ? styles.occupied : ""}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </fieldset>

      <p className={styles.summary} role="status" aria-live="polite" aria-atomic="true">
        선택한 관람석 <strong data-seat-count>{selectedSeats.length}</strong>석
        <span className={styles.seatNames}>
          {seatNames.length > 0 ? seatNames.join(" · ") : "객석을 눌러 관람석 선택을 체험해 보세요."}
        </span>
      </p>
    </div>
  );
}
