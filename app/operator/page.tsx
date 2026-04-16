"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import { 
  Zap, Shield, CheckCircle2, AlertTriangle, Activity, Loader2, RefreshCw 
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showWaiver, setShowWaiver] = useState(false);
  
  const [missions, setMissions] = useState<any[]>([]);
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [liveToken, setLiveToken] = useState("");
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

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
    else { 
      showToast("Contrat transmis", "success"); 
      setMissionDesc(""); setMinViewers(""); setRequestedBounty("");
      fetchMissions(user.id); 
    }
  };

  const signLegalWaiver = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return showToast("Signature requise", "error");
    const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    await supabase.from('operator_waivers').insert([{ user_id: user.id, signature_data: signatureData }]);
    store.setModuleStatus('safetyValid', true);
    setShowWaiver(false);
    showToast("Contrat signé et archivé");
  };

  const activeMission = missions.find(m => m.status === 'approved' || m.status === 'active');

  const handleDeploy = async () => {
    if (!store.safetyValid || !activeMission) return showToast("Sécurité ou Mission non valide", "error");
    setDeploying(true);
    try {
      const resp = await fetch(`/api/get-participant-token?room=room-${user.id}&username=OPERATOR-${user.id.substring(0,5)}`);
      const data = await resp.json();
      if (!data.token) throw new Error("Accès refusé");
      
      setLiveToken(data.token);
      await supabase.from('missions').update({ status: 'active' }).eq('id', activeMission.id);
      
      let timer = 3; setCountdown(timer);
      const interval = setInterval(() => {
        timer--; setCountdown(timer);
        if (timer === 0) { 
          clearInterval(interval); 
          setIsLive(true); 
          setDeploying(false); 
        }
      }, 1000);
    } catch (e) { 
      setDeploying(false); 
      showToast("Erreur Uplink Réseau", "error"); 
    }
  };

  const abortMission = async () => { 
    setIsLive(false); 
    setLiveToken(""); 
    if (activeMission) {
      await supabase.from('missions').update({ status: 'completed' }).eq('id', activeMission.id);
      showToast("Mission terminée. Signal coupé.", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#050505] font-mono text-white relative">
      {store.settings.hud?.crtEffect && <div className="crt-overlay pointer-events-none z-50 opacity-5" />}
      
      {/* Toasts de notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[300] px-6 py-3 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-widest animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl ${toast.type === 'success' ? 'bg-[#00FFC2]/20 border border-[#00FFC2] text-[#00FFC2]' : 'bg-red-500/20 border border-red-500 text-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {toast.message}
        </div>
      )}

      <section className="flex-1 relative flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_50%,_#111_0%,_#050505_100%)]">
        
        {!isLive && (
          <div className="h-full overflow-y-auto p-6 lg:p-12 max-w-[1400px] mx-auto w-full grid grid-cols-12 gap-6 scrollbar-hide animate-in fade-in duration-500">
            
            {/* Header de Mission */}
            <div className="col-span-12 border-b border-white/10 pb-6 mb-4 flex justify-between items-end">
              <div>
                <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Mission_Control</h2>
                <div className="flex flex-wrap gap-3 mt-4">
                  <StatusTag label="UPLINK" ok={!!liveToken || isLive} />
                  <StatusTag label="CONTRACT" ok={!!activeMission} />
                  <StatusTag label="AUTH_SIGN" ok={store.safetyValid} />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <Activity size={16} className="text-[#00FFC2] animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase">Pulse_OS_v4.2 // Operational</span>
              </div>
            </div>

            {/* Formulaire de Mission */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl space-y-6 backdrop-blur-sm shadow-2xl">
                <InputBox label="Tactical Objective" type="textarea" value={missionDesc} onChange={setMissionDesc} placeholder="Détaillez votre objectif opérationnel ici..." />
                <div className="grid grid-cols-2 gap-6">
                  <InputBox label="Min Viewers" type="number" value={minViewers} onChange={setMinViewers} />
                  <InputBox label="Requested Bounty ($)" type="number" value={requestedBounty} onChange={setRequestedBounty} />
                </div>
                <button onClick={submitMissionProposal} disabled={isSubmitting} className="w-full py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Transmit_Proposal_to_Command"}
                </button>
              </div>

              {/* Safety Waiver Section */}
              <div className={`p-8 rounded-3xl border transition-all duration-500 ${store.safetyValid ? 'border-[#00FFC2]/30 bg-[#00FFC2]/5 shadow-[0_0_30px_rgba(0,255,194,0.05)]' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-colors ${store.safetyValid ? 'bg-[#00FFC2]/20 text-[#00FFC2]' : 'bg-red-500/20 text-red-500'}`}>
                      <Shield size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest">Legal_Safety_Waiver</div>
                      <div className="text-[9px] text-gray-500 uppercase mt-1 leading-none">{store.safetyValid ? 'Neural_Signature: Verified // Uplink: Authorized' : 'Neural_Signature: Missing // Uplink: Locked'}</div>
                    </div>
                  </div>
                  {!store.safetyValid && <button onClick={() => setShowWaiver(true)} className="px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 active:scale-95">Sign_Waiver</button>}
                </div>
              </div>
            </div>

            {/* Bouton de Déploiement Géant */}
            <div className="col-span-12 lg:col-span-5 h-full">
              <button onClick={handleDeploy} disabled={!store.safetyValid || !activeMission || deploying} 
                className={`w-full h-full min-h-[400px] rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all group relative overflow-hidden border ${
                  (!store.safetyValid || !activeMission) ? 'bg-white/5 border-white/5 text-gray-700 grayscale cursor-not-allowed' : 'bg-[#00FFC2] border-[#00FFC2] text-black shadow-[0_0_60px_rgba(0,255,194,0.15)] hover:scale-[1.01] active:scale-[0.98]'
                }`}>
                
                {deploying ? (
                  <div className="text-center animate-in zoom-in duration-300">
                    <div className="text-4xl font-black italic mb-2 tracking-tighter uppercase">Initializing...</div>
                    <div className="text-9xl font-black tabular-nums">{countdown}</div>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
                    <Zap size={80} className="relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform" />
                    <span className="text-4xl font-black italic tracking-tighter relative z-10 uppercase">Deploy_Live_Link</span>
                    {activeMission ? (
                      <div className="px-6 py-2 bg-black text-[#00FFC2] rounded-full text-[10px] font-black uppercase relative z-10 border border-[#00FFC2]/30">
                        Contract_Ready: ${activeMission.bounty}
                      </div>
                    ) : (
                      <div className="text-[10px] font-black uppercase opacity-40">No_Active_Mission_Found</div>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Vue Livekit (Quand on est en live) */}
        {isLive && liveToken && (
          <div className="fixed inset-0 z-[100] bg-black">
            <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full">
              <VideoConference />
              <RoomAudioRenderer />
              <div className="absolute top-10 inset-x-0 flex flex-col items-center pointer-events-none z-20">
                <div className="px-10 py-3 bg-red-600/20 border border-red-500 backdrop-blur-md text-red-500 font-black uppercase text-[10px] tracking-[0.3em] rounded-full animate-pulse mb-4">Signal_Operational_Sector</div>
                <button onClick={abortMission} className="pointer-events-auto px-10 py-3 bg-black/80 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full tracking-widest backdrop-blur-md hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95">Disconnect_Signal</button>
              </div>
            </LiveKitRoom>
          </div>
        )}

        {/* Modal de signature */}
        {showWaiver && (
          <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl">
            <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-12 space-y-8 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 text-red-500 font-black uppercase italic text-3xl tracking-tighter">
                <AlertTriangle size={32} /> Safety_Waiver_v4.2
              </div>
              <p className="text-gray-500 text-[10px] leading-relaxed uppercase tracking-wide">
                En apposant votre signature électronique, vous reconnaissez que NORD.VANTIX ne peut être tenu responsable de toute défaillance neurologique, perte de données biométriques ou interruption de signal en zone hostile.
              </p>
              <div className="bg-white rounded-2xl h-64 overflow-hidden shadow-inner">
                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-full'}} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowWaiver(false)} className="py-5 bg-white/5 text-gray-500 font-black uppercase text-[10px] rounded-2xl hover:bg-white/10 transition-all">Cancel_Op</button>
                <button onClick={signLegalWaiver} className="py-5 bg-[#00FFC2] text-black font-black uppercase text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#00FFC2]/20">Authorize_Neural_Link</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 transition-all ${ok ? 'border-[#00FFC2]/50 text-[#00FFC2] bg-[#00FFC2]/5' : 'border-red-500/20 text-red-500/40 bg-red-500/5'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[#00FFC2] animate-pulse' : 'bg-red-500/20'}`} />
      {label}: {ok ? 'STABLE' : 'ERROR'}
    </div>
  );
}

function InputBox({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, type?: string, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] block ml-1">{label}</label>
      {type === "textarea" ? (
        <textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs text-white outline-none focus:border-[#00FFC2] transition-all h-32 resize-none placeholder-gray-800" />
      ) : (
        <input placeholder={placeholder} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-5 rounded-2xl text-xs text-white outline-none focus:border-[#00FFC2] transition-all placeholder-gray-800" />
      )}
    </div>
  );
}