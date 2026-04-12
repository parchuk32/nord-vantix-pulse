"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Shield, Activity, Target, Terminal, Database, Map, Eye, 
  Radio, LayoutDashboard, CreditCard, Settings, MessageSquare, 
  Play, Square, Send, Wallet, Lock, Crosshair, AlertTriangle, 
  Unlock, User, Bell, Volume2, Palette, X, Maximize2
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

// --- 1. RENDU VIDÉO PLEIN ÉCRAN ---
function VideoRenderer({ isDeployed }: { isDeployed: boolean }) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  return activeTrack ? (
    <VideoTrack trackRef={activeTrack} className={`absolute inset-0 w-full h-full ${isDeployed ? 'object-cover' : 'object-cover grayscale opacity-60'}`} />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4" />
      <div className="text-[10px] text-violet-500 animate-pulse uppercase">Searching_Signal...</div>
    </div>
  );
}

export default function OperatorMobileSystem() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'hub' | 'wallet' | 'settings'>('hub');
  const [isLive, setIsLive] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false); // Mode Plein Écran
  const [chatMessage, setChatMessage] = useState("");
  const [mission, setMission] = useState<any>(null);
  const [stats, setStats] = useState({ viewers: 0, bounty: 0 });
  const [chat, setChat] = useState([{ s: "SYS", m: "CORE_READY", t: "21:00" }]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register'); else setUser(session.user);
    };
    checkAuth();
  }, [router]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.startsWith('/bounty')) setStats({ ...stats, bounty: stats.bounty + 500 });
    if (chatMessage.startsWith('/viewers')) setStats({ ...stats, viewers: stats.viewers + 50 });
    setChat([...chat, { s: "OP", m: chatMessage, t: "NOW" }]);
    setChatMessage("");
  };

  if (!user) return null;

  // ==========================================
  // VUE 1 : MODE DÉPLOIEMENT (FULL SCREEN)
  // ==========================================
  if (isDeployed) {
    return (
      <main className="h-screen w-screen bg-black relative overflow-hidden font-mono">
        <div className="absolute inset-0 z-0">
           <LiveKitRoom video={true} audio={true} token="TOKEN_HERE" serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={isLive}>
              <VideoRenderer isDeployed={true} />
           </LiveKitRoom>
        </div>
        
        {/* HUD de combat */}
        <div className="absolute inset-0 z-10 pointer-events-none border-[20px] border-transparent border-t-violet-500/20 border-b-violet-500/20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
        
        {/* Overlay Chat & Stats */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <div className="bg-black/60 border-l-2 border-red-500 p-3 backdrop-blur-md">
              <div className="text-red-500 text-[10px] font-black animate-pulse">● LIVE // {mission?.objective}</div>
              <div className="text-white text-[10px] mt-1">${stats.bounty} / ${mission?.targetBounty}</div>
            </div>
            <button onClick={() => setIsDeployed(false)} className="pointer-events-auto p-3 bg-black/60 border border-white/10 rounded-full text-white"><X size={20}/></button>
          </div>

          <div className="w-full max-w-[280px] space-y-2 pointer-events-auto">
             <div className="h-40 overflow-y-auto bg-black/40 backdrop-blur-sm p-3 space-y-2 text-[10px]">
                {chat.map((c, i) => (
                  <div key={i}><span className="text-violet-400 font-bold">{c.s}:</span> <span className="text-gray-200">{c.m}</span></div>
                ))}
             </div>
             <form onSubmit={handleCommand} className="flex gap-2">
                <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} className="flex-1 bg-black/60 border border-white/20 p-3 text-xs outline-none text-white" placeholder="Type command..." />
                <button className="bg-violet-600 px-4 text-white"><Send size={16}/></button>
             </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen bg-[#050505] text-white flex flex-col font-mono relative">
      <div className="crt-overlay pointer-events-none opacity-20" />

      {/* HEADER NOMADE */}
      <header className="p-5 border-b border-white/10 flex justify-between items-center bg-black/80 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Vantix_OS 3.0</span>
        </div>
        <div className="text-[10px] text-gray-500 uppercase">Sector: Matawinie</div>
      </header>

      {/* ZONE DE CONTENU VARIABLE */}
      <div className="flex-1 overflow-y-auto pb-24 p-5 space-y-6">
        
        {/* ONGLET HUB (MISSION & CAMERA) */}
        {activeTab === 'hub' && (
          <div className="space-y-6">
            <div className="aspect-video bg-zinc-900 border border-white/10 relative rounded-lg overflow-hidden shadow-2xl">
               <VideoRenderer isDeployed={false} />
               {!isLive && <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-black text-[10px] tracking-widest text-gray-500 italic">SYSTEM_OFFLINE</div>}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setIsLive(!isLive)} className={`p-4 border-2 font-black text-[10px] tracking-widest uppercase transition-all ${isLive ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 text-gray-500'}`}>
                 {isLive ? '[ DISCONNECT ]' : '[ CONNECT_UPLINK ]'}
               </button>
               <button 
                 disabled={!isLive} 
                 onClick={() => {
                   setMission({ objective: "INFILTRATE_DATABASE", targetBounty: 2500, targetViewers: 100 });
                   setIsDeployed(true);
                 }} 
                 className="p-4 bg-violet-600 text-white font-black text-[10px] tracking-widest uppercase disabled:opacity-20"
               >
                 [ DEPLOY_MISSION ]
               </button>
            </div>

            {/* QUICK STATS */}
            <div className="p-4 border border-white/5 bg-white/5 rounded-xl flex justify-around">
               <div className="text-center"><div className="text-gray-500 text-[8px] uppercase mb-1">Watchers</div><div className="text-lg font-black">{stats.viewers}</div></div>
               <div className="text-center"><div className="text-gray-500 text-[8px] uppercase mb-1">Bounty</div><div className="text-lg font-black text-amber-500">${stats.bounty}</div></div>
            </div>
          </div>
        )}

        {/* ONGLET WALLET / BILLING */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 bg-gradient-to-br from-violet-900/40 to-black border border-violet-500/30 rounded-2xl">
               <div className="text-[10px] text-violet-400 uppercase tracking-widest mb-2 font-bold">Total_Clearance_Funds</div>
               <div className="text-4xl font-black italic">$75,430.22</div>
            </div>
            <div className="space-y-3">
               <div className="p-4 bg-white/5 border border-white/5 flex justify-between items-center rounded-lg">
                  <div className="text-[10px] uppercase font-bold">Withdraw to Crypto</div>
                  <ChevronRight size={16} className="text-violet-500"/>
               </div>
               <div className="p-4 bg-white/5 border border-white/5 flex justify-between items-center rounded-lg">
                  <div className="text-[10px] uppercase font-bold">Transaction History</div>
                  <ChevronRight size={16} className="text-violet-500"/>
               </div>
            </div>
          </div>
        )}

        {/* ONGLET PARAMÈTRES (CONFIG UTILISATEUR) */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-5 p-4 border-b border-white/10">
               <div className="w-16 h-16 rounded-full border-2 border-violet-500 p-1">
                  <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center font-black text-xl italic">T</div>
               </div>
               <div>
                  <div className="text-sm font-black uppercase italic tracking-widest">Tristan_Operator</div>
                  <div className="text-[8px] text-violet-400 uppercase font-bold">Rank: Elite Ghost</div>
               </div>
            </div>

            <div className="space-y-6">
               <section>
                  <div className="text-[8px] text-gray-600 uppercase tracking-[0.3em] mb-4">Tactical_Preferences</div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center"><div className="flex items-center gap-3 text-xs"><Bell size={16}/> Notifications</div> <div className="w-10 h-5 bg-violet-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"/></div></div>
                     <div className="flex justify-between items-center"><div className="flex items-center gap-3 text-xs"><Volume2 size={16}/> System Sounds</div> <div className="w-10 h-5 bg-violet-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"/></div></div>
                     <div className="flex justify-between items-center"><div className="flex items-center gap-3 text-xs"><Palette size={16}/> Theme: High Contrast</div> <div className="text-[9px] text-violet-500 font-black">ACTIVE</div></div>
                  </div>
               </section>

               <button className="w-full py-4 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                 Terminate_All_Sessions
               </button>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM TAB BAR (NAV MOBILE) --- */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 border-t border-white/10 backdrop-blur-xl z-50 flex justify-around items-center px-6">
        <button onClick={() => setActiveTab('hub')} className={`flex flex-col items-center gap-1 ${activeTab === 'hub' ? 'text-violet-500' : 'text-gray-600'}`}>
          <LayoutDashboard size={20} /> <span className="text-[8px] font-bold uppercase tracking-widest">HUB</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 ${activeTab === 'wallet' ? 'text-violet-500' : 'text-gray-600'}`}>
          <Wallet size={20} /> <span className="text-[8px] font-bold uppercase tracking-widest">BANK</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-violet-500' : 'text-gray-600'}`}>
          <User size={20} /> <span className="text-[8px] font-bold uppercase tracking-widest">USER</span>
        </button>
      </footer>
    </main>
  );
}