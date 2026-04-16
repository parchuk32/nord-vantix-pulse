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

  // États Techniques
  const [isLive, setIsLive] = useState(false);
  const [liveToken, setLiveToken] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Form States
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. SYSTÈME DE NETTOYAGE (ANTI-ZOMBIE / SESSION FANTÔME) --- 
  useEffect(() => {
    const endSessionOnLeave = async () => {
      // Si on quitte la page alors qu'un live ou un déploiement était en cours
      if ((isLive || deploying) && selectedMission) {
        await supabase.from('missions').update({ status: 'approved' }).eq('id', selectedMission.id);
      }
    };

    return () => {
      endSessionOnLeave(); // Nettoyage lors de la navigation interne
    };
  }, [isLive, deploying, selectedMission]);

  // Gestion de la fermeture brusque du navigateur [cite: 353, 357]
  useEffect(() => {
    const handleUnload = () => {
      if ((isLive || deploying) && selectedMission) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/missions?id=eq.${selectedMission.id}`;
        // navigator.sendBeacon est la seule méthode fiable pour envoyer des données à la fermeture de l'onglet
        navigator.sendBeacon(url, JSON.stringify({ status: 'approved' }));
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isLive, deploying, selectedMission]);

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

  // --- 2. LOGIQUE DE DÉPLOIEMENT CORRIGÉE --- [cite: 332, 345]
  const handleDeploy = async () => {
    // CORRECTION : On autorise si c'est approved OU active (pour relancer si bloqué) 
    if (!selectedMission || (selectedMission.status !== 'approved' && selectedMission.status !== 'active')) return;
    
    setDeploying(true);
    try {
      const resp = await fetch(`/api/get-participant-token?room=room-${user.id}&username=OPERATOR-${user.id.substring(0,5)}`);
      const data = await resp.json();
      if (!data.token) throw new Error("Accès refusé");
      
      setLiveToken(data.token);
      await supabase.from('missions').update({ status: 'active' }).eq('id', selectedMission.id);
      
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
      alert("Erreur Uplink Réseau"); 
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
      {/* HUD OVERLAY */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* LIVE VIEW MODE */}
      {isLive && liveToken && (
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500">
          <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full">
            <VideoConference />
            <RoomAudioRenderer />
            <div className="absolute top-10 inset-x-0 flex flex-col items-center pointer-events-none z-20">
              <div className="px-10 py-3 bg-red-600/20 border border-red-500 backdrop-blur-md text-red-500 font-black uppercase text-[10px] tracking-[0.3em] rounded-full animate-pulse mb-4">Signal_Operational</div>
              <button onClick={abortMission} className="pointer-events-auto px-10 py-3 bg-black/80 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full tracking-widest backdrop-blur-md hover:bg-red-600 hover:text-white transition-all shadow-2xl">Disconnect_Signal</button>
            </div>
          </LiveKitRoom>
        </div>
      )}

      {/* HEADER TABS [cite: 311, 315] */}
      <header className="h-16 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-[#00FFC2] animate-pulse" />
            <span className="font-black tracking-[0.3em] text-sm italic">PULSE_OPS</span>
          </div>
          <nav className="flex items-center gap-2 bg-black/40 p-1 border border-white/5 rounded-lg">
            <TabButton active={activeCenterTab === 'stats'} onClick={() => setActiveCenterTab('stats')} icon={<BarChart3 size={14} />} label="DASHBOARD_STATS" />
            <TabButton active={activeCenterTab === 'requests'} onClick={() => setActiveCenterTab('requests')} icon={<FileText size={14} />} label="NEW_REQUEST" />
          </nav>
        </div>
        <div className="w-10 h-10 rounded-full border border-[#00FFC2]/30 overflow-hidden shadow-[0_0_10px_rgba(0,255,194,0.1)]">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="pfp" />
        </div>
      </header>

      {/* MAIN COCKPIT GRID [cite: 288, 312] */}
      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
        
        {/* LEFT: DATABASE [cite: 317] */}
        <aside className="col-span-3 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
                <Target size={14} className="text-[#00FFC2]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mission_Database</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                <MissionCategory label="Active / Approved" items={getMissionsByStatus('approved').concat(getMissionsByStatus('active'))} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#00FFC2" icon={<CheckCircle2 size={10}/>} />
                <MissionCategory label="Pending_Review" items={getMissionsByStatus('pending')} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#60A5FA" icon={<Clock size={10}/>} />
            </div>
        </aside>

        {/* MIDDLE: INTERFACE DYNAMIQUE [cite: 313, 316] */}
        <main className="col-span-6 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            {activeCenterTab === 'requests' ? (
                <div className="p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4">Create_New_Contract</h2>
                    <div className="space-y-4">
                        <textarea value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-sm text-[#00FFC2] h-32 outline-none focus:border-[#00FFC2]" placeholder="Describe challenge..." />
                        <div className="grid grid-cols-2 gap-4">
                            <InputSmall label="Min_Viewers" value={minViewers} onChange={setMinViewers} />
                            <InputSmall label="Price ($)" value={requestedBounty} onChange={setRequestedBounty} />
                        </div>
                        <div className="p-4 border border-white/5 bg-white/[0.01] rounded-sm space-y-4">
                            <div className="h-32 bg-white rounded-sm overflow-hidden border border-white/10">
                                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-full'}} />
                            </div>
                            <button onClick={() => store.setModuleStatus('safetyValid', true)} className={`w-full py-2 text-[8px] font-black uppercase tracking-widest transition-all ${store.safetyValid ? 'bg-[#00FFC2] text-black' : 'bg-white/5 text-gray-500'}`}>
                                {store.safetyValid ? "ID_CONFIRMED" : "Sign_Handshake"}
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
                        }} disabled={!store.safetyValid || isSubmitting} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-[#00FFC2] transition-all">Submit_Request</button>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col gap-8">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4 text-[#00FFC2]">Operations_Dashboard</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatsBox label="Success_Rate" value="88.4%" icon={<Zap size={18}/>} />
                        <StatsBox label="Avg_Bounty" value="$1,240" icon={<Activity size={18}/>} />
                        <StatsBox label="Neutral_Load" value="32%" icon={<Cpu size={18}/>} />
                        <StatsBox label="Stability" value="99.9%" icon={<Globe size={18}/>} />
                    </div>
                </div>
            )}
        </main>

        {/* RIGHT: TARGETING & DEPLOY [cite: 314, 318, 347] */}
        <aside className="col-span-3 flex flex-col gap-2">
            <div className="flex-1 border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2">
                    <Target size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Selected_Contract</span>
                </div>
                {selectedMission ? (
                    <div className="space-y-4">
                        <p className="text-[10px] leading-relaxed text-gray-300 font-bold italic bg-white/[0.02] p-2">"{selectedMission.objective}"</p>
                        <div className="grid grid-cols-2 gap-2">
                            <MiniMetric label="STATUS" value={selectedMission.status} color={(selectedMission.status === 'approved' || selectedMission.status === 'active') ? '#00FFC2' : '#60A5FA'} />
                            <MiniMetric label="BOUNTY" value={`$${selectedMission.bounty}`} />
                        </div>
                    </div>
                ) : <p className="text-xs text-gray-600 italic">No mission selected...</p>}
            </div>

            <button 
                onClick={handleDeploy}
                // CORRECTION : Actif si approved OU active [cite: 347, 350]
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
                        <span className="text-[8px] font-bold uppercase">Uplink...</span>
                    </div>
                ) : (
                    <>
                        <Zap size={32} className={(selectedMission?.status === 'approved' || selectedMission?.status === 'active') ? "animate-bounce" : ""} />
                        <span className="text-2xl font-black italic uppercase tracking-tighter">Deploy_Uplink</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </>
                )}
            </button>
        </aside>
      </div>
    </div>
  );
}

// COMPOSANTS HELPERS (Identiques à la version précédente)
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
            <h4 className="text-[8px] font-black uppercase text-gray-600 flex items-center gap-2">{icon} {label}</h4>
            <div className="space-y-1">
                {items.map((m: any) => (
                    <button key={m.id} onClick={() => onSelect(m)} className={`w-full text-left p-2 border transition-all flex items-center justify-between ${activeId === m.id ? 'bg-white/10 border-white/20' : 'border-transparent hover:bg-white/[0.02]'}`}>
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
            <label className="text-[8px] font-black text-gray-600 uppercase">{label}</label>
            <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2]" />
        </div>
    );
}