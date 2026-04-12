"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Activity, LayoutDashboard, Settings, MessageSquare, Wallet, Zap, 
  Shield, ChevronRight, Camera, Signal, Loader2, CheckCircle2, AlertTriangle, Lock, Users, Monitor, X
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
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

  // --- LOGIQUE SIGNATURE ---
  const signLegalWaiver = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert("Signature requise.");
      return;
    }
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    store.addLog("LEGAL: Biometric uplink secured.");
    
    const { error } = await supabase.from('operator_waivers').insert([{ 
      user_id: user.id, contract_version: '4.0.2', signature_data: signatureData 
    }]);

    if (!error) {
      store.setModuleStatus('safetyValid', true);
      store.setModuleStatus('hardwareReady', true);
      setShowWaiver(false);
    }
  };

  const handleDeploy = () => {
    if (!store.isSystemReady()) return;
    setDeploying(true);
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
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#050505] font-mono text-white relative">
      <div className="crt-overlay pointer-events-none z-50 opacity-5" />
      
      {/* --- SIDEBAR (PC) / BOTTOM NAV (MOBILE) --- */}
      {!isLive && (
        <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-black border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col p-2 md:p-6 gap-2 z-40 backdrop-blur-lg">
          {['hub', 'wallet', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} 
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 p-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#00FFC2]/10 text-[#00FFC2] border border-[#00FFC2]/20 shadow-[0_0_20px_rgba(0,255,194,0.1)]' : 'text-gray-500'
              }`}>
              {tab === 'hub' ? <LayoutDashboard size={18}/> : tab === 'wallet' ? <Wallet size={18}/> : <Settings size={18}/>}
              <span className="hidden md:inline">{tab}</span>
            </button>
          ))}
        </nav>
      )}

      {/* --- MAIN CONTENT --- */}
      <section className="flex-1 relative flex flex-col overflow-hidden pb-20 md:pb-0">
        {!isLive && activeTab === 'hub' && (
          <div className="p-4 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 md:gap-6 overflow-y-auto scrollbar-hide">
            {/* Header */}
            <div className="col-span-12 border-b border-[#00FFC2]/20 pb-6">
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Mission_Protocol</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusTag label="HW" ok={store.hardwareReady} />
                <StatusTag label="AI" ok={store.aiApproved} />
                <StatusTag label="SAFE" ok={store.safetyValid} />
              </div>
            </div>

            {/* Inputs */}
            <div className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6">
              <div className="bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-[#00FFC2]" /> Contract_Definition
                </label>
                <textarea 
                  value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)}
                  placeholder="Describe objective..."
                  className="w-full h-32 bg-black border border-white/10 p-4 rounded-xl text-xs outline-none focus:border-[#00FFC2] transition-all"
                />
                <button onClick={() => {store.setModuleStatus('aiApproved', true); store.addLog("AI: Validated.");}}
                  className="w-full py-4 bg-[#00FFC2] text-black font-black text-[10px] uppercase rounded-xl">
                  VALIDATE_OBJECTIVE
                </button>
              </div>

              <div className={`p-6 md:p-8 rounded-2xl border ${store.safetyValid ? 'border-[#00FFC2]/30 bg-[#00FFC2]/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Safety_Waiver</span>
                  </div>
                  {!store.safetyValid ? (
                    <button onClick={() => setShowWaiver(true)} className="px-4 py-2 bg-red-600 text-[10px] font-black uppercase rounded-md">Sign</button>
                  ) : <CheckCircle2 size={24} className="text-[#00FFC2]" />}
                </div>
              </div>
            </div>

            {/* Deploy */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="bg-[#00FFC2]/5 border border-[#00FFC2]/20 p-8 rounded-2xl text-center">
                <span className="text-[10px] text-gray-500 font-black uppercase">Est_Payout</span>
                <div className="text-5xl font-black italic text-[#00FFC2] my-2">${store.payout}</div>
                <div className="flex gap-2 mt-4">
                  {['LOW', 'MID', 'EXTREME'].map(lvl => (
                    <button key={lvl} onClick={() => store.setRisk(lvl as any)}
                      className={`flex-1 py-2 rounded text-[8px] font-black border ${store.riskLevel === lvl ? 'bg-[#00FFC2] text-black' : 'border-white/10 text-gray-500'}`}>{lvl}</button>
                  ))}
                </div>
              </div>
              <button 
                onClick={handleDeploy}
                disabled={!store.isSystemReady() || deploying}
                className={`w-full py-10 rounded-2xl font-black text-2xl uppercase italic tracking-widest transition-all ${store.isSystemReady() ? 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-gray-800 cursor-not-allowed'}`}>
                {deploying ? `T-MINUS ${countdown}` : 'Deploy_Live'}
              </button>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {!isLive && activeTab === 'settings' && (
          <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-6 overflow-y-auto scrollbar-hide">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">Settings</h2>
            <div className="space-y-3">
              <SettingCategory icon={<Users size={20}/>} label="Account" desc={`@${store.settings.account.username}`}>
                <input type="text" onChange={(e) => store.updateSettings('account', {username: e.target.value})} placeholder="Username" className="w-full bg-black border border-white/10 p-4 rounded-xl mt-4 text-xs outline-none focus:border-[#00FFC2]" />
              </SettingCategory>
              
              <SettingCategory icon={<Monitor size={20}/>} label="Appearance" desc="HUD Customization">
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {['#00FFC2', '#FF0055', '#A855F7', '#FFFFFF'].map(c => (
                    <button key={c} onClick={() => store.updateSettings('appearance', {accentColor: c})} style={{backgroundColor: c}} className={`h-10 rounded-lg border-2 ${store.settings.appearance.accentColor === c ? 'border-white' : 'border-transparent'}`} />
                  ))}
                </div>
              </SettingCategory>
            </div>
          </div>
        )}

        {/* --- LIVE VIEW (FULL SCREEN) --- */}
        {isLive && (
          <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
            <LiveKitRoom video audio token="DUMMY" serverUrl="DUMMY" connect className="h-full w-full relative">
              <div className="absolute inset-0 z-0 bg-zinc-900 flex items-center justify-center">
                 <p className="text-[#00FFC2] animate-pulse font-black uppercase text-xs tracking-[0.5em]">Transmitting_Neural_Link...</p>
              </div>
              {/* HUD */}
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between pointer-events-none z-10">
                <div className="flex justify-between items-start">
                   <div className="bg-red-600 px-3 py-1 text-[10px] font-black uppercase italic shadow-lg">Live_Ops</div>
                   <div className="text-right">
                      <div className="text-4xl md:text-6xl font-black italic" style={{ color: store.settings.appearance.accentColor }}>${store.payout}</div>
                   </div>
                </div>
                <button onClick={() => setIsLive(false)} className="pointer-events-auto self-center px-10 py-3 bg-black/60 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full tracking-widest backdrop-blur-md">Abort_Mission</button>
              </div>
            </LiveKitRoom>
          </div>
        )}
      </section>

      {/* --- WAIVER MODAL (MOBILE FIXED) --- */}
      {showWaiver && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-3 text-red-500">
                  <AlertTriangle size={24} />
                  <h2 className="text-xl md:text-2xl font-black uppercase italic italic">Safety_Contract_v4.0</h2>
               </div>
               <button onClick={() => setShowWaiver(false)} className="p-2 text-gray-500 hover:text-white"><X /></button>
            </div>
            
            <div className="h-32 md:h-48 overflow-y-auto text-[10px] text-gray-500 space-y-4 pr-4 border-b border-white/5 pb-4 scrollbar-hide italic leading-relaxed">
              <p>L'Opérateur accepte les risques de blessures graves ou décès. NORD.VANTIX décline toute responsabilité. Signature obligatoire pour débloquer le LiveKit_Uplink.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-[#00FFC2] tracking-widest">Digital_Signature_Canvas</label>
              <div className="bg-white rounded-xl overflow-hidden h-40 md:h-48 cursor-crosshair touch-none border-4 border-[#00FFC2]/20 shadow-[0_0_30px_rgba(0,255,194,0.1)]">
                <SignatureCanvas 
                  ref={sigCanvas}
                  penColor='black'
                  backgroundColor='white'
                  canvasProps={{className: 'w-full h-full'}} 
                />
              </div>
              <button onClick={() => sigCanvas.current.clear()} className="text-[8px] text-red-500 font-black uppercase tracking-widest underline">Reset_Ink</button>
            </div>

            <button onClick={signLegalWaiver} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all">Sign_&_Authorize_Uplink</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/20 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}

function SettingCategory({ icon, label, desc, children }: { icon: any, label: string, desc: string, children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl transition-all ${open ? 'bg-zinc-900/40 border-white/20' : 'bg-zinc-900/10 border-white/5'}`}>
      <button onClick={() => setOpen(!open)} className="w-full p-5 flex items-center justify-between">
        <div className="flex items-center gap-4 text-left">
          <div className={`p-3 rounded-xl ${open ? 'text-[#00FFC2] bg-black' : 'text-gray-600 bg-white/5'}`}>{icon}</div>
          <div><p className="text-xs font-black uppercase">{label}</p><p className="text-[9px] text-gray-500 italic uppercase">{desc}</p></div>
        </div>
        <ChevronRight size={16} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="p-6 pt-0 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
}