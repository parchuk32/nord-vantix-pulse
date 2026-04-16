"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Zap, Shield, Activity, Target, Cpu, BarChart3, Fingerprint, 
  Crosshair, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, Send, Globe
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function PulseOperatorHub() {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [activeCenterTab, setActiveCenterTab] = useState<'stats' | 'requests'>('requests');
  const [selectedMission, setSelectedMission] = useState<any>(null);

  // Form States
  const [missionDesc, setMissionDesc] = useState("");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deploying, setDeploying] = useState(false);

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

  const submitMissionProposal = async () => {
    if (!missionDesc || !minViewers || !requestedBounty || !store.safetyValid) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('missions').insert([{ 
        user_id: user.id, objective: missionDesc, min_viewers: parseInt(minViewers), 
        bounty: parseFloat(requestedBounty), status: 'pending' 
    }]);
    if (!error) {
        setMissionDesc(""); setMinViewers(""); setRequestedBounty("");
        fetchMissions(user.id);
        setActiveCenterTab('stats');
    }
    setIsSubmitting(false);
  };

  const getMissionsByStatus = (status: string) => missions.filter(m => m.status === status);

  return (
    <div className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* HEADER AVEC TABS NAVIGATION */}
      <header className="h-16 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-md">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-[#00FFC2] animate-pulse" />
            <span className="font-black tracking-[0.3em] text-sm italic">PULSE_OPS</span>
          </div>

          <nav className="flex items-center gap-2 bg-black/40 p-1 border border-white/5 rounded-lg">
            <TabButton 
                active={activeCenterTab === 'stats'} 
                onClick={() => setActiveCenterTab('stats')} 
                icon={<BarChart3 size={14} />} 
                label="DASHBOARD_STATS" 
            />
            <TabButton 
                active={activeCenterTab === 'requests'} 
                onClick={() => setActiveCenterTab('requests')} 
                icon={<FileText size={14} />} 
                label="NEW_REQUEST" 
            />
          </nav>
        </div>

        <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Operator_Node</p>
                <p className="text-[10px] font-black text-[#00FFC2]">{user?.email?.split('@')[0]}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#00FFC2]/30 overflow-hidden shadow-[0_0_10px_rgba(0,255,194,0.1)]">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="pfp" />
            </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
        
        {/* COLONNE GAUCHE : MISSION LIST (PAR CATÉGORIES) */}
        <aside className="col-span-3 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
                <Target size={14} className="text-[#00FFC2]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mission_Database</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                <MissionCategory label="Active / Approved" items={getMissionsByStatus('approved').concat(getMissionsByStatus('active'))} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#00FFC2" icon={<CheckCircle2 size={10}/>} />
                <MissionCategory label="Pending_Review" items={getMissionsByStatus('pending')} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#60A5FA" icon={<Clock size={10}/>} />
                <MissionCategory label="Completed / Success" items={getMissionsByStatus('success').concat(getMissionsByStatus('completed'))} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#A855F7" icon={<Zap size={10}/>} />
                <MissionCategory label="Dismissed / Failed" items={getMissionsByStatus('dismissed').concat(getMissionsByStatus('failed'))} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#EF4444" icon={<XCircle size={10}/>} />
            </div>
        </aside>

        {/* COLONNE MILIEU : STATS OU REQUESTS (INTERCHANGEABLE) */}
        <main className="col-span-6 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            {activeCenterTab === 'requests' ? (
                <div className="p-8 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4">Create_New_Contract</h2>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Mission_Objective</label>
                            <textarea 
                                value={missionDesc}
                                onChange={(e) => setMissionDesc(e.target.value)}
                                className="w-full bg-black border border-white/10 p-4 text-sm text-[#00FFC2] h-32 outline-none focus:border-[#00FFC2] transition-all"
                                placeholder="Describe the challenge..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputSmall label="Min_Viewers" value={minViewers} onChange={setMinViewers} />
                            <InputSmall label="Price_Bounty ($)" value={requestedBounty} onChange={setRequestedBounty} />
                        </div>

                        {/* WAIVER INTEGRÉ DANS LE FORM */}
                        <div className="p-4 border border-white/5 bg-white/[0.01] rounded-sm space-y-4">
                            <div className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest">
                                <Shield size={12} /> Legal_Signature_Required
                            </div>
                            <div className="h-32 bg-white rounded-sm overflow-hidden border border-white/10">
                                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-full'}} />
                            </div>
                            <button 
                                onClick={() => store.setModuleStatus('safetyValid', true)} 
                                className={`w-full py-2 text-[8px] font-black uppercase tracking-widest transition-all ${store.safetyValid ? 'bg-[#00FFC2] text-black' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                            >
                                {store.safetyValid ? "ID_CONFIRMED" : "Confirm_Identity_Handshake"}
                            </button>
                        </div>

                        <button 
                            onClick={submitMissionProposal}
                            disabled={!store.safetyValid || isSubmitting}
                            className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-[#00FFC2] transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                        >
                            Submit_Request <Send size={14}/>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-8 flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 overflow-y-auto">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4 text-[#00FFC2]">Operations_Dashboard</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatsBox label="Success_Rate" value="88.4%" icon={<Zap size={18}/>} />
                        <StatsBox label="Avg_Bounty" value="$1,240" icon={<Activity size={18}/>} />
                        <StatsBox label="Neutral_Load" value="32%" icon={<Cpu size={18}/>} />
                        <StatsBox label="Uplink_Stability" value="99.9%" icon={<Globe size={18}/>} />
                    </div>
                    <div className="flex-1 border border-white/5 bg-black/40 min-h-[200px] flex items-center justify-center relative">
                        <Crosshair size={100} className="text-white/5" />
                        <span className="text-[9px] text-gray-700 uppercase absolute top-4 left-4 tracking-widest italic">Live_Visual_Metrics_042</span>
                    </div>
                </div>
            )}
        </main>

        {/* COLONNE DROITE : SELECTED MISSION & DEPLOY (ACTION) */}
        <aside className="col-span-3 flex flex-col gap-2">
            {/* BOX HAUT : DÉTAILS DE LA MISSION SÉLECTIONNÉE */}
            <div className="flex-1 border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4 overflow-hidden relative">
                <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2">
                    <Target size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Selected_Contract</span>
                </div>
                
                {selectedMission ? (
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="space-y-1">
                            <span className="text-[8px] text-[#00FFC2] font-black uppercase">Objective:</span>
                            <p className="text-[10px] leading-relaxed text-gray-300 font-bold italic line-clamp-6 bg-white/[0.02] p-2">"{selectedMission.objective}"</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <MiniMetric label="STATUS" value={selectedMission.status} color="#00FFC2" />
                            <MiniMetric label="BOUNTY" value={`$${selectedMission.bounty}`} color="#FFF" />
                            <MiniMetric label="VIEWERS" value={`${selectedMission.min_viewers}+`} color="#FFF" />
                            <MiniMetric label="THREAT" value="MID" color="#60A5FA" />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-700 italic text-[10px]">No mission selected...</div>
                )}
                
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex justify-between items-end">
                        <span className="text-[8px] text-gray-600 font-black uppercase">Auth_Key</span>
                        <span className="text-[10px] font-mono text-[#00FFC2]">PULSE-{selectedMission?.id.substring(0,8)}</span>
                    </div>
                </div>
            </div>

            {/* BOX BAS : DEPLOY (ACTION FINALE) */}
            <button 
                onClick={() => setDeploying(true)}
                disabled={!selectedMission || selectedMission.status !== 'approved'}
                className={`h-40 border-2 flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden group ${
                    selectedMission?.status === 'approved' 
                    ? 'border-[#00FFC2] bg-[#00FFC2] text-black shadow-[0_0_30px_rgba(0,255,194,0.2)]' 
                    : 'border-white/5 bg-white/[0.01] text-white/10'
                }`}
            >
                <Zap size={32} className={selectedMission?.status === 'approved' ? "animate-bounce" : ""} />
                <span className="text-2xl font-black italic uppercase tracking-tighter">Deploy_Uplink</span>
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                    {selectedMission?.status === 'approved' ? 'Authorization_Granted' : 'Waiting_For_Approval'}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
        </aside>
      </div>
    </div>
  );
}

// ─── MINI COMPOSANTS LOCAUX ──────────────────────────────────────────────────

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${active ? 'bg-[#00FFC2] text-black font-black' : 'text-gray-500 hover:text-white font-bold'}`}>
            {icon}
            <span className="text-[9px] uppercase tracking-widest">{label}</span>
        </button>
    );
}

