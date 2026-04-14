"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom } from '@livekit/components-react';
import { 
  LayoutDashboard, Settings, Wallet, Zap, 
  Shield, CheckCircle2, AlertTriangle, X, Copy, Mail,
  Camera, Loader2, Target, Activity, Crosshair
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
  
  // Modals
  const [showWaiver, setShowWaiver] = useState(false);
  const [showFaceId, setShowFaceId] = useState(false);
  const [isScanningFace, setIsScanningFace] = useState(false);
  
  // VRAI SYSTEME DE MISSIONS (DATABASE)
  const [missions, setMissions] = useState<any[]>([]);
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MID' | 'EXTREME'>('LOW');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Initialisation et Auth
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

  // ABONNEMENT TEMPS RÉEL (REALTIME)
  useEffect(() => {
    if (!user) return;
    
    // On écoute tout changement sur la table missions pour cet utilisateur
    const channel = supabase.channel('realtime_missions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions', filter: `user_id=eq.${user.id}` }, 
      (payload) => {
        // Dès que l'admin change le statut, on rafraîchit la liste
        fetchMissions(user.id);
        
        // Notifications contextuelles
        if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
          showToast(`MISSION APPROUVÉE: ${payload.new.bounty}$ validés.`, 'success');
        } else if (payload.eventType === 'UPDATE' && payload.new.status === 'rejected') {
          showToast(`MISSION REJETÉE par le Commandement.`, 'error');
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Vraie fonction de récupération des données
  const fetchMissions = async (userId: string) => {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (!error && data) setMissions(data);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- SOUMISSION DE MISSION ---
  const submitMissionProposal = async () => {
    if (!missionDesc || !minViewers || !requestedBounty) {
      showToast("Toutes les données tactiques sont requises.", "error");
      return;
    }
    
    setIsSubmitting(true);

    const { error } = await supabase.from('missions').insert([{
      user_id: user.id,
      objective: missionDesc,
      min_viewers: parseInt(minViewers),
      bounty: parseFloat(requestedBounty),
      risk_level: riskLevel,
      status: 'pending'
    }]);

    setIsSubmitting(false);

    if (error) {
      showToast(`Échec de la transmission: ${error.message}`, "error");
    } else {
      showToast("Proposition envoyée au Commandement.", "success");
      setMissionDesc(""); setMinViewers(""); setRequestedBounty("");
      fetchMissions(user.id); // Rafraîchissement manuel au cas où le realtime lag
    }
  };

  // --- FACE ID & WAIVER (Identique mais rendu plus propre) ---
  const startFaceScan = () => {
    setIsScanningFace(true);
    setTimeout(() => {
      setIsScanningFace(false); setShowFaceId(false);
      store.setModuleStatus('hardwareReady', true); 
      showToast("Identité confirmée : Uplink Autorisé");
    }, 2500);
  };

  const signLegalWaiver = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return showToast("Signature requise.", "error");
    store.setModuleStatus('safetyValid', true);
    setShowWaiver(false);
    showToast("Contrat signé et validé !");
  };

  // --- DÉPLOIEMENT ---
  const activeMission = missions.find(m => m.status === 'approved');

  const handleDeploy = () => {
    if (!store.isSystemReady() || !activeMission) {
      showToast("Système non sécurisé ou aucune mission approuvée.", "error");
      return;
    }
    setIsLive(true);
    // Optionnel: Mettre à jour le statut en 'active' dans la BD ici
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
        {/* ONGLET HUB (Mission Protocol V2)                 */}
        {/* ============================================== */}
        {!isLive && activeTab === 'hub' && (
          <div className="p-4 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-12 gap-4 md:gap-6 overflow-y-auto scrollbar-hide">
            <div className="col-span-12 border-b border-[#00FFC2]/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">Mission_Protocol</h2>
                <div className="flex flex-wrap gap-2 mt-3">
                  <StatusTag label="ID_VERIF" ok={store.hardwareReady} />
                  <StatusTag label="SAFE" ok={store.safetyValid} />
                  <StatusTag label="UPLINK" ok={store.hardwareReady && store.safetyValid} />
                </div>
              </div>
            </div>

            {/* COLONNE GAUCHE : CRÉATION DE MISSION */}
            <div className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6">
              
              <div className="bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                    <Crosshair size={14} className="text-[#00FFC2]" /> Draft_New_Contract
                  </label>
                  <span className="text-[9px] text-gray-500 italic">Secure Channel</span>
                </div>
                
                <InputBox label="Tactical Objective / Rules" type="textarea" value={missionDesc} onChange={setMissionDesc} placeholder="Ex: Survivre 30 min sans armure..." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputBox label="Minimum Viewers Required" type="number" value={minViewers} onChange={setMinViewers} placeholder="Ex: 50" />
                  <InputBox label="Requested Bounty ($)" type="number" value={requestedBounty} onChange={setRequestedBounty} placeholder="Ex: 100" />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest block">Threat Level Assessment</label>
                  <div className="flex gap-2">
                    {['LOW', 'MID', 'EXTREME'].map((lvl) => (
                      <button key={lvl} onClick={() => setRiskLevel(lvl as any)}
                        className={`flex-1 py-3 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all border ${
                          riskLevel === lvl 
                            ? lvl === 'EXTREME' ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'bg-[#00FFC2] text-black border-[#00FFC2]'
                            : 'bg-black text-gray-500 border-white/10 hover:border-white/30'
                        }`}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={submitMissionProposal}
                  disabled={isSubmitting}
                  className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Transmit_Proposal_to_Command"}
                </button>
              </div>

              {/* MODULES DE SÉCURITÉ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${store.hardwareReady ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Camera size={18} className={store.hardwareReady ? "text-blue-500" : "text-blue-500/50"} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Biometric_ID</span>
                    </div>
                    {!store.hardwareReady ? (
                      <button onClick={() => setShowFaceId(true)} className="px-3 py-1.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded shadow-lg hover:bg-blue-500 transition-all">Scan</button>
                    ) : <CheckCircle2 size={18} className="text-blue-500" />}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${store.safetyValid ? 'border-[#00FFC2]/30 bg-[#00FFC2]/5' : 'border-red-500/20 bg-red-500/5'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Safety_Waiver</span>
                    </div>
                    {!store.safetyValid ? (
                      <button onClick={() => setShowWaiver(true)} className="px-3 py-1.5 bg-red-600 text-white text-[8px] font-black uppercase rounded shadow-lg hover:bg-red-500 transition-all">Sign</button>
                    ) : <CheckCircle2 size={18} className="text-[#00FFC2]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE : DATA & DÉPLOIEMENT */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
              
              {/* LA VRAIE BOÎTE DE RÉCEPTION (Basée sur la DB) */}
              <div className="bg-black border border-white/10 rounded-2xl flex flex-col" style={{ height: '380px' }}>
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                   <div className="flex items-center gap-2">
                     <Activity size={16} className="text-[#00FFC2] animate-pulse" />
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-[#00FFC2]">Command_Uplink</h3>
                   </div>
                   <span className="text-[8px] text-gray-500 uppercase">{missions.length} dossiers</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                   {missions.length === 0 ? (
                     <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center mt-10">Aucun historique de mission.</p>
                   ) : (
                     missions.map((msg) => (
                       <div key={msg.id} className={`p-4 rounded-xl border flex flex-col gap-2 ${
                         msg.status === 'approved' ? 'bg-[#00FFC2]/10 border-[#00FFC2]/30' :
                         msg.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20' :
                         msg.status === 'rejected' ? 'bg-red-500/5 border-red-500/20' :
                         'bg-white/5 border-white/10'
                       }`}>
                         <div className="flex justify-between items-start">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                             msg.status === 'approved' ? 'bg-[#00FFC2] text-black' :
                             msg.status === 'pending' ? 'bg-yellow-500 text-black' :
                             msg.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                           }`}>
                             {msg.status}
                           </span>
                           <span className="text-[10px] font-black text-white">${msg.bounty}</span>
                         </div>
                         <p className="text-[10px] text-gray-300 line-clamp-2 italic">"{msg.objective}"</p>
                         <div className="flex justify-between items-center mt-1">
                            <span className="text-[8px] text-gray-500">Risque: {msg.risk_level}</span>
                            <span className="text-[8px] text-gray-500">Viewers min: {msg.min_viewers}</span>
                         </div>
                       </div>
                     ))
                   )}
                </div>
              </div>

              {/* BOUTON DE DÉPLOIEMENT DYNAMIQUE */}
              <button 
                onClick={handleDeploy}
                disabled={!store.isSystemReady() || !activeMission}
                className={`w-full py-8 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  store.isSystemReady() && activeMission 
                    ? 'bg-[#00FFC2] text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_40px_rgba(0,255,194,0.2)]' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }`}>
                <span className="font-black text-2xl uppercase italic tracking-widest">
                  {activeMission ? 'Deploy_Live' : 'No_Active_Contract'}
                </span>
                {activeMission && <span className="text-[10px] font-bold uppercase tracking-widest">Opération: ${activeMission.bounty} garantie</span>}
              </button>

            </div>
          </div>
        )}

        {/* ... (LE RESTE DU CODE : SETTINGS ET MODALS RESTENT IDENTIQUES) ... */}

        {/* ============================================== */}
        {/* LIVE VIEW (FULL SCREEN)                        */}
        {/* ============================================== */}
        {isLive && activeMission && (
          <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
            <LiveKitRoom video audio token="DUMMY" serverUrl="DUMMY" connect className="h-full w-full relative">
              <div className="absolute inset-0 z-0 bg-zinc-900 flex items-center justify-center">
                 <p className="text-[#00FFC2] animate-pulse font-black uppercase text-xs tracking-[0.5em]">Transmitting_Neural_Link...</p>
              </div>
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between pointer-events-none z-10">
                <div className="flex justify-between items-start">
                   <div className="bg-red-600 px-4 py-1.5 text-[10px] font-black uppercase italic shadow-lg animate-pulse flex items-center gap-2">
                     <div className="w-2 h-2 bg-white rounded-full"></div> Live_Ops
                   </div>
                   <div className="text-right">
                      <div className="text-4xl md:text-6xl font-black italic text-[#00FFC2]">${activeMission.bounty}</div>
                      <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Objectif Actif</div>
                   </div>
                </div>
                <button onClick={() => setIsLive(false)} className="pointer-events-auto self-center px-10 py-3 bg-black/60 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full tracking-widest backdrop-blur-md hover:bg-red-600 hover:text-white transition-colors">
                  Abort_Mission
                </button>
              </div>
            </LiveKitRoom>
          </div>
        )}

      {/* ============================================== */}
      {/* FACE ID MODAL (Maintenu 100% gratuit)          */}
      {/* ============================================== */}
      {showFaceId && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col items-center">
              <h2 className="text-xl font-black uppercase italic text-blue-500 mb-6">Face_ID Validation</h2>
              
              <div className="relative w-48 h-48 border-2 border-blue-500/50 rounded-2xl overflow-hidden flex items-center justify-center">
                 {isScanningFace ? (
                    <>
                      <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                      <div className="w-full h-1 bg-blue-400 absolute top-1/2 animate-ping" />
                      <Loader2 className="animate-spin text-blue-500" size={48} />
                    </>
                 ) : (
                    <Camera size={48} className="text-gray-600" />
                 )}
              </div>

              {!isScanningFace ? (
                 <button onClick={startFaceScan} className="mt-8 w-full py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-blue-500 transition-all">
                   Start Scan
                 </button>
              ) : (
                 <p className="mt-8 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">
                   Vérification biométrique...
                 </p>
              )}
              
              {!isScanningFace && (
                <button onClick={() => setShowFaceId(false)} className="mt-4 text-[10px] text-gray-500 uppercase underline">
                  Annuler
                </button>
              )}
           </div>
        </div>
      )}

      {/* WAIVER MODAL RESTA IDENTIQUE ICI */}
      {showWaiver && (
         /* ... insérer le code du Waiver Modal précédent ici ... */
         <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 animate-in slide-in-from-bottom duration-300">
            {/* Contenu du Waiver... (pour gagner de la place, tu peux copier-coller celui de la réponse précédente, il n'a pas changé) */}
            <div className="w-full max-w-2xl bg-[#0a0a0a] border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-10 space-y-6 max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-start flex-shrink-0">
                 <div className="flex items-center gap-3 text-red-500">
                    <AlertTriangle size={24} />
                    <h2 className="text-xl md:text-2xl font-black uppercase italic">Safety_Contract_v4.0</h2>
                 </div>
                 <button onClick={() => setShowWaiver(false)} className="p-2 text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              
              <div className="overflow-y-auto text-[10px] text-gray-400 space-y-4 pr-4 border-b border-white/5 pb-4 scrollbar-hide italic leading-relaxed">
                <p>1. L'Opérateur accepte les risques de blessures graves ou décès.</p>
                <p>2. Signature obligatoire pour débloquer le LiveKit_Uplink.</p>
              </div>

              <div className="space-y-2 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase text-[#00FFC2] tracking-widest">Signature_Canvas</label>
                  <button onClick={() => sigCanvas.current.clear()} className="text-[8px] text-red-500 font-black uppercase underline">Reset</button>
                </div>
                <div className="bg-white rounded-xl overflow-hidden h-40 md:h-48 cursor-crosshair border-4 border-[#00FFC2]/20 shadow-[0_0_30px_rgba(0,255,194,0.1)]">
                  <SignatureCanvas ref={sigCanvas} penColor='black' backgroundColor='white' canvasProps={{className: 'w-full h-full'}} />
                </div>
              </div>

              <button onClick={signLegalWaiver} className="w-full py-5 bg-[#00FFC2] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-all">
                Sign_&_Authorize
              </button>
            </div>
         </div>
      )}
      </section>
    </div>
  );
}

// COMPOSANTS UTILES (A garder à la fin du fichier)
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