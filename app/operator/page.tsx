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
import { useDeployStore, RiskLevel } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

// ─── COMPOSANTS UI RÉUTILISABLES ────────────────────────────────────────────

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

// ─── MODULES DE PARAMÈTRES (LES 12 SECTIONS) ────────────────────────────────

const ProfileModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const p = settings.profile;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Nom d'Opérateur" desc="Identifiant public sur le réseau"><input value={p.displayName} onChange={e => updateSettings('profile', {displayName: e.target.value})} className="bg-black border border-white/10 p-2 text-xs rounded text-[#00FFC2] outline-none w-48" /></SettingRow>
      <SettingRow label="Bio Tactique" desc="Votre description Elite (JSONB encoded)"><textarea value={p.bio} onChange={e => updateSettings('profile', {bio: e.target.value})} className="bg-black border border-white/10 p-2 text-xs rounded text-white outline-none w-48 h-20 resize-none" /></SettingRow>
      <SettingRow label="User ID" desc="Identifiant réseau unique (Copiable)"><div className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/5 cursor-pointer hover:bg-white/10" onClick={() => {navigator.clipboard.writeText(p.userId); alert("ID Copié")}}><span className="text-[9px] font-mono text-gray-400">{p.userId}</span><Copy size={12} /></div></SettingRow>
      <SettingRow label="Avatar & Banner" desc="Upload de média chiffré"><button className="px-4 py-2 border border-white/10 text-[10px] uppercase font-black hover:bg-white/5">Gérer les Médias</button></SettingRow>
    </div>
  );
};

const AVModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const s = settings.av;
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => { navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => {}); }, []);
  const mics = devices.filter(d => d.kind === 'audioinput');
  const cams = devices.filter(d => d.kind === 'videoinput');
  const outs = devices.filter(d => d.kind === 'audiooutput');

  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Caméra Uplink" desc="Flux vidéo primaire"><Toggle value={s.cameraEnabled} onChange={v => updateSettings('av', {cameraEnabled: v})} /></SettingRow>
      <SettingRow label="Microphone Comms" desc="Capture audio en temps réel"><Toggle value={s.micEnabled} onChange={v => updateSettings('av', {micEnabled: v})} /></SettingRow>
      <SettingRow label="Source Vidéo"><Select value={s.selectedCamId || ""} options={[{label: 'Auto', value: ''}, ...cams.map(c => ({label: c.label || 'Webcam', value: c.deviceId}))]} onChange={v => updateSettings('av', {selectedCamId: v})} /></SettingRow>
      <SettingRow label="Source Audio"><Select value={s.selectedMicId || ""} options={[{label: 'Auto', value: ''}, ...mics.map(m => ({label: m.label || 'Micro', value: m.deviceId}))]} onChange={v => updateSettings('av', {selectedMicId: v})} /></SettingRow>
      <SettingRow label="Volume Mic" desc="Gain logiciel (Vu-mètre activé)"><Range value={s.micVolume} min={0} max={100} onChange={v => updateSettings('av', {micVolume: v})} /></SettingRow>
      <div className="mt-4 p-4 border border-[#a855f7]/20 bg-[#a855f7]/5 rounded-xl">
        <span className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest block mb-4">Contre-Mesures Média</span>
        <SettingRow label="Voice Scrambler" desc="Pitch shift anti-IA"><Toggle value={s.voiceScrambler || false} onChange={v => updateSettings('av', {voiceScrambler: v})} accent="#a855f7" /></SettingRow>
        <SettingRow label="Anti-Screen Capture" desc="Bloque les enregistrements (DRM)"><Toggle value={s.antiScreenCapture || false} onChange={v => updateSettings('av', {antiScreenCapture: v})} accent="#a855f7" /></SettingRow>
      </div>
    </div>
  );
};

const ConnectionModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const c = settings.connection;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Mode de Transmission"><Select value={c.mode} options={[{label: 'Realtime (Latency 0)', value: 'realtime'}, {label: 'Optimized', value: 'optimized'}, {label: 'Data Saver', value: 'datasaver'}]} onChange={v => updateSettings('connection', {mode: v as any})} /></SettingRow>
      <SettingRow label="Région Uplink"><Select value={c.serverRegion} options={[{label: 'Auto Detect', value: 'auto'}, {label: 'EU-West (Paris)', value: 'eu-west'}, {label: 'US-East', value: 'us-east'}]} onChange={v => updateSettings('connection', {serverRegion: v as any})} /></SettingRow>
      <SettingRow label="Affichage Ping" desc="Monitorer la latence en live"><Toggle value={c.showPing} onChange={v => updateSettings('connection', {showPing: v})} /></SettingRow>
      <SettingRow label="Auto Reconnect" desc="Tentative de reprise sur coupure réseau"><Toggle value={c.autoReconnect} onChange={v => updateSettings('connection', {autoReconnect: v})} /></SettingRow>
    </div>
  );
};

const ChatModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const ch = settings.chat;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Chat Global" desc="Autoriser les comms externes"><Toggle value={ch.globalChatEnabled} onChange={v => updateSettings('chat', {globalChatEnabled: v})} /></SettingRow>
      <SettingRow label="Filtre Anti-Spam" desc="Protection neurale contre le flood"><Toggle value={ch.antispam} onChange={v => updateSettings('chat', {antispam: v})} /></SettingRow>
      <SettingRow label="Taille Historique"><Select value={ch.messageHistory} options={[{label: '10 messages', value: 10}, {label: '50 messages', value: 50}, {label: '100 messages', value: 100}]} onChange={v => updateSettings('chat', {messageHistory: v as any})} /></SettingRow>
      <SettingRow label="Opacité du Chat"><Range value={ch.chatOpacity} min={10} max={100} unit="%" onChange={v => updateSettings('chat', {chatOpacity: v})} /></SettingRow>
      <SettingRow label="Auto-Traduction" desc="Traduire les agents étrangers en EN"><Toggle value={ch.autoTranslate} onChange={v => updateSettings('chat', {autoTranslate: v})} /></SettingRow>
    </div>
  );
};

const NotificationModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const n = settings.notifications;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Alertes Messages"><Toggle value={n.onMessage} onChange={v => updateSettings('notifications', {onMessage: v})} /></SettingRow>
      <SettingRow label="Alertes Mentions"><Toggle value={n.onMention} onChange={v => updateSettings('notifications', {onMention: v})} /></SettingRow>
      <SettingRow label="Volume Alertes"><Range value={n.volume} min={0} max={100} unit="%" onChange={v => updateSettings('notifications', {volume: v})} /></SettingRow>
      <SettingRow label="Mode Silencieux" desc="Couper tout sauf urgences"><Toggle value={n.silentMode} onChange={v => updateSettings('notifications', {silentMode: v})} accent="#FFD600" /></SettingRow>
    </div>
  );
};

const HUDModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const h = settings.hud;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Thème Visuel"><Select value={h.theme} options={[{label: 'CYBER_CYAN', value: 'cyber'}, {label: 'BLOOD_RED', value: 'blood'}, {label: 'GHOST_WHITE', value: 'ghost'}]} onChange={v => updateSettings('hud', {theme: v as any})} /></SettingRow>
      <SettingRow label="Mode HUD"><Select value={h.hudMode} options={[{label: 'Full (Immersive)', value: 'full'}, {label: 'Minimal (Clean)', value: 'minimal'}]} onChange={v => updateSettings('hud', {hudMode: v as any})} /></SettingRow>
      <SettingRow label="Échelle Interface"><Range value={h.uiScale} min={80} max={130} unit="%" onChange={v => updateSettings('hud', {uiScale: v})} /></SettingRow>
      <SettingRow label="Effet CRT" desc="Scanlines de moniteur vintage"><Toggle value={h.crtEffect} onChange={v => updateSettings('hud', {crtEffect: v})} /></SettingRow>
      <SettingRow label="Glow & Bloom" desc="Effets néons haute intensité"><Toggle value={h.glowEffect} onChange={v => updateSettings('hud', {glowEffect: v})} /></SettingRow>
    </div>
  );
};

const PerformanceModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const perf = settings.performance;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Low Performance Mode" desc="Désactive les shaders lourds"><Toggle value={perf.lowPerformanceMode} onChange={v => updateSettings('performance', {lowPerformanceMode: v})} /></SettingRow>
      <SettingRow label="Limiter FPS UI" desc="Réduire la charge CPU"><Select value={perf.fpsLimit} options={[{label: '30 FPS', value: 30}, {label: '60 FPS', value: 60}, {label: '120 FPS', value: 120}]} onChange={v => updateSettings('performance', {fpsLimit: v})} /></SettingRow>
      <SettingRow label="Cache Local" desc="Stockage des assets sur disque"><Toggle value={perf.localCache} onChange={v => updateSettings('performance', {localCache: v})} /></SettingRow>
      <SettingRow label="Compression Data" desc="Réduire la conso réseau"><Toggle value={perf.dataCompression} onChange={v => updateSettings('performance', {dataCompression: v})} /></SettingRow>
    </div>
  );
};

const PrivacyModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const pr = settings.privacy;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Profil Public"><Toggle value={pr.publicProfile} onChange={v => updateSettings('privacy', {publicProfile: v})} /></SettingRow>
      <SettingRow label="Statut en Ligne"><Toggle value={pr.showOnlineStatus} onChange={v => updateSettings('privacy', {showOnlineStatus: v})} /></SettingRow>
      <SettingRow label="Ghost Protocol" desc="Invisibilité réseau totale"><Toggle value={pr.ghostProtocol || false} onChange={v => updateSettings('privacy', {ghostProtocol: v})} accent="#FF4444" /></SettingRow>
      <SettingRow label="MFA Biomtrique"><Toggle value={pr.mfaEnabled} onChange={v => updateSettings('privacy', {mfaEnabled: v})} /></SettingRow>
    </div>
  );
};

const DataModule = () => {
  const { settings, updateSettings, resetSettings, clearChatHistory } = useDeployStore();
  const d = settings.data;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Sauvegarde Cloud"><Toggle value={d.cloudBackup} onChange={v => updateSettings('data', {cloudBackup: v})} /></SettingRow>
      <SettingRow label="Sync Multi-Device"><Toggle value={d.multiDeviceSync} onChange={v => updateSettings('data', {multiDeviceSync: v})} /></SettingRow>
      <div className="mt-8 space-y-4">
        <button onClick={() => {if(confirm("Effacer tout le chat?")) clearChatHistory()}} className="w-full py-3 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500 transition-all">Supprimer Historique Chat</button>
        <button onClick={() => {if(confirm("Réinitialiser TOUT?")) resetSettings()}} className="w-full py-3 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-orange-500/20 hover:border-orange-500 transition-all">Réinitialiser Paramètres</button>
      </div>
    </div>
  );
};

const AgentModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const a = settings.agents;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Agent par défaut"><Select value={a.defaultAgent} options={[{label: 'ALPHA-7', value: 'ALPHA-7'}, {label: 'GHOST-X', value: 'GHOST-X'}]} onChange={v => updateSettings('agents', {defaultAgent: v})} /></SettingRow>
      <SettingRow label="Auto-Join Mission"><Toggle value={a.autoJoinAgent} onChange={v => updateSettings('agents', {autoJoinAgent: v})} /></SettingRow>
      <SettingRow label="Notifs Bounty" desc="Alertes sur les primes urgentes"><Toggle value={a.bountyNotifications} onChange={v => updateSettings('agents', {bountyNotifications: v})} /></SettingRow>
      <SettingRow label="Stats Agent" desc="Afficher le k/d en temps réel"><Toggle value={a.showAgentStats} onChange={v => updateSettings('agents', {showAgentStats: v})} /></SettingRow>
    </div>
  );
};

const AccountModule = () => {
  const { settings, updateSettings } = useDeployStore();
  const acc = settings.account;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Email Sécurisé"><input disabled value={acc.email} className="bg-white/5 border border-white/10 p-2 text-xs rounded text-gray-500 outline-none w-48 opacity-50" /></SettingRow>
      <SettingRow label="Plan Actuel" desc="Statut de licence Nord.Vantix"><div className="px-3 py-1 bg-[#00FFC2]/20 text-[#00FFC2] text-[10px] font-black border border-[#00FFC2]/50 rounded">{acc.plan}</div></SettingRow>
      <button onClick={() => supabase.auth.signOut()} className="w-full mt-6 py-4 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-500 shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-3"><LogOut size={16} /> Déconnexion du Réseau</button>
      <button className="w-full py-3 text-red-500/50 text-[10px] uppercase font-black hover:text-red-500 transition-colors">Supprimer mon compte</button>
    </div>
  );
};

