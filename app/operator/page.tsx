"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Zap, Shield, CheckCircle2, AlertTriangle, Activity, Loader2, 
  Target, Cpu, Globe, BarChart3, Fingerprint, Crosshair, Map as MapIcon
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showWaiver, setShowWaiver] = useState(false);
  const [missions, setMissions] = useState<any[]>([]);
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleDeploy = async () => {
    if (!store.safetyValid || !activeMission) return showToast("Sécurité ou Mission non valide", "error");
    setDeploying(true);
    let timer = 3; setCountdown(timer);
    const interval = setInterval(() => {
      timer--; setCountdown(timer);
      if (timer === 0) { 
        clearInterval(interval); 
        setDeploying(false); 
        showToast("Uplink établi - Signal Live simulé");
      }
    }, 1000);
  };

  const activeMission = missions.find(m => m.status === 'approved' || m.status === 'active');

  if (!user) return null;

  return (
    <div className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2">
      {/* CRT OVERLAY EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* TOP BAR / HUD HEADER */}
      <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#00FFC2]">
            <Activity size={18} className="animate-pulse" />
            <span className="font-black tracking-[0.3em] text-sm italic">PULSE_COMMAND</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="text-[10px] text-gray-500 uppercase flex gap-4">
            <span>Secteur: <span className="text-white">PALVINICE_04</span></span>
            <span>Uplink: <span className="text-[#00FFC2]">STABLE</span></span>
          </div>
        </div>
        <div className="flex gap-6 items-center">
            <div className="flex flex-col items-end">
                <span className="text-[8px] text-gray-600 uppercase">Neural_Load</span>
                <div className="w-24 h-1 bg-white/5 mt-1 overflow-hidden">
                    <div className="h-full bg-[#00FFC2] w-[42%] shadow-[0_0_8px_#00FFC2]" />
                </div>
            </div>
            <Fingerprint size={20} className="text-white/20" />
        </div>
      </div>

      {/* MAIN GRID HUB */}
      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
        
        {/* COL 1: INTELLIGENCE & STATS (LEFT) */}
        <div className="col-span-3 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 border border-white/10 bg-white/[0.01] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2">
              <BarChart3 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Tactical_Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Success" val="94.2%" />
              <StatCard label="Threat" val="LOW" />
              <StatCard label="Sync" val="0.04ms" />
              <StatCard label="Bounty" val="$14.2k" />
            </div>
            <div className="flex-1 border border-white/5 mt-4 relative overflow-hidden bg-black">
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
               {/* Mock Mini Map Visual */}
               <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <Crosshair size={100} strokeWidth={0.5} className="text-[#00FFC2]" />
               </div>
               <div className="absolute bottom-2 left-2 text-[8px] text-[#00FFC2] font-black">GRID_COORD: 42.11 / -09.4</div>
            </div>
          </div>
          <div className="h-1/3 border border-white/10 bg-white/[0.01] p-4">
             <span className="text-[9px] text-gray-500 uppercase block mb-2">Recent_Logs</span>
             <div className="space-y-2 text-[8px] uppercase">
                {missions.slice(0, 3).map((m, i) => (
                    <div key={i} className="flex justify-between border-l-2 border-[#00FFC2] pl-2 py-1 bg-white/[0.02]">
                        <span className="text-white/60">Op_{m.id.substring(0,4)}</span>
                        <span className="text-[#00FFC2]">{m.status}</span>
                    </div>
                ))}
             </div>
          </div>
        </div>

        {/* COL 2: STRATEGIC OBJECTIVE (CENTER) */}
        <div className="col-span-6 flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 border border-white/10 bg-white/[0.01] flex flex-col p-6 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target size={120} />
            </div>
            
            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                <Crosshair className="text-[#00FFC2]" /> 
                Objective_Interface
            </h2>

            <div className="space-y-6 relative z-10">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#00FFC2] tracking-[0.3em] uppercase">Tactical_Objective</label>
                    <textarea 
                        value={missionDesc}
                        onChange={(e) => setMissionDesc(e.target.value)}
                        placeholder="DEFINE TARGET AND MISSION PARAMETERS..."
                        className="w-full bg-black/50 border border-white/10 p-4 rounded-sm text-xs focus:border-[#00FFC2] outline-none h-40 resize-none transition-all placeholder:text-white/5 font-bold"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Min_Viewers</label>
                        <input 
                            type="number"
                            value={minViewers}
                            onChange={(e) => setMinViewers(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-4 text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bounty_Request ($)</label>
                        <input 
                            type="number"
                            value={requestedBounty}
                            onChange={(e) => setRequestedBounty(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 p-4 text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2]"
                        />
                    </div>
                </div>

                <button 
                    onClick={submitMissionProposal}
                    disabled={isSubmitting}
                    className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.4em] hover:bg-[#00FFC2] transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <>TRANSMIT_TO_OVERSEER <Zap size={16}/></>}
                </button>
            </div>
          </div>
          
          <div className="h-20 border border-white/10 bg-white/[0.01] flex items-center px-6 justify-between">
              <div className="flex gap-4">
                <StatusTag label="AUTH" ok={store.safetyValid} />
                <StatusTag label="MISSION" ok={!!activeMission} />
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-600 block uppercase">Signal_Freq</span>
                <span className="text-xs text-[#00FFC2] font-black uppercase italic">882.11 MHZ</span>
              </div>
          </div>
        </div>

        {/* COL 3: DEPLOYMENT & VERIFICATION (RIGHT) */}
        <div className="col-span-3 flex flex-col gap-2 overflow-hidden">
          <div className="h-1/2 border border-white/10 bg-white/[0.01] p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-red-500 border-b border-red-500/20 pb-2">
              <Shield size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Operator_Safety</span>
            </div>
            
            <p className="text-[9px] text-gray-500 uppercase leading-relaxed">
                Neural link authorization required. Confirm biometric handshake to unlock tactical deployment.
            </p>

            <button 
                onClick={() => setShowWaiver(true)}
                disabled={store.safetyValid}
                className={`w-full py-4 border font-black uppercase text-[10px] tracking-widest transition-all ${
                    store.safetyValid 
                    ? 'border-[#00FFC2]/20 text-[#00FFC2]/40 cursor-default' 
                    : 'border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                }`}
            >
                {store.safetyValid ? "IDENTITY_VERIFIED" : "VERIFY_IDENTITY"}
            </button>
          </div>

          <button 
            onClick={handleDeploy}
            disabled={!store.safetyValid || !activeMission || deploying}
            className={`flex-1 flex flex-col items-center justify-center gap-4 group transition-all relative overflow-hidden border ${
                (!store.safetyValid || !activeMission) 
                ? 'bg-white/5 border-white/10 grayscale text-gray-600' 
                : 'bg-[#00FFC2] text-black border-[#00FFC2] shadow-[0_0_30px_rgba(0,255,194,0.1)] active:scale-95'
            }`}
          >
            {deploying ? (
                <div className="flex flex-col items-center animate-pulse">
                    <span className="text-5xl font-black italic">{countdown}</span>
                    <span className="text-[10px] font-bold uppercase mt-2">Initializing Uplink...</span>
                </div>
            ) : (
                <>
                    <Zap size={48} className="group-hover:scale-110 transition-transform" />
                    <span className="text-2xl font-black italic uppercase tracking-tighter">Deploy_Link</span>
                    {activeMission && <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Contract_${activeMission.bounty}</span>}
                </>
            )}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </div>
      </div>

      {/* MODAL WAIVER (HANDSHAKE) */}
      {showWaiver && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="w-full max-w-xl border border-white/10 bg-[#0a0a0a] p-10 flex flex-col gap-6 animate-in zoom-in duration-300">
                <div className="flex items-center gap-3 text-red-500">
                    <Fingerprint size={32} />
                    <h3 className="text-2xl font-black uppercase italic italic tracking-tighter">Biometric_Handshake</h3>
                </div>
                <div className="bg-white rounded-sm h-60 overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]">
                    <SignatureCanvas 
                        ref={sigCanvas} 
                        penColor='black' 
                        canvasProps={{className: 'w-full h-full'}} 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowWaiver(false)} className="py-4 border border-white/10 text-gray-500 font-black uppercase text-[10px]">Abort</button>
                    <button 
                        onClick={async () => {
                            if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;
                            const sig = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
                            await supabase.from('operator_waivers').insert([{ user_id: user.id, signature_data: sig }]);
                            store.setModuleStatus('safetyValid', true);
                            setShowWaiver(false);
                            showToast("Neural link established");
                        }} 
                        className="py-4 bg-[#00FFC2] text-black font-black uppercase text-[10px]"
                    >Confirm_Identity</button>
                </div>
            </div>
        </div>
      )}

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-3 z-[200] border font-black uppercase text-[10px] tracking-widest animate-in slide-in-from-bottom-10 ${
            toast.type === 'success' ? 'bg-[#00FFC2]/20 border-[#00FFC2] text-[#00FFC2]' : 'bg-red-500/20 border-red-500 text-red-500'
        }`}>
            {toast.message}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, val }: { label: string, val: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-2 flex flex-col items-center">
      <span className="text-[7px] text-gray-600 uppercase mb-1">{label}</span>
      <span className="text-xs font-black text-[#00FFC2] italic">{val}</span>
    </div>
  );
}

function StatusTag({ label, ok }: { label: string, ok: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 border text-[9px] font-black transition-all ${
        ok ? 'border-[#00FFC2]/40 text-[#00FFC2] bg-[#00FFC2]/5' : 'border-white/10 text-white/20'
    }`}>
      <div className={`w-1 h-1 rounded-full ${ok ? 'bg-[#00FFC2] animate-pulse' : 'bg-white/10'}`} />
      {label}
    </div>
  );
}