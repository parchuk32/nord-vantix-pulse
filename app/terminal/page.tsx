"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, Radio, Activity, Target, Fingerprint, Crosshair } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

// --- RENDU VIDÉO SÉCURISÉ ---
function VideoRenderer() {
  // On cherche le flux caméra de n'importe quel participant (l'opérateur)
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  if (tracks.length > 0 && tracks[0].publication) {
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
    const { data } = await supabase.from('missions').select('*').eq('status', 'active').order('created_at', { ascending: false });
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    const channel = supabase.channel('terminal-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => { fetchSessions(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- LOGIQUE DE RECONNEXION TACTIQUE ---
  useEffect(() => {
    if (!selectedPlayer) {
      setWatcherToken("");
      return;
    }

    const connectToStream = async () => {
      try {
        const roomName = `mission_${selectedPlayer.id}`; // SYNCHRO TOTALE AVEC L'OPÉRATEUR
        console.log("🔍 [WATCHER] Interception de la Room:", roomName);

        const resp = await fetch(`/api/get-participant-token?room=${roomName}&username=WATCHER_${Math.floor(Math.random() * 1000)}`);
        const data = await resp.json();
        
        if (data.token) {
          console.log("✅ [WATCHER] Signal intercepté.");
          setWatcherToken(data.token);
        }
      } catch (e) { console.error("💥 [WATCHER] ÉCHEC:", e); }
    };
    connectToStream();
  }, [selectedPlayer]);

  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
        {/* HEADER */}
        <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6">
          <button onClick={() => {setSelectedPlayer(null); setWatcherToken("");}} className="flex items-center gap-2 text-gray-500 hover:text-[#00FFC2] text-[9px] font-black uppercase"><ChevronLeft size={14} /> Abort_Link</button>
          <div className="flex items-center gap-3 text-[#00FFC2]"><Activity size={18} className="animate-pulse" /><span className="text-xs italic uppercase">Monitoring_Node_{selectedPlayer.id.substring(0,6)}</span></div>
          <div className="text-right"><span className="text-[7px] text-gray-600 block uppercase">Signal</span><span className="text-[9px] text-[#00FFC2]">ENCRYPTED</span></div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
          <aside className="col-span-3 border border-white/10 p-4 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2"><Fingerprint size={14} /><span className="text-[9px] font-black uppercase">Intercept_Data</span></div>
            <div className="mt-auto border border-white/5 h-40 relative flex items-center justify-center bg-black"><Crosshair size={60} className="text-white/5 animate-pulse" /></div>
          </aside>

          {/* LA ZONE VIDÉO (LÀ OÙ ÇA BLOQUAIT) */}
          <section className="col-span-6 border border-white/10 bg-black relative overflow-hidden">
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
                <div className="absolute inset-0 flex items-center justify-center animate-pulse text-gray-700 text-[10px] uppercase tracking-[0.5em]">Establishing_Uplink...</div>
             )}
             
             {/* INFO OVERLAY */}
             <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex justify-between items-end">
                    <div><span className="text-[8px] text-[#00FFC2] font-black uppercase block flex items-center gap-2"><Target size={12}/> Active_Objective</span><h2 className="text-xl font-black italic uppercase text-white max-w-md line-clamp-2">{selectedPlayer.objective}</h2></div>
                    <div className="text-right"><span className="text-[8px] text-gray-500 uppercase block">Bounty</span><div className="text-4xl font-black text-[#00FFC2] italic">${selectedPlayer.bounty}</div></div>
                </div>
             </div>
          </section>

          <aside className="col-span-3 border border-white/10 p-4 opacity-50 italic text-[9px] space-y-2">
            <p>{'>'} Scanning frequencies...</p>
            <p className="text-[#00FFC2]">{'>'} Connection stable.</p>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-6 font-mono">
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12 text-white">
        <h2 className="text-5xl font-black uppercase italic italic">Terminal_V4</h2>
        <div className="text-right"><div className="text-[10px] text-gray-500 uppercase font-black">Active_Ops</div><div className="text-5xl font-black text-white">{activePlayers.length}</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activePlayers.map((player) => (
          <div key={player.id} onClick={() => setSelectedPlayer(player)} className="group relative border border-white/10 aspect-video bg-zinc-900/40 overflow-hidden hover:border-[#00FFC2] transition-all cursor-pointer">
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-white">
              <span className="bg-black/90 px-3 py-1.5 border border-[#00FFC2]/30 text-[9px] font-black uppercase text-[#00FFC2]">NODE_{player.id.substring(0, 6)}</span>
              <div className="text-4xl font-black italic tracking-tighter">${player.bounty}</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
          </div>
        ))}
      </div>
    </main>
  );
}