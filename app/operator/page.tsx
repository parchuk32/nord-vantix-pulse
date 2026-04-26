"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import { 
  Zap, Activity, Target, BarChart3, Fingerprint, 
  Crosshair, FileText, CheckCircle2, Clock, Globe, 
  Loader2, MapPin, Calendar, Award, Briefcase, ChevronRight, Terminal
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";
import '@livekit/components-styles';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

const CATEGORIES = ["STREET", "FOOD", "FITNESS", "EXPLORE", "PRANK", "CHAOS"];

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

  // Form States
  const [missionDesc, setMissionDesc] = useState("");
  const [selectedCat, setSelectedCat] = useState("STREET");
  const [minViewers, setMinViewers] = useState("");
  const [requestedBounty, setRequestedBounty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock Stats (À remplacer par un fetch profiles plus tard)
  const [operatorStats] = useState({
    rank: 128,
    total_earned: 12450,
    missions_completed: 42,
    success_rate: "94.2",
    location: "Montréal, QC",
    joined: "2024",
    bio: "Spécialiste en infiltration urbaine et défis physiques."
  });

  const isLiveRef = useRef(isLive);
  const missionRef = useRef(selectedMission);

  useEffect(() => {
    isLiveRef.current = isLive;
    missionRef.current = selectedMission;
  }, [isLive, selectedMission]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isLiveRef.current && missionRef.current) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/missions?id=eq.${missionRef.current.id}`;
        fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ status: 'approved' }),
          keepalive: true 
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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

  const handleDeploy = async () => {
    if (!selectedMission?.id) return;
    setDeploying(true);

    try {
      await supabase.from('missions').update({ status: 'active' }).eq('id', selectedMission.id);
      const roomName = `mission_${selectedMission.id}`;
      const resp = await fetch(`/api/get-participant-token?room=${roomName}&username=OP_${user.id.substring(0,4)}`);
      const data = await resp.json();
      setLiveToken(data.token);

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
    } catch (e) { 
      setDeploying(false); 
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

  if (!user) return <div className="h-screen bg-black flex items-center justify-center text-[#00FFC2] font-mono animate-pulse">AUTHENTICATING_OPERATOR...</div>;

  return (
    <div className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {isLive && liveToken && (
        <div className="fixed inset-0 z-[100] bg-black">
          <LiveKitRoom video={true} audio={true} token={liveToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full">
            <VideoConference />
            <RoomAudioRenderer />
            <div className="absolute top-10 inset-x-0 flex flex-col items-center z-20">
              <div className="px-10 py-2 bg-red-600/20 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full animate-pulse mb-4 tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.4)]">Signal_Live</div>
              <button onClick={abortMission} className="px-8 py-3 bg-black/80 border border-red-500 text-red-500 font-black uppercase text-[10px] rounded-full hover:bg-red-600 hover:text-white transition-all backdrop-blur-md">Terminate_Link</button>
            </div>
          </LiveKitRoom>
        </div>
      )}

      <header className="h-16 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-[#00FFC2] animate-pulse" />
            <span className="font-black tracking-[0.3em] text-sm italic text-[#00FFC2]">PULSE_OPS_V4</span>
          </div>
          <nav className="flex items-center gap-2">
            <TabButton active={activeCenterTab === 'stats'} onClick={() => setActiveCenterTab('stats')} icon={<BarChart3 size={14} />} label="OPERATOR_DOSSIER" />
            <TabButton active={activeCenterTab === 'requests'} onClick={() => setActiveCenterTab('requests')} icon={<FileText size={14} />} label="NEW_CONTRACT" />
          </nav>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
              <p className="text-[10px] font-black text-[#00FFC2] uppercase tracking-widest">{user?.email?.split('@')[0]}</p>
              <div className="flex items-center justify-end gap-1"><div className="w-1 h-1 bg-[#00FFC2] rounded-full animate-ping" /><p className="text-[7px] text-gray-500 uppercase">Uplink_Ready</p></div>
           </div>
           <div className="w-10 h-10 rounded-full border border-[#00FFC2]/30 overflow-hidden shadow-[0_0_15px_rgba(0,255,194,0.1)]">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="pfp" />
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
        {/* SIDEBAR MISSIONS */}
        <aside className="col-span-3 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2">
                <Target size={14} className="text-[#00FFC2]" />
                <span className="text-[10px] font-black uppercase">Mission_Database</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-4">
                <MissionCategory label="Ready_to_Deploy" items={getMissionsByStatus('approved').concat(getMissionsByStatus('active'))} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#00FFC2" icon={<CheckCircle2 size={10}/>} />
                <MissionCategory label="Pending_Review" items={getMissionsByStatus('pending')} onSelect={setSelectedMission} activeId={selectedMission?.id} color="#60A5FA" icon={<Clock size={10}/>} />
            </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="col-span-6 border border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            {activeCenterTab === 'requests' ? (
                <div className="p-8 flex flex-col gap-6 overflow-y-auto">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter border-b border-white/5 pb-4">Draft_Contract</h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-600 uppercase px-1">Category</label>
                          <select 
                            value={selectedCat} 
                            onChange={(e) => setSelectedCat(e.target.value)}
                            className="w-full bg-black border border-white/10 p-3 text-xs text-[#00FFC2] outline-none appearance-none"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <textarea value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} className="w-full bg-black border border-white/10 p-4 text-sm text-[#00FFC2] h-24 outline-none focus:border-[#00FFC2] transition-all" placeholder="Define objective..." />
                        <div className="grid grid-cols-2 gap-4">
                            <InputSmall label="Min Viewers" value={minViewers} onChange={setMinViewers} />
                            <InputSmall label="Bounty ($)" value={requestedBounty} onChange={setRequestedBounty} />
                        </div>
                        <div className="p-4 border border-white/5 bg-white/[0.01] space-y-2">
                            <div className="h-20 bg-white rounded-sm overflow-hidden">
                                <SignatureCanvas ref={sigCanvas} penColor='black' canvasProps={{className: 'w-full h-full'}} />
                            </div>
                            <button onClick={() => store.setModuleStatus('safetyValid', true)} className={`w-full py-2 text-[8px] font-black uppercase tracking-widest transition-all ${store.safetyValid ? 'bg-[#00FFC2] text-black shadow-[0_0_20px_rgba(0,255,194,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                                {store.safetyValid ? "AUTHORIZATION_SIGNED" : "Sign_to_Validate"}
                            </button>
                        </div>
                        <button onClick={async () => {
                            if (!missionDesc || !minViewers || !requestedBounty || !store.safetyValid) return;
                            setIsSubmitting(true);
                            await supabase.from('missions').insert([{ 
                              user_id: user.id, 
                              objective: missionDesc, 
                              category: selectedCat,
                              min_viewers: parseInt(minViewers), 
                              bounty: parseFloat(requestedBounty), 
                              status: 'pending' 
                            }]);
                            setMissionDesc(""); setMinViewers(""); setRequestedBounty("");
                            fetchMissions(user.id);
                            setActiveCenterTab('stats');
                            setIsSubmitting(false);
                        }} disabled={!store.safetyValid || isSubmitting} className="w-full py-5 bg-white text-black font-black uppercase text-xs tracking-[0.3em] hover:bg-[#00FFC2] transition-all disabled:opacity-20">Submit_Contract</button>
                    </div>
                </div>
            ) : (
                /* --- FULL OPERATOR DOSSIER DASHBOARD --- */
                <div className="p-8 flex flex-col gap-6 overflow-y-auto animate-in fade-in duration-500">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <h2 className="text-3xl font-black italic uppercase tracking-tighter">Operator_Dossier</h2>
                      <span className="text-[10px] text-[#00FFC2] font-black border border-[#00FFC2]/30 px-2 py-1 uppercase tracking-widest">Rank: #{operatorStats.rank}</span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                       <StatsBox label="TOTAL_EARNED" value={`$${operatorStats.total_earned}`} icon={<Award size={16}/>} />
                       <StatsBox label="SUCCESS_RATE" value={`${operatorStats.success_rate}%`} icon={<Zap size={16}/>} />
                       <StatsBox label="TOTAL_CONTRACTS" value={operatorStats.missions_completed} icon={<Briefcase size={16}/>} />
                    </div>

                    {/* Data Rows */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.02] border border-white/5 p-4 space-y-3">
                        <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><MapPin size={12} className="text-[#00FFC2]"/> Deployment_Base</h4>
                        <p className="text-sm font-bold">{operatorStats.location}</p>
                      </div>
                      <div className="bg-white/[0.02] border border-white/5 p-4 space-y-3">
                        <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2"><Calendar size={12} className="text-[#00FFC2]"/> Active_Since</h4>
                        <p className="text-sm font-bold">{operatorStats.joined}</p>
                      </div>
                    </div>

                    {/* Mission History (Table) */}
                    <div className="bg-white/[0.02] border border-white/5 flex flex-col">
                      <div className="p-3 bg-white/[0.03] border-b border-white/5 text-[9px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                        <Terminal size={14}/> Recent_Mission_Logs
                      </div>
                      <div className="p-0">
                         <table className="w-full text-left">
                            <thead className="text-[8px] text-gray-500 uppercase bg-black/40">
                              <tr>
                                <th className="p-3">Objective</th>
                                <th className="p-3 text-right">Payout</th>
                              </tr>
                            </thead>
                            <tbody className="text-[10px] font-bold">
                               {missions.slice(0, 5).map((m, i) => (
                                 <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                                    <td className="p-3 flex items-center gap-2 truncate max-w-[200px]">
                                      <ChevronRight size={10} className="text-[#00FFC2]"/> {m.objective}
                                    </td>
                                    <td className="p-3 text-right text-[#00FFC2]">${m.bounty}</td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                    </div>
                </div>
            )}
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-3 flex flex-col gap-2">
            <div className="flex-1 border border-white/10 bg-white/[0.02] p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-gray-500 border-b border-white/5 pb-2 uppercase text-[9px] font-black tracking-[0.2em]">
                    <Crosshair size={12} /> Target_Specs
                </div>
                {selectedMission ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <p className="text-[10px] leading-relaxed text-gray-300 font-bold italic bg-white/[0.03] p-3 border border-white/10">"{selectedMission.objective}"</p>
                        <div className="grid grid-cols-2 gap-2">
                            <MiniMetric label="STATUS" value={selectedMission.status} color={selectedMission.status === 'active' ? '#00FFC2' : '#60A5FA'} />
                            <MiniMetric label="EST_PAYOUT" value={`$${selectedMission.bounty}`} />
                        </div>
                    </div>
                ) : <p className="text-[9px] text-gray-600 italic uppercase">Awaiting_Selection...</p>}
            </div>

            <button 
                onClick={handleDeploy}
                disabled={!selectedMission || (selectedMission.status !== 'approved' && selectedMission.status !== 'active') || deploying}
                className={`h-40 border-2 flex flex-col items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden group ${
                    (selectedMission?.status === 'approved' || selectedMission?.status === 'active') 
                    ? 'border-[#00FFC2] bg-[#00FFC2] text-black shadow-[0_0_40px_rgba(0,255,194,0.15)]' 
                    : 'border-white/5 bg-white/[0.01] text-white/5'
                }`}
            >
                {deploying ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <span className="text-5xl font-black">{countdown}</span>
                        <span className="text-[8px] font-black uppercase tracking-[0.5em] mt-2">Uplink_Sync</span>
                    </div>
                ) : (
                    <>
                        <Zap size={32} className={(selectedMission?.status === 'approved' || selectedMission?.status === 'active') ? "animate-bounce" : ""} />
                        <span className="text-2xl font-black italic uppercase tracking-tighter">Initialize_Link</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </>
                )}
            </button>
        </aside>
      </div>
    </div>
  );
}

