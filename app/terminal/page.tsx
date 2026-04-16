"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, Activity, Target, Fingerprint, Crosshair } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

// --- RENDU VIDÉO SÉCURISÉ ---
function VideoRenderer() {
  // On cherche le flux caméra de l'opérateur avec "onlySubscribed" pour éviter de s'auto-afficher
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  if (tracks.length > 0) {
    return <VideoTrack trackRef={tracks[0]} className="absolute inset-0 w-full h-full object-cover" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-[10px] text-[#00FFC2] animate-pulse uppercase font-black tracking-widest">Searching_Signal...</span>
    </div>
  );
}

export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [watcherToken, setWatcherToken] = useState("");

  const fetchSessions = async () => {
    // On ne récupère que les missions dont le statut est 'active'
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    
    // Écoute en temps réel des changements de statut dans Supabase
    const channel = supabase
      .channel('terminal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => { 
        fetchSessions(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- LOGIQUE DE CONNEXION AU FLUX ---
  useEffect(() => {
    if (!selectedPlayer) {
      setWatcherToken("");
      return;
    }

    const connectToStream = async () => {
      try {
        // SYNCHRONISATION : Doit être identique à la room de l'Operator Hub
        const roomName = `mission_${selectedPlayer.id}`; 
        console.log("🔍 [WATCHER] Tentative d'interception de la salle:", roomName);

        const resp = await fetch(`/api/get-participant-token?room=${roomName}&username=WATCHER_${Math.floor(Math.random() * 1000)}`);
        const data = await resp.json();
        
        if (data.token) {
          console.log("✅ [WATCHER] Signal intercepté avec succès.");
          setWatcherToken(data.token);
        } else {
          console.error("❌ [WATCHER] Aucun token reçu de l'API");
        }
      } catch (e) { 
        console.error("💥 [WATCHER] ÉCHEC DE CONNEXION:", e); 
      }
    };

    connectToStream();
  }, [selectedPlayer]);

  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
        {/* HEADER */}
        <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6">
          <button 
            onClick={() => {setSelectedPlayer(null); setWatcherToken("");}} 
            className="flex items-center gap-2 text-gray-500 hover:text-[#00FFC2] text-[9px] font-black uppercase transition-colors"
          >
            <ChevronLeft size={14} /> Abort_Link
          </button>
          <div className="flex items-center gap-3 text-[#00FFC2]">
            <Activity size={18} className="animate-pulse" />
            <span className="text-xs italic uppercase">Monitoring_Node_{selectedPlayer.id.substring(0,6)}</span>
          </div>
          <div className="text-right">
            <span className="text-[7px] text-gray-600 block uppercase">Signal</span>
            <span className="text-[9px] text-[#00FFC2]">ENCRYPTED</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
          {/* SIDEBAR GAUCHE */}
          <aside className="col-span-3 border border-white/10 p-4 flex flex-col gap-6 bg-white/[0.01]">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2">
              <Fingerprint size={14} />
              <span className="text-[9px] font-black uppercase">Intercept_Data</span>
            </div>
            <div className="mt-auto border border-white/5 h-40 relative flex items-center justify-center bg-black">
              <Crosshair size={60} className="text-white/5 animate-pulse" />
            </div>
          </aside>

          {/* ZONE VIDÉO PRINCIPALE */}
          <section className="col-span-6 border border-white/10 bg-black relative overflow-hidden">
             {watcherToken ? (
                <LiveKitRoom 
                  video={false} 
                  audio={true} 
                  token={watcherToken} 
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
                  connect={true} 
                  className="h-full w-full"
                >
                  <VideoRenderer />
                  <RoomAudioRenderer />
                </LiveKitRoom>
             ) : (
                <div className="absolute inset-0 flex items-center justify-center animate-pulse text-gray-700 text-[10px] uppercase tracking-[0.5em]">
                  Establishing_Uplink...
                </div>
             )}
             
             {/* INFO OVERLAY SUR LA VIDÉO */}
             <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] text-[#00FFC2] font-black uppercase block flex items-center gap-2">
                        <Target size={12}/> Active_Objective
                      </span>
                      <h2 className="text-xl font-black italic uppercase text-white max-w-md line-clamp-2">
                        {selectedPlayer.objective}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-gray-500 uppercase block">Bounty</span>
                      <div className="text-4xl font-black text-[#00FFC2] italic">${selectedPlayer.bounty}</div>
                    </div>
                </div>
             </div>
          </section>

          {/* SIDEBAR DROITE / LOGS */}
          <aside className="col-span-3 border border-white/10 p-4 opacity-50 italic text-[9px] space-y-2 bg-white/[0.01]">
            <p className="text-gray-500">{'>'} Scanning frequencies...</p>
            {watcherToken && <p className="text-[#00FFC2]">{'>'} Uplink established.</p>}
            <p className="text-gray-500">{'>'} Intercepting packets...</p>
          </aside>
        </div>
      </main>
    );
  }

  // --- VUE LISTE (TERMINAL HOME) ---
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-6 font-mono text-white">
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Terminal_V4</h2>
          <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-[0.2em]">Global_Encryption_Active</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase font-black">Active_Ops</div>
          <div className="text-5xl font-black text-[#00FFC2]">{activePlayers.length}</div>
        </div>
      </div>

      {activePlayers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-white/5 rounded-lg bg-white/[0.01] opacity-20 italic">
          <p className="animate-pulse">Waiting for active signals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activePlayers.map((player) => (
            <div 
              key={player.id} 
              onClick={() => setSelectedPlayer(player)} 
              className="group relative border border-white/10 aspect-video bg-zinc-900/40 overflow-hidden hover:border-[#00FFC2] transition-all cursor-pointer shadow-2xl"
            >
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <span className="bg-black/90 self-start px-3 py-1.5 border border-[#00FFC2]/30 text-[9px] font-black uppercase text-[#00FFC2]">
                  NODE_{player.id.substring(0, 6)}
                </span>
                <div className="text-4xl font-black italic tracking-tighter group-hover:text-[#00FFC2] transition-colors">
                  ${player.bounty}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {/* Effet de scanline au survol */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}