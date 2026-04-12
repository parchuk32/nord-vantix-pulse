"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  Shield, Lock, Activity, Settings, Users, Target, 
  Signal, Eye, ChevronRight, Terminal, Database, RefreshCw 
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function PulseLandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logs, setLogs] = useState<string[]>(["SYSTEM READY", "AWAITING AUTHENTICATION..."]);
  const [prize, setPrize] = useState(1244500);

  // 1. MÉMOIRE DE SESSION (Reste connecté si pas de logout)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        addLog(`AGENT DETECTED: ${session.user.email?.split('@')[0].toUpperCase()}`);
      }
    };
    checkSession();
  }, []);

  // 2. MOTEUR DE LOGS (Pour donner du "purpose" aux clics)
  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  const handleAction = (name: string, action: () => void) => {
    addLog(`INITIALIZING ${name.toUpperCase()}...`);
    setTimeout(action, 500);
  };

  return (
    <main className="relative w-screen h-screen bg-black text-white flex flex-col justify-between overflow-hidden font-mono">
      
      {/* ENVIRONNEMENT ANIMÉ */}
      <div className="grid-floor" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10 pointer-events-none" />

      {/* HUD HAUT : DATA CLIQUABLE */}
      <div className="absolute inset-0 z-20 pointer-events-none p-10 flex justify-between items-start">
        {/* Uplink Status */}
        <button 
          onClick={() => addLog("REFRESHING NETWORK CLEARANCE...")}
          className="pointer-events-auto border-l-2 border-violet-500 pl-4 bg-black/40 p-4 hover:bg-violet-900/20 transition-all text-left"
        >
          <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1 flex items-center gap-2">
            <Signal size={12} /> System_Uplink
          </div>
          <div className={`text-xs font-bold ${isLoggedIn ? 'text-green-500' : 'text-amber-500'}`}>
            {isLoggedIn ? "ONLINE // AUTH_VALID" : "STANDBY // ENCRYPTED"}
          </div>
        </button>

        {/* Global Prize cliquable (Simule une mise à jour) */}
        <button 
          onClick={() => { setPrize(prev => prev + 150); addLog("BOUNTY UPDATE DETECTED (+150$)"); }}
          className="pointer-events-auto text-right border-r-2 border-violet-500 pr-4 bg-black/40 p-4 hover:bg-violet-900/20 transition-all"
        >
          <div className="text-[10px] text-violet-400 font-black tracking-widest uppercase mb-1">Global_Prize</div>
          <div className="text-2xl font-black italic text-white">${prize.toLocaleString()}</div>
        </button>
      </div>

      {/* HEADER */}
      <header className="p-8 flex justify-between items-center z-50">
        <div className="tracking-[0.8em] font-black text-xs italic uppercase text-white">NORD.VANTIX <span className="text-violet-500">:: PULSE</span></div>
        <div className="flex gap-10 text-[10px] text-gray-500 font-black uppercase tracking-widest">
           <button onClick={() => addLog("SCANNING ACTIVE WATCHERS...")} className="hover:text-white">WATCHERS: <span className="text-white animate-pulse">842</span></button>
           <button onClick={() => addLog("CLAN STATUS: DOMINANT")} className="hover:text-white">CLAN: <span className="text-white">NORD.VANTIX</span></button>
        </div>
      </header>

      {/* CENTRE : MONOLITHE ET BOUTONS PRINCIPAUX */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-30">
        <div className="flex flex-col items-center text-center select-none">
          <h1 className="pulse-monolith">PULSE</h1>
          <p className="text-[10px] tracking-[1.5em] text-violet-300 font-black uppercase mt-4 opacity-60">Tactical Operations Hub</p>

          <div className="flex gap-6 mt-16 pointer-events-auto">
            {/* BOUTON WATCHER */}
            <Link href="/terminal" className="px-14 py-4 bg-violet-600/20 border-2 border-violet-500 text-white font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:bg-violet-600 transition-all shadow-[0_0_50px_rgba(124,58,237,0.4)] active:scale-95 flex items-center gap-2">
              <Eye size={14} /> WATCHER
            </Link>
            
            {/* BOUTON PLAYER (Dynamique selon session) */}
            <button 
              onClick={() => isLoggedIn ? router.push('/terminal') : router.push('/register')}
              className="px-14 py-4 border-2 border-white/10 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-[0.4em] rounded-full hover:text-white hover:border-white transition-all active:scale-95 flex items-center gap-2"
            >
              <ChevronRight size={14} /> {isLoggedIn ? "RESUME_OPS" : "PLAYER_ENLIST"}
            </button>
          </div>
        </div>
      </div>

      {/* MINI TERMINAL DE LOGS (Bottom Left) */}
      <div className="absolute bottom-32 left-8 z-50 pointer-events-none opacity-50">
        <div className="text-[9px] font-bold text-violet-500 mb-2 flex items-center gap-2">
          <Terminal size={10} /> LIVE_FEED:
        </div>
        {logs.map((log, i) => (
          <div key={i} className="text-[8px] text-gray-500 uppercase tracking-tighter mb-1">
            {`> ${log}`}
          </div>
        ))}
      </div>

      {/* FOOTER INTERACTIF */}
      <footer className="w-full bg-black/90 border-t border-white/5 p-8 z-50">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-8 text-gray-600">
            <button onClick={() => handleAction('settings', () => addLog("ERROR: CONFIG_LOCKED"))} className="hover:text-violet-400"><Settings size={18} /></button>
            <button onClick={() => handleAction('users', () => router.push('/agent/list'))} className="hover:text-violet-400"><Users size={18} /></button>
            <button onClick={() => handleAction('target', () => addLog("TARGET: GOLD_XAUUSD"))} className="hover:text-violet-400"><Target size={18} /></button>
          </div>
          
          <div className="flex gap-10 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <button onClick={() => addLog("ENCRYPTION: AES-256-GCM")}>ENCRYPTION: <span className="text-green-500">AES-256</span></button>
            <button onClick={() => addLog("LOCATION: LANAUDIERE_NODE")}>SECTOR: <span className="text-white">MATAWINIE</span></button>
          </div>

          <div className="flex gap-4 text-gray-600">
            <button onClick={() => handleAction('activity', () => addLog("SYNCING TRADING DATA..."))} className="hover:text-violet-400"><Activity size={18} /></button>
            <button onClick={() => handleAction('signal', () => addLog("PING: 14MS"))} className="hover:text-violet-400"><Signal size={18} /></button>
            <button 
              onClick={() => {
                if(isLoggedIn) {
                  supabase.auth.signOut().then(() => { setIsLoggedIn(false); addLog("SESSION TERMINATED"); });
                } else {
                  router.push('/register');
                }
              }} 
              className={`transition-colors ${isLoggedIn ? 'text-red-500 hover:text-red-400' : 'hover:text-violet-400'}`}
            >
              <Lock size={18} />
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}