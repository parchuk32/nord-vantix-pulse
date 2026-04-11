"use client";
import Link from 'next/link';
import React from 'react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono flex flex-col justify-between overflow-hidden relative">
      
      {/* HEADER */}
      <header className="p-6 flex justify-between items-center border-b border-gray-900/50 bg-black/20 backdrop-blur-md z-20">
        <div className="tracking-[0.3em] font-bold text-sm">NORD.VANTIX</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Watchers Online:</span>
          <span className="text-sm font-bold tracking-tighter">042</span>
        </div>
      </header>

      {/* CENTRE : PULSE & BOUTONS */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        
        {/* Aura Violette (Derrière le texte) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[400px] h-[400px] bg-[#a855f7]/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        {/* Titre PULSE */}
        <div className="relative z-10 mb-16 text-center">
          <h1 className="text-8xl md:text-[12rem] font-black tracking-[-0.05em] opacity-40 select-none italic text-gray-400">
            PULSE
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
             <h1 className="text-8xl md:text-[12rem] font-black tracking-[-0.05em] text-white italic drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              PULSE
            </h1>
          </div>
        </div>

        {/* BOUTONS */}
        <div className="flex gap-8 z-20">
          <Link href="/terminal" className="px-12 py-4 bg-[#a855f7] text-white rounded-xl font-bold tracking-[0.2em] text-sm uppercase hover:shadow-[0_0_20px_#a855f7] transition-all hover:scale-105 active:scale-95">
            Watcher
          </Link>
          <Link href="/cam?id=GHOST" className="px-12 py-4 bg-gray-300 text-black rounded-xl font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-all hover:scale-105 active:scale-95">
            Player
          </Link>
        </div>
      </div>

      {/* FOOTER : Ticker défilant technique */}
      <footer className="w-full bg-black border-t border-[#a855f7]/30 py-4 z-20">
        <div className="flex whitespace-nowrap overflow-hidden group">
          <div className="flex animate-ticker gap-10">
            <TickerText />
            <TickerText />
            <TickerText />
          </div>
        </div>
      </footer>

      {/* Animation CSS pour le ticker */}
      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </main>
  );
}

function TickerText() {
  return (
    <span className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase flex gap-10">
      <span>2,184.20 (+0.42%) // USD/JPY: 151.62 (-0.12%)</span>
      <span className="text-[#a855f7] font-bold">[LIVE] PLAYER_042 ACCEPTED "EXTREME_PARKOUR"</span>
      <span>CURRENT__POT: $15,000 // ENCRYPTION: AES-256</span>
      <span>SERVER__LATENCY: 14MS // CLAN: NORD.VANTIX</span>
    </span>
  );
}