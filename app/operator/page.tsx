"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, MessageSquare, Radio, Activity, Target, Fingerprint, Crosshair } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ─── RENDU VIDÉO (FLUX DISTANT) ───────────────────────────────────────────
function VideoRenderer() {
  // Syntaxe simplifiée pour éviter les erreurs TypeScript sur "participant"
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  if (tracks.length > 0 && tracks[0].publication) {
    return (
      <VideoTrack 
        trackRef={tracks[0]} 
        className="absolute inset-0 w-full h-full object-cover shadow-[0_0_50px_rgba(0,0,0,0.8)]" 
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-12 h-12 border-2 border-[#00FFC2]/10 border-t-[#00FFC2] rounded-full animate-spin mb-6" />
      <div className="text-[10px] text-[#00FFC2] animate-pulse tracking-[0.5em] uppercase font-black">
        Intercepting_Signal...
      </div>
    </div>
  );
}

// ─── COMPOSANT TERMINAL ───────────────────────────────────────────────────
export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [watcherToken, setWatcherToken] = useState("");

  // Récupération des missions actives en temps réel
  const fetchSessions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'active') 
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

  // Connexion automatique au flux lors de la sélection
  useEffect(() => {
    if (!selectedPlayer) {
      setWatcherToken("");
      return;
    }

    const connectToStream = async () => {
      try {
        // SYNCHRONISATION : Doit être identique au nom utilisé par l'Opérateur
        const roomId = `mission_${selectedPlayer.id}`; 
        const viewerId = `WATCHER_${Math.floor(Math.random() * 10000)}`;

        const resp = await fetch(`/api/get-participant-token?room=${roomId}&username=${viewerId}`);
        const data = await resp.json();
        
        if (data.token) {
          setWatcherToken(data.token);
        }
      } catch (e) {
        console.error("Échec d'uplink:", e);
      }
    };

    connectToStream();
  }, [selectedPlayer]);

  const handleSelectPlayer = (player: any) => {
    setSelectedPlayer(player);
    window.history.pushState({}, '', `?target=${player.id}`);
  };

  const handleExit = () => {
    setSelectedPlayer(null);
    setWatcherToken("");
    window.history.pushState({}, '', window.location.pathname);
  };

  // --- VUE TACTIQUE (Cockpit de Surveillance) ---
  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative border-4 border-black">
        {/* CRT SCANLINES EFFECT */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {/* HEADER BAR */}
        <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-xl">
          <button onClick={handleExit} className="flex items-center gap-2 text-gray-500 hover:text-[#00FFC2] transition-colors text-[9px] font-black uppercase tracking-widest">
            <ChevronLeft size={14} /> Abort_Link
          </button>
          <div className="flex items-center gap-3 text-[#00FFC2]">
            <Activity size={18} className="animate-pulse" />
            <span className="font-black tracking-[0.3em] text-xs italic uppercase">Monitoring: NODE_{selectedPlayer.id.substring(0,6)}</span>
          </div>
          <div className="text-right">
            <span className="text-[7px] text-gray-600 block uppercase leading-none">Security_Protocol</span>
            <span className="text-[9px] text-[#00FFC2] font-mono tracking-widest">E2E_ENCRYPTED</span>
          </div>
        </div>

        {/* COCKPIT GRID */}
        <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
          
          {/* COLONNE GAUCHE : DATA STREAM */}
          <aside className="col-span-3 border border-white/10 bg-white/[0.01] p-4 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2">
                <Fingerprint size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Intercept_Data</span>
            </div>
            <div className="space-y-6 pt-2">
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[7px] font-black uppercase text-gray-500"><span>Signal_Stability</span><span>98%</span></div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#00FFC2] w-[98%] shadow-[0_0_8px_#00FFC2]" /></div>
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[7px] font-black uppercase text-gray-500"><span>Packet_Loss</span><span>0.01%</span></div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[4%]" /></div>
                </div>
            </div>
            <div className="mt-auto border border-white/5 bg-black h-48 relative flex items-center justify-center">
                <Crosshair size={80} className="text-white/5 animate-pulse" />
                <div className="absolute bottom-2 left-2 text-[7px] text-[#00FFC2] font-black uppercase">Scanning_Active</div>
            </div>
          </aside>

          {/* COLONNE MILIEU : LE SIGNAL VIDÉO */}
          <section className="col-span-6 border border-white/10 bg-black relative overflow-hidden group">
             {watcherToken ? (
                <LiveKitRoom 
                  video={false} audio={true} 
                  token={watcherToken} 
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
                  connect={true} 
                  className="h-full w-full"
                >
                  <VideoRenderer />
                  <RoomAudioRenderer />
                </LiveKitRoom>
             ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
                        <span className="text-[10px] text-gray-600 uppercase tracking-[0.4em]">Decrypting_Signal...</span>
                    </div>
                </div>
             )}
             
             {/* OVERLAY TACTIQUE SUR VIDÉO */}
             <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <span className="text-[8px] text-[#00FFC2] font-black uppercase tracking-widest block mb-1 flex items-center gap-2">
                           <Target size={12} className="animate-pulse" /> Active_Target_Objective
                        </span>
                        <h2 className="text-2xl font-black italic uppercase text-white drop-shadow-2xl max-w-md line-clamp-2">
                           {selectedPlayer.objective}
                        </h2>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] text-gray-500 font-black uppercase block tracking-widest">Bounty_Pool</span>
                        <div className="text-5xl font-black text-[#00FFC2] italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,255,194,0.3)]">
                           ${selectedPlayer.bounty}
                        </div>
                    </div>
                </div>
             </div>
          </section>

          {/* COLONNE DROITE : GLOBAL COMMS */}
          <aside className="col-span-3 border border-white/10 bg-white/[0.01] p-4 flex flex-col">
            <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2 mb-4">
                <MessageSquare size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">Intercepted_Comms</span>
            </div>
            <div className="flex-1 text-[9px] space-y-4 opacity-70 italic overflow-y-auto pr-2">
                <p className="text-[#00FFC2] border-l border-[#00FFC2]/30 pl-2 py-1">{'>'} Terminal connection secured.</p>
                <p className="border-l border-white/10 pl-2 py-1">{'>'} Receiving live sensory data.</p>
                <p className="border-l border-white/10 pl-2 py-1">{'>'} Visual handshake confirmed.</p>
            </div>
            <div className="mt-4 p-4 border border-white/10 bg-black/40 space-y-4">
                <span className="text-[8px] text-gray-600 uppercase font-black block text-center tracking-[0.2em]">Place_Bet_Matrix</span>
                <div className="grid grid-cols-2 gap-2">
                    <button className="py-2.5 bg-[#00FFC2]/10 border border-[#00FFC2]/30 text-[#00FFC2] text-[8px] font-black uppercase hover:bg-[#00FFC2] hover:text-black transition-all">Success</button>
                    <button className="py-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Failure</button>
                </div>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  // --- VUE HUB DE SÉLECTION ---
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-6 md:p-12 overflow-x-hidden font-mono">
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12">
        <div>
           <h2 className="text-5xl md:text-7xl tracking-tighter text-white font-black uppercase italic">Terminal_V4</h2>
           <p className="text-[10px] text-[#00FFC2] font-bold tracking-[0.4em] uppercase italic flex items-center gap-2 mt-2">
             <Radio size={14} className="animate-pulse" /> Intercepting Sector Signals...
           </p>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Active_Nodes</div>
           <div className="text-5xl font-black italic text-white tracking-tighter">{activePlayers.length.toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {activePlayers.length === 0 ? (
          <div className="col-span-full text-center py-40 border border-dashed border-white/5 rounded-[2rem]">
             <span className="text-[10px] text-gray-700 uppercase tracking-[0.6em] animate-pulse">No tactical signals detected in sector...</span>
          </div>
        ) : (
          activePlayers.map((player) => (
            <div 
              key={player.id} 
              onClick={() => handleSelectPlayer(player)}
              className="group relative border border-white/10 aspect-video bg-zinc-900/40 overflow-hidden hover:border-[#00FFC2] transition-all cursor-pointer shadow-2xl"
            >
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="bg-black/90 px-3 py-1.5 border border-[#00FFC2]/30 text-[9px] font-black uppercase text-[#00FFC2] tracking-widest shadow-[0_0_15px_rgba(0,255,194,0.1)]">
                    NODE_{player.id.substring(0, 6)}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shadow-[0_0_10px_red]" />
                </div>
                <div>
                  <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1 block">Contract_Bounty</span>
                  <div className="text-4xl text-white font-black italic tracking-tighter">${player.bounty}</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-[#00FFC2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent" />
            </div>
          ))
        )}
      </div>
    </main>
  );
}