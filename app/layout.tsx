import type { Metadata } from "next";
import { Inter, Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Abdu Academy - Master the Markets",
  description:
    "Premium forex trading education. Master the markets with structured, professional content from fundamentals to advanced strategies.",
  keywords: [
    "forex",
    "trading",
    "education",
    "course",
    "forex trading",
    "forex course",
    "trading academy",
    "financial markets",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${geist.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans bg-background text-foreground h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
