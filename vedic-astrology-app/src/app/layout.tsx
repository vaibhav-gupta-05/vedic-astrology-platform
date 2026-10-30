import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import Watermark from "@/components/Watermark";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientProviders>
          <div className="saffron-bar" aria-hidden="true" />
          <Watermark />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
