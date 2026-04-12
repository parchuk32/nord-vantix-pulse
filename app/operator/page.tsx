"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Activity, LayoutDashboard, Settings, MessageSquare, Wallet, X, Zap, 
  Shield, ChevronRight, Camera, Signal, Loader2, CheckCircle2, AlertTriangle, Lock, Eye, EyeOff
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'wallet' | 'settings'>('hub');
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showWaiver, setShowWaiver] = useState(false);
  const [missionDesc, setMissionDesc] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register'); else setUser(session.user);
    };
    checkAuth();
  }, [router]);

  const handleDeploy = async () => {
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
                activeTab === tab ? 'bg-[#00FFC2]/5 text-[#00FFC2] border border-[#00FFC2]/20' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab === 'hub' ? <LayoutDashboard size={16}/> : tab === 'wallet' ? <Wallet size={16}/> : <Settings size={16}/>}
              {tab}
            </button>
          ))}
        </aside>
      )}

      <section className="flex-1 relative bg-black flex flex-col overflow-hidden">
        
        {/* --- HUB : TACTICAL BRIEFING --- */}
        {!isLive && activeTab === 'hub' && (
          <div className="p-8 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 animate-in fade-in duration-500">
            <div className="col-span-12 flex justify-between items-end border-b border-[#00FFC2]/20 pb-6 mb-4">
              <div>
                <h2 className="text-5xl font-black uppercase italic tracking-tighter">Mission_Protocol</h2>
                <div className="flex gap-4 mt-2">
                  <StatusTag label="HW" ok={store.hardwareReady} />
                  <StatusTag label="AI" ok={store.aiApproved} />
                  <StatusTag label="SAFE" ok={store.safetyValid} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#00FFC2] font-black uppercase tracking-[0.3em]">Status: {store.isSystemReady() ? 'READY' : 'LOCKED'}</p>
                <p className="text-2xl font-black uppercase italic">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 space-y-6">
              <div className="bg-zinc-900/10 border border-white/5 p-8 rounded-2xl space-y-6">
                <div className="flex items-center gap-3 text-[#00FFC2]">
                  <Zap size={18} /> <h3 className="text-[10px] font-black uppercase">Contract_Definition</h3>
                </div>
                <textarea 
                  value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)}
                  placeholder="Describe your tactical route... (Min. 10 chars)"
                  className="w-full h-32 bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-[#00FFC2] transition-all"
                />
                <button 
                  onClick={() => {store.setModuleStatus('aiApproved', true); store.addLog("AI: Route Validated.");}}
                  className="w-full py-4 bg-[#00FFC2] text-black font-black text-[10px] uppercase rounded-xl hover:scale-[1.01] active:scale-95 transition-all">
                  RUN_AI_VALIDATION
                </button>
              </div>

              <div className={`p-8 rounded-2xl border transition-all ${store.safetyValid ? 'bg-[#00FFC2]/5 border-[#00FFC2]/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                    <h3 className="text-[10px] font-black uppercase">Legal_Waiver_&_Safety</h3>
                  </div>
                  {!store.safetyValid && <button onClick={() => setShowWaiver(true)} className="px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase rounded-md">Review & Sign</button>}
                  {store.safetyValid && <CheckCircle2 size={20} className="text-[#00FFC2]" />}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-6">
              <div className="bg-[#00FFC2]/5 border border-[#00FFC2]/20 p-8 rounded-2xl group relative overflow-hidden">
                <span className="text-[10px] text-[#00FFC2] font-black uppercase mb-2 block">Est_Payout</span>
                <div className="text-5xl font-black italic">${store.payout.toLocaleString()}</div>
                <div className="mt-8 flex gap-2">
                  {['LOW', 'MID', 'EXTREME'].map(lvl => (
                    <button key={lvl} onClick={() => store.setRisk(lvl as any)}
                      className={`flex-1 py-2 rounded text-[8px] font-black border transition-all ${store.riskLevel === lvl ? 'bg-[#00FFC2] text-black border-[#00FFC2]' : 'border-white/10 text-gray-500'}`}>{lvl}</button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleDeploy}
                disabled={!store.isSystemReady() || deploying}
                className={`w-full py-12 rounded-2xl font-black text-3xl uppercase italic tracking-[0.3em] transition-all ${store.isSystemReady() ? 'bg-white text-black hover:scale-[1.02]' : 'bg-zinc-900/50 text-gray-700 cursor-not-allowed'}`}>
                {deploying ? `T-MINUS ${countdown}` : 'Lock_&_Deploy'}
              </button>
            </div>
          </div>
        )}

        {/* --- SETTINGS : REAL INFO --- */}
        {!isLive && activeTab === 'settings' && (
          <div className="p-10 max-w-4xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black italic uppercase border-b border-white/10 pb-4">Operator_Settings</h2>
            <div className="grid gap-8">
              <div className="bg-zinc-900/30 p-8 rounded-3xl border border-white/5 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-black uppercase">Stream_Resolution</label>
                    <select 
                      value={store.streamConfig.quality}
                      onChange={(e) => store.updateSettings({ quality: e.target.value })}
                      className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2]">
                      <option value="4K_ULTRA">4K // 60FPS // 20Mbps</option>
                      <option value="1080P">1080P // 60FPS // 8Mbps</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-500 font-black uppercase">Low_Latency_Mode</label>
                    <button 
                      onClick={() => store.updateSettings({ lowLatency: !store.streamConfig.lowLatency })}
                      className={`w-full py-4 border rounded-xl flex items-center justify-center gap-3 transition-all ${store.streamConfig.lowLatency ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-white/10 text-gray-600'}`}>
                      {store.streamConfig.lowLatency ? <Activity size={16}/> : <Zap size={16}/>}
                      <span className="text-[9px] font-black uppercase">{store.streamConfig.lowLatency ? 'Uplink_Prioritized' : 'Quality_Prioritized'}</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-gray-500 font-black uppercase">HUD_Accent_Color</label>
                  <div className="flex gap-4">
                    {['#00FFC2', '#FF0055', '#A855F7', '#FFFFFF'].map(color => (
                      <button 
                        key={color} 
                        onClick={() => store.updateSettings({ overlayColor: color })}
                        style={{ backgroundColor: color }} 
                        className={`w-12 h-12 rounded-full border-2 ${store.streamConfig.overlayColor === color ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LIVE VIEW --- */}
        {isLive && (
          <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-500">
            <LiveKitRoom video={true} audio={true} token="TOKEN" serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
               <VideoTrack trackRef={useTracks([Track.Source.Camera])[0]} className="absolute inset-0 w-full h-full object-cover" />
            </LiveKitRoom>
            <div className="absolute inset-0 z-10 p-10 flex justify-between pointer-events-none">
              <div className="bg-red-600 px-3 py-1 text-[10px] font-black self-start rounded-sm shadow-xl">LIVE_OPS</div>
              <div className="text-right">
                <div className="text-6xl font-black italic drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ color: store.streamConfig.overlayColor }}>
                  ${store.payout.toLocaleString()}
                </div>
              </div>
            </div>
            <button onClick={() => setIsLive(false)} className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-2 bg-black/60 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase rounded-full tracking-[0.4em]">Abort_Mission</button>
          </div>
        )}
      </section>

      {/* --- MODALE DE DÉCHARGE --- */}
      {showWaiver && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-3xl p-10 space-y-6">
            <div className="flex items-center gap-3 text-red-500 mb-4"><AlertTriangle size={24} /><h2 className="text-2xl font-black uppercase italic tracking-tighter">Safety_Contract_v4.0</h2></div>
            <div className="h-48 overflow-y-auto text-[10px] text-gray-400 space-y-4 pr-4 font-sans leading-relaxed border-b border-white/5 pb-6">
              <p>1. L'Opérateur reconnaît que le défi comporte des risques inhérents de blessures graves ou de décès.</p>
              <p>2. NORD.VANTIX et PULSE déclinent toute responsabilité en cas d'accident ou dommage matériel.</p>
              <p>3. L'Opérateur certifie agir de sa propre volonté et être en pleine possession de ses moyens.</p>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowWaiver(false)} className="flex-1 py-4 text-[10px] font-black uppercase border border-white/10">Cancel</button>
              <button onClick={() => { store.setModuleStatus('safetyValid', true); setShowWaiver(false); store.setModuleStatus('hardwareReady', true); }}
                className="flex-1 py-4 bg-[#00FFC2] text-black text-[10px] font-black uppercase">Accept & Sign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/40 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}