"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Shield, Activity, Target, Signal, Terminal, 
  Database, Network, Map, Eye, AlertTriangle, Radio
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
    return <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover grayscale opacity-90" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-3" />
      <div className="text-[7px] text-violet-500 animate-pulse tracking-[0.4em] uppercase">Initializing_Agent_Optics...</div>
    </div>
  );
}

// --- 2. MONITEUR LIVE ---
function OperatorCamera({ room, name }: { room: string, name: string }) {
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


// --- COMPOSANT PRINCIPAL (LE DASHBOARD DE LA PHOTO) ---
export default function OperatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "INITIALIZING_VANTIX_OPERATOR_CORE...",
    "UPLINK_ESTABLISHED_SECTOR:MATAWINIE",
    "DECRYPTING_LOCAL_AGENT_STREAMS..."
  ]);

  useEffect(() => {
    const checkClearance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/register');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkClearance();
  }, [router]);

  const addLog = (msg: string) => {
    setTerminalLogs(prev => [`${new Date().toLocaleTimeString()} > ${msg}`, ...prev].slice(0, 8));
  };

  if (loading) return <div className="min-h-screen bg-black text-violet-500 flex items-center justify-center font-mono uppercase tracking-widest text-xs animate-pulse">Loading_Tactical_Interface...</div>;

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col font-mono overflow-hidden relative">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="crt-overlay pointer-events-none z-50" />

      {/* HEADER TACTIQUE */}
      <header className="p-3 border-b border-white/10 flex justify-between items-center z-40 bg-black">
        <div className="flex items-center gap-4 border border-violet-500/30 p-2 text-violet-400">
           <Radio size={16} className="animate-pulse"/>
           <div className="tracking-[0.6em] font-black text-xs italic uppercase text-white">NORD.VANTIX <span className="text-violet-500">:: OPERATOR</span></div>
        </div>
        <div className="flex gap-8 text-[9px] font-black text-gray-600 uppercase tracking-widest">
           <div>SECTOR: <span className="text-white">MATAWINIE</span></div>
           <div>SYS_LOAD: <span className="text-green-500 animate-pulse">OPTIMAL (14ms)</span></div>
           <div>ENCRYPTION: <span className="text-white">AES-256</span></div>
        </div>
      </header>

      {/* GRILLE CENTRALE DE CONTRÔLE (COMME LA PHOTO) */}
      <div className="flex-1 p-6 grid grid-cols-12 gap-5 z-20 overflow-hidden relative">
        
        {/* COLONNE GAUCHE (Data Agent & Marché) */}
        <div className="col-span-3 space-y-5">
          <TacticalPanel title="Agent_Identity" icon={Shield}>
            <div className="flex items-center gap-3 border border-white/10 p-3 bg-black/40">
              <Eye className="text-violet-500" size={24} />
              <div>
                 <div className="text-xs font-black text-white">{user?.email?.split('@')[0].toUpperCase()}</div>
                 <div className="text-[8px] text-violet-400">STATUS: ACTIVE_NODE</div>
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

        {/* CENTRE : LA CAMÉRA DE L'AGENT */}
        <div className="col-span-6 relative border-2 border-violet-500/50 flex flex-col p-2 bg-black overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)]">
          <div className="absolute top-4 left-4 border-l-2 border-t-2 border-violet-400 w-10 h-10 z-10 pointer-events-none" />
          <div className="absolute top-4 right-4 border-r-2 border-t-2 border-violet-400 w-10 h-10 z-10 pointer-events-none" />
          <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-violet-400 w-10 h-10 z-10 pointer-events-none" />
          <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-violet-400 w-10 h-10 z-10 pointer-events-none" />
          
          <div className="w-full flex justify-between items-center text-[8px] font-black tracking-widest uppercase text-violet-300 p-2 border-b border-violet-500/20 mb-2 z-10">
              <div>// LIVE_UPLINK :: TRANSMITTING //</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> REC //</div>
          </div>

          <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
            {/* L'Opérateur se voit lui-même ici pour transmettre */}
            <OperatorCamera room={`room-${user?.id}`} name="Agent_Camera" />
            
            {/* Réticule de visée central pour le style photo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
               <div className="w-64 h-64 border border-violet-500/50 rounded-full flex items-center justify-center relative">
                  <div className="absolute w-full h-[1px] bg-violet-500/50" />
                  <div className="absolute h-full w-[1px] bg-violet-500/50" />
                  <div className="w-32 h-32 border border-violet-500/80 rounded-full" />
               </div>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (Contrôles & Stats) */}
        <div className="col-span-3 space-y-5 flex flex-col">
          <TacticalPanel title="Sector_Coordinates" icon={Network}>
              <div className="flex gap-3 text-xs border border-white/10 p-3 bg-black text-center">
                  <div className="flex-1"><Map className="mx-auto text-violet-500 mb-1" size={16}/> <span className="text-[9px]">LOC: 46.12, -73.65</span></div>
                  <div className="flex-1"><Target className="mx-auto text-green-500 mb-1" size={16}/> <span className="text-[9px]">PING: 14ms</span></div>
              </div>
          </TacticalPanel>

          <TacticalPanel title="Data_Matrices" icon={Database}>
             <div className="h-28 overflow-hidden text-gray-800 text-[6px] tracking-tight leading-none bg-black border border-white/5 p-2 break-all opacity-40">
                {Array(600).fill(0).map(() => Math.floor(Math.random()*16).toString(16))}
             </div>
          </TacticalPanel>

          <div className="flex-1 border border-red-500/30 bg-red-900/10 p-4 font-mono backdrop-blur-sm flex flex-col justify-end">
             <button 
               onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
               className="w-full py-4 border border-red-500/30 text-red-500 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500/10 transition-all text-center"
             >
                [ TERMINATE_NODE ]
             </button>
          </div>
        </div>
      </div>

      {/* LOG FOOTER (Journal Système de la photo) */}
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