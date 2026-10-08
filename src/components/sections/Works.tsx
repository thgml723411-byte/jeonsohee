import { works } from "@/data/works";
import Section from "@/components/common/Section";
import TicketCarousel from "@/components/ticket-carousel/TicketCarousel";
import SeatBooking from "@/components/seat-booking/SeatBooking";
import styles from "./Works.module.css";

/** Act III — The Program : 작품 티켓과 선택적인 관람석 체험 */
export default function Works() {
  return (
    <Section id="program" className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.tickets}>
          <TicketCarousel works={works} />
        </div>
        <aside className={styles.seating} aria-label="관람석 선택 체험">
          <SeatBooking />
        </aside>
      </div>
    </Section>
  );
}
