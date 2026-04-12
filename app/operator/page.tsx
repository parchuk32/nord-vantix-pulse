"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Activity, LayoutDashboard, Settings, MessageSquare, Wallet, X, Zap, 
  Shield, ChevronRight, Camera, Signal, Loader2, CheckCircle2, AlertTriangle, Lock, Users, Monitor
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
  const [showWaiver, setShowWaiver] = useState(false);
  const [missionDesc, setMissionDesc] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register'); else setUser(session.user);
    };
    checkAuth();
  }, [router]);

  // --- SIGNATURE RÉELLE DU CONTRAT ---
  const signLegalWaiver = async () => {
    store.addLog("LEGAL: Finalizing digital signature...");
    
    const { error } = await supabase
      .from('operator_waivers')
      .insert([{ user_id: user.id, contract_version: '4.0.2' }]);

    if (error) {
      store.addLog("CRITICAL_ERR: Signature uplink failed.");
      return;
    }

    store.setModuleStatus('safetyValid', true);
    store.setModuleStatus('hardwareReady', true); 
    store.addLog("LEGAL: Contract signed and archived.");
    setShowWaiver(false);
  };

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
                activeTab === tab ? 'bg-[#00FFC2]/5 text-[#00FFC2] border border-[#00FFC2]/20 shadow-[0_0_15px_rgba(0,255,194,0.1)]' : 'text-gray-500 hover:text-gray-300'
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
                  placeholder="Describe your tactical route..."
                  className="w-full h-32 bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-[#00FFC2] transition-all"
                />
                <button 
                  onClick={() => {store.setModuleStatus('aiApproved', true); store.addLog("AI: Route Validated.");}}
                  className="w-full py-4 bg-[#00FFC2] text-black font-black text-[10px] uppercase rounded-xl hover:scale-[1.01] transition-all">
                  RUN_AI_VALIDATION
                </button>
              </div>

              <div className={`p-8 rounded-2xl border transition-all ${store.safetyValid ? 'bg-[#00FFC2]/5 border-[#00FFC2]/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Legal_Waiver_&_Safety</h3>
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
                className={`w-full py-12 rounded-2xl font-black text-3xl uppercase italic tracking-[0.3em] transition-all ${store.isSystemReady() ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'bg-zinc-900/50 text-gray-700 cursor-not-allowed border border-white/5'}`}>
                {deploying ? `T-MINUS ${countdown}` : 'Lock_&_Deploy'}
              </button>
            </div>
          </div>
        )}

        {/* --- SETTINGS : CATEGORIZED INFO --- */}
        {!isLive && activeTab === 'settings' && (
          <div className="p-10 max-w-2xl mx-auto w-full animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">System_Settings</h2>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <div className="space-y-3">
              <SettingRow icon={<Users size={18}/>} label="Account" desc={`Operator: ${store.settings.account.username} // Status: ELITE`} />
              <SettingRow icon={<Monitor size={18}/>} label="Broadcast" desc={`Quality: ${store.settings.appearance.quality} // Low Latency`} />
              <SettingRow icon={<Zap size={18}/>} label="Appearance" desc={`Accent: ${store.settings.appearance.accentColor} // CRT Effect ON`} />
              <SettingRow icon={<Lock size={18}/>} label="Privacy & Security" desc={`Encryption: ${store.settings.privacy.dataEncryption} // Stealth Mode`} />
              
              <button onClick={() => setShowWaiver(true)} className="w-full group flex items-center justify-between p-6 bg-red-500/5 border border-red-500/20 rounded-2xl hover:bg-red-500/10 transition-all mt-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-xl text-red-500"><Shield size={20} /></div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase text-white tracking-widest">Legal_Waiver</p>
                    <p className="text-[9px] text-red-500/60 uppercase font-bold tracking-tighter">Review & Re-sign contract</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-red-500 group-hover:translate-x-1 transition-transform" />
              </button>
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
                <div className="text-6xl font-black italic drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]" style={{ color: store.settings.appearance.accentColor }}>
                  ${store.payout.toLocaleString()}
                </div>
              </div>
            </div>
            <button onClick={() => setIsLive(false)} className="absolute top-10 left-1/2 -translate-x-1/2 z-50 px-8 py-2 bg-black/60 border border-red-500/30 text-red-500 hover:bg-red-500 transition-all text-[9px] font-black uppercase rounded-full tracking-[0.4em]">Abort_Mission</button>
          </div>
        )}
      </section>

      {/* --- MODALE DE DÉCHARGE LÉGALE --- */}
      {showWaiver && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-3xl p-10 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <AlertTriangle size={24} />
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">Safety_Contract_v4.0</h2>
            </div>
            <div className="h-72 overflow-y-auto text-[10px] text-gray-400 space-y-5 pr-4 leading-relaxed border-b border-white/5 pb-6 scrollbar-hide">
              <p className="font-bold text-white uppercase border-l-2 border-red-500 pl-3">Clause 1 : Acceptation des Risques</p>
              <p>L'Opérateur reconnaît que le défi comporte des risques physiques extrêmes. L'Utilisateur assume l'entière responsabilité légale de ses actions.</p>
              <p className="font-bold text-white uppercase border-l-2 border-red-500 pl-3">Clause 2 : Exonération de Responsabilité</p>
              <p>NORD.VANTIX et PULSE déclinent toute responsabilité en cas d'accident, de blessure ou de décès. Aucune assistance n'est garantie.</p>
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 font-bold italic text-center uppercase">
                EN SIGNANT, VOUS RENONCEZ À TOUT DROIT DE POURSUITE JUDICIAIRE.
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowWaiver(false)} className="flex-1 py-4 text-[10px] font-black uppercase border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={signLegalWaiver} className="flex-1 py-4 bg-[#00FFC2] text-black text-[10px] font-black uppercase hover:scale-[1.02] transition-all">Accept & Sign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingRow({ icon, label, desc }: { icon: any, label: string, desc: string }) {
  return (
    <button className="w-full group flex items-center justify-between p-5 bg-zinc-900/20 border border-white/5 rounded-2xl hover:bg-white/5 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-black border border-white/5 rounded-xl text-[#00FFC2]">{icon}</div>
        <div className="text-left">
          <p className="text-xs font-black uppercase text-white tracking-widest">{label}</p>
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter italic">{desc}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-700 group-hover:translate-x-1 transition-transform" />
    </button>
  );
}

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/40 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}