import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";

// 영문 디스플레이 — 극장 포스터 느낌의 세리프
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

// 한글 세리프 — 대사/인용
const serif = Noto_Serif_KR({
  variable: "--font-serif",
  weight: ["400", "700"],
  preload: false,
});

// 본문
const sans = Noto_Sans_KR({
  variable: "--font-sans",
  weight: ["300", "400", "500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "STAGE — Portfolio",
  description: "무대 컨셉 포트폴리오",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${display.variable} ${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