const AppModule = () => {
  const { settings } = useDeployStore();
  const ap = settings.apps;
  return (
    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
      <SettingRow label="Liaison Discord" desc="Statut : Synchro"><div className={`w-3 h-3 rounded-full ${ap.discordLinked ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500'}`} /></SettingRow>
      <SettingRow label="API Access Key" desc="Pour vos scripts externes"><div className="bg-black border border-white/10 p-2 text-[10px] font-mono text-gray-500 rounded">{ap.apiKey.substring(0, 10)}****************</div></SettingRow>
      <button className="w-full py-4 border border-white/10 bg-white/5 text-[10px] font-black uppercase hover:bg-white/10">Gérer les Intégrations</button>
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
    { id: 'connection', icon: <Globe size={16} />, label: 'Connexion' },
    { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' },
    { id: 'notifications', icon: <Bell size={16} />, label: 'Notifs' },
    { id: 'hud', icon: <Monitor size={16} />, label: 'Interface HUD' },
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
        
        {/* ONGLET HUB : GESTION DES MISSIONS */}
        {!isLive && activeTab === 'hub' && (
          <div className="h-full overflow-y-auto p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 scrollbar-hide">
            {/* Header Hub */}
            <div className="col-span-12 flex justify-between items-end border-b border-white/5 pb-8 mb-4">
               <div>
                  <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Operator_Hub</h2>
                  <div className="flex gap-4 mt-4">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00FFC2]"><div className="w-2 h-2 rounded-full bg-[#00FFC2] animate-pulse" /> Signal Stable</div>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Node_ID: {user.id.substring(0,8)}</div>
                  </div>
               </div>
            </div>

            {/* Formulaire Mission */}
            <div className="col-span-12 lg:col-span-8 bg-zinc-900/10 border border-white/5 rounded-3xl p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Initialize_Mission_Protocol</h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-[#00FFC2] tracking-widest">Mission Objective</label>
                    <textarea value={missionDesc} onChange={e => setMissionDesc(e.target.value)} placeholder="Décrivez votre objectif tactique..." className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] h-24 resize-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Min Viewers</label>
                       <input type="number" value={minViewers} onChange={e => setMinViewers(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2]" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Requested Bounty ($)</label>
                       <input type="number" value={requestedBounty} onChange={e => setRequestedBounty(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2]" />
                    </div>
                 </div>
                 <button onClick={() => showToast("Proposition transmise au Commandement", "success")} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-[#00FFC2] transition-all">Transmit_Contract</button>
              </div>
            </div>

            {/* Bouton Deploy */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
               <button onClick={handleDeploy} disabled={!activeMission || deploying} className={`w-full h-full min-h-[250px] rounded-3xl flex flex-col items-center justify-center gap-4 transition-all group ${activeMission ? 'bg-[#00FFC2] text-black shadow-[0_0_50px_rgba(0,255,194,0.15)]' : 'bg-white/5 text-gray-600'}`}>
                  {deploying ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-red-600" size={48} />
                      <span className="text-3xl font-black text-red-600">T-MINUS {countdown}</span>
                    </div>
                  ) : activeMission ? (
                    <>
                      <Zap size={48} className="animate-pulse" />
                      <span className="text-2xl font-black uppercase italic tracking-tighter">Deploy_Live</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status: Mission Approved</span>
                    </>
                  ) : (
                    <>
                      <Lock size={48} className="opacity-20" />
                      <span className="text-xl font-black uppercase tracking-widest opacity-30 text-center px-6">Waiting for_Command Approval</span>
                    </>
                  )}
               </button>
            </div>
          </div>
        )}

        {/* ONGLET SETTINGS : LES 12 MODULES ─────────────────────────────── */}
        {!isLive && activeTab === 'settings' && (
          <div className="flex h-full w-full overflow-hidden bg-black/40">
            {/* Menu Vertical des Sous-Sections */}
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
              <div className="mt-auto p-4 space-y-3">
                 <button onClick={() => showToast("Config Sync Success", "success")} className="w-full py-3 bg-[#00FFC2] text-black text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"><RefreshCw size={12}/> Sync_Cloud</button>
              </div>
            </div>

            {/* Contenu des Sections */}
            <div className="flex-1 overflow-y-auto p-8 md:p-16 scrollbar-hide">
              <div className="max-w-3xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                   <div className="w-12 h-12 rounded-2xl bg-[#00FFC2]/10 flex items-center justify-center text-[#00FFC2] shadow-inner shadow-[#00FFC2]/20">{SETTINGS_NAV.find(n => n.id === activeSubTab)?.icon}</div>
                   <div>
                      <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">{SETTINGS_NAV.find(n => n.id === activeSubTab)?.label}</h2>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Protocol_Module v4.0.2 / SECURE_LINK</p>
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

        {/* MODE LIVE : DIFFUSION RÉELLE ─────────────────────────────────── */}
        {isLive && liveToken && (
          <div className="fixed inset-0 z-[100] bg-black">
            <LiveKitRoom 
              video={true} audio={true} 
              token={liveToken} 
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
              connect={true} 
              className="h-full w-full relative"
              options={{ videoCaptureDefaults: { resolution: { width: 1920, height: 1080 }, frameRate: 30 } }}
            >
              <div className="absolute inset-0 z-0"><VideoConference /></div>
              <RoomAudioRenderer />
              <div className="absolute inset-0 p-10 flex flex-col justify-between pointer-events-none z-10">
                {/* HUD Overlay Style Watcher */}
                <div className="flex justify-between items-start">
                   <div className="bg-black/60 backdrop-blur-md p-4 border border-red-500/50 rounded-xl">
                      <div className="flex items-center gap-3 text-red-500 font-black italic uppercase"><div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Signal_Live_High_Definition</div>
                      <div className="text-[10px] text-gray-400 mt-1">Uplink: {user.id.substring(0,8)} | Encrypted_Mode_v4</div>
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