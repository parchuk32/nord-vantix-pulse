"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, TrendingUp, MessageSquare, Radio, Activity, Target, Fingerprint, Crosshair, Shield } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function VideoRenderer() {
  // On récupère les tracks vidéo distants (ceux de l'opérateur)
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  return activeTrack ? (
    <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover" />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-12 h-12 border-2 border-[#00FFC2]/10 border-t-[#00FFC2] rounded-full animate-spin mb-6" />
      <div className="text-[10px] text-[#00FFC2] animate-pulse tracking-[0.5em] uppercase font-black">Waiting_For_Signal_Uplink...</div>
    </div>
  );
}

export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [watcherToken, setWatcherToken] = useState("");

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

  // --- CORRECTION : CONNEXION VIA MISSION ID ---
  useEffect(() => {
    if (!selectedPlayer) {
      setWatcherToken("");
      return;
    }

    const connectToStream = async () => {
      try {
        // CORRECTION ICI : On utilise player.id (Mission) et non user_id
        const roomId = `room-${selectedPlayer.id}`; 
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

  const handleSelectPlayer = (player: any) => {
    setSelectedPlayer(player);
    window.history.pushState({}, '', `?target=${player.id}`);
  };

  const handleExit = () => {
    setSelectedPlayer(null);
    setWatcherToken("");
    window.history.pushState({}, '', window.location.pathname);
  };

  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
        {/* CRT EFFECT */}
        <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

        {/* HEADER TACTIQUE */}
        <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6">
          <button onClick={handleExit} className="flex items-center gap-2 text-gray-500 hover:text-[#00FFC2] transition-colors text-[10px] font-black uppercase tracking-widest">
            <ChevronLeft size={14} /> Abort_View
          </button>
          <div className="flex items-center gap-3 text-[#00FFC2]">
            <Activity size={18} className="animate-pulse" />
            <span className="font-black tracking-[0.3em] text-sm italic">MONITORING_OP_{selectedPlayer.id.substring(0,4)}</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-[8px] text-gray-600 uppercase">Signal_Stability</span>
             <div className="w-20 h-1 bg-white/5 overflow-hidden">
                <div className="h-full bg-[#00FFC2] w-[98%] shadow-[0_0_8px_#00FFC2]" />
             </div>
          </div>
        </div>

        {/* INTERFACE 3 COLONNES STYLE OPÉRATEUR */}
        <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
          
          {/* GAUCHE : DATA */}
          <div className="col-span-3 border border-white/10 bg-white/[0.01] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2">
                <Fingerprint size={14} />
                <span className="text-[9px] font-black uppercase">Bio_Metrics</span>
            </div>
            <div className="space-y-4 pt-4">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#00FFC2] w-[85%]" /></div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[40%]" /></div>
            </div>
            <div className="mt-auto border border-white/5 h-40 relative flex items-center justify-center bg-black">
                <Crosshair size={80} className="text-white/5" />
                <div className="absolute bottom-2 left-2 text-[7px] text-[#00FFC2]">SCAN_ACTIVE</div>
            </div>
          </div>

          {/* MILIEU : LIVE VIDEO (FOCUS) */}
          <div className="col-span-6 border border-white/10 bg-black relative overflow-hidden group">
             {watcherToken ? (
                <LiveKitRoom 
                  video={false} audio={false} 
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
                    <span className="text-[10px] text-gray-700 animate-pulse uppercase tracking-[0.5em]">Establishing_Link...</span>
                </div>
             )}
             
             {/* Overlay Mission Information */}
             <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-[8px] text-[#00FFC2] font-black uppercase tracking-widest block mb-1">Target_Objective</span>
                        <h2 className="text-xl font-black italic uppercase text-white drop-shadow-lg max-w-md">{selectedPlayer.objective}</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] text-gray-500 font-black uppercase block">Bounty_Pool</span>
                        <span className="text-3xl font-black text-[#00FFC2] italic">${selectedPlayer.bounty}</span>
                    </div>
                </div>
             </div>
          </div>

          {/* DROITE : COMMS & WAGERS */}
          <div className="col-span-3 flex flex-col gap-2 overflow-hidden">
             <div className="flex-1 border border-white/10 bg-white/[0.01] p-4 flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2 mb-4">
                    <MessageSquare size={14} />
                    <span className="text-[9px] font-black uppercase">Intercepted_Comms</span>
                </div>
                <div className="flex-1 text-[9px] space-y-3 opacity-60 italic">
                    <p className="">{'>'} Encrypted stream detected...</p>
                    <p className="">{'>'} Visual handshake confirmed.</p>
                </div>
                <div className="mt-4 p-4 border border-white/5 bg-white/[0.01]">
                    <span className="text-[8px] text-gray-500 uppercase block mb-2 text-center">Place_Wager</span>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-2 bg-zinc-900 text-[8px] font-black uppercase hover:bg-[#00FFC2] hover:text-black transition-all">Success</button>
                        <button className="py-2 bg-zinc-900 text-[8px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">Failure</button>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    );
  }

  // HUB SELECTION (Identique mais épuré)
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-6 md:p-12 overflow-x-hidden">
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12">
        <div>
           <h2 className="text-5xl md:text-7xl tracking-tighter text-white font-black uppercase italic">Watcher_Terminal</h2>
           <p className="text-[10px] text-[#00FFC2] font-bold tracking-[0.4em] uppercase italic flex items-center gap-2 mt-2">
             <Radio size={12} className="animate-pulse" /> Intercepting Global Uplinks...
           </p>
        </div>
        <div className="text-right">
           <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Active_Nodes</div>
           <div className="text-5xl font-black italic text-white">{activePlayers.length.toString().padStart(2, '0')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activePlayers.map((player) => (
          <div 
            key={player.id} 
            onClick={() => handleSelectPlayer(player)}
            className="group relative border border-white/10 aspect-video bg-zinc-900/40 overflow-hidden hover:border-[#00FFC2] transition-all cursor-pointer shadow-2xl"
          >
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex justify-between items-start">
                <span className="bg-black/90 px-3 py-1.5 border border-[#00FFC2]/30 text-[9px] font-black uppercase text-[#00FFC2] tracking-widest shadow-[0_0_10px_rgba(0,255,194,0.1)]">
                  NODE_{player.id.substring(0, 4)}
                </span>
                <div className="w-2 h-2 rounded-full bg-red-600 animate-ping shadow-[0_0_10px_red]" />
              </div>
              <div>
                <span className="text-[8px] text-gray-500 uppercase font-black">Bounty_Request</span>
                <div className="text-4xl text-white font-black italic tracking-tighter">${player.bounty}</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-[#00FFC2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          </div>
        ))}
      </div>
    </main>
  );
}