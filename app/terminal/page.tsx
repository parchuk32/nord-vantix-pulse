"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  ChevronLeft, Shield, Lock, Activity, Users, Target, 
  Signal, Terminal, Database, Cpu, Network, Map, Eye, AlertTriangle, Radio
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- 1. RENDU VIDÉO ---
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  if (activeTrack) {
    return <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-3" />
      <div className="text-[7px] text-violet-500 animate-pulse tracking-[0.4em] uppercase">Searching_Signal...</div>
    </div>
  );
}

// --- 2. MONITEUR LIVE ---
function VideoMonitor({ room, name }: { room: string, name: string }) {
  const [token, setToken] = useState("");
  useEffect(() => {
    fetch(`/api/get-participant-token?room=${room}&username=${name}`)
      .then(res => res.json()).then(data => { if(data.token) setToken(data.token); });
  }, [room, name]);

  if (!token) return <div className="h-full bg-black border border-white/5 animate-pulse flex items-center justify-center"><Terminal className="text-violet-500/20" size={32}/></div>;
  
  return (
    <LiveKitRoom video={true} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full relative">
      <VideoRenderer />
    </LiveKitRoom>
  );
}

// --- 3. COMPOSANT PANNEAU TACTIQUE ---
const TacticalPanel = ({ title, icon: Icon, children, accent = "violet" }: any) => {
  const accentClass = accent === "violet" ? "text-violet-400 border-violet-500/50" : "text-amber-500 border-amber-500/50";
  return (
    <div className={`border border-white/10 bg-black/60 p-4 font-mono relative overflow-hidden ${accentClass}`}>
      <div className="absolute inset-0 scanline opacity-5 pointer-events-none" />
      <div className="relative z-10">
        <div className={`text-[9px] font-black uppercase tracking-[0.4em] mb-3 flex items-center gap-2 ${accentClass}`}>
          <Icon size={12} /> {title}
        </div>
        <div className="text-[10px] text-gray-300 space-y-2">
          {children}
        </div>
      </div>
    </div>
  );
};


