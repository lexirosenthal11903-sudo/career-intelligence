import type { Metadata } from "next";
import { Instrument_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import CookieBanner from "@/components/CookieBanner";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--f",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--fm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Meridian",
  description: "Work out what you want — then get it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSans.variable} ${dmMono.variable}`}>
      <body style={{ fontFamily: "var(--f, system-ui, sans-serif)" }}>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
