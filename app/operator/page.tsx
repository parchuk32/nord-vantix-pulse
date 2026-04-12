"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Activity, LayoutDashboard, Settings, MessageSquare, 
  Wallet, X, Zap, Target, Users, TrendingUp, Shield, ChevronRight
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
  
  // États pour la mission personnalisable
  const [mission, setMission] = useState({
    title: "Crane Height Challenge",
    payout: 7500,
    progress: 62,
    tasks: ["JUMP TO ADJACENT ROOF", "CLIMB TO TOP OF CRANE"],
    risk: "EXTREME"
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
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-[#050505] font-mono relative text-white">
      <div className="crt-overlay pointer-events-none z-50 opacity-10" />
      
      {/* --- SIDEBAR GAUCHE (Navigation Hub) --- */}
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

      {/* --- ZONE PRINCIPALE --- */}
      <section className="flex-1 relative bg-black flex flex-col overflow-hidden">
        
        {/* --- SETUP HUB : TACTICAL BRIEFING ROOM --- */}
        {!isLive && activeTab === 'hub' && (
          <div className="p-10 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex justify-between items-end border-b border-[#00FFC2]/20 pb-6">
              <div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white">Mission_Briefing</h2>
                <p className="text-[10px] text-[#00FFC2] font-bold tracking-[0.3em] mt-2 italic uppercase">Awaiting Operator Configuration...</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-500 block uppercase">Uplink_Clock</span>
                <span className="text-xl font-black text-white">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900/10 border border-white/5 p-8 rounded-2xl backdrop-blur-sm space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Target_Objective</label>
                      <select 
                        onChange={(e) => setMission({...mission, title: e.target.value})}
                        className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] transition-all cursor-pointer appearance-none"
                      >
                        <option>CRANE_HEIGHT_CHALLENGE</option>
                        <option>URBAN_EXTRACTION</option>
                        <option>MERC_STORE_HEIST</option>
                        <option>HIGH_SPEED_PURSUIT</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Risk_Level</label>
                      <div className="flex gap-2">
                        {['LOW', 'MID', 'EXTREME'].map((level) => (
                          <button 
                            key={level} 
                            onClick={() => setMission({...mission, risk: level})}
                            className={`flex-1 py-3 rounded-lg text-[9px] font-black border transition-all ${
                              mission.risk === level 
                                ? 'border-[#00FFC2] text-[#00FFC2] bg-[#00FFC2]/10' 
                                : 'border-white/10 text-gray-500 hover:border-white/20'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest italic">Intel_Description (For Bot Analysis)</label>
                    <textarea 
                      placeholder="Describe your tactical route or specific stunts for verification..." 
                      className="w-full h-32 bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-[#00FFC2] transition-all resize-none"
                    />
                    <div className="flex items-center gap-2 text-[9px] text-[#00FFC2]/60 italic">
                      <Shield size={12} /> Data cross-referenced via Vantix_Bot uplink.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#00FFC2]/5 border border-[#00FFC2]/20 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden group shadow-lg">
                  <div className="relative z-10">
                    <div className="text-[10px] text-[#00FFC2] font-black uppercase tracking-widest mb-2">Estimated_Payout</div>
                    <div className="text-5xl font-black italic text-white group-hover:scale-110 transition-transform duration-500">${mission.payout.toLocaleString()}</div>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase"><span>Rep_Gain</span> <span>+450</span></div>
                      <div className="flex justify-between text-[9px] font-bold text-gray-500 uppercase"><span>Bot_Status</span> <span className="text-[#00FFC2]">READY</span></div>
                    </div>
                  </div>
                  <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-[#00FFC2]/5 -rotate-12" />
                </div>

                <button 
                  onClick={() => setIsLive(true)}
                  className="w-full group relative overflow-hidden rounded-2xl shadow-[0_0_30px_rgba(0,255,194,0.15)] active:scale-[0.98] transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00FFC2] to-emerald-400" />
                  <div className="relative p-10 flex flex-col items-center gap-3">
                    <span className="text-black font-black text-2xl uppercase italic tracking-[0.3em]">Lock_&_Deploy</span>
                    <div className="flex items-center gap-2 text-[9px] text-black/60 font-black uppercase tracking-widest">
                      <Activity size={12} /> Initialize Neural Uplink
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- INTERFACE PLAYER (FULL SCREEN IMMERSIVE) --- */}
        {isLive && (
          <div className="absolute inset-0 z-40 bg-black flex animate-in fade-in duration-500">
            <div className="h-full w-full relative">
              <LiveKitRoom 
                video={true} audio={true} 
                token="TOKEN" 
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
                connect={true} 
                className="h-full w-full"
              >
                <VideoRenderer />
              </LiveKitRoom>

              <div className="absolute inset-0 z-10 p-10 flex justify-between pointer-events-none">
                {/* HUD GAUCHE */}
                <div className="flex flex-col justify-between h-full w-full max-w-sm">
                  <div className="bg-red-600 px-3 py-1 text-[10px] font-black flex items-center gap-2 rounded-sm self-start shadow-xl shadow-red-900/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE_OPS
                  </div>

                  {/* Mission Box (Transparent Ghost) */}
                  <div className="bg-black/30 backdrop-blur-md border-l-4 border-[#00FFC2] p-6 rounded-r-xl pointer-events-auto">
                    <div className="text-[9px] text-[#00FFC2] font-black tracking-widest mb-1 uppercase italic">Objective_Focus</div>
                    <h3 className="text-2xl font-black uppercase italic mb-4 tracking-tighter leading-none">{mission.title}</h3>
                    <div className="space-y-3">
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00FFC2] shadow-[0_0_10px_#00FFC2]" style={{ width: `${mission.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span className="text-white/40 italic">{mission.progress}% DONE</span>
                        <span className="text-[#00FFC2]">${mission.payout}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HUD DROITE */}
                <div className="flex flex-col justify-between h-full w-[350px]">
                  <div className="text-right flex flex-col items-end">
                    <div className="text-6xl font-black italic text-[#00FFC2] drop-shadow-[0_0_20px_rgba(0,255,194,0.6)]">
                      ${stats.balance.toLocaleString()}
                    </div>
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1 mt-2 text-[10px] font-black text-white/60 border border-white/10 rounded-sm">
                      {stats.watchers.toLocaleString()} VIEWERS
                    </div>
                  </div>

                  {/* CHAT TRANSPARENT (GHOST MODE) */}
                  <div className="h-[400px] flex flex-col bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl pointer-events-auto overflow-hidden shadow-2xl">
                    <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                      <MessageSquare size={14} className="text-[#00FFC2]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Tactical_Comms</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide text-[11px]">
                      <div className="animate-in fade-in slide-in-from-right-2">
                        <span className="text-[#00FFC2] font-black mr-2 uppercase tracking-tighter italic">Operator_Bot:</span>
                        <span className="text-white/80">Uplink verified. Mission is go.</span>
                      </div>
                      <div className="animate-in fade-in slide-in-from-right-2">
                        <span className="text-white/30 font-black mr-2 uppercase tracking-tighter italic">Vantix_Spectre:</span>
                        <span className="text-white/80">Watching the perimeter.</span>
                      </div>
                    </div>

                    <div className="p-4 bg-black/40 border-t border-white/5">
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="TRANSMIT..." 
                          className="w-full bg-white/5 border border-white/10 p-3 rounded text-[10px] text-white outline-none focus:border-[#00FFC2]/50 transition-all"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FFC2] font-black text-[9px]">SEND</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ABORT MISSION (Centered Top) */}
              <button 
                onClick={() => setIsLive(false)} 
                className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-2 bg-black/60 border border-red-500/30 text-red-500/60 hover:text-red-500 hover:border-red-500 transition-all text-[9px] font-black uppercase rounded-full pointer-events-auto tracking-[0.4em] backdrop-blur-sm"
              >
                Abort_Link
              </button>
            </div>
          </div>
        )}
      </section>

      {/* --- FOOTER TACTIQUE --- */}
      <footer className="h-8 absolute bottom-0 w-full border-t border-white/5 bg-black/90 backdrop-blur-md flex justify-between items-center px-6 z-[60]">
        <div className="flex gap-8 text-[7px] font-black text-gray-600 uppercase tracking-widest">
           <div>Uplink: <span className="text-[#00FFC2]">STABLE</span></div>
           <div>Mode: <span className="text-white uppercase italic">{isLive ? "Tactical_Ops" : "Operator_Hub"}</span></div>
        </div>
        <div className="text-[7px] font-black text-gray-500 uppercase tracking-widest">
           &copy; 2026 NORD.VANTIX // SYS_ID: {user.id.slice(0,12)}
        </div>
      </footer>
    </div>
  );
}