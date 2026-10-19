"use client";

import { useRef, useState } from "react";
import type { Work } from "@/types/portfolio";
import styles from "./SeatBooking.module.css";

const rows = ["A", "B", "C", "D", "E", "F"];
const initialOccupied = [11, 12, 22, 23, 35, 36, 44, 45, 46];

const seatName = (index: number) => `${rows[Math.floor(index / 8)]}${index % 8 + 1}`;

interface Booking {
  work: Work;
  seats: string[];
  date: string;
}

export type BookingStep = "seat" | "work";

interface SeatBookingProps {
  step: BookingStep;
  pickedWork: Work | null;
  onStepChange: (step: BookingStep) => void;
}

export default function SeatBooking({ step, pickedWork, onStepChange }: SeatBookingProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>(initialOccupied);
  const [booking, setBooking] = useState<Booking | null>(null);
  const seatNames = [...selectedSeats].sort((a, b) => a - b).map(seatName);

  const toggleSeat = (index: number) => {
    if (occupiedSeats.includes(index)) return;
    setSelectedSeats((selected) => selected.includes(index)
      ? selected.filter((seat) => seat !== index)
      : [...selected, index]);
  };

  const book = () => {
    if (selectedSeats.length === 0 || !pickedWork) return;
    const today = new Date();
    setBooking({
      work: pickedWork,
      seats: seatNames,
      date: `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`,
    });
    setOccupiedSeats((occupied) => [...occupied, ...selectedSeats]);
    setSelectedSeats([]);
    onStepChange("seat");
    dialogRef.current?.showModal();
  };

  return (
    <div className={styles.booking} data-seat-booking>
      <ol className={styles.steps} aria-label="관람 순서">
        <li data-done={step === "work"} aria-current={step === "seat" ? "step" : undefined}><span>1</span>좌석 선택</li>
        <li data-done={pickedWork !== null} aria-current={step === "work" ? "step" : undefined}><span>2</span>작품 고르기</li>
        <li data-done={false}><span>3</span>입장</li>
      </ol>

      <div className={styles.introduction}>
        <p className={styles.eyebrow}>{step === "seat" ? "Step 1 · Seat" : "Step 2 · Program"}</p>
        <h3>{step === "seat" ? "관람석을 골라주세요" : "관람할 작품을 골라주세요"}</h3>
        <p>
          {step === "seat"
            ? "공연장에 오신 것을 환영합니다. 먼저 원하는 좌석을 선택하세요."
            : "옆의 티켓을 넘겨보고, 마음에 드는 작품에서 「관람하기」를 눌러주세요."}
        </p>
      </div>

      <ul className={styles.legend} aria-label="좌석 상태 안내">
        <li><span className={styles.seat} aria-hidden="true" /><small>선택 가능</small></li>
        <li><span className={`${styles.seat} ${styles.selected}`} aria-hidden="true" /><small>선택</small></li>
        <li><span className={`${styles.seat} ${styles.occupied}`} aria-hidden="true" /><small>예매 완료</small></li>
      </ul>

      <fieldset className={styles.theater} disabled={step === "work"}>
        <legend className={styles.srOnly}>공연 관람석 선택</legend>
        <div className={styles.stage} aria-hidden="true"><span>STAGE</span></div>
        <div className={styles.seats}>
          {rows.map((row, rowIndex) => (
            <div key={row} className={styles.row} role="group" aria-label={`${row}열`}>
              {Array.from({ length: 8 }, (_, columnIndex) => {
                const index = rowIndex * 8 + columnIndex;
                const occupied = occupiedSeats.includes(index);
                const selected = selectedSeats.includes(index);
                const name = seatName(index);
                return (
                  <button
                    key={name}
                    type="button"
                    className={styles.seatButton}
                    disabled={occupied}
                    aria-label={`${name}${occupied ? " · 예매 완료" : ""}`}
                    aria-pressed={occupied ? undefined : selected}
                    title={`${name}${occupied ? " · 예매 완료" : ""}`}
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
          {seatNames.length > 0 ? seatNames.join(" · ") : "객석을 눌러 관람석을 선택해 보세요."}
        </span>
      </p>

      {step === "seat" ? (
        <button
          type="button"
          className={styles.bookButton}
          disabled={selectedSeats.length === 0}
          onClick={() => onStepChange("work")}
        >
          {selectedSeats.length > 0 ? "다음 · 작품 고르기 →" : "좌석을 선택해 주세요"}
        </button>
      ) : (
        <>
          <div className={styles.pickedWork} aria-live="polite">
            <small>관람 작품</small>
            <strong>{pickedWork ? pickedWork.title : "아직 고르지 않았어요"}</strong>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.backButton} onClick={() => onStepChange("seat")}>
              ← 좌석 변경
            </button>
            <button type="button" className={styles.bookButton} disabled={!pickedWork} onClick={book}>
              {pickedWork ? "예매하기" : "작품을 골라주세요"}
            </button>
          </div>
        </>
      )}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="booking-dialog-title"
        onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
      >
        {booking && (
          <div className={styles.confirm}>
            <div className={styles.confirmMain}>
              <p className={styles.eyebrow}>Admission Ticket</p>
              <h4 id="booking-dialog-title">예매가 완료되었습니다</h4>
              <dl className={styles.confirmInfo}>
                <div><dt>공연</dt><dd>{booking.work.title}</dd></div>
                <div><dt>장르</dt><dd>{booking.work.category}</dd></div>
                <div><dt>좌석</dt><dd>{booking.seats.join(" · ")}</dd></div>
                <div><dt>관람일</dt><dd>{booking.date}</dd></div>
              </dl>
              <p className={styles.greeting}>✦ 즐거운 관람 되세요 ✦</p>
              <p className={styles.notice}>곧 막이 오릅니다. 입장하시면 실제 작품 사이트로 이동합니다.</p>
            </div>
            <div className={styles.confirmActions}>
              {booking.work.href ? (
                <a
                  className={styles.enter}
                  href={booking.work.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => dialogRef.current?.close()}
                >
                  입장하기 ↗
                </a>
              ) : (
                <span className={styles.enterDisabled}>Coming Soon</span>
              )}
              <button type="button" className={styles.later} onClick={() => dialogRef.current?.close()}>
                다른 작품 더 보기
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
