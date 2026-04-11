"use client";
import React from 'react';
import Link from 'next/link';
import { Network, Search, Target, Users, Settings, Lock, Signal } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono flex flex-col justify-between overflow-hidden relative">
      
      {/* --- OVERLAYS TACTIQUES --- */}
      <div className="crt-overlay" /> 
      <div className="scanline" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,black_30%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* HEADER */}
      <header className="p-6 flex justify-between items-center border-b border-gray-900 bg-black/40 backdrop-blur-md z-50">
        <div className="tracking-[0.5em] font-black text-xs italic uppercase">NORD.VANTIX : Pulse</div>
        <div className="flex gap-10 items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <div>WATCHERS: 042 <span className="text-gray-700 animate-pulse">(LIVE)</span></div>
          <div>CLAN: NORD.VANTIX</div>
        </div>
      </header>

      {/* CENTRE : TITRE ET BOUTONS */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* TITRE PULSE GLITCHÉ */}
        <div className="relative text-center select-none group mb-16">
          <h1 className="text-8xl md:text-[14rem] font-bold text-white leading-none italic 
            animate-[glitch-text_0.5s_infinite_ease-out]
            shadow-[0_0_100px_rgba(168,85,247,0.3)]">
            PULSE
          </h1>
          <p className="text-[10px] md:text-xs tracking-[1em] text-gray-700 uppercase -mt-4 md:-mt-8">
            Tactical Operations Hub
          </p>
        </div>

        {/* BOUTONS */}
        <div className="flex flex-col md:flex-row gap-8 scale-110">
          <Link href="/terminal" 
            className="group relative px-20 py-5 bg-transparent text-white border-2 border-[#a855f7] 
            font-black tracking-[0.3em] text-[10px] uppercase overflow-hidden transition-all duration-300
            hover:border-[#facc15] hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            <span className="relative z-10">Watcher</span>
            <div className="absolute inset-0 bg-[#a855f7]/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </Link>

          <Link href="/cam?id=OPERATOR" 
            className="px-20 py-5 bg-black/60 text-gray-400 border border-gray-900
            font-black tracking-[0.3em] text-[10px] uppercase 
            transition-all duration-300 hover:text-white hover:border-gray-700 hover:scale-105 active:scale-95">
            Player
          </Link>
        </div>

        {/* GRILLE 3D (DECORATION) */}
        <div className="absolute inset-x-0 -bottom-48 h-full bg-grid opacity-20 pointer-events-none transform rotateX-60 perspective-1000 -z-10">
          <div className="grid-pin" style={{ left: '25%', top: '30%' }}><div className="grid-pin-ping" /></div>
          <div className="grid-pin" style={{ left: '75%', top: '65%' }}><div className="grid-pin-ping" /></div>
        </div>
      </div>

      {/* FOOTER AVEC TICKER FIXÉ */}
      <footer className="w-full bg-[#030303] border-t border-gray-900 z-50 p-6 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div className="flex gap-4 items-center text-gray-700">
          <Settings size={18} />
          <Users size={18} />
          <Target size={18} />
        </div>

        <div className="flex-1 overflow-hidden px-12">
          <div className="animate-ticker text-[9px] text-gray-600 font-bold uppercase tracking-[0.4em]">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="whitespace-nowrap flex gap-10 items-center mr-10">
                <span>[ENCRYPTION: <span className="text-green-500">AES-256 (ACTIVE)</span>]</span>
                <span>// SERVER_LATENCY: 14MS (<span className="text-green-500">OPTIMAL</span>) //</span>
                <span>ACTIVE_PLAYERS: <span className="text-white">12</span> //</span>
                <span>CLAN: NORD.VANTIX</span>
                <Lock size={12} className="text-gray-800" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 items-center text-gray-600">
          <Signal size={16} />
        </div>
      </footer>
    </main>
  );
}