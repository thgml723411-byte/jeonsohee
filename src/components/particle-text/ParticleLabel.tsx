/** Keep native text layout and accessibility; the section canvas handles hover. */
export default function ParticleLabel({ text }: { text: string }) {
  return <span data-particle-text>{text}</span>;
}
