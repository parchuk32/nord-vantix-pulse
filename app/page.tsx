"use client";
import Link from 'next/link';
import { Shield, Lock, Activity, Settings, Users, Target, Signal, Eye, ChevronRight } from "lucide-react";

export default function PulseLandingPage() {
  return (
    <main className="relative w-screen h-screen bg-black text-white flex flex-col justify-between overflow-hidden font-mono">
      
      {/* ENVIRONNEMENT */}
      <div className="grid-floor" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />

      {/* HUD DATA SIDES */}
      <div className="absolute inset-0 z-20 pointer-events-none p-10 flex justify-between items-center opacity-60">
        <div className="border-l-2 border-violet-500 pl-4 bg-black/40 p-4">
          <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1">System_Uplink</div>
          <div className="text-xs font-bold text-green-500">STATUS: ENCRYPTED</div>
        </div>
        <div className="text-right border-r-2 border-violet-500 pr-4 bg-black/40 p-4">
          <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1">Global_Prize</div>
          <div className="text-2xl font-black italic text-white">$1,244,500</div>
        </div>
      </div>

      {/* HEADER */}
      <header className="p-8 flex justify-between items-center z-50">
        <div className="tracking-[0.8em] font-black text-xs italic uppercase text-white">NORD.VANTIX <span className="text-violet-500">:: PULSE</span></div>
        <div className="flex gap-10 text-[10px] text-gray-500 font-black uppercase tracking-widest">
           <div>WATCHERS: <span className="text-white animate-pulse">842</span></div>
           <div>CLAN: <span className="text-white">NORD.VANTIX</span></div>
        </div>
      </header>

      {/* CENTRE : MONOLITHE ET BOUTONS */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-30">
        <div className="flex flex-col items-center text-center select-none">
          
          {/* LE TITRE SANS OVERLAP */}
          <h1 className="pulse-monolith">PULSE</h1>
          
          {/* SOUS-TITRE REPOSITIONNÉ PROPREMENT */}
          <p className="text-[10px] md:text-xs tracking-[1.5em] text-violet-300 font-black uppercase mt-4 opacity-60">
            Tactical Operations Hub
          </p>

          {/* BOUTONS D'ACTION */}
          <div className="flex gap-6 mt-16 pointer-events-auto">
            <Link href="/terminal" className="px-14 py-4 bg-violet-600/20 border-2 border-violet-500 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:bg-violet-600 transition-all shadow-[0_0_50px_rgba(124,58,237,0.4)] active:scale-95 flex items-center gap-2">
              <Eye size={14} /> WATCHER
            </Link>
            <Link href="/register" className="px-14 py-4 border-2 border-white/10 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:text-white hover:border-white transition-all active:scale-95 flex items-center gap-2">
              <ChevronRight size={14} /> PLAYER
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-black/90 border-t border-white/5 p-8 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-8 text-gray-600">
            <Settings size={18} /> <Users size={18} /> <Target size={18} />
          </div>
          <div className="flex gap-10 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <div>ENCRYPTION: <span className="text-green-500">AES-256</span></div>
            <div>SECTOR: <span className="text-white">MATAWINIE</span></div>
          </div>
          <div className="flex gap-4 text-gray-600">
            <Activity size={18} /> <Signal size={18} /> <Lock size={18} />
          </div>
        </div>
      </footer>
    </main>
  );
}