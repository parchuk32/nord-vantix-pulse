"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import { 
  LayoutDashboard, Settings, Wallet, Zap, Shield, CheckCircle2, 
  AlertTriangle, X, Activity, Crosshair, Loader2, Camera, Mic, 
  Volume2, Monitor, Globe, MessageSquare, Bell, Cpu, Lock, Database, 
  User, CreditCard, Link, Copy, LogOut, Trash2, RefreshCw
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ─── COMPOSANTS UI DE BASE ──────────────────────────────────────────────────

function SettingRow({ label, desc, children, isDanger = false }: { label: string; desc?: string; children: React.ReactNode; isDanger?: boolean }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-white/5 hover:bg-white/[0.01] transition-colors px-2 ${isDanger ? 'bg-red-500/5' : ''}`}>
      <div className="flex flex-col max-w-[70%]">
        <span className={`text-xs font-black uppercase tracking-widest ${isDanger ? 'text-red-500' : 'text-gray-200'}`}>{label}</span>
        {desc && <span className="text-[9px] text-gray-500 uppercase tracking-tight mt-1 leading-relaxed">{desc}</span>}
      </div>
      <div className="flex-shrink-0 flex items-center">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, accent = '#00FFC2' }: { value: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full transition-all relative border ${value ? 'bg-opacity-20 border-opacity-50' : 'bg-black border-white/20'}`} style={{ backgroundColor: value ? `${accent}33` : '', borderColor: value ? accent : '', boxShadow: value ? `0 0 12px ${accent}44` : 'none' }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300" style={{ left: value ? 'calc(100% - 20px)' : '4px', backgroundColor: value ? accent : '#444' }} />
    </button>
  );
}

function Select<T extends string | number>({ value, options, onChange }: { value: T; options: { label: string; value: T }[]; onChange: (v: T) => void; }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)} className="bg-black border border-white/10 text-[#00FFC2] text-[10px] font-bold uppercase rounded px-3 py-2 outline-none focus:border-[#00FFC2] cursor-pointer">
      {options.map((o) => <option key={o.value} value={o.value} className="bg-[#0a0f1a]">{o.label}</option>)}
    </select>
  );
}

function Range({ value, min, max, onChange, unit = "" }: { value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <div className="flex items-center gap-3 min-w-[150px]">
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="flex-1 accent-[#00FFC2] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
      <span className="text-[10px] font-black text-[#00FFC2] w-8 text-right">{value}{unit}</span>
    </div>
  );
}

// ─── LES 12 MODULES DE PARAMÈTRES ───────────────────────────────────────────

const ProfileModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
      <SettingRow label="Nom d'Opérateur" desc="Identifiant public"><input value={settings.profile.displayName} onChange={e => updateSettings('profile', {displayName: e.target.value})} className="bg-black border border-white/10 p-2 text-xs rounded text-[#00FFC2] outline-none w-48" /></SettingRow>
      <SettingRow label="Bio Tactique" desc="Encodage JSONB"><textarea value={settings.profile.bio} onChange={e => updateSettings('profile', {bio: e.target.value})} className="bg-black border border-white/10 p-2 text-xs rounded text-white outline-none w-48 h-20 resize-none" /></SettingRow>
      <SettingRow label="Node ID" desc="Unique Hash"><div className="text-[9px] font-mono text-gray-500 uppercase">{settings.profile.userId}</div></SettingRow>
    </div>
  );
};

const AVModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => { navigator.mediaDevices.enumerateDevices().then(setDevices); }, []);
  const cams = devices.filter(d => d.kind === 'videoinput');
  return (
    <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
      <SettingRow label="Caméra Uplink"><Toggle value={settings.av.cameraEnabled} onChange={v => updateSettings('av', {cameraEnabled: v})} /></SettingRow>
      <SettingRow label="Microphone"><Toggle value={settings.av.micEnabled} onChange={v => updateSettings('av', {micEnabled: v})} /></SettingRow>
      <SettingRow label="Source Vidéo"><Select value={settings.av.selectedCamId || ""} options={[{label: 'Auto', value: ''}, ...cams.map(c => ({label: c.label || 'Webcam', value: c.deviceId}))]} onChange={v => updateSettings('av', {selectedCamId: v})} /></SettingRow>
      <div className="mt-4 p-4 border border-[#a855f7]/20 bg-[#a855f7]/5 rounded-xl">
        <span className="text-[9px] font-black text-[#a855f7] uppercase mb-4 block">Cyber-Defense</span>
        <SettingRow label="Voice Scrambler" desc="Pitch shift anti-IA"><Toggle value={settings.av.voiceScrambler || false} onChange={v => updateSettings('av', {voiceScrambler: v})} accent="#a855f7" /></SettingRow>
        <SettingRow label="Anti-Screen Capture"><Toggle value={settings.av.antiScreenCapture || false} onChange={v => updateSettings('av', {antiScreenCapture: v})} accent="#a855f7" /></SettingRow>
      </div>
    </div>
  );
};

const ConnectionModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
      <SettingRow label="Mode Transmission"><Select value={settings.connection.mode} options={[{label: 'Realtime (Latency 0)', value: 'realtime'}, {label: 'Optimized', value: 'optimized'}]} onChange={v => updateSettings('connection', {mode: v as any})} /></SettingRow>
      <SettingRow label="Ping Monitor"><Toggle value={settings.connection.showPing} onChange={v => updateSettings('connection', {showPing: v})} /></SettingRow>
      <SettingRow label="Auto Reconnect"><Toggle value={settings.connection.autoReconnect} onChange={v => updateSettings('connection', {autoReconnect: v})} /></SettingRow>
    </div>
  );
};

const HUDModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
      <SettingRow label="Thème HUD"><Select value={settings.hud.theme} options={[{label: 'CYBER_CYAN', value: 'cyber'}, {label: 'BLOOD_RED', value: 'blood'}]} onChange={v => updateSettings('hud', {theme: v as any})} /></SettingRow>
      <SettingRow label="Scanlines CRT"><Toggle value={settings.hud.crtEffect} onChange={v => updateSettings('hud', {crtEffect: v})} /></SettingRow>
      <SettingRow label="Glow & Bloom"><Toggle value={settings.hud.glowEffect} onChange={v => updateSettings('hud', {glowEffect: v})} /></SettingRow>
      <SettingRow label="Interface Scale"><Range value={settings.hud.uiScale} min={80} max={130} unit="%" onChange={v => updateSettings('hud', {uiScale: v})} /></SettingRow>
    </div>
  );
};

const PrivacyModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2 animate-in slide-in-from-right-2 duration-300">
      <SettingRow label="Ghost Protocol" desc="Invisibilité réseau"><Toggle value={settings.privacy.ghostProtocol || false} onChange={v => updateSettings('privacy', {ghostProtocol: v})} accent="#FF4444" /></SettingRow>
      <SettingRow label="MFA Biométrique"><Toggle value={settings.privacy.mfaEnabled} onChange={v => updateSettings('privacy', {mfaEnabled: v})} /></SettingRow>
      <SettingRow label="Public Profile"><Toggle value={settings.privacy.publicProfile} onChange={v => updateSettings('privacy', {publicProfile: v})} /></SettingRow>
    </div>
  );
};

const DataModule = () => {
  const { resetSettings, clearChatHistory } = useDeployStore();
  return (
    <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
      <button onClick={() => confirm("Purge historique ?") && clearChatHistory()} className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase hover:bg-red-500/20 hover:border-red-500 transition-all">Effacer Historique Chat</button>
      <button onClick={() => confirm("Reset total ?") && resetSettings()} className="w-full py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase hover:bg-orange-500/20 hover:border-orange-500 transition-all">Réinitialiser Paramètres</button>
    </div>
  );
};

const ChatModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2">
      <SettingRow label="Global Chat"><Toggle value={settings.chat.globalChatEnabled} onChange={v => updateSettings('chat', {globalChatEnabled: v})} /></SettingRow>
      <SettingRow label="Anti-Spam Neura"><Toggle value={settings.chat.antispam} onChange={v => updateSettings('chat', {antispam: v})} /></SettingRow>
      <SettingRow label="Opacité"><Range value={settings.chat.chatOpacity} min={10} max={100} unit="%" onChange={v => updateSettings('chat', {chatOpacity: v})} /></SettingRow>
    </div>
  );
};

const NotificationModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2">
      <SettingRow label="Alertes Messages"><Toggle value={settings.notifications.onMessage} onChange={v => updateSettings('notifications', {onMessage: v})} /></SettingRow>
      <SettingRow label="Volume Alerte"><Range value={settings.notifications.volume} min={0} max={100} unit="%" onChange={v => updateSettings('notifications', {volume: v})} /></SettingRow>
      <SettingRow label="Mode Silencieux"><Toggle value={settings.notifications.silentMode} onChange={v => updateSettings('notifications', {silentMode: v})} accent="#FFD600" /></SettingRow>
    </div>
  );
};

const PerformanceModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2">
      <SettingRow label="Low Perf Mode"><Toggle value={settings.performance.lowPerformanceMode} onChange={v => updateSettings('performance', {lowPerformanceMode: v})} /></SettingRow>
      <SettingRow label="FPS Limit UI"><Select value={settings.performance.fpsLimit} options={[{label: '30 FPS', value: 30}, {label: '60 FPS', value: 60}]} onChange={v => updateSettings('performance', {fpsLimit: v})} /></SettingRow>
    </div>
  );
};

const AgentModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-2">
      <SettingRow label="Agent Défaut"><Select value={settings.agents.defaultAgent} options={[{label: 'ALPHA-7', value: 'ALPHA-7'}, {label: 'GHOST-X', value: 'GHOST-X'}]} onChange={v => updateSettings('agents', {defaultAgent: v})} /></SettingRow>
      <SettingRow label="Stats Agent"><Toggle value={settings.agents.showAgentStats} onChange={v => updateSettings('agents', {showAgentStats: v})} /></SettingRow>
    </div>
  );
};

const AccountModule = () => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="text-[10px] text-gray-500 uppercase mb-1">Plan Actuel</div>
        <div className="text-sm font-black text-[#00FFC2]">NORD_VANTIX ELITE LICENSE</div>
      </div>
      <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-3"><LogOut size={16} /> Déconnexion</button>
    </div>
  );
};

const AppModule = () => {
  const { settings } = useDeployStore();
  return (
    <div className="space-y-2">
      <SettingRow label="Discord Linked"><div className={`w-2 h-2 rounded-full ${settings.apps.discordLinked ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500'}`} /></SettingRow>
      <SettingRow label="API Access Key"><div className="text-[10px] font-mono text-gray-500">VTX-**************</div></SettingRow>
    </div>
  );
};