// --- COMPOSANT PRINCIPAL ---
export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING_VANTIX_CORE...",
    "UPLINK_ESTABLISHED_SECTOR:MATAWINIE",
    "DECRYPTING_AGENT_STREAMS..."
  ]);

  const fetchSessions = async () => {
    const { data } = await supabase.from('live_sessions').select('*');
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    const channel = supabase.channel('terminal-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => fetchSessions()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [`${new Date().toLocaleTimeString()} > ${msg}`, ...prev].slice(0, 8));
  };


  // ==========================================
  // MODE CINÉMA (VUE OPÉRATEUR TACTIQUE)
  // ==========================================
  if (selectedPlayer) {
    return (
      <main className="h-screen w-screen bg-[#050505] text-white flex flex-col font-mono overflow-hidden relative">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="crt-overlay pointer-events-none z-50" />

        {/* HEADER TACTIQUE */}
        <header className="p-3 border-b border-white/10 flex justify-between items-center z-40 bg-black">
          <div className="flex items-center gap-4 border border-violet-500/30 p-2 text-violet-400">
             <Radio size={16} className="animate-pulse"/>
             <div className="tracking-[0.6em] font-black text-xs italic uppercase text-white">VANTIX <span className="text-violet-500">:: TERMINAL</span></div>
          </div>
          <button onClick={() => setSelectedPlayer(null)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-all">
            <ChevronLeft size={14} /> <span className="text-[9px] font-black uppercase tracking-widest">[ BACK_TO_GRID ]</span>
          </button>
          <div className="flex gap-8 text-[9px] font-black text-gray-600 uppercase tracking-widest">
             <div>SECTOR: <span className="text-white">MATAWINIE</span></div>
             <div>SYS_LOAD: <span className="text-green-500 animate-pulse">OPTIMAL (14ms)</span></div>
          </div>
        </header>

        {/* GRILLE CENTRALE DE CONTRÔLE */}
        <div className="flex-1 p-6 grid grid-cols-12 gap-5 z-20 overflow-hidden relative">
          
          {/* COLONNE GAUCHE (Data Agent) */}
          <div className="col-span-3 space-y-5">
            <TacticalPanel title="Agent_Identity" icon={Shield}>
              <div className="flex items-center gap-3 border border-white/10 p-3 bg-black/40">
                <Eye className="text-violet-500" size={24} />
                <div>
                   <div className="text-xs font-black text-white">{selectedPlayer.player_id}</div>
                   <div className="text-[8px] text-violet-400">STATUS: LIVE_STREAMING</div>
                </div>
              </div>
            </TacticalPanel>

            <TacticalPanel title="Market_Matrix" icon={Activity}>
               <div className="flex items-center justify-between p-2 bg-black border border-white/10 text-xs">
                  <span className="text-gray-400">XAUUSD:</span>
                  <span className="text-white font-black italic">$2,118.90</span>
                  <span className="text-green-500 animate-pulse">+0.12%</span>
               </div>
               <div className="border border-white/5 h-20 bg-black/50 text-[6px] text-gray-700 flex items-end p-1 gap-[2px]">
                  {Array(20).fill(0).map((_, i) => <div key={i} className="flex-1 bg-violet-900/40" style={{ height: `${Math.random() * 100}%` }}></div>)}
               </div>
            </TacticalPanel>
          </div>

          {/* CENTRE : LA CAMÉRA */}
          <div className="col-span-6 relative border-2 border-violet-500/50 flex flex-col p-2 bg-black overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)]">
            <div className="absolute top-4 left-4 border-l-2 border-t-2 border-violet-400 w-10 h-10 z-10" />
            <div className="absolute top-4 right-4 border-r-2 border-t-2 border-violet-400 w-10 h-10 z-10" />
            <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-violet-400 w-10 h-10 z-10" />
            <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-violet-400 w-10 h-10 z-10" />
            
            <div className="w-full flex justify-between items-center text-[8px] font-black tracking-widest uppercase text-violet-300 p-2 border-b border-violet-500/20 mb-2 z-10">
                <div>// LIVE_FEED :: NODE_{selectedPlayer.id} //</div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> REC //</div>
            </div>

            <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
              {/* COMPOSANT LIVEKIT INTÉGRÉ ICI */}
              <VideoMonitor room={`room-${selectedPlayer.player_id}`} name="Watcher_Op_Focus" />
            </div>
          </div>

          {/* COLONNE DROITE (Contrôles & Stats) */}
          <div className="col-span-3 space-y-5 flex flex-col">
            <TacticalPanel title="Target_Status" icon={Network}>
                <div className="flex gap-3 text-xs border border-white/10 p-3 bg-black text-center">
                    <div className="flex-1"><Map className="mx-auto text-amber-500 mb-1" size={16}/> <span className="text-[9px]">LOC: 46.12, -73.65</span></div>
                    <div className="flex-1"><Target className="mx-auto text-green-500 mb-1" size={16}/> <span className="text-[9px]">${selectedPlayer.bounty || '4,500'}</span></div>
                </div>
            </TacticalPanel>

            <TacticalPanel title="Database_Matrices" icon={Database}>
               <div className="h-28 overflow-hidden text-gray-800 text-[6px] tracking-tight leading-none bg-black border border-white/5 p-2 break-all opacity-40">
                  {Array(600).fill(0).map(() => Math.floor(Math.random()*16).toString(16))}
               </div>
            </TacticalPanel>

            <div className="flex-1 border border-violet-500/30 bg-violet-900/10 p-4 font-mono backdrop-blur-sm flex flex-col justify-end">
               <button 
                 onClick={() => { addLog("INITIATING LINK TERMINATION..."); setTimeout(() => setSelectedPlayer(null), 1000); }}
                 className="w-full py-4 border border-red-500/30 text-red-500 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500/10 transition-all text-center"
               >
                  [ TERMINATE_LINK ]
               </button>
            </div>
          </div>
        </div>

        {/* LOG FOOTER */}
        <footer className="p-4 border-t border-white/10 z-40 bg-black flex gap-6 items-center">
          <div className="flex items-center gap-2 border border-violet-500/30 p-2 text-violet-400">
             <Terminal size={16}/>
          </div>
          <div className="flex-1 h-16 overflow-hidden text-[7px] text-green-400 font-bold uppercase tracking-tight leading-tight space-y-1 bg-[#050505] p-2 border border-white/5">
              {terminalLogs.map((log, i) => <p key={i} className={`${i === 0 ? 'text-white' : ''}`}>{log}</p>)}
          </div>
        </footer>
      </main>
    );
  }

  // ==========================================
  // MODE HUB (GRILLE GLOBALE)
  // ==========================================
  return (
    <main className="h-screen bg-[#050505] font-mono text-gray-400 flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="crt-overlay pointer-events-none z-50" />
      
      {/* HEADER HUB */}
      <header className="border-b border-white/10 px-8 py-5 flex justify-between items-center bg-black z-40">
        <div className="flex gap-4 items-center">
          <Radio size={18} className="text-violet-500 animate-pulse" />
          <h1 className="text-2xl tracking-[0.3em] text-white font-black italic uppercase">Nord.Vantix <span className="text-violet-500 not-italic">:: Hub</span></h1>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-gray-600 uppercase tracking-widest mb-1 font-bold text-right">Active_Streams</div>
          <div className="text-4xl text-white font-black italic tracking-tighter leading-none">{activePlayers.length.toString().padStart(2, '0')}</div>
        </div>
      </header>

      {/* GRILLE DE FLUX */}
      <section className="flex-1 p-10 overflow-y-auto relative z-20">
        <div className="flex justify-between items-end border-b border-white/5 pb-6 mb-12">
           <h2 className="text-xl tracking-[0.2em] text-gray-500 font-black uppercase">Global Monitoring Grid</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {activePlayers.map((player) => (
            <div 
              key={player.id}
              onClick={() => { addLog(`UPLINK SECURED TO NODE: ${player.player_id}`); setSelectedPlayer(player); }}
              className="cursor-pointer group relative border border-white/10 aspect-video hover:border-violet-500 transition-all bg-black overflow-hidden shadow-2xl hover:scale-[1.02]"
            >
              {/* Le LiveKit MiniMonitor */}
              <div className="absolute inset-0 z-0">
                <VideoMonitor room={`room-${player.player_id}`} name="Grid_Watcher" />
              </div>

              {/* L'overlay Tactique par dessus la vidéo */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10 opacity-80" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between z-20 pointer-events-none">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-white bg-black/80 px-3 py-1.5 border border-white/10 uppercase italic">ID: {player.player_id}</span>
                  <div className="flex items-center gap-2 bg-black/80 px-3 py-1.5 border border-red-500/20">
                     <span className="text-red-500 text-[10px] font-black uppercase animate-pulse">Live</span>
                     <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] text-gray-400 uppercase font-black tracking-widest mb-1">Bounty</div>
                  <div className="text-3xl text-amber-400 font-black italic tracking-tighter drop-shadow-2xl tabular-nums">${player.bounty || '4,500'}</div>
                </div>
              </div>
            </div>
          ))}
          {/* Bloc d'ajout factice si vide pour le design */}
          {activePlayers.length === 0 && (
            <div className="aspect-video border border-dashed border-white/10 flex items-center justify-center flex-col text-gray-700 bg-black/20">
               <Radio size={24} className="mb-2 opacity-50" />
               <div className="text-[10px] font-black uppercase tracking-widest">Awaiting_Signals...</div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}