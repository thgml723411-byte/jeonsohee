import Header from "@/components/layout/Header";
import Spotlight from "@/components/layout/Spotlight";
import CurtainIntro from "@/components/layout/CurtainIntro";
import Hero from "@/components/sections/Hero";
import Profile from "@/components/sections/Profile";
import Skills from "@/components/sections/Skills";
import Works from "@/components/sections/Works";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <CurtainIntro />
      <Spotlight />
      <Header />
      <main>
        <Hero />
        <Profile />
        <Skills />
        <Works />
        <Contact />
      </main>
    </>
  );
}
