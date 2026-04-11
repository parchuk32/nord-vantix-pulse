"use client";

import SecurityMonitor from '../components/SecurityMonitor'; // Correction du chemin
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom } from '@livekit/components-react';
import { LayoutDashboard, Globe, History, Activity, DollarSign, Search, Zap } from 'lucide-react';
import '@livekit/components-styles';

// 1. Connexion Supabase (Gardée)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// 2. Le composant Vidéo (Optimisé visuellement)
function VideoMonitor({ room, name }: { room: string, name: string }) {
  const [token, setToken] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const resp = await fetch(`/api/get-participant-token?room=${room}&username=${name}`);
        const data = await resp.json();
        if (data.token) setToken(data.token);
      } catch (e) { console.error("Token Error:", e); }
    };
    getToken();
  }, [room, name]);

  if (!token) return <div className="h-full bg-black animate-pulse border border-gray-900" />;

  if (!isJoined) {
    return (
      <button 
        onClick={() => setIsJoined(true)}
        className="w-full h-full bg-[#0a0a0a] border border-gray-900 flex items-center justify-center group hover:bg-[#111] hover:border-[#a855f7]/30 transition-all"
      >
        <span className="text-[#a855f7] text-[10px] tracking-[0.4em] font-bold group-hover:scale-110 transition-transform drop-shadow-[0_0_5px_#a855f7]">
          [ INITIALIZE_UPLINK ]
        </span>
      </button>
    );
  }

  return (
    <div className="w-full h-full bg-black border border-gray-900 relative overflow-hidden group-hover:border-[#a855f7]">
      <LiveKitRoom video={false} audio={false} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true}>
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <SecurityMonitor /> 
        </div>
      </LiveKitRoom>
    </div>
  );
}

