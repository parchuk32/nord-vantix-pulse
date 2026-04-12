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
  Unlock, User, Bell, Volume2, Palette, X, ChevronRight
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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
  const [isDeployed, setIsDeployed] = useState(false);
  const [token, setToken] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [stats, setStats] = useState({ viewers: 0, bounty: 0 });
  const [chat, setChat] = useState([{ s: "SYS", m: "CORE_READY", t: "21:00" }]);

  // 1. GESTION DU JETON VIDÉO (TOKEN)
  useEffect(() => {
    if (isLive && user) {
      fetch(`/api/get-participant-token?room=room-${user.id}&username=Agent_${user.email.split('@')[0]}`)
        .then(res => res.json())
        .then(data => { if(data.token) setToken(data.token); })
        .catch(err => console.error("Token Error:", err));
    } else {
      setToken("");
    }
  }, [isLive, user]);

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
    setChat([...chat, { s: "OP", m: chatMessage, t: "NOW" }]);
    setChatMessage("");
  };

  if (!user) return null;

  return (
    <main className="h-screen w-screen bg-[#050505] text-white flex flex-col font-mono relative overflow-hidden">
      <div className="crt-overlay pointer-events-none opacity-20" />

      {/* --- MODE PLEIN ÉCRAN (DEPLOYED) --- */}
      {isDeployed && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
          <div className="absolute inset-0">
             {token ? (
               <LiveKitRoom video={true} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
                  <VideoRenderer isDeployed={true} />
               </LiveKitRoom>
             ) : (
               <div className="h-full w-full flex items-center justify-center text-red-500 uppercase text-[10px] animate-pulse">Waiting_for_secure_token...</div>
             )}
          </div>
          <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <div className="bg-black/60 border-l-2 border-red-500 p-3 backdrop-blur-md">
                <div className="text-red-500 text-[10px] font-black animate-pulse uppercase">● MISSION_ACTIVE</div>
                <div className="text-white text-[10px] mt-1 tracking-widest uppercase">${stats.bounty} Secured</div>
              </div>
              <button onClick={() => setIsDeployed(false)} className="p-3 bg-black/60 border border-white/10 rounded-full text-white hover:bg-violet-600 transition-colors"><X size={20}/></button>
            </div>
            <div className="w-full max-w-[280px] pointer-events-auto">
               <div className="h-32 overflow-y-auto bg-black/40 backdrop-blur-sm p-3 mb-2 space-y-1 text-[9px]">
                  {chat.map((c, i) => (
                    <div key={i}><span className="text-violet-400 font-bold">{c.s}:</span> {c.m}</div>
                  ))}
               </div>
               <form onSubmit={handleCommand} className="flex gap-2">
                  <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} className="flex-1 bg-black/60 border border-white/20 p-3 text-xs outline-none text-white focus:border-violet-500" placeholder="CMD..." />
                  <button className="bg-violet-600 px-4"><Send size={16}/></button>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* --- INTERFACE STANDARD --- */}
      <header className="p-5 border-b border-white/10 flex justify-between items-center bg-black/80">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase">Vantix_OS</span>
        </div>
        <div className="text-[10px] text-gray-500 uppercase">Sector: Matawinie</div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 p-5 space-y-6">
        {activeTab === 'hub' && (
          <div className="space-y-6">
            <div className="aspect-video bg-zinc-900 border border-white/10 relative rounded-lg overflow-hidden shadow-2xl">
               {token ? (
                 <LiveKitRoom video={true} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
                    <VideoRenderer isDeployed={false} />
                 </LiveKitRoom>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-black text-[10px] tracking-widest text-gray-500 uppercase">System_Offline</div>
               )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setIsLive(!isLive)} className={`p-4 border-2 font-black text-[10px] tracking-widest uppercase transition-all ${isLive ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 text-gray-500'}`}>
                 {isLive ? '[ DISCONNECT ]' : '[ CONNECT_UPLINK ]'}
               </button>
               <button 
                 disabled={!isLive} 
                 onClick={() => setIsDeployed(true)} 
                 className="p-4 bg-violet-600 text-white font-black text-[10px] tracking-widest uppercase disabled:opacity-20"
               >
                 [ FULL_DEPLOY ]
               </button>
            </div>
          </div>
        )}

        {/* ... Autres onglets (wallet, settings) ... */}
        {activeTab === 'wallet' && <div className="p-6 bg-violet-900/10 border border-violet-500/20 rounded-xl"><div className="text-4xl font-black italic">$75,430</div></div>}
        
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="text-[10px] text-gray-600 uppercase tracking-widest border-b border-white/5 pb-2">User_Preferences</div>
            <div className="flex justify-between items-center text-xs"><div className="flex items-center gap-2"><Lock size={14}/> Security 2FA</div> <span className="text-green-500 font-bold uppercase">Active</span></div>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full py-4 bg-red-900/20 text-red-500 border border-red-500/30 text-[10px] font-black uppercase tracking-widest">Logout</button>
          </div>
        )}
      </div>

      {/* NAVIGATION BASSE */}
      <footer className="fixed bottom-0 left-0 right-0 h-20 bg-black border-t border-white/10 backdrop-blur-xl z-50 flex justify-around items-center">
        <button onClick={() => setActiveTab('hub')} className={`flex flex-col items-center gap-1 ${activeTab === 'hub' ? 'text-violet-500' : 'text-gray-600'}`}>
          <LayoutDashboard size={20} /> <span className="text-[8px] font-bold uppercase">HUB</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 ${activeTab === 'wallet' ? 'text-violet-500' : 'text-gray-600'}`}>
          <Wallet size={20} /> <span className="text-[8px] font-bold uppercase">BANK</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-violet-500' : 'text-gray-600'}`}>
          <User size={20} /> <span className="text-[8px] font-bold uppercase">USER</span>
        </button>
      </footer>
    </main>
  );
}