"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Shield, Activity, Target, Terminal, Database, Map, Eye, 
  Radio, LayoutDashboard, CreditCard, Settings, MessageSquare, 
  Play, Square, Send, Wallet, Lock, Crosshair, AlertTriangle, Unlock
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- 1. RENDU VIDÉO ---
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const activeTrack = tracks[0];

  if (activeTrack) {
    return <VideoTrack trackRef={activeTrack} className="absolute inset-0 w-full h-full object-cover grayscale opacity-90" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-3" />
      <div className="text-[7px] text-violet-500 animate-pulse tracking-[0.4em] uppercase">Initializing_Optics...</div>
    </div>
  );
}

// --- 2. MONITEUR LIVE ---
function OperatorCamera({ room, name, isLive }: { room: string, name: string, isLive: boolean }) {
  const [token, setToken] = useState("");
  useEffect(() => {
    fetch(`/api/get-participant-token?room=${room}&username=${name}`)
      .then(res => res.json()).then(data => { if(data.token) setToken(data.token); });
  }, [room, name]);

  if (!token || !isLive) return (
    <div className="h-full w-full bg-black border border-white/5 flex flex-col items-center justify-center gap-4">
      <Radio className="text-gray-800" size={40}/>
      <div className="text-[9px] font-black text-gray-700 tracking-widest uppercase">TRANSMISSION_OFFLINE</div>
    </div>
  );
  
  return (
    <LiveKitRoom video={true} audio={true} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full relative">
      <VideoRenderer />
    </LiveKitRoom>
  );
}

