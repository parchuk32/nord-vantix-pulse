"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDeployStore } from '@/store/useDeployStore'; // Ajuste le chemin vers ton store si besoin

// ─── TYPES ───────────────────────────────────────────────────────────────────

type NavSection =
  | 'profile'
  | 'av'
  | 'connection'
  | 'chat'
  | 'notifications'
  | 'hud'
  | 'performance'
  | 'privacy'
  | 'data'
  | 'agents'
  | 'account'
  | 'apps';

// ─── COMPOSANTS UI ────────────────────────────────────────────────────────────

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

// ─── SECTIONS DE SÉCURITÉ (AV, PRIVACY, DATA) ────────────────────────────────

function AVSection() {
  const { settings, updateSettings } = useDeployStore();
  const s = settings.av;
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(setDevices).catch(() => {});
  }, []);

  const mics = devices.filter((d) => d.kind === 'audioinput');
  const cams = devices.filter((d) => d.kind === 'videoinput');
  const outputs = devices.filter((d) => d.kind === 'audiooutput');

  const makeOptions = (devs: MediaDeviceInfo[]) =>
    [{ label: 'Par défaut', value: '' }, ...devs.map((d) => ({ label: d.label || d.deviceId, value: d.deviceId }))];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon="🎥" title="Audio / Vidéo & Contre-Mesures" />

      {/* PÉRIPHÉRIQUES STANDARD */}
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
      
      {/* CONTRE-MESURES MÉDIA (NOUVEAU) */}
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon="🔐" title="Confidentialité & Sécurité" />

      {/* RÉSEAU & ANONYMAT */}
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

      {/* CHIFFREMENT */}
      <div className="mt-8">
        <p className="text-xs text-[#00FFC2] font-bold tracking-widest uppercase mb-3 border-b border-[#00FFC2]/20 pb-1">Cryptographie</p>

        <SettingRow label="Chiffrement Zero-Knowledge (E2E)" desc="Nord.Vantix ne stocke aucune clé de déchiffrement">
          <Toggle value={s.zeroKnowledgeE2E} onChange={(v) => updateSettings('privacy', { zeroKnowledgeE2E: v })} />
        </SettingRow>

        <SettingRow label="Double authentification (2FA)" desc="Requiert un jeton physique ou biométrique">
          <Toggle value={s.mfaEnabled} onChange={(v) => updateSettings('privacy', { mfaEnabled: v })} />
        </SettingRow>
      </div>

      {/* SCORE DE SÉCURITÉ */}
      <div className="mt-8 p-4 rounded-lg bg-black/40 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,194,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-pulse pointer-events-none" />
        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-white/50">Niveau d'Armure Numérique</span>
          <span
            className="text-sm font-black font-mono tracking-widest"
            style={{ color: s.securityScore >= 80 ? '#00FFC2' : s.securityScore >= 50 ? '#FFD600' : '#FF4444' }}
          >
            {s.securityScore}/100
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/10">
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${s.securityScore}%`,
              background: s.securityScore >= 80 ? '#00FFC2' : s.securityScore >= 50 ? '#FFD600' : '#FF4444',
              boxShadow: `0 0 10px ${s.securityScore >= 80 ? '#00FFC2' : '#FFD600'}`,
            }}
          />
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle icon="📊" title="Données & Protocoles" />

      <div>
        <SettingRow label="Sauvegarde cloud cryptée" desc="Synchronisation AES-256 des préférences">
          <Toggle value={s.cloudBackup} onChange={(v) => updateSettings('data', { cloudBackup: v })} />
        </SettingRow>

        <SettingRow label="Auto-Destruction des Logs (Burn)" desc="Purge les caches locaux à chaque déconnexion">
          <Toggle value={s.autoBurnLogs} onChange={(v) => updateSettings('data', { autoBurnLogs: v })} accent="#FF4444" />
        </SettingRow>
      </div>

      {/* BOUTON D'URGENCE (KILL SWITCH) */}
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

      {/* Actions Standard */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <button
          onClick={handleExport}
          className="w-full py-2.5 rounded-lg border border-[#00FFC2]/20 text-[#00FFC2] text-xs font-mono tracking-wider hover:bg-[#00FFC2]/5 transition-colors"
        >
          ⬇ Télécharger l'Archive Sécurisée (JSON)
        </button>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: NavSection; icon: string; label: string }[] = [
  { id: 'profile', icon: '👤', label: 'Profil' },
  { id: 'privacy', icon: '🔐', label: 'Confidentialité' },
  { id: 'av', icon: '🎥', label: 'Contre-Mesures AV' },
  { id: 'data', icon: '📊', label: 'Data & Kill Switch' },
  { id: 'connection', icon: '📡', label: 'Connexion' },
  { id: 'chat', icon: '💬', label: 'Chat' },
  { id: 'notifications', icon: '🔔', label: 'Notifs' },
  { id: 'hud', icon: '🎮', label: 'HUD' },
  { id: 'performance', icon: '⚡', label: 'Performance' },
  { id: 'agents', icon: '🧠', label: 'Agents' },
  { id: 'account', icon: '🚪', label: 'Compte' },
  { id: 'apps', icon: '🔗', label: 'Apps' },
];

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<NavSection>('privacy'); // On ouvre sur Privacy par défaut pour montrer la sécu
  const accent = useDeployStore((s) => s.settings.hud.accentColor);

  const renderSection = () => {
    switch (active) {
      case 'av': return <AVSection />;
      case 'privacy': return <PrivacySection />;
      case 'data': return <DataSection />;
      // Note: J'ai retiré les autres placeholders pour alléger, mais tu peux remettre tes anciens ProfileSection, ConnectionSection etc ici si besoin.
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-white/30 text-xs font-mono mt-20">
          <span className="text-4xl mb-4">🚧</span>
          Module [{active.toUpperCase()}] en cours de cryptage...
        </div>
      );
    }
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: 'radial-gradient(ellipse at 20% 0%, #001a2e 0%, #0a0f1a 50%, #000 100%)',
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* Header */}
      <div
        className="border-b px-6 py-4 flex items-center gap-4 bg-black/50 backdrop-blur-md"
        style={{ borderColor: `${accent}22` }}
      >
        <div
          className="w-1 h-6 rounded-full animate-pulse"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
        <h1
          className="text-sm font-black tracking-[0.25em] uppercase"
          style={{ color: accent }}
        >
          OS_Settings — NORD.VANTIX
        </h1>
        <div className="flex-1" />
        <span className="text-xs text-white/20 font-mono bg-white/5 px-2 py-1 rounded">v4.0.2 SECURE</span>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sidebar */}
        <nav
          className="w-56 border-r flex flex-col gap-1 p-3 overflow-y-auto bg-black/20"
          style={{ borderColor: `${accent}11` }}
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group"
              style={{
                background: active === item.id ? `${accent}15` : 'transparent',
                borderLeft: active === item.id ? `3px solid ${accent}` : '3px solid transparent',
              }}
            >
              <span className="text-base flex-shrink-0 opacity-80">{item.icon}</span>
              <span
                className="text-xs font-bold uppercase tracking-widest truncate transition-colors"
                style={{ color: active === item.id ? accent : 'rgba(255,255,255,0.4)' }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 relative">
          <div className="max-w-2xl mx-auto">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}