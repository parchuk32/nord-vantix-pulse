import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "NORD.VANTIX :: PULSE — Tactical Operations Hub",
  description: "Clandestine tactical operations hub. Watchers & Players only.",
  robots: "noindex, nofollow",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%237c3aed'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistMono.variable}>
      {/* On ajoute font-mono ici pour forcer le look terminal partout */}
      <body className="font-mono antialiased bg-black text-white">
        {children}
      </body>
    </html>
  );
}