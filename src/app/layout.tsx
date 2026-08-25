import type { Metadata } from "next";
import { Crimson_Pro, Inter } from "next/font/google";

import "./globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Biblia — Traducción contextual",
  description:
    "Traducción de la Biblia basada en la intención del autor y el contexto de cada texto.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