// --- HELPERS ---
function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2 rounded-md transition-all ${active ? 'bg-[#00FFC2] text-black font-black' : 'text-gray-500 hover:text-white font-bold'}`}>
            {icon} <span className="text-[9px] uppercase tracking-widest">{label}</span>
        </button>
    );
}

function StatsBox({ label, value, icon }: any) {
    return (
        <div className="bg-white/[0.02] border border-white/5 p-4 flex flex-col gap-2 relative overflow-hidden">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest z-10">{label}</span>
            <span className="text-xl font-black italic z-10">{value}</span>
            <div className="absolute right-2 bottom-2 text-[#00FFC2] opacity-10 z-0">{icon}</div>
        </div>
    );
}

function MissionCategory({ label, items, onSelect, activeId, color, icon }: any) {
    return (
        <div className="space-y-2 mt-4">
            <h4 className="text-[8px] font-black uppercase text-gray-600 flex items-center gap-2 px-2 tracking-widest">{icon} {label}</h4>
            <div className="space-y-1">
                {items.map((m: any) => (
                    <button key={m.id} onClick={() => onSelect(m)} className={`w-full text-left p-3 border transition-all flex items-center justify-between ${activeId === m.id ? 'bg-[#00FFC2]/10 border-[#00FFC2]/30' : 'border-transparent hover:bg-white/[0.03]'}`}>
                        <span className={`text-[10px] font-black uppercase truncate max-w-[150px] ${activeId === m.id ? 'text-white' : 'text-gray-500'}`}>{m.objective}</span>
                        <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: color, backgroundColor: color }} />
                    </button>
                ))}
            </div>
        </div>
    );
}

function MiniMetric({ label, value, color }: any) {
    return (
        <div className="bg-black/40 border border-white/5 p-2 flex-1">
            <span className="text-[7px] text-gray-600 uppercase font-black block mb-1">{label}</span>
            <span className="text-[10px] font-black italic uppercase" style={{ color: color || 'white' }}>{value}</span>
        </div>
    );
}

function InputSmall({ label, value, onChange }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-600 uppercase px-1 tracking-widest">{label}</label>
            <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-xs text-[#00FFC2] outline-none focus:border-[#00FFC2] transition-all" />
        </div>
    );
}