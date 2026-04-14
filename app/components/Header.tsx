"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Lock, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialisation de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérification de la session en temps réel
  useEffect(() => {
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

  // Définition des onglets
  const navItems = [
    { name: 'HOME', path: '/', isPublic: true },
    { name: 'WATCHER', path: '/terminal', isPublic: true },
    { name: 'PLAYERS', path: '/operator', isPublic: false },
    { name: 'RANKINGS', path: '/rankings', isPublic: false },
  ];

  // Bloquer l'accès aux onglets privés
  const handleNavClick = (e: React.MouseEvent, isPublic: boolean) => {
    if (!isPublic && !isAuthenticated) {
      e.preventDefault(); 
      router.push('/register'); 
    }
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="w-full h-16 bg-[#050505] border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 font-mono">
      
      {/* GAUCHE : Logo Pulse */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <Activity 
          strokeWidth={2.5} 
          className="w-5 h-5 md:w-6 md:h-6 text-[#00FFC2] drop-shadow-[0_0_5px_#00FFC2]" 
        />
        <span className="text-white font-black tracking-[0.2em] md:tracking-[0.3em] text-sm md:text-lg">PULSE</span>
      </div>

      {/* CENTRE : Navigation Horizontale (Scrollable sur mobile) */}
      <nav className="flex items-center h-full gap-4 md:gap-10 overflow-x-auto no-scrollbar mx-4 scroll-smooth">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            onClick={(e) => handleNavClick(e, item.isPublic)}
            className={`relative flex items-center gap-1.5 h-full text-[9px] md:text-[11px] font-bold tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
              pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {item.name}
            
            {!item.isPublic && !isAuthenticated && (
               <Lock size={10} className="opacity-50 shrink-0" />
            )}

            {pathname === item.path && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFC2] shadow-[0_0_12px_#00FFC2] animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* DROITE : Secteur et Auth */}
      <div className="flex items-center gap-2 md:gap-6 shrink-0">
        <div className="hidden lg:block text-right">
          <p className="text-[9px] text-gray-500 tracking-widest leading-none uppercase">Sector: Palvinice</p>
        </div>
        
        <div className="flex items-center gap-4 border-l border-white/10 pl-4 md:pl-6">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors whitespace-nowrap"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          ) : (
            <Link 
              href="/register"
              className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#00FFC2] hover:text-white transition-colors whitespace-nowrap"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Login_Sys</span>
              <span className="sm:hidden text-[9px]">LOGIN</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}