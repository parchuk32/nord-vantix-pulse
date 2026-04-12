"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Shield, Activity, Target, Terminal, Database, Network, Map, Eye, 
  Radio, LayoutDashboard, CreditCard, Settings, Edit3, MessageSquare, 
  Play, Square, Send, Wallet, Lock
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
  const [streamConfig, setStreamConfig] = useState({
    title: "OPERATION: SHADOW_MARKET",
    category: "XAUUSD / FINANCIAL",
    status: "STEALTH"
  });
  const [chatMessage, setChatMessage] = useState("");
  const [chatLogs, setChatLogs] = useState<{sender: string, text: string, time: string}[]>([
    { sender: "SYSTEM", text: "UPLINK SECURED. MATAWINIE NODE ONLINE.", time: new Date().toLocaleTimeString() }
  ]);

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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if(!chatMessage.trim()) return;
    setChatLogs(prev => [...prev, { sender: "OP_TRISTAN", text: chatMessage, time: new Date().toLocaleTimeString() }]);
    setChatMessage("");
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
          <div className="text-[8px] text-green-500 tracking-[0.2em] mt-1">STATUS: ENCRYPTED</div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-3 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'dashboard' ? 'bg-violet-900/20 text-violet-400 border border-violet-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutDashboard size={14} /> Mission_Control
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 p-3 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'billing' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <CreditCard size={14} /> Financial_Hub
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 p-3 text-[9px] font-black tracking-widest uppercase transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white border border-white/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Settings size={14} /> Sys_Config
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
           <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full py-3 bg-red-900/20 text-red-500 border border-red-500/30 text-[9px] font-black tracking-widest uppercase hover:bg-red-500 hover:text-black transition-all">
             [ LOGOUT ]
           </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <section className="flex-1 flex flex-col z-30 relative h-full overflow-hidden">
        
        {/* HEADER HAUT */}
        <header className="h-16 border-b border-white/10 flex justify-between items-center px-6 bg-black/60 backdrop-blur-md">
           <div className="flex items-center gap-3 text-violet-400">
             <Terminal size={16} />
             <span className="text-[10px] font-black tracking-[0.4em] uppercase">NORD.VANTIX :: OPERATOR</span>
           </div>
           
           {/* BOUTON GO LIVE MASTER */}
           <button 
             onClick={() => {
               setIsLive(!isLive);
               setChatLogs(prev => [...prev, { sender: "SYSTEM", text: isLive ? "TRANSMISSION TERMINATED." : "UPLINK ACTIVE. TRANSMITTING VIDEO DATA.", time: new Date().toLocaleTimeString() }]);
             }}
             className={`px-8 py-2 border-2 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isLive ? 'bg-red-500/20 text-red-500 border-red-500 hover:bg-red-500 hover:text-black' : 'bg-green-500/10 text-green-500 border-green-500 hover:bg-green-500 hover:text-black'}`}
           >
             {isLive ? <><Square size={12} fill="currentColor"/> OFFLINE_ABORT</> : <><Play size={12} fill="currentColor"/> GO_LIVE_NOW</>}
           </button>
        </header>

        {/* ZONE DE DONNÉES DYNAMIQUE (Selon l'onglet) */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          
          {/* ========================================================= */}
          {/* ONGLET 1 : DASHBOARD & STREAM CONTROL                       */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-5 h-full">
              
              {/* COLONNE GAUCHE: Config du stream & Stats */}
              <div className="col-span-3 flex flex-col gap-5 h-full">
                <TacticalPanel title="Stream_Config" icon={Edit3}>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 block">Op_Designation (Title)</label>
                      <input type="text" value={streamConfig.title} onChange={e => setStreamConfig({...streamConfig, title: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-xs outline-none focus:border-violet-500" />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 block">Sector / Target (Category)</label>
                      <select value={streamConfig.category} onChange={e => setStreamConfig({...streamConfig, category: e.target.value})} className="w-full bg-black border border-white/10 p-2 text-xs outline-none focus:border-violet-500 appearance-none">
                        <option>XAUUSD / FINANCIAL</option>
                        <option>2D_SIMULATION / GODOT</option>
                        <option>AUTOMATION / N8N</option>
                        <option>IRL / MECHANICS</option>
                      </select>
                    </div>
                    <button className="w-full py-3 mt-2 bg-violet-900/40 text-violet-300 text-[9px] border border-violet-500/30 uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all">
                       [ UPDATE_CONFIG ]
                    </button>
                  </div>
                </TacticalPanel>

                <TacticalPanel title="Live_Telemetry" icon={Activity} accent="amber">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="bg-black border border-white/5 p-3 flex flex-col justify-center items-center">
                      <Eye className="text-amber-500 mb-1" size={14}/>
                      <div className="text-[8px] text-gray-500 uppercase">Watchers</div>
                      <div className="text-lg font-black text-white">{isLive ? '142' : '0'}</div>
                    </div>
                    <div className="bg-black border border-white/5 p-3 flex flex-col justify-center items-center">
                      <Target className="text-green-500 mb-1" size={14}/>
                      <div className="text-[8px] text-gray-500 uppercase">Bounty</div>
                      <div className="text-lg font-black text-white">$450</div>
                    </div>
                    <div className="col-span-2 bg-black border border-white/5 p-3 flex justify-between items-center">
                      <div className="text-[8px] text-gray-500 uppercase">Uptime</div>
                      <div className="text-xs font-black text-white">{isLive ? '01:24:40' : '00:00:00'}</div>
                    </div>
                  </div>
                </TacticalPanel>
              </div>

              {/* COLONNE CENTRE: Vidéo */}
              <div className="col-span-6 border-2 border-violet-500/30 bg-black flex flex-col relative shadow-[0_0_30px_rgba(168,85,247,0.1)] h-full min-h-[400px]">
                 <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-20 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
                   <div>
                     <div className="text-[10px] font-black text-white tracking-widest uppercase">{streamConfig.title}</div>
                     <div className="text-[8px] text-violet-400 font-bold mt-1">[{streamConfig.category}]</div>
                   </div>
                   {isLive && <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 px-2 py-1"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> <span className="text-[8px] text-red-500 font-black tracking-widest uppercase">LIVE</span></div>}
                 </div>
                 
                 <div className="flex-1 relative overflow-hidden">
                    <OperatorCamera room={`room-${user?.id}`} name="Agent_Camera" isLive={isLive} />
                    
                    {/* Crosshair Opérateur */}
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
                <TacticalPanel title="Secure_Comms_Link" icon={MessageSquare} className="h-full">
                   <div className="flex-1 bg-black border border-white/5 p-3 overflow-y-auto space-y-3 mb-3">
                      {chatLogs.map((msg, idx) => (
                        <div key={idx} className="text-[10px] leading-relaxed">
                          <span className="text-gray-600 text-[8px] mr-2">[{msg.time}]</span>
                          <span className={msg.sender === 'SYSTEM' ? 'text-amber-500 font-bold' : 'text-violet-400 font-bold'}>{msg.sender}: </span>
                          <span className="text-gray-300">{msg.text}</span>
                        </div>
                      ))}
                   </div>
                   
                   <form onSubmit={handleSendChat} className="flex gap-2">
                     <input 
                       type="text" 
                       value={chatMessage}
                       onChange={e => setChatMessage(e.target.value)}
                       placeholder="Transmit_Message..." 
                       disabled={!isLive}
                       className="flex-1 bg-black border border-white/10 p-2 text-[10px] outline-none focus:border-violet-500 disabled:opacity-50" 
                     />
                     <button type="submit" disabled={!isLive} className="bg-violet-900/50 border border-violet-500/50 text-violet-400 p-2 hover:bg-violet-500 hover:text-white transition-all disabled:opacity-50">
                       <Send size={14} />
                     </button>
                   </form>
                </TacticalPanel>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ONGLET 2 : FINANCIAL HUB & BILLING (Inspiré de ta photo)  */}
          {/* ========================================================= */}
          {activeTab === 'billing' && (
            <div className="max-w-4xl mx-auto space-y-6">
               <h2 className="text-2xl font-black italic tracking-widest text-white uppercase border-b border-white/10 pb-4 mb-6">Financial Hub & Billing</h2>
               
               <div className="grid grid-cols-2 gap-6">
                  <TacticalPanel title="Current_Balance" icon={Wallet} accent="green">
                    <div className="text-4xl font-black italic text-green-500 my-4">$75,430.00</div>
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Account Status: <span className="text-green-400">Verified</span></div>
                  </TacticalPanel>

                  <TacticalPanel title="Total_Earned" icon={Activity} accent="amber">
                    <div className="text-4xl font-black italic text-amber-500 my-4">$342,110.50</div>
                    <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Global Rank: <span className="text-amber-400">#14</span></div>
                  </TacticalPanel>
               </div>

               <TacticalPanel title="Payout_Settings" icon={CreditCard}>
                 <div className="space-y-4 mt-2">
                   <div className="flex items-center justify-between bg-black border border-white/10 p-4">
                     <div className="flex items-center gap-4">
                        <CreditCard className="text-gray-500" size={24}/>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-widest">Offshore Card</div>
                          <div className="text-[10px] text-gray-500">Linked ending in **** 4921</div>
                        </div>
                     </div>
                     <span className="text-[9px] text-green-500 border border-green-500/20 px-2 py-1">ACTIVE</span>
                   </div>

                   <div className="flex items-center justify-between bg-black border border-white/10 p-4">
                     <div className="flex items-center gap-4">
                        <Database className="text-gray-500" size={24}/>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-widest">Crypto Wallet</div>
                          <div className="text-[10px] text-gray-500">0x7F...a9B2 (USDT/ERC20)</div>
                        </div>
                     </div>
                   </div>

                   <button className="w-full py-4 mt-4 bg-transparent border border-white/20 text-white text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
                     [ Manage_Payouts ]
                   </button>
                 </div>
               </TacticalPanel>
            </div>
          )}

          {/* ========================================================= */}
          {/* ONGLET 3 : SETTINGS (Inspiré de ta photo)                 */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-black italic tracking-widest text-white uppercase border-b border-white/10 pb-4 mb-6">Account Settings & Preferences</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <TacticalPanel title="Operational_Modifiers" icon={Target}>
                   <div className="space-y-6 mt-2">
                      <div>
                        <div className="flex justify-between text-[9px] text-gray-400 uppercase font-bold mb-2"><span>Risk Level</span> <span>Extreme</span></div>
                        <div className="h-2 w-full bg-black border border-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 w-[85%]" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold mb-2">Geolocation Exposure</div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-black border border-white/10 text-[9px] text-gray-500 uppercase tracking-widest">Public</button>
                          <button className="flex-1 py-2 bg-violet-900/40 border border-violet-500 text-violet-400 uppercase tracking-widest font-bold">Hidden (VPN)</button>
                        </div>
                      </div>
                   </div>
                </TacticalPanel>

                <TacticalPanel title="Security_Protocols" icon={Lock}>
                   <div className="space-y-6 mt-2">
                      <div className="flex items-center justify-between">
                         <div className="text-[10px] text-white uppercase tracking-widest font-bold">Two-Factor Auth (2FA)</div>
                         <span className="text-green-500 text-[10px] font-black uppercase">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="text-[10px] text-white uppercase tracking-widest font-bold">Stream Key Rotation</div>
                         <span className="text-amber-500 text-[10px] font-black uppercase">Manual</span>
                      </div>
                      <button className="w-full py-4 bg-transparent border border-white/20 text-white text-[10px] font-black tracking-widest uppercase hover:bg-white hover:text-black transition-all">
                        [ Change_Password ]
                      </button>
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