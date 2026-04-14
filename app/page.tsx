"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Radio, Lock, Unlock, Zap } from 'lucide-react'; // Zap ajouté ici

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function NordVantixHome() {
  const router = useRouter();
  const [bootSequence, setBootSequence] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setBootSequence(true);
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOperatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/operator');
    } else {
      router.push('/register');
    }
  };

  return (
    // FIX MOBILE : justify-start + py-12 pour permettre le scroll et éviter l'écrasement
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-start md:justify-center relative overflow-x-hidden overflow-y-auto font-mono py-12 px-4">
      
      {/* EFFET DE SOL */}
      <div className="grid-floor opacity-30" />
      
      {/* OVERLAY DE SCAN TACTIQUE - Masqué sur mobile pour gagner de la place */}
      <div className="absolute inset-0 pointer-events-none border-[10px] md:border-[20px] border-white/5 z-20 hidden sm:block" />
      
      <div className={`z-10 text-center space-y-8 md:space-y-12 transition-all duration-1000 w-full max-w-6xl ${bootSequence ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* LE MONOLITHE (LOGO) */}
        <div className="relative group mb-4 md:mb-0">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 pulse-monolith cursor-default">
            PULSE
          </h1>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-[#a855f7] tracking-[0.5em] md:tracking-[1em] font-black uppercase animate-pulse whitespace-nowrap">
            {isAuthenticated ? 'System_Authenticated' : 'Public_Access_Mode'}
          </div>
        </div>

        {/* NAVIGATION CENTRALE - 3 Colonnes sur PC, 1 sur Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-sm md:max-w-5xl mx-auto px-2">
          
          {/* WATCHER_HUB */}
          <Link href="/terminal" className="group p-6 bg-black/40 backdrop-blur-xl border border-[#a855f7]/20 rounded-2xl hover:border-[#a855f7] transition-all flex flex-col items-center gap-4">
            <Radio size={28} className="text-[#a855f7] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="block text-white font-black text-sm md:text-lg italic uppercase tracking-widest">Watcher_Hub</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Connect to nodes</span>
            </div>
          </Link>

          {/* RANKINGS */}
          <Link href="/rankings" className="group p-6 bg-black/40 backdrop-blur-xl border border-[#00FFC2]/20 rounded-2xl hover:border-[#00FFC2] transition-all flex flex-col items-center gap-4">
            <Zap size={28} className="text-[#00FFC2] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="block text-white font-black text-sm md:text-lg italic uppercase tracking-widest">Global_Rank</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Agent Standings</span>
            </div>
          </Link>

          {/* INITIALIZE_OPS */}
          <button onClick={handleOperatorClick} className="group p-6 bg-white text-black rounded-2xl hover:scale-[1.02] transition-all flex flex-col items-center gap-4 shadow-xl w-full">
            {isAuthenticated ? (
              <Unlock size={28} className="text-[#00FFC2] group-hover:rotate-12 transition-transform" />
            ) : (
              <Lock size={28} className="group-hover:rotate-12 transition-transform" />
            )}
            <div className="text-center">
              <span className="block font-black text-sm md:text-lg italic uppercase tracking-widest">Initialize_Ops</span>
              <span className="text-[8px] opacity-60 uppercase font-bold tracking-widest">
                {isAuthenticated ? 'Secure Uplink' : 'Login Required'}
              </span>
            </div>
          </button>
        </div>

        {/* DATA FEED (BAS DE PAGE) */}
        <div className="pt-6 md:pt-10 flex flex-wrap gap-4 md:gap-12 justify-center opacity-40 px-4">
           {['Encryption: AES-256', isAuthenticated ? 'Status: Authenticated' : 'Status: Public', 'Signal: 100%'].map((info, i) => (
             <div key={i} className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/50 border border-white/5 px-2 py-1 md:border-none">
               {info}
             </div>
           ))}
        </div>
      </div>

      {/* EFFET DE SCANLINE */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(168,85,247,0.02),rgba(0,0,0,0),rgba(34,211,238,0.02))] bg-[size:100%_4px,3px_100%] z-30" />
    </main>
  );
}