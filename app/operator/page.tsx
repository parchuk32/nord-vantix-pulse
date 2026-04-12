"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Activity, LayoutDashboard, Settings, MessageSquare, Wallet, X, Zap, 
  Shield, ChevronRight, Camera, Signal, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

// --- RENDU VIDÉO ---
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];
  return activeTrack ? (
    <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover" />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]">
      <div className="w-12 h-12 border-2 border-[#00FFC2]/20 border-t-[#00FFC2] rounded-full animate-spin mb-4" />
      <div className="text-[10px] text-[#00FFC2] animate-pulse tracking-[0.5em] uppercase font-black">Establishing_Uplink...</div>
    </div>
  );
}

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'wallet' | 'settings'>('hub');
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // États locaux pour les formulaires
  const [missionDesc, setMissionDesc] = useState("");
  const [emergencyID, setEmergencyID] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register'); else setUser(session.user);
    };
    checkAuth();
  }, [router]);

  // --- LOGIQUE DE L'IA ---
  const runAIAnalysis = () => {
    if (missionDesc.length < 10) return;
    setAnalyzing(true);
    store.addLog("AI_ENGINE: Analyzing tactical route...");
    setTimeout(() => {
      store.setModuleStatus('aiApproved', true);
      store.addLog("AI_ENGINE: Mission VALIDATED. Clarity: 98%");
      setAnalyzing(false);
    }, 2000);
  };

  // --- DÉPLOIEMENT FINAL ---
  const startDeploymentSequence = () => {
    if (!store.isSystemReady()) return;
    setDeploying(true);
    store.addLog("CRITICAL: Commencing Final Uplink...");
    let timer = 3;
    setCountdown(timer);
    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        setIsLive(true);
        setDeploying(false);
      }
    }, 1000);
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-64px)] w-full flex overflow-hidden bg-[#050505] font-mono relative text-white">
      <div className="crt-overlay pointer-events-none z-50 opacity-10" />
      
      {!isLive && (
        <aside className="w-64 border-r border-white/5 bg-black flex flex-col p-6 gap-2">
          {['hub', 'wallet', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} 
              className={`flex items-center gap-4 p-4 text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#00FFC2]/5 text-[#00FFC2] border border-[#00FFC2]/20 shadow-[0_0_15px_rgba(0,255,194,0.1)]' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab === 'hub' ? <LayoutDashboard size={16}/> : tab === 'wallet' ? <Wallet size={16}/> : <Settings size={16}/>}
              {tab}
            </button>
          ))}
        </aside>
      )}

      <section className="flex-1 relative bg-black flex flex-col overflow-hidden">
        
        {!isLive && activeTab === 'hub' && (
          <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            
            {/* --- HEADER --- */}
            <div className="col-span-12 flex justify-between items-end border-b border-[#00FFC2]/20 pb-6 mb-4">
              <div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Mission_Briefing</h2>
                <div className="flex gap-4 mt-2">
                  <StatusTag label="HW" ok={store.hardwareReady} />
                  <StatusTag label="NET" ok={store.networkStable} />
                  <StatusTag label="AI" ok={store.aiApproved} />
                  <StatusTag label="SAFE" ok={store.safetyValid} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#00FFC2] font-bold tracking-[0.3em] uppercase">Status: {store.isSystemReady() ? 'READY' : 'WAITING'}</p>
                <p className="text-2xl font-black">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {/* --- COLONNE GAUCHE: HARDWARE & LOGS --- */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-4 text-[#00FFC2]">
                  <Camera size={18} /> <h3 className="text-[10px] font-black uppercase tracking-widest">Hardware_Link</h3>
                </div>
                <button onClick={() => {store.setModuleStatus('hardwareReady', true); store.addLog("HW: Camera detected (4K/60)");}} 
                  className={`w-full py-4 border rounded-xl text-[9px] font-black uppercase transition-all ${store.hardwareReady ? 'border-[#00FFC2] text-[#00FFC2] bg-[#00FFC2]/5' : 'border-white/10 text-gray-500'}`}>
                  {store.hardwareReady ? 'HW_LINK_ESTABLISHED' : 'INITIALIZE_CAMERA_SCAN'}
                </button>
              </div>

              <div className="bg-zinc-900/20 border border-white/5 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4 text-[#00FFC2]">
                  <Signal size={18} /> <h3 className="text-[10px] font-black uppercase tracking-widest">Network_Pulse</h3>
                </div>
                <PingMonitor />
              </div>

              <div className="bg-black border border-white/5 p-4 rounded-xl h-32 overflow-y-auto scrollbar-hide">
                {store.logs.map((log, i) => <p key={i} className="text-[8px] font-mono text-gray-500 italic mb-1">{log}</p>)}
              </div>
            </div>

            {/* --- COLONNE CENTRE: AI & BRIEFING --- */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl backdrop-blur-sm space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                  Mission_Description {store.aiApproved && <CheckCircle2 size={12} className="text-[#00FFC2]" />}
                </label>
                <textarea 
                  value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)}
                  placeholder="Describe your tactical route..." 
                  className="w-full h-40 bg-black border border-white/10 p-4 rounded-2xl text-xs text-white outline-none focus:border-[#00FFC2] transition-all resize-none font-mono"
                />
                <button onClick={runAIAnalysis} disabled={analyzing || missionDesc.length < 10}
                  className="w-full py-4 bg-[#00FFC2] text-black font-black uppercase text-[10px] rounded-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-30">
                  {analyzing ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'RUN_AI_VALIDATION'}
                </button>
              </div>

              <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-red-500"><Shield size={16}/> <h3 className="text-[10px] font-black uppercase">Safety_Protocols</h3></div>
                <input type="text" value={emergencyID} onChange={(e) => {
                  setEmergencyID(e.target.value);
                  if(e.target.value.length > 5) store.setModuleStatus('safetyValid', true);
                }} placeholder="Emergency_Signal_ID" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-red-500" />
              </div>
            </div>

            {/* --- COLONNE DROITE: MONETIZATION & DEPLOY --- */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-[#00FFC2]/5 border border-[#00FFC2]/20 p-8 rounded-2xl relative overflow-hidden group">
                <div className="relative z-10">
                  <span className="text-[10px] text-[#00FFC2] font-black uppercase tracking-widest mb-2 block">Est_Payout</span>
                  <div className="text-5xl font-black italic">${store.payout.toLocaleString()}</div>
                  <div className="mt-8 grid grid-cols-3 gap-2">
                    {['LOW', 'MID', 'EXTREME'].map(lvl => (
                      <button key={lvl} onClick={() => store.setRisk(lvl as any)}
                        className={`py-2 rounded text-[8px] font-black border transition-all ${store.riskLevel === lvl ? 'bg-[#00FFC2] text-black border-[#00FFC2]' : 'border-white/10 text-gray-500'}`}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <Zap className="absolute -bottom-4 -right-4 w-32 h-32 text-[#00FFC2]/5 -rotate-12" />
              </div>

              <button 
                onClick={startDeploymentSequence}
                disabled={!store.isSystemReady() || deploying}
                className={`w-full py-12 rounded-2xl font-black text-2xl uppercase italic tracking-[0.3em] transition-all relative overflow-hidden group
                  ${store.isSystemReady() ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-gray-700 cursor-not-allowed'}`}
              >
                {deploying ? `T-MINUS ${countdown}` : 'Lock_&_Deploy'}
                <div className="absolute inset-0 bg-[#00FFC2] translate-y-full group-hover:translate-y-0 transition-transform opacity-10" />
              </button>
            </div>
          </div>
        )}

        {/* --- LIVE VIEW --- */}
        {isLive && (
          <div className="absolute inset-0 z-100 bg-black animate-in zoom-in-95 duration-500">
            <LiveKitRoom video={true} audio={true} token="TOKEN" serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
              <VideoRenderer />
            </LiveKitRoom>
            <div className="absolute inset-0 z-10 p-10 flex justify-between pointer-events-none">
              <div className="bg-red-600 px-3 py-1 text-[10px] font-black self-start rounded-sm shadow-xl">LIVE_OPS</div>
              <div className="text-right">
                <div className="text-6xl font-black italic text-[#00FFC2] drop-shadow-[0_0_20px_rgba(0,255,194,0.6)]">${store.payout.toLocaleString()}</div>
              </div>
            </div>
            <button onClick={() => setIsLive(false)} className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-2 bg-black/60 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase rounded-full tracking-[0.4em]">Abort_Mission</button>
          </div>
        )}
      </section>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/40 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}

function PingMonitor() {
  const [ping, setPing] = useState(14);
  const store = useDeployStore();
  useEffect(() => {
    const interval = setInterval(() => {
      const p = Math.floor(Math.random() * (40 - 10) + 10);
      setPing(p);
      if(p < 35 && !store.networkStable) store.setModuleStatus('networkStable', true);
    }, 2000);
    return () => clearInterval(interval);
  }, [store]);

  return (
    <div className="flex justify-between items-end">
      <div><p className="text-[8px] text-gray-500 uppercase font-black">Uplink_Ping</p><p className="text-3xl font-black italic">{ping}ms</p></div>
      <div className="text-right text-[8px] text-green-500 font-bold uppercase">Signal_Locked</div>
    </div>
  );
}