"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, Zap } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// 1. LE FIX POUR LES ERREURS TS (Track.Source et trackRef)
function VideoRenderer() {
  // On passe uniquement la source directement dans l'array (syntaxe v2+)
  const tracks = useTracks(
    [Track.Source.Camera], 
    { onlySubscribed: true }
  );

  // On extrait la première track de façon sécurisée
  const activeTrack = tracks[0];

  // Si on a une track, on l'affiche, sinon on montre le chargement
  if (activeTrack) {
    return (
      <VideoTrack 
        trackRef={activeTrack} 
        className="absolute inset-0 w-full h-full object-cover" 
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <div className="w-4 h-4 border-2 border-[#a855f7]/20 border-t-[#a855f7] rounded-full animate-spin mb-2" />
      <div className="text-[7px] text-[#a855f7] animate-pulse tracking-[0.4em]">SEARCHING_SIGNAL...</div>
    </div>
  );
}

// 2. MONITEUR LIVE
function VideoMonitor({ room, name }: { room: string, name: string }) {
  const [token, setToken] = useState("");
  useEffect(() => {
    fetch(`/api/get-participant-token?room=${room}&username=${name}`)
      .then(res => res.json())
      .then(data => { if(data.token) setToken(data.token); });
  }, [room, name]);

  if (!token) return <div className="h-full bg-black border border-white/5 animate-pulse" />;
  
  return (
    <LiveKitRoom 
      video={true} 
      audio={true} 
      token={token} 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
      connect={true} 
      className="h-full w-full relative"
    >
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
    const channel = supabase.channel('terminal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => fetchSessions())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- MODE CINÉMA (TWITCH STYLE) ---
  if (selectedPlayer) {
    return (
      <main className="h-screen w-screen bg-black flex flex-col font-mono overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/80 z-50">
          <button onClick={() => setSelectedPlayer(null)} className="flex items-center gap-2 text-white hover:text-[#a855f7] transition-all">
            <ChevronLeft size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Retour au Hub</span>
          </button>
          <div className="text-xs font-bold text-[#a855f7] tracking-[0.2em] uppercase italic">Monitoring: {selectedPlayer.player_id}</div>
          <div className="text-right">
             <div className="text-[8px] text-gray-500 uppercase">Live_Bounty</div>
             <div className="text-lg text-[#facc15] font-black italic">${selectedPlayer.bounty || '4,500'}</div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative bg-black">
             <VideoMonitor room={`room-${selectedPlayer.player_id}`} name="Watcher_Focus" />
          </div>
          <aside className="w-80 border-l border-white/10 bg-[#050505] flex flex-col p-6 gap-6">
             <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-2 text-center underline decoration-[#a855f7]">Contrôles</div>
             <button className="w-full py-4 bg-[#a855f7] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-lg shadow-[#a855f7]/20">
                Boost Bounty +$500
             </button>
             <button className="w-full py-4 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/5 transition-all">
                Terminate Link
             </button>
          </aside>
        </div>
      </main>
    );
  }

  // --- MODE GRILLE ---
  return (
    <main className="h-screen bg-[#050505] font-mono text-gray-400 flex flex-col overflow-hidden">
      <header className="border-b border-white/10 px-6 py-4 flex justify-between items-center bg-black/40">
        <div className="flex gap-4 items-center">
          <Zap size={16} className="text-[#a855f7]" />
          <h1 className="text-xl tracking-[0.3em] text-white font-black italic uppercase italic">Nord.Vantix :: Pulse</h1>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-600 uppercase">Nodes_Detected</div>
          <div className="text-3xl text-white font-black italic tracking-tighter tabular-nums">
            {activePlayers.length.toString().padStart(2, '0')}
          </div>
        </div>
      </header>

      <section className="flex-1 p-8 overflow-y-auto relative bg-grid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activePlayers.map((player) => (
            <div 
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="cursor-pointer group relative border border-white/10 aspect-video hover:border-[#a855f7] transition-all bg-black overflow-hidden shadow-2xl"
            >
              <VideoMonitor room={`room-${player.player_id}`} name="Grid_Preview" />
              <div className="absolute inset-0 p-4 flex flex-col justify-between z-20 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-bold text-white bg-black/80 px-2 py-1 border border-white/10 uppercase italic">ID: {player.player_id}</span>
                  <span className="text-red-500 text-[8px] font-black animate-pulse uppercase">Live</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-[#facc15] font-black italic tracking-tighter">${player.bounty || '4,500'}</div>
                </div>
              </div>
            </div>
          ))}

          {activePlayers.length === 0 && (
            <div className="col-span-full h-64 border-2 border-dashed border-white/5 flex flex-col items-center justify-center opacity-20">
              <div className="text-[10px] tracking-[0.5em] uppercase animate-pulse text-[#a855f7]">Waiting_For_Uplink...</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}