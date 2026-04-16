"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { 
  User, Camera, Monitor, Globe, MessageSquare, Bell, Cpu, Shield, 
  Database, Zap, CreditCard, Link, RefreshCw, LogOut, ChevronRight,
  ArrowLeft, Save
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ─── COMPOSANTS UI RÉUTILISABLES ────────────────────────────────────────────

function SettingRow({ label, desc, children, isDanger = false }: { label: string; desc?: string; children: React.ReactNode; isDanger?: boolean }) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-white/5 hover:bg-white/[0.01] transition-colors px-4 ${isDanger ? 'bg-red-500/5' : ''}`}>
      <div className="flex flex-col max-w-[70%]">
        <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDanger ? 'text-red-500' : 'text-[#00FFC2]'}`}>{label}</span>
        {desc && <span className="text-[10px] text-gray-400 uppercase tracking-tight mt-1 leading-relaxed opacity-60">{desc}</span>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, accent = '#00FFC2' }: { value: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full transition-all relative border ${value ? 'bg-opacity-20 border-opacity-50' : 'bg-black border-white/20'}`} style={{ backgroundColor: value ? `${accent}33` : '', borderColor: value ? accent : '', boxShadow: value ? `0 0 12px ${accent}44` : 'none' }}>
      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-lg" style={{ left: value ? 'calc(100% - 20px)' : '4px', backgroundColor: value ? accent : '#444' }} />
    </button>
  );
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings, resetSettings } = useDeployStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSyncing, setIsSyncing] = useState(false);

  const MENU_ITEMS = [
    { id: 'profile', icon: <User size={18} />, label: 'Profil' },
    { id: 'av', icon: <Camera size={18} />, label: 'Audio / Vidéo' },
    { id: 'hud', icon: <Monitor size={18} />, label: 'Interface HUD' },
    { id: 'privacy', icon: <Shield size={18} />, label: 'Sécurité & Privacy' },
    { id: 'connection', icon: <Globe size={18} />, label: 'Réseau' },
    { id: 'performance', icon: <Cpu size={18} />, label: 'Système' },
    { id: 'data', icon: <Database size={18} />, label: 'Données' },
    { id: 'account', icon: <CreditCard size={18} />, label: 'Compte' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-mono flex flex-col lg:flex-row">
      
      {/* SIDEBAR DE NAVIGATION SETTINGS */}
      <aside className="w-full lg:w-80 border-r border-white/5 bg-black/40 backdrop-blur-xl p-6 flex flex-col gap-2">
        <button 
          onClick={() => router.push('/operator')}
          className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-[10px] font-black uppercase tracking-widest"
        >
          <ArrowLeft size={14} /> Back_to_Hub
        </button>

        <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-8 px-2">Configuration_OS</h1>

        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
                activeTab === item.id 
                ? 'bg-[#00FFC2]/10 border border-[#00FFC2]/20 text-[#00FFC2]' 
                : 'hover:bg-white/5 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-4">
                {item.icon}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform ${activeTab === item.id ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 space-y-3">
            <button 
              onClick={handleSync}
              className="w-full py-4 bg-[#00FFC2] text-black rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} /> 
              {isSyncing ? 'Syncing...' : 'Sync_Cloud_Node'}
            </button>
        </div>
      </aside>

      {/* ZONE DE CONTENU DYNAMIQUE */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-20 scrollbar-hide">
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SECTION PROFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black italic uppercase mb-10 text-[#00FFC2]">User_Identity</h2>
              <SettingRow label="Nom d'appel" desc="Identifiant public visible sur le réseau">
                <input 
                  value={settings.profile.displayName} 
                  onChange={(e) => updateSettings('profile', {displayName: e.target.value})}
                  className="bg-black border border-white/10 p-3 rounded-xl text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2] w-64"
                />
              </SettingRow>
              <SettingRow label="Bio Tactique" desc="Description courte affichée dans le terminal">
                <textarea 
                  value={settings.profile.bio} 
                  onChange={(e) => updateSettings('profile', {bio: e.target.value})}
                  className="bg-black border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] w-64 h-24 resize-none"
                />
              </SettingRow>
            </div>
          )}

          {/* SECTION PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black italic uppercase mb-10 text-red-500">Security_Protocol</h2>
              <SettingRow label="Ghost Protocol" desc="Masquage total de l'adresse IP et des métadonnées">
                <Toggle value={settings.privacy.ghostProtocol} onChange={(v) => updateSettings('privacy', {ghostProtocol: v})} accent="#FF4444" />
              </SettingRow>
              <SettingRow label="E2E Encryption" desc="Chiffrement zero-knowledge des transmissions">
                <Toggle value={settings.privacy.zeroKnowledgeE2E} onChange={(v) => updateSettings('privacy', {zeroKnowledgeE2E: v})} />
              </SettingRow>
              <SettingRow label="Hardware Spoofing" desc="Génère une signature matérielle aléatoire">
                <Toggle value={settings.privacy.hardwareSpoofing} onChange={(v) => updateSettings('privacy', {hardwareSpoofing: v})} />
              </SettingRow>
            </div>
          )}

          {/* SECTION HUD */}
          {activeTab === 'hud' && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black italic uppercase mb-10 text-blue-400">Interface_HUD</h2>
              <SettingRow label="Effet Cathodique (CRT)" desc="Applique un filtre scanline rétro-futuriste">
                <Toggle value={settings.hud.crtEffect} onChange={(v) => updateSettings('hud', {crtEffect: v})} accent="#60A5FA" />
              </SettingRow>
              <SettingRow label="Glow Intensif" desc="Augmente le bloom des éléments néon">
                <Toggle value={settings.hud.glowEffect} onChange={(v) => updateSettings('hud', {glowEffect: v})} accent="#60A5FA" />
              </SettingRow>
            </div>
          )}

          {/* SECTION DATA (DANGER ZONE) */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-4xl font-black italic uppercase mb-10 text-orange-500">Data_Management</h2>
              <SettingRow label="Auto-Burn Logs" desc="Détruit l'historique de session après déconnexion">
                <Toggle value={settings.data.autoBurnLogs} onChange={(v) => updateSettings('data', {autoBurnLogs: v})} accent="#F97316" />
              </SettingRow>
              <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl mt-12">
                <h3 className="text-red-500 font-black uppercase text-xs mb-4">Danger_Zone</h3>
                <button 
                  onClick={() => confirm("Réinitialiser tout le système ?") && resetSettings()}
                  className="px-6 py-3 bg-red-600 text-white font-black uppercase text-[10px] rounded-xl hover:bg-red-500 transition-all"
                >
                  Factory_Reset_OS
                </button>
              </div>
            </div>
          )}

          {/* Fallback pour les autres sections (tu pourras les remplir plus tard) */}
          {!['profile', 'privacy', 'hud', 'data'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-3xl">
              <Zap size={48} className="text-gray-800 mb-4" />
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Module_Under_Construction</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}