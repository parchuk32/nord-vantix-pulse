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
  User, CreditCard, Link, Copy, LogOut, RefreshCw
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

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
    <div className="space-y-4 animate-in slide-in-from-right-2">
      <SettingRow label="Nom d'Opérateur" desc="Identifiant public"><input value={settings.profile.displayName} onChange={e => updateSettings('profile', {displayName: e.target.value})} className="bg-black border border-white/10 p-2 text-xs rounded text-[#00FFC2] outline-none w-48" /></SettingRow>
      <SettingRow label="Bio Tactique" desc="Description courte"><textarea value={settings.profile.bio} onChange={e => updateSettings('profile', {bio: e.target.value})} className="bg-black border border-white/10 p-2 text-xs rounded text-white outline-none w-48 h-20 resize-none" /></SettingRow>
    </div>
  );
};

const AVModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Caméra Uplink"><Toggle value={settings.av.cameraEnabled} onChange={v => updateSettings('av', {cameraEnabled: v})} /></SettingRow>
      <SettingRow label="Microphone"><Toggle value={settings.av.micEnabled} onChange={v => updateSettings('av', {micEnabled: v})} /></SettingRow>
      <SettingRow label="Voice Scrambler" desc="Pitch shift anti-IA"><Toggle value={settings.av.voiceScrambler} onChange={v => updateSettings('av', {voiceScrambler: v})} accent="#a855f7" /></SettingRow>
      <SettingRow label="Anti-Screen Capture"><Toggle value={settings.av.antiScreenCapture} onChange={v => updateSettings('av', {antiScreenCapture: v})} /></SettingRow>
    </div>
  );
};

const ConnectionModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Mode Transmission"><Select value={settings.connection.mode} options={[{label: 'Realtime', value: 'realtime'}, {label: 'Optimized', value: 'optimized'}]} onChange={v => updateSettings('connection', {mode: v as any})} /></SettingRow>
      <SettingRow label="Auto Reconnect"><Toggle value={settings.connection.autoReconnect} onChange={v => updateSettings('connection', {autoReconnect: v})} /></SettingRow>
      <SettingRow label="Ping Monitor"><Toggle value={settings.connection.showPing} onChange={v => updateSettings('connection', {showPing: v})} /></SettingRow>
    </div>
  );
};

const HUDModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Effet CRT"><Toggle value={settings.hud.crtEffect} onChange={v => updateSettings('hud', {crtEffect: v})} /></SettingRow>
      <SettingRow label="Glow & Bloom"><Toggle value={settings.hud.glowEffect} onChange={v => updateSettings('hud', {glowEffect: v})} /></SettingRow>
      <SettingRow label="UI Scale"><Range value={settings.hud.uiScale} min={80} max={130} unit="%" onChange={v => updateSettings('hud', {uiScale: v})} /></SettingRow>
    </div>
  );
};

const ChatModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Global Chat"><Toggle value={settings.chat.globalChatEnabled} onChange={v => updateSettings('chat', {globalChatEnabled: v})} /></SettingRow>
      <SettingRow label="Anti-Spam"><Toggle value={settings.chat.antispam} onChange={v => updateSettings('chat', {antispam: v})} /></SettingRow>
      <SettingRow label="Opacité"><Range value={settings.chat.chatOpacity} min={10} max={100} unit="%" onChange={v => updateSettings('chat', {chatOpacity: v})} /></SettingRow>
    </div>
  );
};

const NotificationModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Alertes Messages"><Toggle value={settings.notifications.onMessage} onChange={v => updateSettings('notifications', {onMessage: v})} /></SettingRow>
      <SettingRow label="Volume"><Range value={settings.notifications.volume} min={0} max={100} unit="%" onChange={v => updateSettings('notifications', {volume: v})} /></SettingRow>
      <SettingRow label="Mode Silencieux"><Toggle value={settings.notifications.silentMode} onChange={v => updateSettings('notifications', {silentMode: v})} accent="#FFD600" /></SettingRow>
    </div>
  );
};

const PerformanceModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Mode Éco"><Toggle value={settings.performance.lowPerformanceMode} onChange={v => updateSettings('performance', {lowPerformanceMode: v})} /></SettingRow>
      <SettingRow label="FPS Limit"><Select value={settings.performance.fpsLimit} options={[{label: '30 FPS', value: 30}, {label: '60 FPS', value: 60}]} onChange={v => updateSettings('performance', {fpsLimit: v as any})} /></SettingRow>
    </div>
  );
};

const PrivacyModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Ghost Protocol" desc="Invisibilité réseau"><Toggle value={settings.privacy.ghostProtocol} onChange={v => updateSettings('privacy', {ghostProtocol: v})} accent="#FF4444" /></SettingRow>
      <SettingRow label="Hardware Spoofing"><Toggle value={settings.privacy.hardwareSpoofing} onChange={v => updateSettings('privacy', {hardwareSpoofing: v})} /></SettingRow>
      <SettingRow label="IP Masking"><Toggle value={settings.privacy.ipMasking} onChange={v => updateSettings('privacy', {ipMasking: v})} /></SettingRow>
      <SettingRow label="Chiffrement E2E"><Toggle value={settings.privacy.zeroKnowledgeE2E} onChange={v => updateSettings('privacy', {zeroKnowledgeE2E: v})} /></SettingRow>
    </div>
  );
};

const DataModule = () => {
  const { settings, updateSettings, resetSettings, clearChatHistory } = useDeployStore();
  return (
    <div className="space-y-6">
      <SettingRow label="Sauvegarde Cloud"><Toggle value={settings.data.cloudBackup} onChange={v => updateSettings('data', {cloudBackup: v})} /></SettingRow>
      <SettingRow label="Auto-Burn Logs"><Toggle value={settings.data.autoBurnLogs} onChange={v => updateSettings('data', {autoBurnLogs: v})} accent="#FF4444" /></SettingRow>
      <div className="pt-4 space-y-2">
        <button onClick={() => confirm("Purge historique ?") && clearChatHistory()} className="w-full py-2 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded hover:bg-white/10 transition-all">Clear Chat Logs</button>
        <button onClick={() => confirm("Reset total ?") && resetSettings()} className="w-full py-2 bg-red-600/20 text-red-500 text-[10px] font-black uppercase rounded border border-red-500/50 hover:bg-red-600 hover:text-white transition-all">Reset All Settings</button>
      </div>
    </div>
  );
};

const AgentModule = () => {
  const { settings, updateSettings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Stats Agent"><Toggle value={settings.agents.showAgentStats} onChange={v => updateSettings('agents', {showAgentStats: v})} /></SettingRow>
      <SettingRow label="Auto-Join Agent"><Toggle value={settings.agents.autoJoinAgent} onChange={v => updateSettings('agents', {autoJoinAgent: v})} /></SettingRow>
    </div>
  );
};

const AccountModule = () => {
  const { settings } = useDeployStore();
  return (
    <div className="space-y-4">
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
        <div className="text-[10px] text-gray-500 uppercase font-black">Account Info</div>
        <div className="text-xs text-white font-mono">{settings.account.email}</div>
        <div className="text-[10px] text-[#00FFC2] font-black px-2 py-0.5 bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded inline-block">{settings.account.plan}</div>
      </div>
      <button onClick={() => supabase.auth.signOut()} className="w-full py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-3">
        <LogOut size={16} /> Disconnect_Node
      </button>
    </div>
  );
};

const AppModule = () => {
  const { settings } = useDeployStore();
  return (
    <div className="space-y-4">
      <SettingRow label="Discord Linked">
        <div className={`px-2 py-1 rounded text-[9px] font-black ${settings.apps.discordLinked ? 'bg-green-500/20 text-green-500 border border-green-500' : 'bg-red-500/20 text-red-500 border border-red-500'}`}>
          {settings.apps.discordLinked ? 'STABLE_LINK' : 'NO_LINK'}
        </div>
      </SettingRow>
      <SettingRow label="API Key"><div className="text-[10px] font-mono text-gray-600 bg-black p-2 rounded border border-white/5 truncate">{settings.apps.apiKey}</div></SettingRow>
    </div>
  );
};

