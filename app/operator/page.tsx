"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Activity, LayoutDashboard, Settings, MessageSquare, 
  Wallet, X, Zap, Target, Users, TrendingUp
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- RENDU VIDÉO ---
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  return activeTrack ? (
    <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover" />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]">
      <div className="w-12 h-12 border-2 border-[#00FFC2]/20 border-t-[#00FFC2] rounded-full animate-spin mb-4" />
      <div className="text-[10px] text-[#00FFC2] animate-pulse tracking-[0.5em] uppercase font-black">
        Establishing_Uplink...
      </div>
    </div>
  );
}

export default function PulseOperatorHub() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'wallet' | 'settings'>('hub');
  
  // Données de mission (Identiques à la photo)
  const [mission] = useState({
    title: "Crane Height Challenge",
    payout: 7500,
    progress: 62,
    tasks: ["JUMP TO ADJACENT ROOF", "CLIMB TO TOP OF CRANE"]
  });

  const [stats] = useState({ watchers: 25478, pool: 28451.25, balance: 2140.75 });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register'); else setUser(session.user);
    };
    checkAuth();
  }, [router]);

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-[#050505] font-mono relative">
      <div className="crt-overlay pointer-events-none z-50 opacity-10" />
      
      {/* --- SIDEBAR DE GAUCHE (Navigation Hub) --- */}
      {!isLive && (
        <aside className="w-64 border-r border-white/5 bg-black flex flex-col p-6 gap-2">
          <button onClick={() => setActiveTab('hub')} 
            className={`flex items-center gap-4 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'hub' ? 'bg-[#00FFC2]/5 text-[#00FFC2] border border-[#00FFC2]/20' : 'text-gray-500 hover:text-gray-300'
            }`}>
            <LayoutDashboard size={16}/> Dashboard
          </button>
          <button onClick={() => setActiveTab('wallet')} 
            className={`flex items-center gap-4 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'wallet' ? 'bg-[#00FFC2]/5 text-[#00FFC2] border border-[#00FFC2]/20' : 'text-gray-500 hover:text-gray-300'
            }`}>
            <Wallet size={16}/> Wallet
          </button>
          <button onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-4 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'settings' ? 'bg-[#00FFC2]/5 text-[#00FFC2] border border-[#00FFC2]/20' : 'text-gray-500 hover:text-gray-300'
            }`}>
            <Settings size={16}/> Settings
          </button>
        </aside>
      )}

      {/* --- ZONE DE CONTENU PRINCIPALE --- */}
      <section className="flex-1 relative bg-black flex flex-col overflow-hidden">
        
        {/* SETUP HUB (Avant de lancer le live) */}
        {!isLive && activeTab === 'hub' && (
          <div className="p-12 max-w-5xl mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-6xl font-black uppercase italic tracking-tighter text-white/90">Operator Setup</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profil */}
                <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl flex items-center gap-8 backdrop-blur-sm">
                   <div className="w-32 h-32 rounded-xl bg-zinc-800 border-2 border-[#00FFC2]/30 overflow-hidden relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Agent" className="grayscale object-cover" />
                   </div>
                   <div>
                      <div className="text-[10px] text-[#00FFC2] font-black tracking-[0.4em] uppercase mb-1">Status: Active</div>
                      <div className="text-3xl font-black italic uppercase leading-none">{user.email?.split('@')[0]}</div>
                      <button className="mt-4 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Modify Intel</button>
                   </div>
                </div>

                {/* Balance */}
                <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Available_Credits</div>
                   <div className="text-5xl font-black italic text-[#00FFC2] shadow-[#00FFC2]/20 drop-shadow-lg">${stats.balance.toLocaleString()}</div>
                </div>
             </div>

             {/* Bouton DEPLOY (Initialize Live) */}
             <button 
                onClick={() => setIsLive(true)}
                className="group relative w-full py-12 bg-white text-black font-black text-3xl uppercase italic tracking-[0.5em] rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
             >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="group-hover:tracking-[0.7em] transition-all duration-500">Initialize Deployment</span>
                  <span className="text-[10px] tracking-[0.2em] font-normal opacity-50">Secure Uplink via LiveKit Network</span>
                </div>
                <div className="absolute inset-0 bg-[#00FFC2] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500" />
             </button>
          </div>
        )}

        {/* INTERFACE LIVE (Look identique à la photo) */}
        {isLive && (
          <div className="absolute inset-0 z-40 bg-black flex animate-in fade-in zoom-in-95 duration-500">
            
            {/* STREAM CENTRAL */}
            <div className="flex-1 relative border-r border-white/5 overflow-hidden">
              <LiveKitRoom 
                video={true} audio={true} 
                token="TOKEN" 
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
                connect={true} 
                className="h-full w-full"
              >
                <VideoRenderer />
              </LiveKitRoom>

              {/* HUD OVERLAY (Comme sur l'image) */}
              <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-red-600 px-3 py-1 text-[10px] font-black text-white flex items-center gap-2 rounded-sm shadow-xl shadow-red-900/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-[#00FFC2] border border-white/10 rounded-sm">
                      LOW LATENCY // {stats.watchers.toLocaleString()} WATCHERS
                    </div>
                  </div>
                  <div className="text-4xl font-black italic text-[#00FFC2] drop-shadow-[0_0_15px_rgba(0,255,194,0.4)]">
                    ${stats.balance.toLocaleString()}
                  </div>
                </div>

                {/* Challenge Info Panel */}
                <div className="max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl pointer-events-auto">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Active Challenge</div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter">{mission.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] text-gray-500 uppercase font-black">Payout</div>
                        <div className="text-xl font-black text-[#00FFC2]">${mission.payout.toLocaleString()}</div>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-[#00FFC2] uppercase tracking-[0.2em] animate-pulse">Final Task</span>
                        <span className="text-2xl font-black italic">{mission.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00FFC2] shadow-[0_0_15px_#00FFC2] transition-all duration-1000" style={{ width: `${mission.progress}%` }} />
                      </div>
                      <div className="pt-2">
                         {mission.tasks.map((task, i) => (
                           <div key={i} className="text-[9px] font-bold text-gray-400 uppercase border-l border-[#00FFC2] pl-3 mb-1">
                              {task} // <span className="text-[#00FFC2]">COMPLETED</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>

              <button onClick={() => setIsLive(false)} className="absolute top-6 right-6 z-50 p-2 bg-black/40 border border-white/10 rounded-full hover:bg-red-500 transition-all pointer-events-auto">
                <X size={20}/>
              </button>
            </div>

            {/* SIDEBAR DROITE (Wagers & Chat) */}
            <aside className="w-[380px] bg-black flex flex-col border-l border-white/5">
               {/* Wagers Section */}
               <div className="p-8 border-b border-white/5 bg-[#080808]">
                  <div className="flex items-center gap-2 text-[#00FFC2] font-black uppercase text-[10px] tracking-widest mb-6">
                     <TrendingUp size={16} /> Wagers Pool
                  </div>
                  <div className="text-5xl font-black italic text-white mb-8">${stats.pool.toLocaleString()}</div>
                  
                  <div className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <button className="py-4 bg-[#00FFC2]/5 border border-[#00FFC2]/20 text-[#00FFC2] text-[10px] font-black uppercase hover:bg-[#00FFC2] hover:text-black transition-all">Success 75%</button>
                        <button className="py-4 bg-red-500/5 border border-red-500/20 text-red-500 text-[10px] font-black uppercase hover:bg-red-500 hover:text-black transition-all">Failure 25%</button>
                     </div>
                     <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl hover:bg-[#00FFC2] transition-colors shadow-lg shadow-white/5">Place Bet</button>
                  </div>
               </div>

               {/* Chat Section */}
               <div className="flex-1 flex flex-col p-8 overflow-hidden">
                  <div className="flex items-center gap-2 text-gray-600 font-black uppercase text-[10px] tracking-widest mb-6">
                     <MessageSquare size={16} /> Live_Comms
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-5 mb-6 scrollbar-hide">
                     <div className="flex gap-3">
                        <div className="w-8 h-8 rounded bg-[#00FFC2]/10 flex items-center justify-center text-[9px] font-black text-[#00FFC2]">TX</div>
                        <div>
                           <div className="text-[10px] font-black uppercase text-[#00FFC2]">Operator_X <span className="text-gray-600 text-[8px] ml-2">21:58</span></div>
                           <div className="text-xs text-gray-400 mt-1">Status confirmed. Objective in sight.</div>
                        </div>
                     </div>
                  </div>
                  <div className="relative">
                     <input type="text" placeholder="TRANSMIT MESSAGE..." className="w-full bg-zinc-900 border border-white/5 p-4 rounded-xl text-[10px] outline-none focus:border-[#00FFC2] transition-all" />
                     <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00FFC2] font-black text-[10px]">SEND</button>
                  </div>
               </div>
            </aside>
          </div>
        )}
      </section>

      {/* FOOTER TACTIQUE */}
      <footer className="h-8 absolute bottom-0 w-full border-t border-white/5 bg-black/80 backdrop-blur-md flex justify-between items-center px-6 z-[60]">
        <div className="flex gap-8 text-[7px] font-black text-gray-600 uppercase tracking-widest">
           <div>Uplink: <span className="text-[#00FFC2]">STABLE</span></div>
           <div>Mode: <span className="text-white">OPERATOR_HUB</span></div>
        </div>
        <div className="text-[7px] font-black text-gray-600 uppercase tracking-widest">
           &copy; 2026 NORD.VANTIX // SYSTEM_ID: {user.id.slice(0,8)}
        </div>
      </footer>
    </div>
  );
}