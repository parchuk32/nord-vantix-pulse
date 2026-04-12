import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";
import "./globals.css";

// 1. CHARGEMENT OPTIMISÉ DE LA POLICE TACTIQUE
const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono", // On utilise ce nom pour que ton Tailwind le reconnaisse direct
  display: "swap",
});

// 2. MÉTADONNÉES DU RÉSEAU
export const metadata: Metadata = {
  title: "NORD.VANTIX :: PULSE — Tactical Operations Hub",
  description: "Clandestine tactical operations streaming hub.",
  robots: { index: false, follow: false }, // Indétectable par les moteurs de recherche
  other: {
    "theme-color": "#000008",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 3. INJECTION DANS LE HTML
    <html lang="en" className={shareTechMono.variable}>
      <body className="font-mono bg-black text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}