// 3. La carte du joueur (Look Cyberpunk Exact)
function LiveCard({ player }: { player: any }) {
  return (
    <div className="relative border border-gray-800 rounded-sm overflow-hidden bg-black/40 shadow-2xl neon-border transition-all hover:scale-[1.02] hover:border-[#a855f7] aspect-[4/3] group">
      
      {/* Fond Vidéo (Occupe toute la carte) */}
      <VideoMonitor room={`room-${player.player_id}`} name="Terminal_Watcher" />

      {/* OVERLAY HAUT : ID et Tag Live */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-black/70 backdrop-blur-sm border-b border-gray-900 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] z-10">
        <span className="text-white/80">
          [PLAYER_ID: <span className="text-[#a855f7] font-bold">{player.player_id}</span>]
        </span>
        <span className="text-red-500 font-black animate-pulse flex items-center gap-2">
          [ LIVE ] <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </span>
      </div>

      {/* OVERLAY BAS : Bounty */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-black/0 text-right z-10">
        <div className="text-[9px] text-gray-500 uppercase tracking-widest">Active_Node // Bounty</div>
        <span className="text-3xl text-[#facc15] font-black italic tracking-tighter tabular-nums drop-shadow-[0_0_15px_#facc1550]">
          ${player.bounty?.toFixed(2) || "0.00"}
        </span>
      </div>
      
      {/* Effet de scanlines au survol */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}

// Composants de style pour l'Overload Visuel
function TechTickerTerminal() {
  const tickerText = 'SYSTEM_SIGNAL: ENCRYPTED // [LIVE FEED] PLAYER_089 COMPLETED "ROOFTOP_JUMP" // MARKET_PULSE: USD/JPY 151.62 // SERVER: Matawinie_Sector // ACTIVE_NODES: 04 // LATENCY: 14ms // [CRITICAL] UNKNOWN_FEED_DETECTED // UDP_PORT: 443 // ';
  return (
    <div className="w-full bg-[#030303] border-t border-gray-900 overflow-hidden py-3 font-mono text-gray-600 tracking-[0.2em]">
      <div className="flex whitespace-nowrap animate-ticker text-[8px] md:text-xs">
        {Array(4).fill(tickerText).map((text, i) => (
          <span key={i} className="px-1">{text}</span>
        ))}
      </div>
    </div>
  );
}

const sidebarItems = [
  { name: 'DASHBOARD', icon: LayoutDashboard },
  { name: 'GLOBAL FEED', icon: Globe },
  { name: 'BETTING HISTORY', icon: History },
  { name: 'MARKET PULSE', icon: Activity },
];

// 4. Le Terminal Principal (Exporté par défaut)
export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from('live_sessions').select('*').eq('status', 'active');
      if (data) setActivePlayers(data);
    };

    fetchSessions();

    const channel = supabase
      .channel('terminal-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <main className="h-screen bg-black font-mono text-gray-400 flex flex-col relative overflow-hidden">
      
      {/* HEADER TACTIQUE */}
      <header className="w-full flex justify-between items-center border-b border-gray-900 px-6 py-4 bg-black/40 backdrop-blur-sm z-50">
        <div className="flex gap-4 items-center">
          <Zap size={16} className="text-[#a855f7]" />
          <h1 className="text-xl tracking-[0.3em] text-white font-black uppercase italic">
            NORD.VANTIX <span className="text-[#a855f7] not-italic">:: PULSE</span>
          </h1>
          <span className="text-[10px] text-green-500 bg-green-500/10 px-3 py-1 border border-green-500/20 uppercase">Online</span>
        </div>
        <div className="flex gap-10 items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="text" placeholder="Search_Active_Nodes..." className="bg-gray-900 border border-gray-800 text-xs px-10 py-2 w-72 focus:outline-none focus:border-[#a855f7]" />
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-600 uppercase">ACTIVE_NODES</div>
            <div className="text-3xl text-white font-black italic tracking-tighter tabular-nums">{activePlayers.length.toString().padStart(2, '0')}</div>
          </div>
        </div>
      </header>

      {/* LAYOUT PRINCIPAL : Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR TACTIQUE (Style Nerve Exact) */}
        <aside className="w-64 border-r border-gray-900 bg-[#020202] py-10 px-4 flex flex-col gap-10 justify-between">
          <nav className="space-y-4">
            {sidebarItems.map((item, index) => (
              <button key={item.name} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-xs font-bold transition-colors ${
                  index === 0 ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30' : 'text-gray-600 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} strokeWidth={index === 0 ? 2 : 1.5} />
                <span className="tracking-[0.2em]">{item.name}</span>
              </button>
            ))}
          </nav>
          <button className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-[#facc15]/30 text-[#facc15] rounded-xl text-xs font-bold tracking-[0.2em] uppercase hover:bg-[#facc15] hover:text-black transition-all">
            <DollarSign size={16} /> [ DEPOSIT_FUNDS ]
          </button>
        </aside>

        {/* MAIN CONTENT : Titre + Grille */}
        <section className="flex-1 bg-[#050505] p-10 overflow-y-auto relative">
          
          <div className="flex justify-between items-end border-b border-gray-900 pb-6 mb-10">
            <h2 className="text-4xl tracking-[0.3em] text-white font-black uppercase italic drop-shadow-[0_0_10px_#ffffff20]">
              Watcher Hub
            </h2>
            <p className="text-[10px] text-gray-700 uppercase tracking-[0.5em]">Matawinie // Sector_04 // AES-256_Enforced</p>
          </div>

          {/* Grille de caméras (Automatisée par le Realtime Supabase) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {activePlayers.map((player) => (
              <LiveCard key={player.id} player={player} />
            ))}
            
            {/* Si aucun joueur n'est connecté */}
            {activePlayers.length === 0 && (
              <div className="col-span-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-900 gap-6">
                <div className="w-20 h-20 border-2 border-dashed border-[#a855f7]/20 rounded-full animate-spin [animation-duration:10s]" />
                <p className="text-gray-800 text-xs tracking-[0.5em] uppercase">No_Active_Nodes_Detecting</p>
              </div>
            )}
          </div>
          
          {/* Effet d'arrière-plan technique */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_30%,transparent_100%)] pointer-events-none" />
        </section>
      </div>

      {/* FOOTER TICKER (L'Info Bar technique) */}
      <TechTickerTerminal />

      {/* Style CSS pour les scanlines et l'aura (Neon-border) */}
      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-ticker {
          display: inline-block;
          animation: ticker 50s linear infinite;
        }
        .neon-border {
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.1), inset 0 0 10px rgba(168, 85, 247, 0.05);
        }
      `}</style>
    </main>
  );
}