function MissionCategory({ label, items, onSelect, activeId, color, icon }: any) {
    return (
        <div className="space-y-2">
            <h4 className="text-[8px] font-black uppercase text-gray-600 tracking-[0.3em] flex items-center gap-2">
                {icon} {label} ({items.length})
            </h4>
            <div className="space-y-1">
                {items.map((m: any) => (
                    <button 
                        key={m.id} 
                        onClick={() => onSelect(m)}
                        className={`w-full text-left p-2 border transition-all flex items-center justify-between group ${activeId === m.id ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}
                    >
                        <span className={`text-[10px] font-bold uppercase truncate max-w-[150px] ${activeId === m.id ? 'text-white' : 'text-gray-500'}`}>{m.objective}</span>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function StatsBox({ label, value, icon }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between group hover:border-[#00FFC2]/30 transition-all">
            <div className="flex flex-col gap-1">
                <span className="text-[8px] text-gray-500 uppercase font-black">{label}</span>
                <span className="text-xl font-black italic tracking-tighter">{value}</span>
            </div>
            <div className="text-[#00FFC2] opacity-20 group-hover:opacity-100 transition-opacity">{icon}</div>
        </div>
    );
}

function MiniMetric({ label, value, color }: any) {
    return (
        <div className="bg-black/40 border border-white/5 p-2">
            <span className="text-[7px] text-gray-600 uppercase block mb-1">{label}</span>
            <span className="text-[10px] font-black italic uppercase" style={{ color }}>{value}</span>
        </div>
    );
}

function InputSmall({ label, value, onChange }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-600 uppercase">{label}</label>
            <input 
                type="number" value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-black border border-white/10 p-3 text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2]"
            />
        </div>
    );
}