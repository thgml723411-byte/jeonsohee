import type { Metadata } from "next";
import ParticleText from "@/components/particle-text/ParticleText";

export const metadata: Metadata = {
  title: "Particle Text",
  description: "Interactive glowing text particles with PNG export.",
};

export default function ParticleTextPage() {
  return <ParticleText />;
}
