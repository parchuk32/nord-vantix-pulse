"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { 
  LayoutDashboard, Settings, Wallet, Zap, 
  Shield, CheckCircle2, AlertTriangle, X, Activity, Crosshair, Loader2
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

// ============================================================================
// 1. COMPOSANTS UI POUR LES PARAMÈTRES (INJECTÉS DANS LE HUB)
// ============================================================================

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded px-2">
      <div className="flex flex-col max-w-[70%]">
        <span className="text-sm font-bold text-gray-200">{label}</span>
        {desc && <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{desc}</span>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, accent = '#00FFC2' }: { value: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 border ${
        value ? 'bg-opacity-20 border-opacity-50' : 'bg-black border-white/20'
      }`}
      style={{
        backgroundColor: value ? `${accent}33` : '',
        borderColor: value ? accent : '',
        boxShadow: value ? `0 0 8px ${accent}55` : 'none',
      }}
    >
      <span
        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200`}
        style={{ left: value ? 'calc(100% - 16px)' : '2px', backgroundColor: value ? accent : '#9ca3af' }}
      />
    </button>
  );
}

function Select<T extends string>({ value, options, onChange }: { value: T; options: { label: string; value: T }[]; onChange: (v: T) => void; }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="bg-black border border-white/10 text-white text-xs rounded px-2 py-1.5 outline-none focus:border-[#00FFC2]/50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-[#0a0f1a]">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#00FFC2]/20">
      <span className="text-xl">{icon}</span>
      <h2 className="text-sm font-black tracking-[0.15em] text-[#00FFC2] uppercase">{title}</h2>
    </div>
  );
}

// --- SOUS-SECTIONS DE PARAMÈTRES ---

function AVSection() {
  const { settings, updateSettings } = useDeployStore();
  const s = settings.av;
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => {});
  }, []);

  const mics = devices.filter((d) => d.kind === 'audioinput');
  const cams = devices.filter((d) => d.kind === 'videoinput');
  const makeOptions = (devs: MediaDeviceInfo[]) =>
    [{ label: 'Par défaut', value: '' }, ...devs.map((d) => ({ label: d.label || d.deviceId, value: d.deviceId }))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionTitle icon="🎥" title="Audio / Vidéo & Contre-Mesures" />
      <div>
        <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-3 border-b border-white/10 pb-1">Périphériques Standard</p>
        <SettingRow label="Caméra locale" desc="Activer la vidéo">
          <Toggle value={s.cameraEnabled} onChange={(v) => updateSettings('av', { cameraEnabled: v })} />
        </SettingRow>
        <SettingRow label="Microphone" desc="Activer la capture audio">
          <Toggle value={s.micEnabled} onChange={(v) => updateSettings('av', { micEnabled: v })} />
        </SettingRow>
        {mics.length > 0 && (
          <SettingRow label="Microphone actif">
            <Select value={s.selectedMicId ?? ''} options={makeOptions(mics)} onChange={(v) => updateSettings('av', { selectedMicId: v || null })} />
          </SettingRow>
        )}
        {cams.length > 0 && (
          <SettingRow label="Caméra active">
            <Select value={s.selectedCamId ?? ''} options={makeOptions(cams)} onChange={(v) => updateSettings('av', { selectedCamId: v || null })} />
          </SettingRow>
        )}
      </div>
      <div className="mt-8">
        <p className="text-xs text-[#00FFC2] font-bold tracking-widest uppercase mb-3 border-b border-[#00FFC2]/20 pb-1">Contre-Mesures Média</p>
        <SettingRow label="Brouilleur Vocal (Voice Scrambler)" desc="Modifie le pitch pour empêcher l'identification vocale">
          <Toggle value={s.voiceScrambler} onChange={(v) => updateSettings('av', { voiceScrambler: v })} accent="#a855f7" />
        </SettingRow>
        <SettingRow label="Filigrane Dynamique (Watermark)" desc="Incruste des hashs invisibles pour tracker les fuites">
          <Toggle value={s.dynamicWatermark} onChange={(v) => updateSettings('av', { dynamicWatermark: v })} />
        </SettingRow>
        <SettingRow label="Protection DRM Anti-Capture" desc="Tente de noircir l'écran lors d'enregistrements (OBS, etc.)">
          <Toggle value={s.antiScreenCapture} onChange={(v) => updateSettings('av', { antiScreenCapture: v })} />
        </SettingRow>
      </div>
    </div>
  );
}

