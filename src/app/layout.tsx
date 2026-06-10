import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career Intelligence",
  description: "Work out what you want — then get it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
