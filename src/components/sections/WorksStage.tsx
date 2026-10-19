"use client";

import { useRef, useState } from "react";
import type { Work } from "@/types/portfolio";
import TicketCarousel from "@/components/ticket-carousel/TicketCarousel";
import SeatBooking, { type BookingStep } from "@/components/seat-booking/SeatBooking";
import styles from "./Works.module.css";

/** 관람석 선택 → 작품 티켓 고르기 → 입장으로 이어지도록 두 영역의 상태를 잇는다. */
export default function WorksStage({ works }: { works: Work[] }) {
  const ticketsRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [step, setStep] = useState<BookingStep>("seat");
  const [picked, setPicked] = useState<number | null>(null);

  const changeStep = (next: BookingStep) => {
    setStep(next);
    setPicked(null);
    // 한 줄 레이아웃에서는 티켓이 좌석 아래에 있으므로 작품 고르기 단계에서 티켓으로 이동한다.
    if (next === "work" && window.matchMedia("(max-width: 1100px)").matches) {
      ticketsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.seating} aria-label="관람석 예매">
        <SeatBooking
          step={step}
          pickedWork={picked === null ? null : works[picked]}
          onStepChange={changeStep}
        />
      </aside>
      <div ref={ticketsRef} className={styles.tickets} data-picking={step === "work"}>
        {step === "work" && (
          <p className={styles.pickGuide}>
            <span>STEP 2</span> 티켓을 넘겨보고 관람할 작품을 골라주세요
          </p>
        )}
        <TicketCarousel works={works} onSelectedChange={setSelected} />
        {step === "work" && (
          <div className={styles.pickBar}>
            <button
              type="button"
              className={styles.pickButton}
              aria-pressed={picked === selected}
              onClick={() => setPicked(selected)}
            >
              {picked === selected ? `✓ 「${works[selected].title}」 선택됨` : `「${works[selected].title}」 관람하기`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
