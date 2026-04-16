"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import { 
  Zap, Shield, Activity, Target, Cpu, BarChart3, Fingerprint, 
  Crosshair, FileText, CheckCircle2, XCircle, Clock, Send, Globe, Loader2
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [activeCenterTab, setActiveCenterTab] = useState<'stats' | 'requests'>('requests');
  const [selectedMission, setSelectedMission] = useState<any>(null);

  const [isLive, setIsLive] = useState(false);
  const [liveToken, setLiveToken] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. SYSTÈME DE NETTOYAGE ---
  useEffect(() => {
    return () => {
      if ((isLive || deploying) && selectedMission) {
        // En cas de sortie de page, on remet en 'approved' pour ne pas bloquer
        supabase.from('missions').update({ status: 'approved' }).eq('id', selectedMission.id).then();
      }
    };
  }, [isLive, deploying, selectedMission]);

  // --- 2. AUTH & FETCH ---
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
    if (data) {
        setMissions(data);
        if (data.length > 0 && !selectedMission) setSelectedMission(data[0]);
    }
  };

  // --- 3. DÉPLOIEMENT DU SIGNAL (CORRIGÉ) ---
  const handleDeploy = async () => {
    // SÉCURITÉ : On vérifie qu'on a bien une mission et un ID
    if (!selectedMission?.id) {
      console.error("❌ [OP] Erreur: Aucune mission sélectionnée.");
      return;
    }
    
    console.log("📡 [OP] Tentative d'activation pour la mission:", selectedMission.id);
    setDeploying(true);

    try {
      // ÉTAPE A : Signal à Supabase (L'ACTION QUI BLOQUAIT)
      const { error: supabaseError } = await supabase
        .from('missions')
        .update({ status: 'active' }) // On passe en mode actif
        .eq('id', selectedMission.id);

      if (supabaseError) {
        console.error("❌ [OP] Erreur Supabase (RLS ?) :", supabaseError.message);
        throw supabaseError;
      }

      console.log("✅ [OP] Statut BDD mis à jour avec succès.");

      // ÉTAPE B : Génération du token (RoomName synchronisé avec le Watcher)
      const roomName = `mission_${selectedMission.id}`;
      const resp = await fetch(`/api/get-participant-token?room=${roomName}&username=OP_${user.id.substring(0,4)}`);
      const data = await resp.json();
      
      if (!data.token) throw new Error("Token failure");
      setLiveToken(data.token);

      // ÉTAPE C : Séquence de lancement
      let timer = 3; setCountdown(timer);
      const interval = setInterval(() => {
        timer--; setCountdown(timer);
        if (timer === 0) { 
          clearInterval(interval); 
          setIsLive(true); 
          setDeploying(false); 
          console.log("🎬 [OP] SIGNAL OPÉRATIONNEL");
        }
      }, 1000);

    } catch (e) { 
      console.error("❌ [OP] ÉCHEC TOTAL DU DÉPLOIEMENT:", e);
      setDeploying(false); 
      // On tente de reset le statut en cas d'échec
      await supabase.from('missions').update({ status: 'approved' }).eq('id', selectedMission.id);
    }
  };

  const abortMission = async () => { 
    setIsLive(false); 
    setLiveToken(""); 
    if (selectedMission) {
      await supabase.from('missions').update({ status: 'completed' }).eq('id', selectedMission.id);
      fetchMissions(user.id);
    }
  };

  const getMissionsByStatus = (status: string) => missions.filter(m => m.status === status);

  if (!user) return null;

  return (
    <div className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
      {/* SCANLINES OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* LIVE VIEW */}
      {isLive && liveToken && (
        <div className="fixed inset-0 z-[100] bg-black">
          <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full">
            <VideoConference />
            <RoomAudioRenderer />
            <div className="absolute top-10 inset-x-0 flex flex-col items-center z-20">
              <div className="px-10 py-2 bg-red-600/20 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full animate-pulse mb-4 tracking-widest">Signal_Live</div>
              <button onClick={abortMission} className="px-8 py-3 bg-black border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full hover:bg-red-600 hover:text-white transition-all">Terminate_Link</button>
            </div>
          </LiveKitRoom>
        </div>
      )}

      {/* HEADER */}
      <header className="h-16 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-[#00FFC2] animate-pulse" />
            <span className="font-black tracking-[0.3em] text-sm italic">PULSE_HUB</span>
          </div>
          <nav className="flex items-center gap-2">
            <TabButton active={activeCenterTab === 'stats'} onClick={() => setActiveCenterTab('stats')} icon={<BarChart3 size={14} />} label="DASHBOARD" />
            <TabButton active={activeCenterTab === 'requests'} onClick={() => setActiveCenterTab('requests')} icon={<FileText size={14} />} label="CONTRACTS" />
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-[#00FFC2] uppercase tracking-widest">{user?.email?.split('@')[0]}</p>
              <p className="text-[7px] text-gray-500 uppercase">Operator_Verified</p>
           </div>
           <div className="w-10 h-10 rounded-full border border-[#00FFC2]/30 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="pfp" />
           </div>
        </div>
      </header>

      {/* GRID LAYOUT */}
      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
        {/* LISTE DES MISSIONS */}
        <aside className="col-span-3 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
                <Target size={14} className="text-[#00FFC2]" />
                <span className="text-[10px] font-black uppercase">Active_Missions</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                <MissionCategory label="Approved" items={getMissionsByStatus('approved').concat(getMissionsByStatus('active'))} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#00FFC2" icon={<CheckCircle2 size={10}/>} />
                <MissionCategory label="Waiting" items={getMissionsByStatus('pending')} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#60A5FA" icon={<Clock size={10}/>} />
            </div>
        </aside>

        {/* ZONE CENTRALE */}
        <main className="col-span-6 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            {activeCenterTab === 'requests' ? (
                <div className="p-8 flex flex-col gap-6">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4">Draft_New_Contract</h2>
                    <div className="space-y-4">
                        <textarea value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-sm text-[#00FFC2] h-32 outline-none focus:border-[#00FFC2]" placeholder="Describe your mission objectives..." />
                        <div className="grid grid-cols-2 gap-4">
                            <InputSmall label="Min Viewers" value={minViewers} onChange={setMinViewers} />
                            <InputSmall label="Bounty ($)" value={requestedBounty} onChange={setRequestedBounty} />
                        </div>
                        <div className="p-4 border border-white/5 bg-white/[0.01] space-y-4">
                            <div className="h-32 bg-white rounded-sm overflow-hidden">
                                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-full'}} />
                            </div>
                            <button onClick={() => store.setModuleStatus('safetyValid', true)} className={`w-full py-2 text-[8px] font-black uppercase tracking-widest ${store.safetyValid ? 'bg-[#00FFC2] text-black' : 'bg-white/5 text-gray-500'}`}>
                                {store.safetyValid ? "IDENTITY_CONFIRMED" : "Sign_to_Validate"}
                            </button>
                        </div>
                        <button onClick={async () => {
                            if (!missionDesc || !minViewers || !requestedBounty || !store.safetyValid) return;
                            setIsSubmitting(true);
                            await supabase.from('missions').insert([{ user_id: user.id, objective: missionDesc, min_viewers: parseInt(minViewers), bounty: parseFloat(requestedBounty), status: 'pending' }]);
                            setMissionDesc(""); setMinViewers(""); setRequestedBounty("");
                            fetchMissions(user.id);
                            setActiveCenterTab('stats');
                            setIsSubmitting(false);
                        }} disabled={!store.safetyValid || isSubmitting} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-[#00FFC2] transition-all">Submit_Proposal</button>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col gap-8 text-[#00FFC2]">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4">Operator_Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatsBox label="Live_Success" value="94.2%" icon={<Zap size={18}/>} />
                        <StatsBox label="Uptime" value="100%" icon={<Globe size={18}/>} />
                    </div>
                </div>
            )}
        </main>

        {/* ACTIONS & DEPLOY */}
        <aside className="col-span-3 flex flex-col gap-2">
            <div className="flex-1 border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2 uppercase text-[10px] font-black tracking-widest">
                    <Target size={14} /> Selected_Target
                </div>
                {selectedMission ? (
                    <div className="space-y-4">
                        <p className="text-[10px] leading-relaxed text-gray-300 font-bold italic bg-white/[0.02] p-3 border border-white/5">"{selectedMission.objective}"</p>
                        <div className="grid grid-cols-2 gap-2">
                            <MiniMetric label="STATUS" value={selectedMission.status} color={selectedMission.status === 'active' ? '#00FFC2' : '#60A5FA'} />
                            <MiniMetric label="BOUNTY" value={`$${selectedMission.bounty}`} />
                        </div>
                    </div>
                ) : <p className="text-xs text-gray-600 italic">Waiting for target selection...</p>}
            </div>

            <button 
                onClick={handleDeploy}
                disabled={!selectedMission || (selectedMission.status !== 'approved' && selectedMission.status !== 'active') || deploying}
                className={`h-40 border-2 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                    (selectedMission?.status === 'approved' || selectedMission?.status === 'active') 
                    ? 'border-[#00FFC2] bg-[#00FFC2] text-black shadow-[0_0_30px_rgba(0,255,194,0.2)]' 
                    : 'border-white/5 bg-white/[0.01] text-white/10'
                }`}
            >
                {deploying ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <span className="text-4xl font-black">{countdown}</span>
                        <span className="text-[8px] font-bold uppercase">Uplink_Sync...</span>
                    </div>
                ) : (
                    <>
                        <Zap size={32} className={(selectedMission?.status === 'approved' || selectedMission?.status === 'active') ? "animate-bounce" : ""} />
                        <span className="text-2xl font-black italic uppercase tracking-tighter">Initialize_Live</span>
                    </>
                )}
            </button>
        </aside>
      </div>
    </div>
  );
}

