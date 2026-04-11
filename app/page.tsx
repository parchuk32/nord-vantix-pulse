"use client";
import Link from 'next/link';
import { Lock, Signal, Shield, Activity, Database, Crosshair, Users, Settings, Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#020202] text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* 1. L'ENVIRONNEMENT (Grille qui bouge) */}
      <div className="moving-grid" />
      <div className="scanline-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />

      {/* 2. DATA PANELS FLOTTANTS (Style image_7) */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute top-20 left-10 p-4 border-l border-[#a855f7]/40 bg-black/40 backdrop-blur-sm animate-pulse">
          <div className="text-[8px] text-[#a855f7] uppercase font-black">System_Uplink</div>
          <div className="text-[10px] text-white mt-1">STATUS: ENCRYPTED</div>
          <div className="text-[10px] text-white">LATENCY: 14MS</div>
        </div>
        <div className="absolute bottom-40 right-10 p-4 border-r border-[#a855f7]/40 bg-black/40 backdrop-blur-sm">
           <div className="text-[8px] text-[#a855f7] uppercase font-black text-right">Global_Prize</div>
           <div className="text-xl text-white font-black italic">$1,244,500</div>
        </div>
      </div>

      {/* 3. HEADER */}
      <header className="p-8 flex justify-between items-center z-50 bg-gradient-to-b from-black to-transparent">
        <div className="tracking-[0.8em] font-black text-[10px] italic uppercase text-[#a855f7]">Nord.Vantix : Pulse</div>
        <div className="flex gap-10 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
           <div>Watchers: <span className="text-white animate-pulse">042</span></div>
           <div>Sector: <span className="text-white italic">Matawinie</span></div>
        </div>
      </header>

      {/* 4. LE CENTRE (L'ORB + PULSE) */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-30">
        
        {/* L'ORB ÉNERGÉTIQUE */}
        <div className="relative w-[450px] h-[450px] flex items-center justify-center">
          <div className="pulse-core" />
          <div className="orb-texture" />
          <div className="orb-texture" style={{ animationDuration: '30s', animationDirection: 'reverse', opacity: 0.5 }} />
          
          {/* LE TITRE AU MILIEU DE L'ORB */}
          <div className="relative text-center select-none z-10">
            <h1 className="text-[12rem] md:text-[16rem] font-black italic tracking-tighter leading-none text-white animate-[glitch-hard_0.3s_infinite_ease-out] drop-shadow-[0_0_50px_rgba(168,85,247,0.8)]">
              PULSE
            </h1>
            <div className="text-[10px] tracking-[1.8em] text-white uppercase -mt-8 font-black opacity-50 ml-4">
              Tactical Operations Hub
            </div>
          </div>
        </div>

        {/* BOUTONS STYLE TWITCH/CYBER */}
        <div className="flex flex-col md:flex-row gap-8 mt-12 z-40">
          <Link href="/terminal" className="px-20 py-5 border-2 border-[#a855f7] bg-[#a855f7]/10 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:bg-[#a855f7] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all">
            Watcher Hub
          </Link>
          <Link href="/register" className="px-20 py-5 border-2 border-white/20 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:text-white hover:border-white transition-all">
            Enlist (Agent)
          </Link>
        </div>
      </div>

      {/* 5. FOOTER TACTIQUE AVEC TICKER DYNAMIQUE */}
      <footer className="w-full bg-black/90 border-t border-white/5 p-8 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-8 text-gray-600">
            <Settings size={18} className="hover:text-[#a855f7] cursor-pointer" /> 
            <Users size={18} className="hover:text-[#a855f7] cursor-pointer" /> 
            <Target size={18} className="hover:text-[#a855f7] cursor-pointer" />
          </div>
          <div className="flex gap-12 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">ENCRYPTION: <span className="text-green-500">AES-256</span></div>
            <div className="flex items-center gap-2">SERVER: <span className="text-white">OPTIMAL</span></div>
          </div>
          <div className="flex gap-4 text-gray-600">
            <Activity size={18} /> <Signal size={18} />
          </div>
        </div>
        
        {/* LE TICKER (Défilement infini) */}
        <div className="w-full overflow-hidden border-t border-white/5 pt-4">
           <div className="flex gap-20 animate-ticker whitespace-nowrap text-[9px] text-gray-700 font-bold uppercase tracking-[0.5em]">
              <span>[SYSTEM_LOG] New Node detected in sector 04 // </span>
              <span>[MARKET] Gold: $2,341.52 (+0.4%) // BTC: $69,420 // </span>
              <span>[NETWORK] Signal strength 100% // No breaches detected // </span>
              <span>[AGENT] Tristan authorized // Session active // </span>
           </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-ticker { animation: ticker 30s linear infinite; display: inline-flex; }
      `}</style>
    </main>
  );
}