// ─── LE HUB PRINCIPAL ───────────────────────────────────────────────────────

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'wallet' | 'settings'>('hub');
  const [activeSubTab, setActiveSubTab] = useState('profile');
  
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showWaiver, setShowWaiver] = useState(false);
  
  const [missions, setMissions] = useState<any[]>([]);
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [liveToken, setLiveToken] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const SETTINGS_NAV = [
    { id: 'profile', icon: <User size={16} />, label: 'Profil' },
    { id: 'av', icon: <Camera size={16} />, label: 'Audio / Vidéo' },
    { id: 'hud', icon: <Monitor size={16} />, label: 'Interface' },
    { id: 'connection', icon: <Globe size={16} />, label: 'Connexion' },
    { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' },
    { id: 'notifications', icon: <Bell size={16} />, label: 'Notifs' },
    { id: 'performance', icon: <Cpu size={16} />, label: 'Performance' },
    { id: 'privacy', icon: <Shield size={16} />, label: 'Sécurité' },
    { id: 'data', icon: <Database size={16} />, label: 'Données' },
    { id: 'agents', icon: <Zap size={16} />, label: 'Agents' },
    { id: 'account', icon: <CreditCard size={16} />, label: 'Compte' },
    { id: 'apps', icon: <Link size={16} />, label: 'Apps' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register');
      else {
        setUser(session.user);
        fetchMissions(session.user.id);
      }
    };
    checkAuth();
  }, [router]);

  const fetchMissions = async (userId: string) => {
    const { data } = await supabase.from('missions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setMissions(data);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const activeMission = missions.find(m => m.status === 'approved' || m.status === 'active');

  const handleDeploy = async () => {
    if (!store.safetyValid || !activeMission) return showToast("Contrat non signé ou mission non approuvée.", "error");
    setDeploying(true);
    try {
      const resp = await fetch(`/api/get-participant-token?room=room-${user.id}&username=${user.user_metadata.username || 'OPERATOR'}`);
      const data = await resp.json();
      setLiveToken(data.token);
      let timer = 3; setCountdown(timer);
      const interval = setInterval(() => {
        timer--; setCountdown(timer);
        if (timer === 0) { clearInterval(interval); setIsLive(true); setDeploying(false); }
      }, 1000);
    } catch (e) { setDeploying(false); showToast("Échec Uplink matériel", "error"); }
  };

  const handleSign = () => {
    if (sigCanvas.current?.isEmpty()) return;
    store.setModuleStatus('safetyValid', true);
    setShowWaiver(false);
    showToast("Contrat scellé.");
  };

  if (!user) return null;

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#050505] font-mono text-white relative">
      {store.settings.hud?.crtEffect && <div className="crt-overlay pointer-events-none z-50 opacity-10" />}
      
      {toast && (
        <div className={`fixed top-4 right-4 z-[300] px-6 py-3 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl ${toast.type === 'success' ? 'bg-[#00FFC2]/20 border border-[#00FFC2] text-[#00FFC2]' : 'bg-red-500/20 border border-red-500 text-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}

      {/* SIDEBAR PRINCIPALE */}
      {!isLive && (
        <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-black/90 border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col p-2 md:p-6 gap-2 z-40 backdrop-blur-lg">
          {['hub', 'wallet', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} 
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 p-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#00FFC2]/10 text-[#00FFC2] border border-[#00FFC2]/20' : 'text-gray-500'
              }`}>
              {tab === 'hub' ? <LayoutDashboard size={18}/> : tab === 'wallet' ? <Wallet size={18}/> : <Settings size={18}/>}
              <span className="hidden md:inline">{tab}</span>
            </button>
          ))}
        </nav>
      )}

      <section className="flex-1 relative flex flex-col overflow-hidden">
        
        {/* ONGLET HUB : MISSIONS */}
        {!isLive && activeTab === 'hub' && (
          <div className="h-full overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 scrollbar-hide">
            <div className="col-span-12 flex justify-between items-end border-b border-white/5 pb-8 mb-4">
               <div>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Operator_Hub</h2>
                  <div className="flex gap-4 mt-4">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#00FFC2]"><div className="w-2 h-2 rounded-full bg-[#00FFC2] animate-pulse" /> Signal Stable</div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-500">Node_ID: {user.id.substring(0,8)}</div>
                  </div>
               </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-zinc-900/10 border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Initialize_Mission_Protocol</h3>
              <div className="space-y-4">
                 <textarea value={missionDesc} onChange={e => setMissionDesc(e.target.value)} placeholder="Objectif tactique..." className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] h-24 resize-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" value={minViewers} onChange={e => setMinViewers(e.target.value)} placeholder="Min Viewers" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2]" />
                    <input type="number" value={requestedBounty} onChange={e => setRequestedBounty(e.target.value)} placeholder="Bounty ($)" className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2]" />
                 </div>
                 <button onClick={() => showToast("Transmission au Commandement...", "success")} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#00FFC2] transition-all">Transmit_Contract</button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-6">
               <button onClick={handleDeploy} disabled={!activeMission || deploying} className={`w-full h-full min-h-[250px] rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group ${activeMission ? 'bg-[#00FFC2] text-black shadow-[0_0_50px_rgba(0,255,194,0.15)]' : 'bg-white/5 text-gray-600'}`}>
                  {deploying ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-red-600" size={48} />
                      <span className="text-3xl font-black text-red-600">T-MINUS {countdown}</span>
                    </div>
                  ) : activeMission ? (
                    <><Zap size={48} className="animate-pulse" /><span className="text-2xl font-black uppercase italic tracking-tighter">Deploy_Live</span></>
                  ) : (
                    <><Lock size={48} className="opacity-20" /><span className="text-xl font-black uppercase tracking-widest opacity-30 text-center px-6">Waiting for_Command Approval</span></>
                  )}
               </button>
               {!store.safetyValid && (
                 <button onClick={() => setShowWaiver(true)} className="w-full py-4 border border-red-500/50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all">Sign_Safety_Contract</button>
               )}
            </div>
          </div>
        )}

        {/* ONGLET PARAMÈTRES : SIDEBAR INTERNE + MODULES */}
        {!isLive && activeTab === 'settings' && (
          <div className="flex h-full w-full overflow-hidden bg-black/40">
            <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col p-4 gap-1 overflow-y-auto">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 px-4 pt-4">Configuration_System</h3>
              {SETTINGS_NAV.map((item) => (
                <button key={item.id} onClick={() => setActiveSubTab(item.id)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all group ${
                    activeSubTab === item.id ? 'bg-[#00FFC2]/10 border border-[#00FFC2]/20' : 'hover:bg-white/5'
                  }`}>
                  <span className={`transition-transform duration-300 ${activeSubTab === item.id ? 'text-[#00FFC2] scale-125' : 'text-gray-500 group-hover:text-white'}`}>{item.icon}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${activeSubTab === item.id ? 'text-[#00FFC2]' : 'text-gray-400'}`}>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-16 scrollbar-hide">
              <div className="max-w-3xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                   <div className="w-12 h-12 rounded-2xl bg-[#00FFC2]/10 flex items-center justify-center text-[#00FFC2]">{SETTINGS_NAV.find(n => n.id === activeSubTab)?.icon}</div>
                   <div>
                      <h2 className="text-2xl font-black uppercase italic text-white">{SETTINGS_NAV.find(n => n.id === activeSubTab)?.label}</h2>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Protocol_Module v4.0.2</p>
                   </div>
                </div>

                {activeSubTab === 'profile' && <ProfileModule />}
                {activeSubTab === 'av' && <AVModule />}
                {activeSubTab === 'connection' && <ConnectionModule />}
                {activeSubTab === 'chat' && <ChatModule />}
                {activeSubTab === 'notifications' && <NotificationModule />}
                {activeSubTab === 'hud' && <HUDModule />}
                {activeSubTab === 'performance' && <PerformanceModule />}
                {activeSubTab === 'privacy' && <PrivacyModule />}
                {activeSubTab === 'data' && <DataModule />}
                {activeSubTab === 'agents' && <AgentModule />}
                {activeSubTab === 'account' && <AccountModule />}
                {activeSubTab === 'apps' && <AppModule />}
              </div>
            </div>
          </div>
        )}

        {/* MODAL SIGNATURE CONTRAT */}
        {showWaiver && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 space-y-6">
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3 text-red-500"><AlertTriangle size={24} /><h2 className="text-2xl font-black uppercase italic">Operator_Waiver_v4</h2></div>
                   <button onClick={() => setShowWaiver(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase">En signant, vous acceptez l'entière responsabilité des dommages matériels ou biologiques subis durant la mission. Nord.Vantix décline toute responsabilité en cas de perte de signal ou de capture par des unités hostiles.</p>
                <div className="bg-white rounded-2xl overflow-hidden h-48 cursor-crosshair border-4 border-[#00FFC2]/20">
                  <SignatureCanvas ref={sigCanvas} penColor='black' backgroundColor='white' canvasProps={{className: 'w-full h-full'}} />
                </div>
                <button onClick={handleSign} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all">Authorize_Protocol</button>
             </div>
          </div>
        )}

        {/* MODE LIVE (LIVEKIT) */}
        {isLive && liveToken && (
          <div className="fixed inset-0 z-[100] bg-black">
            <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full relative">
              <div className="absolute inset-0 z-0"><VideoConference /></div>
              <RoomAudioRenderer />
              <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none z-10">
                <div className="flex justify-between items-start">
                   <div className="bg-black/60 backdrop-blur-md p-4 border border-red-500/50 rounded-xl">
                      <div className="flex items-center gap-3 text-red-500 font-black italic uppercase"><div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Signal_Live</div>
                      <div className="text-[10px] text-gray-400 mt-1">Uplink: {user.id.substring(0,8)}</div>
                   </div>
                </div>
                <button onClick={() => setIsLive(false)} className="pointer-events-auto self-center px-12 py-4 bg-red-600/20 border border-red-500 text-red-500 font-black uppercase text-xs rounded-full tracking-widest backdrop-blur-md hover:bg-red-600 hover:text-white transition-all">Abort_Mission_Link</button>
              </div>
            </LiveKitRoom>
          </div>
        )}
      </section>
    </div>
  );
}