function PrivacySection() {
  const { settings, updateSettings } = useDeployStore();
  const s = settings.privacy;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionTitle icon="🔐" title="Confidentialité & Sécurité" />
      <div>
        <p className="text-xs text-[#00FFC2] font-bold tracking-widest uppercase mb-3 border-b border-[#00FFC2]/20 pb-1">Mesures Anti-Pistage</p>
        <SettingRow label="Protocole Fantôme (Ghost Mode)" desc="Vous rend indétectable sur les radars Watchers">
          <Toggle value={s.ghostProtocol} onChange={(v) => updateSettings('privacy', { ghostProtocol: v })} accent="#FF4444" />
        </SettingRow>
        <SettingRow label="Spoofing Matériel" desc="Falsifie l'empreinte WebGL/Canvas de votre machine">
          <Toggle value={s.hardwareSpoofing} onChange={(v) => updateSettings('privacy', { hardwareSpoofing: v })} />
        </SettingRow>
        <SettingRow label="Masquage IP (Onion Routing)" desc="Fait transiter le flux via 3 nœuds relais cryptés">
          <Toggle value={s.ipMasking} onChange={(v) => updateSettings('privacy', { ipMasking: v })} />
        </SettingRow>
      </div>
      <div className="mt-8">
        <p className="text-xs text-[#00FFC2] font-bold tracking-widest uppercase mb-3 border-b border-[#00FFC2]/20 pb-1">Cryptographie</p>
        <SettingRow label="Chiffrement Zero-Knowledge (E2E)" desc="Nord.Vantix ne stocke aucune clé de déchiffrement">
          <Toggle value={s.zeroKnowledgeE2E} onChange={(v) => updateSettings('privacy', { zeroKnowledgeE2E: v })} />
        </SettingRow>
        <SettingRow label="Double authentification (2FA)" desc="Requiert un jeton physique ou biométrique">
          <Toggle value={s.mfaEnabled} onChange={(v) => updateSettings('privacy', { mfaEnabled: v })} />
        </SettingRow>
      </div>
      <div className="mt-8 p-4 rounded-lg bg-black/40 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,194,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-pulse pointer-events-none" />
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-white/50">Niveau d'Armure Numérique</span>
          <span className="text-sm font-black font-mono tracking-widest" style={{ color: s.securityScore >= 80 ? '#00FFC2' : s.securityScore >= 50 ? '#FFD600' : '#FF4444' }}>
            {s.securityScore}/100
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/10">
          <div className="h-full transition-all duration-1000" style={{ width: `${s.securityScore}%`, background: s.securityScore >= 80 ? '#00FFC2' : s.securityScore >= 50 ? '#FFD600' : '#FF4444', boxShadow: `0 0 10px ${s.securityScore >= 80 ? '#00FFC2' : '#FFD600'}` }} />
        </div>
      </div>
    </div>
  );
}

