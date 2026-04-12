"use client";
import { Activity, Settings, Menu, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'HOME', path: '/home' }, // Tu peux garder tes anciens paths
    { name: 'WATCHER', path: '/terminal' },
    { name: 'PLAYERS', path: '/operator' },
    { name: 'RANKINGS', path: '/rankings' },
  ];

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
            className={`relative flex items-center h-full text-[11px] font-bold tracking-[0.2em] transition-all duration-300 ${
              pathname === item.path ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {item.name}
            {/* Ligne néon active sous l'onglet (comme sur la photo) */}
            {pathname === item.path && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00FFC2] shadow-[0_0_12px_#00FFC2] animate-pulse" />
            )}
          </Link>
        ))}
      </nav>

      {/* DROITE : Secteur et Boutons */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:block text-right">
          <p className="text-[9px] text-gray-500 tracking-widest leading-none uppercase">Sector: Palvinice</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-[#00FFC2] border border-white/10 rounded transition-colors">
            <Settings size={18} />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#00FFC2] border border-white/10 rounded transition-colors">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}