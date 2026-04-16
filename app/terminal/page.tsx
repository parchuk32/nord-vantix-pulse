"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, TrendingUp, MessageSquare, Radio } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  return activeTrack ? (
    <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover" />
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
  
  // NOUVEAU : Stockage du vrai token du Watcher
  const [watcherToken, setWatcherToken] = useState("");

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .in('status', ['approved', 'active'])
      .order('created_at', { ascending: false });
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    const channel = supabase.channel('terminal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        fetchSessions();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // NOUVEAU : Obtenir un token quand on clique sur un joueur
  useEffect(() => {
    if (!selectedPlayer) {
      setWatcherToken("");
      return;
    }

    const connectToStream = async () => {
      try {
        // On cible la salle de l'opérateur (basé sur son user_id)
        const roomId = `room-${selectedPlayer.user_id}`;
        const viewerId = `WATCHER-${Math.floor(Math.random() * 10000)}`;

        const resp = await fetch(`/api/get-participant-token?room=${roomId}&username=${viewerId}`);
        const data = await resp.json();
        
        if (data.token) {
          setWatcherToken(data.token);
        }
      } catch (e) {
        console.error("Échec de récupération du token :", e);
      }
    };

    connectToStream();
  }, [selectedPlayer]);

  // --- MODE GROS DASHBOARD (LIVE VIEW) ---
  if (selectedPlayer) {
    return (
      <main className="min-h-screen md:h-[calc(100vh-64px)] w-full bg-black flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-mono">
        
        {/* SECTION GAUCHE / HAUT : VIDÉO */}
        <div className="flex-1 flex flex-col border-r border-white/5 relative min-h-[400px] md:min-h-0">
          <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 left-4 z-50 bg-black/80 px-3 py-2 border border-white/10 text-[#00FFC2] text-[9px] font-black uppercase flex items-center gap-2">
            <ChevronLeft size={12} /> Exit_Hub
          </button>

          <div className="flex-1 relative bg-[#080808] aspect-video md:aspect-auto">
             {/* NOUVEAU : On s'assure qu'on a le token avant de lancer LiveKit */}
             {watcherToken ? (
               <LiveKitRoom 
                 video={false} // Le spectateur ne diffuse pas sa vidéo
                 audio={false} // Le spectateur ne diffuse pas son audio
                 token={watcherToken} 
                 serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
                 connect={true} 
                 className="h-full w-full"
               >
                  <VideoRenderer />
               </LiveKitRoom>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
                 <div className="w-8 h-8 border-2 border-[#00FFC2]/20 border-t-[#00FFC2] rounded-full animate-spin mb-4" />
                 <div className="text-[8px] text-[#00FFC2] animate-pulse tracking-[0.4em] uppercase font-black">Decrypting_Signal...</div>
               </div>
             )}
             
             <div className="absolute top-4 right-4 text-right">
                <div className="text-2xl md:text-4xl font-black italic text-[#00FFC2]">${selectedPlayer.bounty}</div>
                <span className="bg-red-600 px-2 py-0.5 text-[8px] font-black rounded-sm">LIVE</span>
             </div>
          </div>

          {/* MISSION DETAILS */}
          <div className="p-4 md:p-8 bg-black/40 border-t border-white/5">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:max-w-lg">
                   <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest block mb-1">Active_Operation // {selectedPlayer.risk_level}</span>
                   <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter line-clamp-2">{selectedPlayer.objective}</h3>
                </div>
                <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                   <span className="text-[8px] text-gray-500 font-black uppercase">Bounty_Pool</span>
                   <div className="text-2xl md:text-3xl font-black italic text-[#00FFC2]">${selectedPlayer.bounty}</div>
                </div>
             </div>
          </div>
        </div>

        {/* SECTION DROITE / BAS : WAGERS & CHAT */}
        <aside className="w-full md:w-[350px] lg:w-[400px] bg-black border-t md:border-t-0 md:border-l border-white/5 flex flex-col">
           <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-2 text-[#00FFC2] font-black uppercase text-[9px] mb-4"><TrendingUp size={14} /> Wagers_Matrix</div>
              <div className="grid grid-cols-2 gap-3">
                 <button className="py-3 bg-zinc-900 border border-white/5 text-white text-[9px] font-black uppercase hover:bg-[#00FFC2] hover:text-black transition-colors">Success</button>
                 <button className="py-3 bg-zinc-900 border border-white/5 text-white text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-colors">Failure</button>
              </div>
           </div>
           
           <div className="p-6 flex-1 min-h-[300px] flex flex-col">
              <div className="flex items-center gap-2 text-gray-600 font-black uppercase text-[9px] mb-4"><MessageSquare size={14} /> Comms_Log</div>
              <div className="flex-1 text-[10px] space-y-3 opacity-80 mb-4">
                 <div className="text-white/50 italic">{'>'} Neural link established...</div>
              </div>
              <input type="text" placeholder="TRANSMIT..." className="w-full bg-zinc-900 border border-white/5 p-3 text-[9px] text-white outline-none focus:border-[#00FFC2]" />
           </div>
        </aside>
      </main>
    );
  }

  // --- MODE HUB (SÉLECTION DES JOUEURS) ---
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-4 md:p-10 no-scrollbar overflow-x-hidden">
      
      {/* HEADER HUB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
           <h2 className="text-4xl md:text-6xl tracking-tighter text-white font-black uppercase italic">Watcher_Hub</h2>
           <p className="text-[8px] md:text-[10px] text-[#00FFC2] font-bold tracking-[0.3em] uppercase italic flex items-center gap-2">
             <Radio size={12} className="animate-pulse" /> Scanning Global Nodes...
           </p>
        </div>
        <div className="text-left md:text-right">
           <div className="text-[8px] text-gray-500 uppercase font-black mb-1">Nodes_Active</div>
           <div className="text-3xl md:text-5xl font-black italic text-white leading-none">{activePlayers.length.toString().padStart(2, '0')}</div>
        </div>
      </div>

      {/* GRILLE : 1 colonne mobile / 3 colonnes PC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10 pb-20">
        {activePlayers.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-700 font-black uppercase tracking-widest text-[10px]">
            No Ops Detected in Sector.
          </div>
        ) : (
          activePlayers.map((player) => (
            <div 
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="group relative border border-white/5 aspect-video bg-zinc-900/50 overflow-hidden hover:border-[#00FFC2]/50 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="bg-black/80 px-2 py-1 border border-white/10 text-[8px] font-black uppercase text-white">
                    OP_{player.id.substring(0, 4)}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                </div>
                <div className="text-right">
                  <div className="text-[7px] text-gray-500 uppercase font-black">Bounty</div>
                  <div className="text-2xl md:text-3xl text-[#00FFC2] font-black italic tracking-tighter">${player.bounty}</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#00FFC2]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))
        )}
      </div>
    </main>
  );
}