function DataSection() {
  const { settings, updateSettings, resetSettings, clearChatHistory, exportData } = useDeployStore();
  const s = settings.data;

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nord-vantix-classified-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionTitle icon="📊" title="Données & Protocoles" />
      <div>
        <SettingRow label="Sauvegarde cloud cryptée" desc="Synchronisation AES-256 des préférences">
          <Toggle value={s.cloudBackup} onChange={(v) => updateSettings('data', { cloudBackup: v })} />
        </SettingRow>
        <SettingRow label="Auto-Destruction des Logs (Burn)" desc="Purge les caches locaux à chaque déconnexion">
          <Toggle value={s.autoBurnLogs} onChange={(v) => updateSettings('data', { autoBurnLogs: v })} accent="#FF4444" />
        </SettingRow>
      </div>
      <div className="mt-8 p-5 rounded-lg border border-red-500/30 bg-red-500/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20" />
        <h3 className="text-red-500 font-black tracking-widest text-sm uppercase mb-1">Protocole d'Urgence (Kill Switch)</h3>
        <p className="text-xs text-red-400/60 mb-4">Attention: Ceci effacera définitivement toutes les données locales, l'historique et brisera toutes les connexions actives.</p>
        <SettingRow label="Armer le Kill Switch" desc="Déverrouille le bouton d'autodestruction">
          <Toggle value={s.panicWipeReady} onChange={(v) => updateSettings('data', { panicWipeReady: v })} accent="#FF4444" />
        </SettingRow>
        <button
          disabled={!s.panicWipeReady}
          onClick={() => {
             if(confirm("☢ DANGER : Confirmez-vous la purge totale du système ?")) {
                 clearChatHistory();
                 resetSettings();
                 alert("Purge exécutée.");
             }
          }}
          className="w-full mt-4 py-3 bg-red-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded border border-red-400 disabled:opacity-30 disabled:grayscale transition-all hover:bg-red-500 hover:shadow-[0_0_20px_rgba(255,0,0,0.5)] active:scale-95"
        >
          {s.panicWipeReady ? "☢ EXÉCUTER LA PURGE TOTALE ☢" : "SYSTÈME VERROUILLÉ"}
        </button>
      </div>
      <div className="pt-4 border-t border-white/5 space-y-3">
        <button onClick={handleExport} className="w-full py-2.5 rounded-lg border border-[#00FFC2]/20 text-[#00FFC2] text-xs font-mono tracking-wider hover:bg-[#00FFC2]/5 transition-colors">
          ⬇ Télécharger l'Archive Sécurisée (JSON)
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// 2. LE HUB OPÉRATEUR PRINCIPAL
// ============================================================================

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [activeTab, setActiveTab] = useState<'hub' | 'wallet' | 'settings'>('hub');
  const [activeSubTab, setActiveSubTab] = useState('privacy'); // Par défaut sur confidentialité
  
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

  // Le menu de navigation INTERNE des paramètres
  const SETTINGS_NAV = [
    { id: 'privacy', icon: '🔐', label: 'Sécurité' },
    { id: 'av', icon: '🎥', label: 'Vidéo & Scrambler' },
    { id: 'data', icon: '📊', label: 'Données & Kill Switch' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/register');
      } else {
        setUser(session.user);
        fetchMissions(session.user.id);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('realtime_missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions', filter: `user_id=eq.${user.id}` }, 
      (payload) => {
        fetchMissions(user.id);
        if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
          showToast(`MISSION APPROUVÉE: ${payload.new.bounty}$ validés.`, 'success');
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'rejected') {
          showToast(`MISSION REJETÉE par le Commandement.`, 'error');
        }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchMissions = async (userId: string) => {
    const { data, error } = await supabase.from('missions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data) setMissions(data);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveSettings = async () => {
    store.addLog("SYNC: Deploying settings to secure cloud...");
    try {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, settings: store.settings }, { onConflict: 'id' });
      if (error) throw error;
      showToast("Configuration sauvegardée avec succès sur le serveur", "success");
    } catch (err: any) {
      showToast(`Échec: ${err.message || "Erreur de base de données"}`, "error");
    }
  };

  const submitMissionProposal = async () => {
    if (!missionDesc || !minViewers || !requestedBounty) return showToast("Toutes les données tactiques sont requises.", "error");
    setIsSubmitting(true);
    const { error } = await supabase.from('missions').insert([{ user_id: user.id, objective: missionDesc, min_viewers: parseInt(minViewers), bounty: parseFloat(requestedBounty), risk_level: riskLevel, status: 'pending' }]);
    setIsSubmitting(false);
    if (error) showToast(`Échec de la transmission: ${error.message}`, "error");
    else {
      showToast("Proposition envoyée au Commandement.", "success");
      setMissionDesc(""); setMinViewers(""); setRequestedBounty("");
      fetchMissions(user.id);
    }
  };

  const signLegalWaiver = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return showToast("Signature requise.", "error");
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    const { error } = await supabase.from('operator_waivers').insert([{ user_id: user.id, contract_version: '4.0.2', signature_data: signatureData }]);
    if (error) return showToast(`Erreur d'archivage légal: ${error.message}`, "error");
    store.setSignature(signatureData);
    store.setModuleStatus('safetyValid', true);
    setShowWaiver(false);
    showToast("Contrat légal signé et archivé !");
  };

  const activeMission = missions.find(m => m.status === 'approved' || m.status === 'active');

  useEffect(() => {
    const isLiveMode = localStorage.getItem('pulse_live_mode') === 'true';
    if (isLiveMode && activeMission?.status === 'active' && store.safetyValid && !isLive && !deploying && !liveToken) {
      handleDeploy(true);
    }
  }, [activeMission, store.safetyValid, isLive, deploying, liveToken]);

  const handleDeploy = async (instant = false) => {
    if (!store.safetyValid || !activeMission) return showToast("Contrat légal non signé ou aucune mission approuvée.", "error");
    setDeploying(true);
    try {
      const resp = await fetch(`/api/get-participant-token?room=room-${user.id}&username=OPERATOR-${user.id}`);
      const data = await resp.json();
      if (!data.token) throw new Error("Connexion LiveKit rejetée par le serveur.");
      setLiveToken(data.token);
      localStorage.setItem('pulse_live_mode', 'true');
      await supabase.from('missions').update({ status: 'active' }).eq('id', activeMission.id);
      if (instant) { setIsLive(true); setDeploying(false); return; }
      let timer = 3;
      setCountdown(timer);
      const interval = setInterval(() => {
        timer--; setCountdown(timer);
        if (timer === 0) { clearInterval(interval); setIsLive(true); setDeploying(false); }
      }, 1000);
    } catch (e: any) { setDeploying(false); showToast(`Échec Uplink: ${e.message}`, "error"); }
  };

  const abortMission = async () => {
    setIsLive(false); setLiveToken(""); localStorage.removeItem('pulse_live_mode');
    if (activeMission) {
      await supabase.from('missions').update({ status: 'completed' }).eq('id', activeMission.id);
      showToast("Mission annulée. Signal terminé.", "error");
    }
  };

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

      {/* MENU PRINCIPAL HUB */}
      {!isLive && (
        <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-black/90 border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col p-2 md:p-6 gap-2 z-40 backdrop-blur-lg safe-area-bottom">
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
        
        {/* ================================================================= */}
        {/* ONGLET 1 : LE HUB PRINCIPAL                                       */}
        {/* ================================================================= */}
        {!isLive && activeTab === 'hub' && (
          <div className="h-full overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 md:gap-6 scrollbar-hide">
            <div className="col-span-12 border-b border-[#00FFC2]/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Mission_Protocol</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusTag label="CONTRACT" ok={!!activeMission} />
                  <StatusTag label="SAFE" ok={store.safetyValid} />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6">
              <div className="bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Crosshair size={14} className="text-[#00FFC2]" /> Draft_New_Contract</label>
                </div>
                <InputBox label="Tactical Objective / Rules" type="textarea" value={missionDesc} onChange={setMissionDesc} placeholder="Ex: Survivre 30 min sans armure..." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputBox label="Minimum Viewers Required" type="number" value={minViewers} onChange={setMinViewers} placeholder="Ex: 50" />
                  <InputBox label="Requested Bounty ($)" type="number" value={requestedBounty} onChange={setRequestedBounty} placeholder="Ex: 100" />
                </div>
                <button onClick={submitMissionProposal} disabled={isSubmitting} className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Transmit_Proposal_to_Command"}
                </button>
              </div>

              <div className={`p-6 md:p-8 rounded-2xl border ${store.safetyValid ? 'border-[#00FFC2]/30 bg-[#00FFC2]/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Safety_Waiver</span>
                  </div>
                  {!store.safetyValid ? (
                    <button onClick={() => setShowWaiver(true)} className="px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-lg">Sign Contract</button>
                  ) : <CheckCircle2 size={24} className="text-[#00FFC2]" />}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-4">
              <button 
                onClick={() => handleDeploy(false)}
                disabled={!store.safetyValid || !activeMission || deploying}
                className={`w-full py-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  store.safetyValid && activeMission ? 'bg-[#00FFC2] text-black hover:bg-white shadow-[0_0_40px_rgba(0,255,194,0.2)]' : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }`}>
                <span className="font-black text-2xl uppercase italic tracking-widest flex items-center gap-3">
                  {deploying ? (<><Loader2 className="animate-spin text-red-500" size={28} /><span className="text-red-500">T-MINUS {countdown}</span></>) : activeMission ? (<><Activity className="animate-pulse" size={28} /> Deploy_Live</>) : ('No_Active_Contract')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ONGLET 2 : LES PARAMÈTRES (INTÉGRATION DU SOUS-MENU VERTICAL)     */}
        {/* ================================================================= */}
        {!isLive && activeTab === 'settings' && (
          <div className="flex h-full w-full overflow-hidden">
            
            {/* LE MENU VERTICAL DES PARAMETRES */}
            <div className="w-48 md:w-64 border-r border-white/5 bg-black/40 flex flex-col p-4 gap-2 overflow-y-auto">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 px-2 mt-2">OS_Security_Config</h3>
              
              {SETTINGS_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                    activeSubTab === item.id ? 'bg-[#00FFC2]/10 border border-[#00FFC2]/20' : 'hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg flex-shrink-0 opacity-80">{item.icon}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest truncate ${activeSubTab === item.id ? 'text-[#00FFC2]' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              ))}

              <div className="mt-auto pt-6 border-t border-white/5">
                <button onClick={handleSaveSettings} className="w-full py-4 bg-white/10 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#00FFC2] hover:text-black transition-all">
                  Save All
                </button>
              </div>
            </div>

            {/* LE CONTENU DES PARAMETRES */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="max-w-2xl mx-auto">
                {activeSubTab === 'privacy' && <PrivacySection />}
                {activeSubTab === 'av' && <AVSection />}
                {activeSubTab === 'data' && <DataSection />}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* LE RESTE : LIVE ROOM ET WAIVER MODAL                              */}
        {/* ================================================================= */}
        {isLive && activeMission && liveToken && (
          <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
            <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full relative">
              <div className="absolute inset-0 z-0 bg-black"><VideoConference /></div>
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between pointer-events-none z-10">
                <button onClick={abortMission} className="pointer-events-auto self-center px-10 py-3 bg-black/60 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full tracking-widest backdrop-blur-md hover:bg-red-600 hover:text-white transition-colors">
                  Abort_Mission
                </button>
              </div>
            </LiveKitRoom>
          </div>
        )}

        {showWaiver && (
           <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
              <div className="w-full max-w-2xl bg-[#0a0a0a] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-10 space-y-6">
                <div className="flex justify-between items-start flex-shrink-0">
                   <div className="flex items-center gap-3 text-red-500"><AlertTriangle size={24} /><h2 className="text-xl md:text-2xl font-black uppercase italic">Safety_Contract_v4.0</h2></div>
                   <button onClick={() => setShowWaiver(false)} className="p-2 text-gray-500 hover:text-white"><X size={20}/></button>
                </div>
                <div className="bg-white rounded-xl overflow-hidden h-40 md:h-48 cursor-crosshair border-4 border-[#00FFC2]/20 shadow-[0_0_30px_rgba(0,255,194,0.1)]">
                  <SignatureCanvas ref={sigCanvas} penColor='black' backgroundColor='white' canvasProps={{className: 'w-full h-full'}} />
                </div>
                <button onClick={signLegalWaiver} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all">Sign_&_Authorize</button>
              </div>
           </div>
        )}
      </section>
    </div>
  );
}

// Composants helpers additionnels
function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/20 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}

function InputBox({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, type?: "text" | "textarea" | "number", placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">{label}</label>
      {type === "textarea" ? (
        <textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] transition-colors h-24 resize-none placeholder-gray-700" />
      ) : (
        <input placeholder={placeholder} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] transition-colors placeholder-gray-700" />
      )}
    </div>
  );
}