// --- 3. COMPOSANT PANNEAU TACTIQUE ---
const TacticalPanel = ({ title, icon: Icon, children, accent = "violet", className = "" }: any) => {
  const accentClass = accent === "violet" ? "text-violet-400 border-violet-500/50" : accent === "amber" ? "text-amber-500 border-amber-500/50" : "text-green-500 border-green-500/50";
  return (
    <div className={`border border-white/10 bg-black/60 p-4 font-mono relative overflow-hidden flex flex-col ${accentClass} ${className}`}>
      <div className="absolute inset-0 scanline opacity-5 pointer-events-none" />
      <div className="relative z-10 flex-1 flex flex-col">
        <div className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2 ${accentClass} border-b border-white/5 pb-2`}>
          <Icon size={12} /> {title}
        </div>
        <div className="text-[10px] text-gray-300 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};


// --- COMPOSANT PRINCIPAL ---
export default function OperatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'billing' | 'settings'>('dashboard');
  
  // Stream State
  const [isLive, setIsLive] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLogs, setChatLogs] = useState<{sender: string, text: string, time: string}[]>([
    { sender: "SYSTEM", text: "SYSTEM BOOT SEQUENCE COMPLETED.", time: new Date().toLocaleTimeString() }
  ]);

  // MISSION SYSTEM STATE
  const [missionParams, setMissionParams] = useState({ type: 'STEALTH', risk: 'MEDIUM' });
  const [activeMission, setActiveMission] = useState<any>(null);
  const [currentStats, setCurrentStats] = useState({ viewers: 0, missionBounty: 0 });

  // VÉRIFICATION D'AUTORISATION
  useEffect(() => {
    const checkClearance = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/register');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkClearance();
  }, [router]);

  // MOTEUR DE VÉRIFICATION DES CONDITIONS DE MISSION
  useEffect(() => {
    if (activeMission && activeMission.status === 'AWAITING_FUNDS') {
      if (currentStats.missionBounty >= activeMission.targetBounty && currentStats.viewers >= activeMission.targetViewers) {
        setActiveMission({...activeMission, status: 'READY_TO_EXECUTE'});
        setChatLogs(prev => [...prev, { sender: "SYSTEM", text: "TARGETS REACHED. DIRECTIVE UNLOCKED.", time: new Date().toLocaleTimeString() }]);
      }
    }
  }, [currentStats, activeMission]);

  // CHAT & COMMAND HANDLER
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if(!chatMessage.trim()) return;
    
    if(chatMessage.startsWith('/')) {
      const cmd = chatMessage.split(' ');
      if(cmd[0] === '/bounty' && cmd[1]) {
        setCurrentStats(prev => ({...prev, missionBounty: prev.missionBounty + parseInt(cmd[1])}));
        setChatLogs(prev => [...prev, { sender: "SYSTEM", text: `FUNDS INJECTED: +$${cmd[1]}`, time: new Date().toLocaleTimeString() }]);
      } else if (cmd[0] === '/viewers' && cmd[1]) {
        setCurrentStats(prev => ({...prev, viewers: prev.viewers + parseInt(cmd[1])}));
        setChatLogs(prev => [...prev, { sender: "SYSTEM", text: `WATCHERS ROUTED: +${cmd[1]}`, time: new Date().toLocaleTimeString() }]);
      } else {
        setChatLogs(prev => [...prev, { sender: "SYSTEM_ERR", text: "UNKNOWN DIRECTIVE", time: new Date().toLocaleTimeString() }]);
      }
    } else {
      setChatLogs(prev => [...prev, { sender: "OP_TRISTAN", text: chatMessage, time: new Date().toLocaleTimeString() }]);
    }
    setChatMessage("");
  };

  // MISSION GENERATOR
  const generateMission = () => {
    const objectives: any = {
      STEALTH: ["INFILTRATE_SERVER_FARM", "PLANT_TRACKER_UNDETECTED", "EXTRACT_DATA_DRIVE"],
      SURVIVAL: ["HOLD_POSITION_15_MINS", "EVADE_CAPTURE_ZONE_A", "SURVIVE_WAVE_04"],
      SABOTAGE: ["DISABLE_SECURITY_GRID", "CORRUPT_FINANCIAL_LOGS", "DESTROY_COMMS_TOWER"]
    };

    const multipliers: any = { LOW: 1, MEDIUM: 2.5, EXTREME: 5 };
    const baseBounty = 500;
    const baseViewers = 50;

    const selectedType = objectives[missionParams.type];
    const randomObj = selectedType[Math.floor(Math.random() * selectedType.length)];
    const riskMult = multipliers[missionParams.risk];

    setCurrentStats({ viewers: currentStats.viewers, missionBounty: 0 }); // Reset le bounty de mission
    setActiveMission({
      objective: randomObj,
      targetBounty: baseBounty * riskMult,
      targetViewers: Math.floor(baseViewers * riskMult),
      status: 'AWAITING_FUNDS'
    });
    
    setChatLogs(prev => [...prev, { sender: "SYSTEM", text: `NEW CONTRACT: ${randomObj}. AWAITING FUNDING.`, time: new Date().toLocaleTimeString() }]);
  };

  if (loading) return <div className="min-h-screen bg-black text-violet-500 flex items-center justify-center font-mono uppercase tracking-widest text-xs animate-pulse">Loading_System_Core...</div>;

  return (
    <main className="h-screen w-screen bg-[#050505] text-white flex font-mono overflow-hidden relative">
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="crt-overlay pointer-events-none z-50" />

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 border-r border-white/10 bg-[#020202] flex flex-col z-40 relative">
        <div className="p-6 border-b border-white/10 text-center">
          <div className="w-16 h-16 mx-auto bg-black border border-violet-500/50 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Shield className="text-violet-500" size={24} />
          </div>
          <div className="text-xs font-black uppercase tracking-widest text-white">{user?.email?.split('@')[0]}</div>
          <div className="text-[8px] text-green-500 tracking-[0.2em] mt-1">NORD.VANTIX // OPERATOR</div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'dashboard' ? 'bg-violet-900/20 text-violet-400 border border-violet-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={14} /> Mission_Control
          </button>
          <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 p-3 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'billing' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <CreditCard size={14} /> Financial_Hub
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 p-3 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white border border-white/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <Settings size={14} /> Sys_Config
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
           <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full py-3 bg-red-900/20 text-red-500 border border-red-500/30 text-[9px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-black transition-all">
             [ TERMINATE_NODE ]
           </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <section className="flex-1 flex flex-col z-30 relative h-full overflow-hidden">
        
        {/* HEADER HAUT (Contrôle du Live Indépendant) */}
        <header className="h-16 border-b border-white/10 flex justify-between items-center px-6 bg-black/60 backdrop-blur-md">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 text-violet-400 border-r border-white/10 pr-6">
               <Terminal size={16} />
               <span className="text-[10px] font-black tracking-[0.4em] uppercase">MATAWINIE // UPLINK</span>
             </div>
             <Link href="/terminal" className="text-[9px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition-colors flex items-center gap-2">
               <Eye size={12} /> [ ACCESS_WATCHER_GRID ]
             </Link>
           </div>
           
           {/* BOUTON DE STREAM (Indépendant de la mission) */}
           <button 
             onClick={() => {
               setIsLive(!isLive);
               setChatLogs(prev => [...prev, { sender: "SYSTEM", text: isLive ? "UPLINK SEVERED." : "UPLINK ESTABLISHED. BROADCASTING.", time: new Date().toLocaleTimeString() }]);
             }}
             className={`px-8 py-2 border-2 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isLive ? 'bg-red-500/20 text-red-500 border-red-500 hover:bg-red-500 hover:text-black' : 'bg-gray-800 text-gray-400 border-gray-600 hover:bg-white hover:text-black hover:border-white'}`}
           >
             {isLive ? <><Square size={12} fill="currentColor"/> KILL_STREAM</> : <><Radio size={12} fill="currentColor"/> ESTABLISH_UPLINK</>}
           </button>
        </header>

        {/* ZONE DE DONNÉES DYNAMIQUE */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          
          {/* ========================================================= */}
          {/* ONGLET 1 : MISSION CONTROL                                  */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-5 h-full">
              
              {/* COLONNE GAUCHE: Générateur & Gestion de Mission */}
              <div className="col-span-3 flex flex-col gap-5 h-full">
                
                {/* 1. PARAMÈTRES DU CONTRAT */}
                <TacticalPanel title="Contract_Parameters" icon={Crosshair}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 block">Mission_Type</label>
                      <select value={missionParams.type} onChange={e => setMissionParams({...missionParams, type: e.target.value})} disabled={activeMission?.status === 'IN_PROGRESS'} className="w-full bg-black border border-white/10 p-2 text-xs outline-none focus:border-violet-500 disabled:opacity-50">
                        <option value="STEALTH">STEALTH / INFILTRATION</option>
                        <option value="SURVIVAL">SURVIVAL / DEFENSE</option>
                        <option value="SABOTAGE">SABOTAGE / DESTRUCTION</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 block">Threat_Level (Multiplier)</label>
                      <select value={missionParams.risk} onChange={e => setMissionParams({...missionParams, risk: e.target.value})} disabled={activeMission?.status === 'IN_PROGRESS'} className="w-full bg-black border border-white/10 p-2 text-xs outline-none focus:border-violet-500 disabled:opacity-50">
                        <option value="LOW">LOW (1.0x Payout)</option>
                        <option value="MEDIUM">MEDIUM (2.5x Payout)</option>
                        <option value="EXTREME">EXTREME (5.0x Payout)</option>
                      </select>
                    </div>
                    <button onClick={generateMission} disabled={activeMission?.status === 'IN_PROGRESS'} className="w-full py-3 mt-2 bg-violet-900/40 text-violet-300 text-[9px] font-black border border-violet-500/30 uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-violet-900/40 disabled:hover:text-violet-300">
                       [ GENERATE_DIRECTIVE ]
                    </button>
                  </div>
                </TacticalPanel>

                {/* 2. OBJECTIF ACTIF & DÉPLOIEMENT */}
                <TacticalPanel title="Active_Directive" icon={AlertTriangle} accent={activeMission?.status === 'READY_TO_EXECUTE' ? "green" : activeMission ? "amber" : "violet"}>
                  {activeMission ? (
                    <div className="flex flex-col h-full justify-between">
                      <div className="mb-4">
                        <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-1">Primary_Objective:</div>
                        <div className="text-xs font-black text-amber-500 tracking-wider break-words">{activeMission.objective}</div>
                        <div className={`text-[8px] font-bold mt-2 uppercase tracking-widest ${activeMission.status === 'READY_TO_EXECUTE' ? 'text-green-500 animate-pulse' : activeMission.status === 'IN_PROGRESS' ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                          STATUS: {activeMission.status}
                        </div>
                      </div>

                      {/* Barres de progression conditionnelles */}
                      <div className="space-y-4 mb-4">
                        <div>
                           <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
                             <span className="text-gray-400">Required_Bounty</span>
                             <span className="text-white">${currentStats.missionBounty} / ${activeMission.targetBounty}</span>
                           </div>
                           <div className="w-full h-1 bg-black border border-white/10">
                             <div className={`h-full transition-all ${currentStats.missionBounty >= activeMission.targetBounty ? 'bg-green-500' : 'bg-amber-500'}`} style={{width: `${Math.min((currentStats.missionBounty / activeMission.targetBounty) * 100, 100)}%`}}></div>
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between text-[8px] uppercase tracking-widest mb-1">
                             <span className="text-gray-400">Required_Watchers</span>
                             <span className="text-white">{currentStats.viewers} / {activeMission.targetViewers}</span>
                           </div>
                           <div className="w-full h-1 bg-black border border-white/10">
                             <div className={`h-full transition-all ${currentStats.viewers >= activeMission.targetViewers ? 'bg-green-500' : 'bg-violet-500'}`} style={{width: `${Math.min((currentStats.viewers / activeMission.targetViewers) * 100, 100)}%`}}></div>
                           </div>
                        </div>
                      </div>

                      {/* LE BOUTON DE LANCEMENT DE MISSION */}
                      {activeMission.status !== 'IN_PROGRESS' && (
                        <button 
                          onClick={() => {
                            if(!isLive) { alert("YOU MUST ESTABLISH UPLINK (GO LIVE) FIRST."); return; }
                            setActiveMission({...activeMission, status: 'IN_PROGRESS'});
                            setChatLogs(prev => [...prev, { sender: "SYSTEM", text: "DIRECTIVE EXECUTED. GOOD LUCK, AGENT.", time: new Date().toLocaleTimeString() }]);
                          }}
                          disabled={activeMission.status !== 'READY_TO_EXECUTE'}
                          className={`w-full py-4 text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeMission.status === 'READY_TO_EXECUTE' ? 'bg-green-500 text-black hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-gray-900 text-gray-600 border border-gray-700 cursor-not-allowed'}`}
                        >
                          {activeMission.status === 'READY_TO_EXECUTE' ? <><Unlock size={14}/> EXECUTE_DIRECTIVE</> : <><Lock size={14}/> LOCKED</>}
                        </button>
                      )}
                      {activeMission.status === 'IN_PROGRESS' && (
                        <div className="w-full py-4 text-center text-red-500 bg-red-900/20 border border-red-500 text-[10px] font-black tracking-widest uppercase animate-pulse">
                           MISSION_ACTIVE
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[8px] text-gray-600 uppercase tracking-widest text-center">
                       No Directive Assigned.<br/>Generate Mission to proceed.
                    </div>
                  )}
                </TacticalPanel>
              </div>

              {/* COLONNE CENTRE: Vidéo Indépendante */}
              <div className="col-span-6 border-2 border-violet-500/30 bg-black flex flex-col relative shadow-[0_0_30px_rgba(168,85,247,0.1)] h-full min-h-[400px]">
                 <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
                   <div>
                     <div className="text-[10px] font-black text-white tracking-widest uppercase">{isLive ? "BROADCASTING_SIGNAL" : "STANDBY"}</div>
                     <div className="text-[8px] text-violet-400 font-bold mt-1">[{activeMission ? activeMission.objective : "NO_ACTIVE_MISSION"}]</div>
                   </div>
                   {isLive && <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 px-2 py-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> <span className="text-[8px] text-red-500 font-black tracking-widest uppercase">LIVE</span></div>}
                 </div>
                 
                 <div className="flex-1 relative overflow-hidden">
                    <OperatorCamera room={`room-${user?.id}`} name="Agent_Camera" isLive={isLive} />
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                       <div className="w-64 h-64 border border-white/30 rounded-full flex items-center justify-center relative">
                          <div className="absolute w-full h-[1px] bg-white/30" />
                          <div className="absolute h-full w-[1px] bg-white/30" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* COLONNE DROITE: Chat & Logs */}
              <div className="col-span-3 flex flex-col h-full">
                <TacticalPanel title="Command_Terminal" icon={Terminal} className="h-full">
                   <div className="flex-1 bg-black border border-white/5 p-3 overflow-y-auto space-y-3 mb-3">
                      {chatLogs.map((msg, idx) => (
                        <div key={idx} className="text-[10px] leading-relaxed">
                          <span className="text-gray-600 text-[8px] mr-2">[{msg.time}]</span>
                          <span className={msg.sender === 'SYSTEM' ? 'text-amber-500 font-bold' : msg.sender === 'SYSTEM_ERR' ? 'text-red-500 font-bold' : 'text-violet-400 font-bold'}>{msg.sender}: </span>
                          <span className="text-gray-300">{msg.text}</span>
                        </div>
                      ))}
                   </div>
                   
                   <form onSubmit={handleSendChat} className="flex gap-2">
                     <input 
                       type="text" 
                       value={chatMessage}
                       onChange={e => setChatMessage(e.target.value)}
                       placeholder="Enter Command (ex: /bounty 50)..." 
                       className="flex-1 bg-black border border-white/10 p-2 text-[10px] outline-none focus:border-violet-500" 
                     />
                     <button type="submit" className="bg-violet-900/50 border border-violet-500/50 text-violet-400 p-2 hover:bg-violet-500 hover:text-white transition-all">
                       <Send size={14} />
                     </button>
                   </form>
                   <div className="text-[7px] text-gray-600 mt-2 uppercase tracking-widest text-center">Use /bounty [amount] and /viewers [amount] to fill required bars.</div>
                </TacticalPanel>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ONGLET 2 : FINANCIAL HUB                                    */}
          {/* ========================================================= */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <h2 className="text-2xl font-black italic tracking-widest text-white uppercase border-b border-white/10 pb-4 mb-6">Financial Hub</h2>
               <div className="grid grid-cols-2 gap-6">
                  <TacticalPanel title="Current_Balance" icon={Wallet} accent="green">
                    <div className="text-4xl font-black italic text-green-500 my-4">$75,430.00</div>
                  </TacticalPanel>
                  <TacticalPanel title="Total_Earned" icon={Activity} accent="amber">
                    <div className="text-4xl font-black italic text-amber-500 my-4">$342,110.50</div>
                  </TacticalPanel>
               </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ONGLET 3 : SETTINGS                                         */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-black italic tracking-widest text-white uppercase border-b border-white/10 pb-4 mb-6">System Configuration</h2>
              <div className="grid grid-cols-2 gap-6">
                <TacticalPanel title="Geolocation_Spoofing" icon={Map}>
                   <div className="flex gap-2 mt-4">
                     <button className="flex-1 py-2 bg-black border border-white/10 text-[9px] text-gray-500 uppercase tracking-widest">Public</button>
                     <button className="flex-1 py-2 bg-violet-900/40 border border-violet-500 text-violet-400 uppercase tracking-widest font-bold">Hidden (VPN Active)</button>
                   </div>
                </TacticalPanel>
                <TacticalPanel title="Security_Protocols" icon={Lock}>
                   <div className="flex items-center justify-between mt-4">
                      <div className="text-[10px] text-white uppercase tracking-widest font-bold">Two-Factor Auth (2FA)</div>
                      <span className="text-green-500 text-[10px] font-black uppercase">Active</span>
                   </div>
                </TacticalPanel>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}