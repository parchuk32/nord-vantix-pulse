"use client";

import React, { useEffect, useState } from 'react';
import { Activity, Settings, Menu, Lock, LogOut, LogIn } from 'lucide-react';
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
    { name: 'HOME', path: '/', isPublic: true }, // Modifié : /home devient /
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

  // FONCTION DE DÉCONNEXION
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Détruit la session Supabase
    router.push('/'); // Renvoie à l'accueil
  };

  return (
    <header className="w-full h-16 bg-[#050505] border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-50 font-mono">
      
      {/* GAUCHE : Logo Pulse */}
      <div className="flex items-center gap-3">
        <div className="text-[#00FFC2]">
          <Activity size={24} strokeWidth={2.5} className="drop-shadow-[0_0_5px_#00FFC2]" />
        </div>
        <span className="text-white font-black tracking-[0.3em] text-lg">PULSE</span>
      </div>

      {/* CENTRE : Navigation Horizontale */}
      <nav className="flex items-center h-full gap-10">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            onClick={(e) => handleNavClick(e, item.isPublic)}
            className={`relative flex items-center gap-1.5 h-full text-[11px] font-bold tracking-[0.2em] transition-all duration-300 ${
              pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {item.name}
            
            {!item.isPublic && !isAuthenticated && (
               <Lock size={10} className="opacity-50" />
            )}

            {pathname === item.path && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFC2] shadow-[0_0_12px_#00FFC2] animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* DROITE : Secteur et Boutons d'Authentification */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:block text-right">
          <p className="text-[9px] text-gray-500 tracking-widest leading-none uppercase">Sector: Palvinice</p>
        </div>
        
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          {isAuthenticated ? (
            // BOUTON SE DÉCONNECTER
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          ) : (
            // BOUTON SE CONNECTER
            <Link 
              href="/register"
              className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#00FFC2] hover:text-white transition-colors"
            >
              <LogIn size={14} />
              Login_Sys
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}