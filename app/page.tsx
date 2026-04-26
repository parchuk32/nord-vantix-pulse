"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Radio, Lock, Unlock } from 'lucide-react';

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
    <main className="min-h-[calc(100vh-64px)] w-full bg-black flex flex-col items-center justify-center relative overflow-x-hidden overflow-y-auto font-mono py-12 px-4">
      
      {/* EFFET DE SOL */}
      <div className="grid-floor opacity-30" />
      
      <div className={`z-10 text-center space-y-8 md:space-y-12 transition-all duration-1000 w-full max-w-4xl ${bootSequence ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* LE MONOLITHE */}
        <div className="relative group">
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 pulse-monolith cursor-default">
            PULSE
          </h1>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] md:text-[10px] text-[#a855f7] tracking-[0.5em] md:tracking-[1em] font-black uppercase animate-pulse whitespace-nowrap">
            {isAuthenticated ? 'System_Authenticated' : 'Public_Access_Mode'}
          </div>
        </div>

        {/* NAVIGATION CENTRALE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-sm md:max-w-4xl mx-auto">
          
          <Link href="/terminal" className="group p-6 md:p-8 bg-black/40 backdrop-blur-xl border border-[#a855f7]/20 rounded-2xl hover:border-[#a855f7] transition-all flex flex-col items-center gap-4">
            <Radio size={28} className="text-[#a855f7] group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="block text-white font-black text-lg md:text-xl italic uppercase tracking-widest">Watcher_Hub</span>
              <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Connect to global nodes</span>
            </div>
          </Link>

          <button onClick={handleOperatorClick} className="group p-6 md:p-8 bg-white text-black rounded-2xl hover:scale-[1.02] md:hover:scale-105 transition-all text-left w-full flex flex-col items-center gap-4 shadow-xl">
            {isAuthenticated ? (
              <Unlock size={28} className="group-hover:rotate-12 transition-transform text-[#00FFC2]" />
            ) : (
              <Lock size={28} className="group-hover:rotate-12 transition-transform" />
            )}
            <div className="text-center">
              <span className="block font-black text-lg md:text-xl italic uppercase tracking-widest">Initialize_Ops</span>
              <span className="text-[8px] opacity-60 uppercase font-bold tracking-widest">
                {isAuthenticated ? 'Secure operator uplink' : 'Login Required'}
              </span>
            </div>
          </button>
        </div>

        {/* DATA FEED */}
        <div className="pt-6 md:pt-10 flex flex-wrap gap-4 md:gap-12 justify-center opacity-40">
           {['Encryption: AES-256', isAuthenticated ? 'Status: Authenticated' : 'Status: Public', 'Signal: 100%'].map((info, i) => (
             <div key={i} className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/50">{info}</div>
           ))}
        </div>
      </div>

      {/* EFFET DE SCANLINE */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(168,85,247,0.02),rgba(0,0,0,0),rgba(34,211,238,0.02))] bg-[size:100%_4px,3px_100%] z-30" />
    </main>
  );
}