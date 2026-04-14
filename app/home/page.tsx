"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Radio, Lock, Unlock } from 'lucide-react';

// Initialisation de Supabase
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

    // 1. Vérifie si l'utilisateur est DÉJÀ connecté au chargement de la page
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // 2. Écoute les changements (se connecte ou se déconnecte en temps réel)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fonction pour bloquer l'accès à la zone Opérateur
  const handleOperatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push('/operator'); // Autorisé
    } else {
      router.push('/register'); // Bloqué -> Redirigé vers connexion/inscription
    }
  };

  return (
    <main className="h-[calc(100vh-64px)] w-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono">
      {/* EFFET DE SOL */}
      <div className="grid-floor opacity-30" />
      
      {/* OVERLAY DE SCAN TACTIQUE */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-white/5 z-20" />
      
      <div className={`z-10 text-center space-y-12 transition-all duration-1000 ${bootSequence ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        
        {/* LE MONOLITHE */}
        <div className="relative group">
          <h1 className="pulse-monolith cursor-default">
            PULSE
          </h1>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-[#a855f7] tracking-[1em] font-black uppercase animate-pulse">
            {isAuthenticated ? 'System_Authenticated' : 'Public_Access_Mode'}
          </div>
        </div>

        {/* NAVIGATION CENTRALE STYLE "COMMAND CENTER" */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-6">
          
          {/* ACCÈS WATCHER (100% PUBLIC) */}
          <Link href="/terminal" className="group p-8 bg-black/40 backdrop-blur-xl border border-[#a855f7]/20 rounded-2xl hover:border-[#a855f7] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <div className="flex flex-col items-center gap-4">
              <Radio size={32} className="text-[#a855f7] group-hover:scale-110 transition-transform" />
              <div>
                <span className="block text-white font-black text-xl italic uppercase tracking-widest">Watcher_Hub</span>
                <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Connect to global nodes</span>
              </div>
            </div>
          </Link>

          {/* ACCÈS OPERATOR (PRIVÉ / PROTÉGÉ) */}
          <button onClick={handleOperatorClick} className="group p-8 bg-white text-black rounded-2xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] text-left w-full">
            <div className="flex flex-col items-center gap-4">
              
              {/* L'ICÔNE CHANGE ICI EN FONCTION DE L'AUTHENTIFICATION */}
              {isAuthenticated ? (
                <Unlock size={32} className="group-hover:rotate-12 transition-transform text-[#00FFC2]" />
              ) : (
                <Lock size={32} className="group-hover:rotate-12 transition-transform" />
              )}

              <div className="text-center">
                <span className="block font-black text-xl italic uppercase tracking-widest">Initialize_Ops</span>
                <span className="text-[9px] opacity-60 uppercase font-bold tracking-widest">
                  {isAuthenticated ? 'Secure operator uplink' : 'Login Required'}
                </span>
              </div>
            </div>
          </button>
          
        </div>

        {/* DATA FEED (Bas de page) */}
        <div className="pt-10 flex gap-12 justify-center opacity-40">
           {['Encryption: AES-256', isAuthenticated ? 'Status: Authenticated' : 'Status: Public', 'Signal: 100%'].map((info, i) => (
             <div key={i} className="text-[8px] font-black uppercase tracking-[0.4em] text-white/50">{info}</div>
           ))}
        </div>
      </div>

      {/* EFFET DE SCANLINE CSS */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(168,85,247,0.02),rgba(0,0,0,0),rgba(34,211,238,0.02))] bg-[size:100%_4px,3px_100%] z-30" />
    </main>
  );
}