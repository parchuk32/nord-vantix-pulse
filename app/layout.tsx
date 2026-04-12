import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // 1. Importe ton nouveau Header ici

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NORD.VANTIX :: PULSE — Tactical Operations Hub",
  description: "Clandestine tactical operations streaming hub.",
  robots: { index: false, follow: false },
  other: {
    "theme-color": "#000008",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={shareTechMono.variable}>
      <body className="font-mono bg-black text-white antialiased overflow-x-hidden min-h-screen flex flex-col">
        
        {/* 2. On place le Header tout en haut */}
        <Header /> 

        {/* 3. Le contenu (children) prend le reste de la place */}
        <main className="flex-1 w-full">
          {children}
        </main>

      </body>
    </html>
  );
}