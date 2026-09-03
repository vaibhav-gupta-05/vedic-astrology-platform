import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vedic Astrology Platform — Precision Kundali Analysis",
  description: "Discover your cosmic blueprint through high-precision, hallucination-free Vedic astrological analysis powered by the Swiss Ephemeris and deterministic rule engine.",
  keywords: ["Vedic Astrology", "Kundali", "Horoscope", "Jyotish", "Birth Chart", "Yoga", "Dosha"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <div className="starfield" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
