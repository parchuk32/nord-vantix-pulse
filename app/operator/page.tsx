"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom } from '@livekit/components-react';
import { 
  LayoutDashboard, Settings, Wallet, Zap, 
  Shield, CheckCircle2, AlertTriangle, X, Copy, Mail
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
  const [activeSubTab, setActiveSubTab] = useState('General');
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showWaiver, setShowWaiver] = useState(false);
  
  // Nouveaux états Mission Protocol
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [missionStatus, setMissionStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [inboxMessages, setInboxMessages] = useState<{id: number, text: string, type: 'info'|'success'|'warning'|'error'}[]>([
    {id: 1, text: "SYSTÈME: En attente de soumission de contrat.", type: "info"}
  ]);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Menus nettoyés
  const subTabs = ['General', 'Security', 'Billing', 'Notifications', 'Referral', 'Sharing'];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/register'); else setUser(session.user);
    };
    checkAuth();
  }, [router]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch (err) {
      showToast("Erreur lors de la copie", "error");
    }
  };

  // --- LOGIQUE SAUVEGARDE RÉPARÉE (UPSERT) ---
  const handleSaveSettings = async () => {
    store.addLog("SYNC: Deploying settings to secure cloud...");
    try {
      const { error } = await supabase.from('profiles').upsert(
        { id: user.id, settings: store.settings },
        { onConflict: 'id' }
      );
      if (error) throw error;
      
      store.addLog("SUCCESS: Global config saved.");
      showToast("Configuration sauvegardée avec succès sur le serveur", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`Échec: ${err.message || "Erreur de base de données"}`, "error");
    }
  };

  // --- LOGIQUE SÉCURITÉ (VRAI EMAIL) ---
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      showToast(error.message, "error");
    } else {
      showToast(`Lien de sécurité envoyé à ${user.email}`, "success");
    }
  };

  const handleEditBilling = () => {
    const newCard = window.prompt("Entrez les 4 derniers chiffres de votre nouvelle carte :");
    if (newCard && newCard.length === 4 && !isNaN(Number(newCard))) {
      store.updateSettings('billing', { cardLast4: newCard });
      showToast("Moyen de paiement mis à jour");
    } else if (newCard) {
      showToast("Format invalide. Entrez 4 chiffres.", "error");
    }
  };

  // --- LOGIQUE MISSION PROTOCOL ---
  const submitMissionProposal = () => {
    if (!missionDesc || !minViewers || !requestedBounty) {
      showToast("Toutes les données du contrat doivent être remplies", "error");
      return;
    }
    
    setMissionStatus("pending");
    const newMsgId = Date.now();
    setInboxMessages(prev => [{
      id: newMsgId, 
      text: `REQUÊTE ENVOYÉE: Validation de ${requestedBounty}$ pour ${minViewers} viewers en cours d'examen par le Commandement...`, 
      type: 'warning'
    }, ...prev]);

    // TODO: À remplacer par un vrai call Supabase pour envoyer la demande à ton dashboard admin.
    // Pour l'instant, ça simule une acceptation après 4 secondes.
    setTimeout(() => {
      setMissionStatus("approved");
      setInboxMessages(prev => [{
        id: Date.now() + 1, 
        text: `✅ CONTRAT ACCEPTÉ : Objectifs validés. Montant bloqué : ${requestedBounty}$. Déploiement autorisé.`, 
        type: 'success'
      }, ...prev]);
      store.setModuleStatus('aiApproved', true);
      showToast("Contrat approuvé par l'administration !");
    }, 4000);
  };

  // --- LOGIQUE SIGNATURE ---
  const signLegalWaiver = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      showToast("Signature requise.", "error");
      return;
    }
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    store.addLog("LEGAL: Biometric uplink secured.");
    
    const { error } = await supabase.from('operator_waivers').insert([{ 
      user_id: user.id, contract_version: '4.0.2', signature_data: signatureData 
    }]);

    if (!error) {
      store.setSignature(signatureData);
      store.setModuleStatus('safetyValid', true);
      store.setModuleStatus('hardwareReady', true);
      setShowWaiver(false);
      showToast("Contrat signé et validé");
    } else {
      showToast("Erreur lors de la sauvegarde de la signature", "error");
    }
  };

  const handleDeploy = () => {
    if (!store.isSystemReady() || missionStatus !== 'approved') {
      showToast("Le système ou le contrat n'est pas prêt.", "error");
      return;
    }
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
      {store.settings.branding?.crtEffect && <div className="crt-overlay pointer-events-none z-50 opacity-5" />}
      
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[300] px-6 py-3 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl ${toast.type === 'success' ? 'bg-[#00FFC2]/20 border border-[#00FFC2] text-[#00FFC2]' : 'bg-red-500/20 border border-red-500 text-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}

      {/* --- SIDEBAR --- */}
      {!isLive && (
        <nav className="fixed bottom-0 w-full md:relative md:w-64 bg-black border-t md:border-t-0 md:border-r border-white/5 flex md:flex-col p-2 md:p-6 gap-2 z-40 backdrop-blur-lg">
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

      {/* --- MAIN CONTENT --- */}
      <section className="flex-1 relative flex flex-col overflow-hidden pb-20 md:pb-0">
        
        {/* ============================================== */}
        {/* ONGLET HUB (Briefing & Deploy)                 */}
        {/* ============================================== */}
        {!isLive && activeTab === 'hub' && (
          <div className="p-4 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 md:gap-6 overflow-y-auto scrollbar-hide">
            <div className="col-span-12 border-b border-[#00FFC2]/20 pb-6">
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Mission_Protocol</h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <StatusTag label="HW" ok={store.hardwareReady} />
                <StatusTag label="CONTRACT" ok={missionStatus === 'approved'} />
                <StatusTag label="SAFE" ok={store.safetyValid} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6">
              
              {/* VRAI SYSTÈME DE DÉFINITION D'OBJECTIF */}
              <div className="bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-2xl space-y-4">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-[#00FFC2]" /> Contract_Definition
                </label>
                
                <InputBox label="Mission Objective / Rules" type="textarea" value={missionDesc} onChange={setMissionDesc} />
                
                <div className="grid grid-cols-2 gap-4">
                  <InputBox label="Minimum Viewers Required" type="number" value={minViewers} onChange={setMinViewers} />
                  <InputBox label="Requested Bounty ($)" type="number" value={requestedBounty} onChange={setRequestedBounty} />
                </div>

                <button 
                  onClick={submitMissionProposal}
                  disabled={missionStatus === 'pending' || missionStatus === 'approved'}
                  className={`w-full py-4 font-black text-[10px] uppercase rounded-xl transition-all ${
                    missionStatus === 'approved' ? 'bg-[#00FFC2]/20 text-[#00FFC2] border border-[#00FFC2] cursor-not-allowed' :
                    missionStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500 cursor-not-allowed' :
                    'bg-[#00FFC2] text-black hover:scale-[1.02]'
                  }`}>
                  {missionStatus === 'approved' ? 'CONTRACT APPROVED' : missionStatus === 'pending' ? 'AWAITING COMMAND RESPONSE...' : 'SUBMIT_PROPOSAL'}
                </button>
              </div>

              <div className={`p-6 md:p-8 rounded-2xl border ${store.safetyValid ? 'border-[#00FFC2]/30 bg-[#00FFC2]/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Safety_Waiver</span>
                  </div>
                  {!store.safetyValid ? (
                    <button onClick={() => setShowWaiver(true)} className="px-4 py-2 bg-red-600 text-[10px] font-black uppercase rounded-md shadow-lg shadow-red-600/20 hover:bg-red-500 transition-all">Sign</button>
                  ) : <CheckCircle2 size={24} className="text-[#00FFC2]" />}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 space-y-4">
              {/* MESSAGERIE REMPLACE EST_PAYOUT */}
              <div className="bg-black border border-white/10 p-6 rounded-2xl h-64 flex flex-col">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                   <Mail size={16} className="text-gray-500" />
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Command_Messages</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-2">
                   {inboxMessages.map(msg => (
                     <div key={msg.id} className={`p-3 rounded-lg border text-xs leading-relaxed ${
                       msg.type === 'success' ? 'bg-[#00FFC2]/10 border-[#00FFC2]/30 text-[#00FFC2]' :
                       msg.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                       msg.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                       'bg-white/5 border-white/10 text-gray-300'
                     }`}>
                       {msg.text}
                     </div>
                   ))}
                </div>
              </div>

              <button 
                onClick={handleDeploy}
                disabled={!store.isSystemReady() || missionStatus !== 'approved' || deploying}
                className={`w-full py-10 rounded-2xl font-black text-2xl uppercase italic tracking-widest transition-all ${
                  store.isSystemReady() && missionStatus === 'approved' ? 'bg-white text-black shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:scale-[1.02]' : 'bg-white/5 text-gray-800 cursor-not-allowed'
                }`}>
                {deploying ? `T-MINUS ${countdown}` : 'Deploy_Live'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* ONGLET SETTINGS                                */}
        {/* ============================================== */}
        {!isLive && activeTab === 'settings' && (
          <div className="flex flex-col h-full overflow-hidden w-full">
            <div className="px-4 pt-6 md:px-10 md:pt-10 flex-shrink-0">
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-6">System_Config</h2>
              <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/10 w-full">
                {subTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveSubTab(tab)}
                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-t-xl transition-all ${
                      activeSubTab === tab ? `bg-white/10 text-white border-b-2 border-[#00FFC2]` : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-10 max-w-4xl w-full">
              
              {/* 1. GENERAL */}
              {activeSubTab === 'General' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest">Operator Basics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputBox label="Operator Handle" value={store.settings.general.username} onChange={(v) => store.updateSettings('general', {username: v.toUpperCase()})} />
                    <InputBox label="Comms Email" value={store.settings.general.email} onChange={(v) => store.updateSettings('general', {email: v})} />
                  </div>
                  <InputBox label="Tactical Bio" type="textarea" value={store.settings.general.bio} onChange={(v) => store.updateSettings('general', {bio: v})} />
                </div>
              )}

              {/* 2. SECURITY */}
              {activeSubTab === 'Security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-[#00FFC2]/5 border border-[#00FFC2]/20 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={175} strokeDashoffset={175 - (175 * store.settings.security.securityScore) / 100} className="text-[#00FFC2]" />
                        </svg>
                        <span className="absolute text-[10px] font-black italic">{store.settings.security.securityScore}%</span>
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase text-white">System Security: {store.settings.security.securityScore}%</p>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Uplink is protected.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-white">Master Access Key</p>
                        <p className="text-[8px] text-yellow-500 uppercase font-bold mt-1">Vérification email requise pour modification</p>
                      </div>
                      <button onClick={handlePasswordReset} className="w-full md:w-auto px-6 py-3 border border-[#00FFC2]/50 text-[#00FFC2] rounded-lg text-[9px] font-black uppercase hover:bg-[#00FFC2] hover:text-black transition-all">
                        Send Reset Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BILLING */}
              {activeSubTab === 'Billing' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-black border border-white/10 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-2">Current Tier</p>
                      <h4 className="text-4xl font-black italic text-white">{store.settings.billing.plan}</h4>
                      <p className="text-[9px] text-[#00FFC2] uppercase mt-4">Next billing: {store.settings.billing.nextBilling}</p>
                    </div>
                    <Zap className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 -rotate-12 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-5 bg-zinc-900/40 rounded-xl border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4"><Wallet className="text-gray-500" size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Visa ending in {store.settings.billing.cardLast4}</span></div>
                    <button onClick={handleEditBilling} className="text-[9px] text-[#00FFC2] font-black uppercase underline hover:text-white">Edit</button>
                  </div>
                </div>
              )}

              {/* 4. NOTIFICATIONS */}
              {activeSubTab === 'Notifications' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <ToggleRow label="Push Alerts (Mobile/Web)" active={store.settings.notifications.push} onToggle={() => store.updateSettings('notifications', {push: !store.settings.notifications.push})} />
                  <ToggleRow label="Tactical Comms (Live Bounties)" active={store.settings.notifications.tacticalComms} onToggle={() => store.updateSettings('notifications', {tacticalComms: !store.settings.notifications.tacticalComms})} />
                </div>
              )}

              {/* 5. REFERRAL */}
              {activeSubTab === 'Referral' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-zinc-900/40 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-center md:text-left">
                      <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-1">Your Invite Code</p>
                      <p className="text-xl font-black text-white">{store.settings.referral.code}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`https://app.nordvantix.com/invite/${store.settings.referral.code}`, "Lien de parrainage copié !")} 
                      className="w-full md:w-auto px-6 py-3 bg-white/10 rounded-lg hover:bg-white hover:text-black transition-all font-black text-[10px] uppercase">
                      Copy Link
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-6 bg-black border border-white/5 rounded-2xl text-center"><p className="text-3xl font-black italic">{store.settings.referral.recruits}</p><p className="text-[9px] uppercase text-gray-500 font-bold">Operators Recruited</p></div>
                     <div className="p-6 bg-[#00FFC2]/5 border border-[#00FFC2]/20 rounded-2xl text-center"><p className="text-3xl font-black italic text-[#00FFC2]">${store.settings.referral.totalEarned}</p><p className="text-[9px] uppercase text-[#00FFC2]/50 font-bold">Bounty Earned</p></div>
                  </div>
                </div>
              )}

              {/* 6. SHARING */}
              {activeSubTab === 'Sharing' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <ToggleRow label="Public Operator Profile" active={store.settings.sharing.publicProfile} onToggle={() => store.updateSettings('sharing', {publicProfile: !store.settings.sharing.publicProfile})} />
                  <ToggleRow label="Anonymous Mode (Hide Identity)" active={store.settings.sharing.anonymousMode} onToggle={() => store.updateSettings('sharing', {anonymousMode: !store.settings.sharing.anonymousMode})} isDanger />
                </div>
              )}

              {/* SAVE BUTTON FOR SETTINGS */}
              <div className="pt-10 mt-10 border-t border-white/10">
                <button onClick={handleSaveSettings} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase tracking-[0.3em] italic rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(0,255,194,0.15)]">
                  Save_Global_Config
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ============================================== */}
        {/* LIVE VIEW (FULL SCREEN)                        */}
        {/* ============================================== */}
        {isLive && (
          <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
            <LiveKitRoom video audio token="DUMMY" serverUrl="DUMMY" connect className="h-full w-full relative">
              <div className="absolute inset-0 z-0 bg-zinc-900 flex items-center justify-center">
                 <p className="text-[#00FFC2] animate-pulse font-black uppercase text-xs tracking-[0.5em]">Transmitting_Neural_Link...</p>
              </div>
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between pointer-events-none z-10">
                <div className="flex justify-between items-start">
                   <div className="bg-red-600 px-3 py-1 text-[10px] font-black uppercase italic shadow-lg">Live_Ops</div>
                   <div className="text-right">
                      <div className="text-4xl md:text-6xl font-black italic text-[#00FFC2]">${requestedBounty}</div>
                      {store.settings.sharing.anonymousMode && <div className="text-[8px] bg-white text-black px-2 py-0.5 inline-block uppercase font-black mt-2">Stealth_Active</div>}
                   </div>
                </div>
                <button onClick={() => setIsLive(false)} className="pointer-events-auto self-center px-10 py-3 bg-black/60 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full tracking-widest backdrop-blur-md hover:bg-red-600 hover:text-white transition-colors">
                  Abort_Mission
                </button>
              </div>
            </LiveKitRoom>
          </div>
        )}
      </section>

      {/* ============================================== */}
      {/* WAIVER MODAL (MOBILE FIXED)                    */}
      {/* ============================================== */}
      {showWaiver && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-10 space-y-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start flex-shrink-0">
               <div className="flex items-center gap-3 text-red-500">
                  <AlertTriangle size={24} />
                  <h2 className="text-xl md:text-2xl font-black uppercase italic italic">Safety_Contract_v4.0</h2>
               </div>
               <button onClick={() => setShowWaiver(false)} className="p-2 text-gray-500 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="overflow-y-auto text-[10px] text-gray-400 space-y-4 pr-4 border-b border-white/5 pb-4 scrollbar-hide italic leading-relaxed">
              <p>1. L'Opérateur accepte les risques de blessures graves ou décès.</p>
              <p>2. NORD.VANTIX décline toute responsabilité. Signature obligatoire pour débloquer le LiveKit_Uplink.</p>
            </div>

            <div className="space-y-2 flex-shrink-0">
              <div className="flex justify-between items-center">
                <label className="text-[9px] font-black uppercase text-[#00FFC2] tracking-widest">Digital_Signature_Canvas</label>
                <button onClick={() => sigCanvas.current.clear()} className="text-[8px] text-red-500 font-black uppercase tracking-widest underline">Reset_Ink</button>
              </div>
              <div className="bg-white rounded-xl overflow-hidden h-40 md:h-48 cursor-crosshair touch-none border-4 border-[#00FFC2]/20 shadow-[0_0_30px_rgba(0,255,194,0.1)]">
                <SignatureCanvas 
                  ref={sigCanvas}
                  penColor='black'
                  backgroundColor='white'
                  canvasProps={{className: 'w-full h-full'}} 
                />
              </div>
            </div>

            <button onClick={signLegalWaiver} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase tracking-[0.2em] rounded-xl flex-shrink-0 hover:scale-[1.02] transition-all">
              Sign_&_Authorize_Uplink
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SOUS-COMPOSANTS UI ---

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-2 py-0.5 border text-[8px] font-black uppercase tracking-widest rounded-sm ${ok ? 'border-[#00FFC2] text-[#00FFC2]' : 'border-red-500/20 text-red-500/40'}`}>
      {label}: {ok ? 'OK' : 'ERR'}
    </div>
  );
}

function InputBox({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: "text" | "textarea" | "number" }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] transition-colors h-24 resize-none" />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-xs text-white outline-none focus:border-[#00FFC2] transition-colors" />
      )}
    </div>
  );
}

function ToggleRow({ label, active, onToggle, isDanger = false }: { label: string, active: boolean, onToggle: () => void, isDanger?: boolean }) {
  const activeColor = isDanger ? 'bg-red-500' : 'bg-[#00FFC2]';
  return (
    <div className="flex justify-between items-center p-4 md:p-5 bg-zinc-900/40 border border-white/5 rounded-2xl">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{label}</span>
      <button onClick={onToggle} className={`w-14 h-7 rounded-full transition-all relative p-1 ${active ? activeColor : 'bg-black border border-white/10'}`}>
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${active ? 'translate-x-7' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}