// HELPERS (Aucun changement ici)
function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${active ? 'bg-[#00FFC2] text-black font-black' : 'text-gray-500 hover:text-white font-bold'}`}>
            {icon} <span className="text-[9px] uppercase tracking-widest">{label}</span>
        </button>
    );
}

function StatsBox({ label, value, icon }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between">
            <div className="flex flex-col gap-1">
                <span className="text-[8px] text-gray-500 uppercase font-black">{label}</span>
                <span className="text-xl font-black italic">{value}</span>
            </div>
            <div className="text-[#00FFC2] opacity-40">{icon}</div>
        </div>
    );
}

function MissionCategory({ label, items, onSelect, activeId, color, icon }: any) {
    return (
        <div className="space-y-2 mt-2">
            <h4 className="text-[8px] font-black uppercase text-gray-600 flex items-center gap-2 px-2">{icon} {label}</h4>
            <div className="space-y-1">
                {items.map((m: any) => (
                    <button key={m.id} onClick={() => onSelect(m)} className={`w-full text-left p-3 border transition-all flex items-center justify-between ${activeId === m.id ? 'bg-white/10 border-white/20' : 'border-transparent hover:bg-white/[0.02]'}`}>
                        <span className={`text-[10px] font-bold uppercase truncate max-w-[150px] ${activeId === m.id ? 'text-white' : 'text-gray-500'}`}>{m.objective}</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function MiniMetric({ label, value, color }: any) {
    return (
        <div className="bg-black/40 border border-white/5 p-2 flex-1">
            <span className="text-[7px] text-gray-600 uppercase block mb-1">{label}</span>
            <span className="text-[10px] font-black italic uppercase" style={{ color: color || 'white' }}>{value}</span>
        </div>
    );
}

function InputSmall({ label, value, onChange }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-600 uppercase px-1">{label}</label>
            <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2]" />
        </div>
    );
}