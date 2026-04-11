"use client";
import Link from 'next/link';
import { Shield, Lock, Activity, Radio, TrendingUp, Zap, Signal, Users, Target, Settings, Eye, ChevronRight } from "lucide-react";

export default function PulseLandingPage() {
  return (
    <main className="relative w-screen h-screen bg-black text-white flex flex-col justify-between overflow-hidden font-mono">
      
      {/* 1. ENVIRONNEMENT (Grille qui bouge) */}
      <div className="grid-floor" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />

      {/* 2. HUD DATA (Visibilité Premium) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-10 flex justify-between items-center opacity-80">
        <div className="space-y-6">
          <div className="border-l-2 border-violet-500 pl-4 bg-black/40 p-4">
            <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1">System_Uplink</div>
            <div className="text-xs font-bold">STATUS: <span className="text-green-500">ENCRYPTED</span></div>
            <div className="text-xs text-gray-400">SESSION: EUE29PTFB</div>
          </div>
        </div>

        <div className="text-right border-r-2 border-violet-500 pr-4 bg-black/40 p-4">
          <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1">Global_Prize</div>
          <div className="text-3xl font-black italic tracking-tighter text-white">$1,244,500</div>
        </div>
      </div>

      {/* 3. HEADER */}
      <header className="p-8 flex justify-between items-center z-50">
        <div className="tracking-[0.8em] font-black text-xs italic uppercase text-white">NORD.VANTIX <span className="text-violet-500">:: PULSE</span></div>
        <div className="flex gap-10 text-[10px] text-gray-500 font-black uppercase tracking-widest">
           <div>WATCHERS: <span className="text-white animate-pulse">842</span></div>
           <div>CLAN: <span className="text-white">NORD.VANTIX</span></div>
        </div>
      </header>

      {/* 4. CENTRE : LE LOGO MONOLITHIQUE ET ÉRADIQUANT (Zéro Cercle) */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-30">
        <div className="relative flex flex-col items-center justify-center">
          
          {/* LE NOUVEAU LOGO PULSE */}
          <div className="relative text-center select-none z-10">
            <h1 className="pulse-monolith">PULSE</h1>
            <div className="text-[11px] tracking-[1.8em] text-white uppercase -mt-10 font-black opacity-50 ml-4">
              Tactical Operations Hub
            </div>

            {/* BOUTONS D'ACTION */}
            <div className="flex gap-6 mt-16 justify-center pointer-events-auto">
              <Link href="/terminal" className="px-14 py-4 bg-violet-600/20 border-2 border-violet-500 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:bg-violet-600 transition-all shadow-[0_0_60px_rgba(124,58,237,0.4)] active:scale-95">
                <Eye className="w-3 h-3 text-white" /> WATCHER
              </Link>
              <Link href="/register" className="px-14 py-4 border-2 border-white/10 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:text-white hover:border-white transition-all active:scale-95">
                <ChevronRight className="w-3 h-3 text-white" /> PLAYER
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FOOTER TACTIQUE AVEC TICKER */}
      <footer className="w-full bg-black/90 border-t border-white/5 p-8 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-8 text-gray-700">
            <Settings size={18} /> <Users size={18} /> <Target size={18} />
          </div>
          <div className="flex gap-10 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">ENCRYPTION: <span className="text-green-500">AES-256</span></div>
            <div className="flex items-center gap-2">SERVER: <span className="text-white">OPTIMAL</span></div>
          </div>
          <div className="flex gap-4 text-gray-600">
            <Activity size={18} /> <Signal size={18} /> <Lock size={18} />
          </div>
        </div>
        
        {/* LE TICKER (Défilement continu) */}
        <div className="w-full overflow-hidden border-t border-white/5 pt-4">
           <div className="flex gap-20 animate-ticker whitespace-nowrap text-[10px] text-gray-700 font-bold uppercase tracking-[0.5em]">
              <span>[SYSTEM_LOG] New Node detected // [MARKET] Gold: $3,118.90 // [NETWORK] Signal strength 100% // [AGENT] Tristan authorized // [STATUS] Clandestine session active //</span>
              <span>[SYSTEM_LOG] New Node detected // [MARKET] Gold: $3,118.90 // [NETWORK] Signal strength 100% // [AGENT] Tristan authorized // [STATUS] Clandestine session active //</span>
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