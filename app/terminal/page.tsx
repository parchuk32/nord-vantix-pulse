"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, Zap, LayoutDashboard, Globe, History, Activity, DollarSign, Search, ShieldCheck } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// 1. RENDU VIDÉO (FIXÉ)
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  if (activeTrack) {
    return <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-5 h-5 border-2 border-[#a855f7]/20 border-t-[#a855f7] rounded-full animate-spin mb-3" />
      <div className="text-[7px] text-[#a855f7] animate-pulse tracking-[0.4em] uppercase">Searching_Signal...</div>
    </div>
  );
}

// 2. MONITEUR LIVE
function VideoMonitor({ room, name }: { room: string, name: string }) {
  const [token, setToken] = useState("");
  useEffect(() => {
    fetch(`/api/get-participant-token?room=${room}&username=${name}`)
      .then(res => res.json()).then(data => { if(data.token) setToken(data.token); });
  }, [room, name]);

  if (!token) return <div className="h-full bg-black border border-white/5 animate-pulse" />;
  
  return (
    <LiveKitRoom video={true} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full relative">
      <VideoRenderer />
    </LiveKitRoom>
  );
}

export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const fetchSessions = async () => {
    const { data } = await supabase.from('live_sessions').select('*');
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    const channel = supabase.channel('terminal-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => fetchSessions()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- MODE CINÉMA (TWITCH STYLE) ---
  if (selectedPlayer) {
    return (
      <main className="h-screen w-screen bg-black flex flex-col font-mono overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/80 z-50">
          <button onClick={() => setSelectedPlayer(null)} className="flex items-center gap-2 text-white hover:text-[#a855f7] transition-all group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7]">Back_to_Hub</span>
          </button>
          <div className="flex flex-col items-center">
             <div className="text-[7px] text-gray-500 uppercase tracking-[0.3em]">Agent_Monitoring_Uplink</div>
             <div className="text-xs text-white font-black tracking-widest uppercase italic">{selectedPlayer.player_id}</div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-[7px] text-gray-500 uppercase tracking-widest">Payout</div>
                <div className="text-lg text-[#facc15] font-black italic tracking-tighter">${selectedPlayer.bounty || '4,500'}</div>
             </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative bg-black shadow-[inset_0_0_100px_rgba(168,85,247,0.1)]">
             <VideoMonitor room={`room-${selectedPlayer.player_id}`} name="Watcher_Focus" />
             <div className="absolute bottom-6 left-6 z-20 bg-black/80 p-4 border-l-2 border-[#a855f7] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                   <ShieldCheck size={12} className="text-[#a855f7]" />
                   <div className="text-[8px] text-[#a855f7] font-black uppercase tracking-widest">Link_Secure</div>
                </div>
                <div className="text-white text-[10px] font-bold uppercase tracking-widest italic opacity-80">Sector: Matawinie // Node_{selectedPlayer.id}</div>
             </div>
          </div>
          <aside className="w-80 border-l border-white/10 bg-[#050505] flex flex-col p-6 gap-6">
             <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-2 text-center">Tactical_Controls</div>
             <button className="w-full py-5 bg-[#a855f7] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-lg shadow-[#a855f7]/20 active:scale-95">
                Boost Bounty +$500
             </button>
             <button className="w-full py-5 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all">
                Terminate Link
             </button>
          </aside>
        </div>
      </main>
    );
  }

  // --- MODE HUB ELITE (Sidebar + Grille) ---
  return (
    <main className="h-screen bg-black font-mono text-gray-400 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="border-b border-white/10 px-8 py-5 flex justify-between items-center bg-black/40 backdrop-blur-md z-40">
        <div className="flex gap-4 items-center">
          <Zap size={18} className="text-[#a855f7] fill-[#a855f7]/20" />
          <h1 className="text-2xl tracking-[0.3em] text-white font-black italic uppercase">Nord.Vantix <span className="text-[#a855f7] not-italic">:: Pulse</span></h1>
          <span className="text-[9px] text-green-500 border border-green-500/20 px-3 py-1 ml-4 uppercase tracking-[0.2em] font-bold">Online</span>
        </div>
        
        <div className="hidden lg:flex relative items-center">
           <Search size={14} className="absolute left-4 text-gray-600" />
           <input type="text" placeholder="Search_Node..." className="bg-[#0a0a0a] border border-white/5 text-[10px] pl-12 pr-4 py-2.5 w-80 focus:border-[#a855f7] outline-none transition-all" />
        </div>

        <div className="text-right">
          <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-1 font-bold text-right">Nodes_Detected</div>
          <div className="text-4xl text-white font-black italic tracking-tighter leading-none">{activePlayers.length.toString().padStart(2, '0')}</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR TACTIQUE */}
        <aside className="w-72 border-r border-white/10 bg-[#020202] py-8 px-6 flex flex-col justify-between z-30">
          <nav className="space-y-3">
             {[
               { icon: LayoutDashboard, name: 'Dashboard', active: true },
               { icon: Globe, name: 'Global Feed' },
               { icon: History, name: 'History' },
               { icon: Activity, name: 'Market Pulse' }
             ].map((item) => (
               <button key={item.name} className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase transition-all ${item.active ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}>
                 <item.icon size={16} /> {item.name}
               </button>
             ))}
          </nav>
          
          <button className="w-full py-5 border border-[#facc15]/30 text-[#facc15] rounded-xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-[#facc15] hover:text-black transition-all flex items-center justify-center gap-3">
            <DollarSign size={16} /> [ Deposit_Funds ]
          </button>
        </aside>

        {/* CONTENU PRINCIPAL */}
        <section className="flex-1 bg-[#050505] p-10 overflow-y-auto relative scrollbar-hide">
          <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-12">
             <h2 className="text-5xl tracking-[0.2em] text-white font-black uppercase italic italic opacity-90">Watcher Hub</h2>
             <div className="text-[9px] text-gray-700 tracking-[0.5em] uppercase">Matawinie // Sector_04</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {activePlayers.map((player) => (
              <div 
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="cursor-pointer group relative border border-white/10 aspect-video hover:border-[#a855f7] transition-all bg-black overflow-hidden shadow-2xl hover:scale-[1.03] hover:shadow-[#a855f7]/10"
              >
                <VideoMonitor room={`room-${player.player_id}`} name="Grid_Preview" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10 opacity-60 group-hover:opacity-30 transition-opacity" />
                
                <div className="absolute inset-0 p-5 flex flex-col justify-between z-20 pointer-events-none">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-white bg-black/80 px-3 py-1.5 border border-white/10 uppercase italic">ID: {player.player_id}</span>
                    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 border border-red-500/20">
                       <span className="text-red-500 text-[10px] font-black uppercase animate-pulse">Live</span>
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Current_Bounty</div>
                    <div className="text-3xl text-[#facc15] font-black italic tracking-tighter drop-shadow-2xl tabular-nums italic">${player.bounty || '4,500'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BACKGROUND DECORATION */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
        </section>
      </div>

      {/* FOOTER TICKER */}
      <footer className="w-full bg-[#020202] border-t border-white/10 py-4 overflow-hidden z-40">
         <div className="animate-ticker whitespace-nowrap flex gap-12 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">
            <span>[LOG] {activePlayers.length} Nodes online in sector_04</span>
            <span className="text-[#a855f7]">// Signal_Encryption: AES-256 //</span>
            <span>[PULSE] System Stable // Uplink: 14ms //</span>
            <span className="text-[#facc15]">Market_Pulse: Gold $2,341.50 // BTC $69,420 //</span>
            <span>[WATCHER] Welcome to Nord.Vantix Command Center //</span>
         </div>
      </footer>

      <style jsx global>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-ticker { animation: ticker 40s linear infinite; display: inline-flex; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
  );
}