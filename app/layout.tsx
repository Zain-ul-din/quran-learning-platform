import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LocalFont from "next/font/local";

import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OpenAISessionProvider } from "@/components/providers/openai-session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const arabicFont = LocalFont({
  src: "../app/fonts/indopak-nastaleeq-v4.2.1.woff2",
  variable: "--font-arabic",
  display: "swap",
  fallback: ["serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  applicationName: "Quran Learning Platform",
  title: {
    default: "Quran Learning Platform | Learn, Read & Recite",
    template: "%s | Quran Learning Platform",
  },
  description:
    "A free, open-source Quran learning platform. Choose a surah, read each ayah, and practise your recitation. See how it works and contribute on GitHub.",
  keywords: [
    "Quran learning",
    "learn Quran online",
    "Quran recitation practice",
    "read Quran",
    "Quran Arabic",
    "open source Quran app",
  ],
  openGraph: {
    type: "website",
    siteName: "Quran Learning Platform",
    title: "Quran Learning Platform | Learn, Read & Recite",
    description:
      "Learn by choosing a surah, reading each ayah, and practising your recitation. Fully open source on GitHub.",
  },
  twitter: {
    card: "summary",
    title: "Quran Learning Platform | Learn, Read & Recite",
    description:
      "Learn by choosing a surah, reading each ayah, and practising your recitation. Fully open source on GitHub.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${arabicFont.variable} font-sans ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>
            <OpenAISessionProvider>{children}</OpenAISessionProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
