"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { ChevronLeft, MessageSquare, Radio, Activity, Target, Fingerprint, Crosshair } from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

function VideoRenderer() {
  // Syntaxe simplifiée : on cherche n'importe quel flux caméra distant
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  if (tracks.length > 0 && tracks[0].publication) {
    return (
      <VideoTrack 
        trackRef={tracks[0]} 
        className="absolute inset-0 w-full h-full object-cover" 
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
    const channel = supabase.channel('terminal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => { fetchSessions(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!selectedPlayer) { setWatcherToken(""); return; }

    const connectToStream = async () => {
      try {
        const roomId = `mission_${selectedPlayer.id}`; 
        const viewerId = `WATCHER_${Math.floor(Math.random() * 10000)}`;

        const resp = await fetch(`/api/get-participant-token?room=${roomId}&username=${viewerId}`);
        const data = await resp.json();
        
        if (data.token) {
          setWatcherToken(data.token);
        }
      } catch (e) { console.error(e); }
    };
    connectToStream();
  }, [selectedPlayer]);

  const handleSelectPlayer = (player: any) => { setSelectedPlayer(player); };
  const handleExit = () => { setSelectedPlayer(null); setWatcherToken(""); };

  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
        <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6">
          <button onClick={handleExit} className="flex items-center gap-2 text-gray-500 hover:text-[#00FFC2] transition-colors text-[9px] font-black uppercase tracking-widest"><ChevronLeft size={14} /> Abort_Link</button>
          <div className="flex items-center gap-3 text-[#00FFC2]"><Activity size={18} className="animate-pulse" /><span className="font-black tracking-[0.3em] text-xs italic uppercase">Monitoring: Node_{selectedPlayer.id.substring(0,6)}</span></div>
          <div className="text-right"><span className="text-[7px] text-gray-600 block uppercase">Signal_Key</span><span className="text-[9px] text-[#00FFC2] font-mono uppercase">E2E_Encrypted</span></div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
          <aside className="col-span-3 border border-white/10 bg-white/[0.01] p-4 flex flex-col gap-6">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2"><Fingerprint size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Intercept_Data</span></div>
            <div className="mt-auto border border-white/5 bg-black h-40 relative flex items-center justify-center"><Crosshair size={60} className="text-white/5 animate-pulse" /><span className="absolute top-2 left-2 text-[7px] text-gray-600 uppercase tracking-widest">Radar_Pulse_Active</span></div>
          </aside>

          <section className="col-span-6 border border-white/10 bg-black relative overflow-hidden">
             {watcherToken ? (
                <LiveKitRoom video={false} audio={true} token={watcherToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
                  <VideoRenderer />
                  <RoomAudioRenderer />
                </LiveKitRoom>
             ) : (
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-[10px] text-gray-600 uppercase tracking-[0.4em]">Decrypting...</span></div>
             )}
             <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex justify-between items-end">
                    <div className="space-y-1"><span className="text-[8px] text-[#00FFC2] font-black uppercase tracking-widest block mb-1 flex items-center gap-2"><Target size={12}/> Active_Objective</span><h2 className="text-2xl font-black italic uppercase text-white max-w-md line-clamp-2">{selectedPlayer.objective}</h2></div>
                    <div className="text-right"><span className="text-[8px] text-gray-500 font-black uppercase">Bounty_Pool</span><div className="text-5xl font-black text-[#00FFC2] italic tracking-tighter">${selectedPlayer.bounty}</div></div>
                </div>
             </div>
          </section>

          <aside className="col-span-3 border border-white/10 bg-white/[0.01] p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2 mb-4"><MessageSquare size={14} /><span className="text-[9px] font-black uppercase tracking-widest">Intercepted_Comms</span></div>
            <div className="flex-1 text-[9px] space-y-4 opacity-70 italic overflow-y-auto pr-2"><p className="text-[#00FFC2]">{'>'} Terminal connection secured.</p><p>{'>'} Signal strength at 99%.</p></div>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-6 md:p-12 overflow-x-hidden font-mono">
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-12">
        <div><h2 className="text-5xl md:text-7xl tracking-tighter text-white font-black uppercase italic">Terminal_V4</h2><p className="text-[10px] text-[#00FFC2] font-bold tracking-[0.4em] uppercase italic flex items-center gap-2 mt-2"><Radio size={14} className="animate-pulse" /> Intercepting Global Uplinks...</p></div>
        <div className="text-right"><div className="text-[10px] text-gray-500 uppercase font-black mb-1">Active_Nodes</div><div className="text-5xl font-black italic text-white tracking-tighter">{activePlayers.length.toString().padStart(2, '0')}</div></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {activePlayers.map((player) => (
          <div key={player.id} onClick={() => handleSelectPlayer(player)} className="group relative border border-white/10 aspect-video bg-zinc-900/40 overflow-hidden hover:border-[#00FFC2] transition-all cursor-pointer shadow-2xl">
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10"><div className="flex justify-between items-start"><span className="bg-black/90 px-3 py-1.5 border border-[#00FFC2]/30 text-[9px] font-black uppercase text-[#00FFC2] tracking-widest">NODE_{player.id.substring(0, 6)}</span><div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shadow-[0_0_10px_red]" /></div><div><span className="text-[8px] text-gray-500 uppercase font-black mb-1 block">Contract_Bounty</span><div className="text-4xl text-white font-black italic tracking-tighter">${player.bounty}</div></div></div>
            <div className="absolute inset-0 bg-[#00FFC2]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/95 to-transparent" />
          </div>
        ))}
      </div>
    </main>
  );
}