// ─── LE HUB OPÉRATEUR PRINCIPAL ─────────────────────────────────────────────

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
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MID' | 'EXTREME'>('LOW');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [liveToken, setLiveToken] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const SETTINGS_NAV = [
    { id: 'profile', icon: <User size={16} />, label: 'Profil' },
    { id: 'av', icon: <Camera size={16} />, label: 'Audio / Vidéo' },
    { id: 'hud', icon: <Monitor size={16} />, label: 'HUD' },
    { id: 'connection', icon: <Globe size={16} />, label: 'Connexion' },
    { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' },
    { id: 'notifications', icon: <Bell size={16} />, label: 'Notifs' },
    { id: 'performance', icon: <Cpu size={16} />, label: 'Perf' },
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

  const submitMissionProposal = async () => {
    if (!missionDesc || !minViewers || !requestedBounty) return showToast("Données incomplètes", "error");
    setIsSubmitting(true);
    const { error } = await supabase.from('missions').insert([{ 
        user_id: user.id, objective: missionDesc, min_viewers: parseInt(minViewers), 
        bounty: parseFloat(requestedBounty), status: 'pending' 
    }]);
    setIsSubmitting(false);
    if (error) showToast(error.message, "error");
    else { showToast("Contrat transmis", "success"); fetchMissions(user.id); }
  };

  const signLegalWaiver = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return showToast("Signature requise", "error");
    store.setModuleStatus('safetyValid', true);
    setShowWaiver(false);
    showToast("Contrat signé");
  };

  const activeMission = missions.find(m => m.status === 'approved' || m.status === 'active');

  const handleDeploy = async (instant = false) => {
    if (!store.safetyValid || !activeMission) return showToast("Sécurité ou Mission non valide", "error");
    setDeploying(true);
    try {
      const resp = await fetch(`/api/get-participant-token?room=room-${user.id}&username=OPERATOR`);
      const data = await resp.json();
      setLiveToken(data.token);
      let timer = 3; setCountdown(timer);
      const interval = setInterval(() => {
        timer--; setCountdown(timer);
        if (timer === 0) { clearInterval(interval); setIsLive(true); setDeploying(false); }
      }, 1000);
    } catch (e) { setDeploying(false); showToast("Erreur Uplink", "error"); }
  };

  const abortMission = () => { setIsLive(false); setLiveToken(""); };

  if (!user) return null;

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-[#050505] font-mono text-white relative">
      {store.settings.hud?.crtEffect && <div className="crt-overlay pointer-events-none z-50 opacity-5" />}
      
      {toast && (
        <div className={`fixed top-4 right-4 z-[300] px-6 py-3 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl ${toast.type === 'success' ? 'bg-[#00FFC2]/20 border border-[#00FFC2] text-[#00FFC2]' : 'bg-red-500/20 border border-red-500 text-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}

      {!isLive && (
        <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-black/90 border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col p-2 md:p-6 gap-2 z-40 backdrop-blur-lg">
          {['hub', 'wallet', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} 
              className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 p-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-[#00FFC2]/10 text-[#00FFC2] border border-[#00FFC2]/20 shadow-[0_0_20px_rgba(0,255,194,0.1)]' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {tab === 'hub' ? <LayoutDashboard size={18}/> : tab === 'wallet' ? <Wallet size={18}/> : <Settings size={18}/>}
              <span className="hidden md:inline">{tab}</span>
            </button>
          ))}
        </nav>
      )}

      <section className="flex-1 relative flex flex-col overflow-hidden pb-20 md:pb-0">
        
        {!isLive && activeTab === 'hub' && (
          <div className="h-full overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 md:gap-6 scrollbar-hide">
            <div className="col-span-12 border-b border-[#00FFC2]/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Mission_Hub</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusTag label="CONTRACT" ok={!!activeMission} />
                  <StatusTag label="SAFE" ok={store.safetyValid} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6">
              <div className="bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-2xl space-y-5">
                <InputBox label="Tactical Objective" type="textarea" value={missionDesc} onChange={setMissionDesc} placeholder="Objectif..." />
                <div className="grid grid-cols-2 gap-4">
                  <InputBox label="Min Viewers" type="number" value={minViewers} onChange={setMinViewers} />
                  <InputBox label="Bounty ($)" type="number" value={requestedBounty} onChange={setRequestedBounty} />
                </div>
                <button onClick={submitMissionProposal} className="w-full py-5 bg-white text-black font-black uppercase text-xs rounded-xl">Transmit_Proposal</button>
              </div>

              <div className={`p-6 md:p-8 rounded-2xl border ${store.safetyValid ? 'border-[#00FFC2]/30 bg-[#00FFC2]/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Safety_Waiver</span>
                  </div>
                  {!store.safetyValid && <button onClick={() => setShowWaiver(true)} className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg">Sign</button>}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5">
              <button onClick={() => handleDeploy()} disabled={!store.safetyValid || !activeMission || deploying} className="w-full h-48 bg-[#00FFC2] text-black rounded-2xl flex flex-col items-center justify-center gap-2">
                {deploying ? <Loader2 className="animate-spin" /> : <><Zap size={32} /><span className="text-xl font-black italic">DEPLOY_LIVE</span></>}
              </button>
            </div>
          </div>
        )}

        {!isLive && activeTab === 'settings' && (
          <div className="flex h-full w-full overflow-hidden bg-black/40">
            <div className="w-20 lg:w-64 border-r border-white/5 bg-black/20 flex flex-col p-4 gap-1 overflow-y-auto">
              {SETTINGS_NAV.map((item) => (
                <button key={item.id} onClick={() => setActiveSubTab(item.id)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${activeSubTab === item.id ? 'bg-[#00FFC2]/10 border border-[#00FFC2]/20' : 'hover:bg-white/5'}`}>
                  <span className={activeSubTab === item.id ? 'text-[#00FFC2]' : 'text-gray-500'}>{item.icon}</span>
                  <span className={`hidden lg:inline text-[10px] font-black uppercase tracking-widest ${activeSubTab === item.id ? 'text-[#00FFC2]' : 'text-gray-400'}`}>{item.label}</span>
                </button>
              ))}
              <div className="mt-auto p-4 border-t border-white/5 hidden lg:block">
                <button onClick={() => showToast("Sync Complete")} className="w-full py-3 bg-[#00FFC2] text-black text-[10px] font-black uppercase rounded-lg flex items-center justify-center gap-2">
                    <RefreshCw size={12}/> Sync_Cloud
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-16">
              <div className="max-w-2xl mx-auto">
                {activeSubTab === 'profile' && <ProfileModule />}
                {activeSubTab === 'av' && <AVModule />}
                {activeSubTab === 'connection' && <ConnectionModule />}
                {activeSubTab === 'hud' && <HUDModule />}
                {activeSubTab === 'chat' && <ChatModule />}
                {activeSubTab === 'notifications' && <NotificationModule />}
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

        {isLive && liveToken && (
          <div className="fixed inset-0 z-[100] bg-black">
            <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full">
              <VideoConference />
              <button onClick={abortMission} className="absolute top-10 left-1/2 -translate-x-1/2 px-10 py-3 bg-red-600 text-white font-black uppercase text-[10px] rounded-full z-20">Abort_Mission</button>
            </LiveKitRoom>
          </div>
        )}

        {showWaiver && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 space-y-6">
              <div className="text-red-500 font-black uppercase italic text-2xl">Safety_Waiver</div>
              <div className="bg-white rounded-xl h-48">
                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-full'}} />
              </div>
              <button onClick={signLegalWaiver} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase rounded-xl">Authorize_Link</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/20 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}

function InputBox({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">{label}</label>
      {type === "textarea" ? (
        <textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none h-24 resize-none" />
      ) : (
        <input placeholder={placeholder} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none" />
      )}
    </div>
  );
}