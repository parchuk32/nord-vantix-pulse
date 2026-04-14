"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, Zap, TrendingUp, MessageSquare, Shield, Activity, Users } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- RENDU VIDÉO ---
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  return activeTrack ? (
    <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-8 h-8 border-2 border-[#00FFC2]/20 border-t-[#00FFC2] rounded-full animate-spin mb-4" />
      <div className="text-[8px] text-[#00FFC2] animate-pulse tracking-[0.4em] uppercase font-black">Establishing_Uplink...</div>
    </div>
  );
}

export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  // RÉCUPÉRATION DES VRAIES MISSIONS (Opérateurs en direct)
  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .in('status', ['approved', 'active']) // On affiche seulement ceux qui sont approuvés ou en cours
      .order('created_at', { ascending: false });
      
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    
    // TEMPS RÉEL : Si un opérateur est approuvé, il pop instantanément sur l'écran des Watchers
    const channel = supabase.channel('terminal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchSessions();
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- MODE GROS DASHBOARD (Quand on regarde un joueur) ---
  if (selectedPlayer) {
    return (
      <main className="h-[calc(100vh-64px)] w-full bg-black flex overflow-hidden font-mono">
        
        {/* SECTION GAUCHE : VIDÉO + INFOS MISSION */}
        <div className="flex-1 flex flex-col border-r border-white/5 relative">
          
          {/* Bouton Retour */}
          <button onClick={() => setSelectedPlayer(null)} className="absolute top-6 left-6 z-50 bg-black/60 backdrop-blur-md px-4 py-2 border border-white/10 text-[#00FFC2] text-[10px] font-black uppercase tracking-widest hover:bg-[#00FFC2] hover:text-black transition-all rounded-sm flex items-center gap-2">
            <ChevronLeft size={14} /> Back_to_Hub
          </button>

          {/* Player Viewport */}
          <div className="flex-1 relative bg-[#080808]">
             <LiveKitRoom video={true} audio={true} token="TOKEN" serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
                <VideoRenderer />
             </LiveKitRoom>
             
             {/* Player Overlay Stats */}
             <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                <div className="text-4xl font-black italic text-[#00FFC2] drop-shadow-[0_0_15px_rgba(0,255,194,0.4)]">
                   ${selectedPlayer.bounty}
                </div>
                <div className="flex gap-2">
                   <span className="bg-red-600 px-2 py-0.5 text-[9px] font-black rounded-sm shadow-lg">LIVE</span>
                   <span className="bg-black/60 px-2 py-0.5 text-[9px] border border-white/10 rounded-sm text-white/70">
                     MIN {selectedPlayer.min_viewers} REQ.
                   </span>
                </div>
             </div>
          </div>

          {/* Mission Details (Bas de l'écran - VRAIES DONNÉES) */}
          <div className="h-48 border-t border-white/5 bg-black/40 p-8 flex justify-between items-center">
             <div className="space-y-4 max-w-lg w-full">
                <div>
                   <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest flex gap-3">
                     Active_Operation 
                     <span className={`${selectedPlayer.risk_level === 'EXTREME' ? 'text-red-500' : 'text-[#00FFC2]'}`}>
                       [{selectedPlayer.risk_level} RISK]
                     </span>
                   </span>
                   {/* Affichage de l'objectif réel tapé par le joueur */}
                   <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-2 mt-1">
                     {selectedPlayer.objective}
                   </h3>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black">
                      <span className="text-[#00FFC2] uppercase italic tracking-widest">System_Integrity</span>
                      <span>100%</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00FFC2] shadow-[0_0_15px_#00FFC2]" style={{ width: '100%' }} />
                   </div>
                </div>
             </div>
             <div className="text-right">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Bounty_Pool</span>
                <div className="text-3xl font-black italic text-[#00FFC2]">${selectedPlayer.bounty}</div>
             </div>
          </div>
        </div>

        {/* SECTION DROITE : WAGERS & CHAT (FIXE - À connecter plus tard) */}
        <aside className="w-[380px] bg-black flex flex-col pointer-events-auto">
           {/* Panneau de Paris */}
           <div className="p-8 border-b border-white/5 bg-[#080808]">
              <div className="flex items-center gap-2 text-[#00FFC2] font-black uppercase text-[10px] tracking-widest mb-6">
                 <TrendingUp size={16} /> Wagers_Matrix
              </div>
              <div className="text-5xl font-black italic text-white mb-8">$0.00</div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <button className="py-4 bg-[#00FFC2]/5 border border-[#00FFC2]/20 text-[#00FFC2] text-[10px] font-black uppercase hover:bg-[#00FFC2] hover:text-black transition-all">Success 75%</button>
                 <button className="py-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-black transition-all">Failure 25%</button>
              </div>
              <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-xl shadow-lg hover:bg-[#00FFC2] transition-colors">Place_Bet</button>
           </div>

           {/* Chat Transparent */}
           <div className="flex-1 flex flex-col p-8 overflow-hidden relative">
              <div className="flex items-center gap-2 text-gray-600 font-black uppercase text-[10px] tracking-widest mb-6">
                 <MessageSquare size={16} /> Comms_Log
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 mb-6 scrollbar-hide text-[11px]">
                 <div className="animate-in fade-in slide-in-from-right-2">
                    <span className="text-[#00FFC2] font-black mr-2 uppercase italic tracking-tighter">SYSTEM:</span>
                    <span className="text-white/80 leading-relaxed">Uplink established. Waiting for watchers...</span>
                 </div>
              </div>
              <div className="relative">
                 <input type="text" placeholder="TRANSMIT MESSAGE..." className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-[10px] text-white outline-none focus:border-[#00FFC2] transition-all" />
                 <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FFC2] font-black text-[10px] uppercase">Send</button>
              </div>
           </div>
        </aside>
      </main>
    );
  }

  // --- MODE GRILLE DE SÉLECTION (Watcher Hub) ---
  return (
    <main className="h-[calc(100vh-64px)] bg-[#050505] flex flex-col p-10 overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12">
        <div>
           <h2 className="text-6xl tracking-tighter text-white font-black uppercase italic leading-none">Watcher_Hub</h2>
           <p className="text-[10px] text-[#00FFC2] font-bold tracking-[0.5em] mt-2 uppercase italic">Scanning Global Nodes...</p>
        </div>
        <div className="text-right">
           <div className="text-[9px] text-gray-500 uppercase font-black mb-1 tracking-widest">Active_Nodes</div>
           <div className="text-5xl font-black italic text-white leading-none tabular-nums">{activePlayers.length.toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {activePlayers.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-600 font-black uppercase tracking-widest text-xs">
            Aucun opérateur en ligne pour le moment.
          </div>
        ) : (
          activePlayers.map((player) => (
            <div 
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="group relative border border-white/5 aspect-video bg-black overflow-hidden hover:border-[#00FFC2]/50 transition-all cursor-pointer shadow-2xl hover:scale-[1.02]"
            >
              <div className="absolute inset-0 z-0 bg-zinc-900 animate-pulse" />
              
              {/* Card UI */}
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 pointer-events-none">
                <div className="flex justify-between items-start">
                  <span className="bg-black/80 px-2 py-1 border border-white/10 text-[9px] font-black uppercase italic tracking-widest text-white">
                    OP_{player.id.substring(0, 6)}
                  </span>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                     <span className="text-red-500 text-[9px] font-black uppercase italic">Live</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Target_Bounty</div>
                  <div className="text-3xl text-[#00FFC2] font-black italic tracking-tighter">${player.bounty}</div>
                </div>
              </div>
              
              {/* Hover Scanline Effect */}
              <div className="absolute inset-0 bg-[#00FFC2]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))
        )}
      </div>
    </main>
  );
}