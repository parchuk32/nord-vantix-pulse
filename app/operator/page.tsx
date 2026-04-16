"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Zap, Shield, Activity, Target, Cpu, BarChart3, Fingerprint, 
  Crosshair, Map as MapIcon, Wifi, ZapOff, Lock, Eye
} from 'lucide-react';
import { useDeployStore } from "../../store/useDeployStore";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

interface HubProps {
  isWatcher?: boolean; // Si true, on cache les boutons d'interaction
  operatorData?: any;  // Données de l'opérateur à afficher pour le Watcher
}

export default function PulseOperatorHub({ isWatcher = false, operatorData }: HubProps) {
  const router = useRouter();
  const store = useDeployStore();
  const sigCanvas = useRef<any>(null);
  
  const [user, setUser] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [missionDesc, setMissionDesc] = useState("");
  const [showWaiver, setShowWaiver] = useState(false);
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (!isWatcher) {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/register');
            else {
                setUser(session.user);
                fetchMissions(session.user.id);
            }
        };
        checkAuth();
    } else {
        // Mode Watcher : on utilise les données passées en props
        setUser(operatorData);
    }
  }, [isWatcher]);

  const fetchMissions = async (userId: string) => {
    const { data } = await supabase.from('missions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) setMissions(data);
  };

  const activeMission = missions.find(m => m.status === 'approved' || m.status === 'active');

  return (
    <div className="h-screen w-full bg-[#050505] font-mono text-white flex flex-col overflow-hidden p-3 gap-3 relative">
      {/* SCANLINES & CRT EFFECT */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%]" />

      {/* HEADER TACTIQUE */}
      <header className="h-16 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#00FFC2] rounded-sm flex items-center justify-center bg-[#00FFC2]/10 shadow-[0_0_10px_#00FFC2]">
               <Activity size={20} className="text-[#00FFC2]" />
            </div>
            <div>
                <h1 className="text-lg font-black tracking-tighter italic leading-none">PULSE_COMMAND</h1>
                <span className="text-[8px] text-[#00FFC2] tracking-[0.4em] uppercase opacity-70">Tactical_Overseer_v4.2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
            <HeaderStat label="LATENCY" value="14ms" color="#00FFC2" />
            <HeaderStat label="THREAT_LVL" value="STABLE" color="#60A5FA" />
            <div className="h-10 w-px bg-white/10" />
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[9px] font-black text-white/40 uppercase">Operator_ID</p>
                    <p className="text-[11px] font-bold text-[#00FFC2] tracking-widest">{user?.email?.split('@')[0] || "GUEST"}</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-[#00FFC2]/30 overflow-hidden bg-black shadow-[0_0_15px_rgba(0,255,194,0.1)]">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </div>
      </header>

      {/* CORE GRID SYSTEM */}
      <main className="flex-1 grid grid-cols-12 gap-3 overflow-hidden">
        
        {/* COL 1 : BIOMETRICS & PERF (GAUCHE) */}
        <div className="col-span-3 flex flex-col gap-3">
          <div className="flex-1 border border-white/10 bg-white/[0.02] p-5 space-y-6">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-3">
                <Fingerprint size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural_Metrics</span>
            </div>
            
            <div className="space-y-4">
                <DataBar label="SYNC_RATE" percent={88} color="#00FFC2" />
                <DataBar label="STRESS_LVL" percent={12} color="#60A5FA" />
                <DataBar label="CORE_TEMP" percent={36} color="#F97316" />
            </div>

            <div className="pt-6">
                <div className="grid grid-cols-2 gap-2">
                    <MiniMetric label="UPTIME" value="04:12:11" />
                    <MiniMetric label="PACKETS" value="1.2k/s" />
                </div>
            </div>

            <div className="mt-auto border border-white/5 bg-black/40 h-48 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <Crosshair size={120} strokeWidth={0.5} className="text-white/10" />
                <div className="absolute top-2 left-2 text-[7px] text-gray-500 uppercase tracking-widest">Orbital_Scan</div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_red]" />
            </div>
          </div>
        </div>

        {/* COL 2 : STRATEGIC OBJECTIVE (CENTRE) */}
        <div className="col-span-6 flex flex-col gap-3">
          <div className="flex-1 border border-white/10 bg-white/[0.03] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#00FFC2_0%,_transparent_70%)]" />
            </div>

            <div className="flex justify-between items-start mb-10">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                    <Target className="text-[#00FFC2]" size={32} />
                    Current_Objective
                </h2>
                {isWatcher && (
                    <div className="px-4 py-2 bg-[#00FFC2]/10 border border-[#00FFC2] text-[#00FFC2] text-[10px] font-black uppercase animate-pulse">
                       Monitoring_Active
                    </div>
                )}
            </div>

            <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Strategic_Context</label>
                    <div className="min-h-40 w-full bg-black/40 border border-white/10 p-6 rounded-sm text-sm font-bold leading-relaxed text-[#00FFC2]/80 italic">
                        {isWatcher ? (missionDesc || "NO ACTIVE DATA STREAM DETECTED...") : (
                            <textarea 
                                value={missionDesc}
                                onChange={(e) => setMissionDesc(e.target.value)}
                                placeholder="WAITING FOR INPUT..."
                                className="w-full h-full bg-transparent outline-none border-none resize-none placeholder:text-white/5"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <ObjectiveData label="BOUNTY" value={activeMission?.bounty ? `$${activeMission.bounty}` : "N/A"} />
                    <ObjectiveData label="TARGETS" value="MULTIPLE" />
                    <ObjectiveData label="RISK" value="CRITICAL" />
                </div>
            </div>

            {!isWatcher && (
                 <button 
                    className="absolute bottom-8 right-8 px-10 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#00FFC2] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    onClick={() => console.log("Transmitting...")}
                 >
                    Transmit_Proposal
                 </button>
            )}
          </div>
        </div>

        {/* COL 3 : COMMAND & DEPLOY (DROITE) */}
        <div className="col-span-3 flex flex-col gap-3">
          {/* SAFETY CHECK */}
          <div className={`h-1/3 border p-6 flex flex-col justify-between transition-all ${store.safetyValid ? 'border-[#00FFC2]/20 bg-[#00FFC2]/5' : 'border-red-500/20 bg-red-500/5'}`}>
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">Authorization</span>
                <Shield size={16} className={store.safetyValid ? "text-[#00FFC2]" : "text-red-500"} />
             </div>
             <p className="text-[9px] text-gray-500 uppercase leading-relaxed">
                {store.safetyValid ? "Neural handshake complete. Identity confirmed via biocrypt." : "Identity unverified. Deploy sequence locked."}
             </p>
             {!isWatcher && !store.safetyValid && (
                <button 
                    onClick={() => setShowWaiver(true)}
                    className="w-full py-3 border border-red-500 text-red-500 font-black uppercase text-[9px] hover:bg-red-500 hover:text-white transition-all"
                >
                    Authenticate_Link
                </button>
             )}
          </div>

          {/* DEPLOY BUTTON (Visible uniquement pour l'Opérateur) */}
          {!isWatcher ? (
              <button 
                onClick={() => console.log("Deploying...")}
                disabled={!store.safetyValid || deploying}
                className={`flex-1 border-2 flex flex-col items-center justify-center gap-4 transition-all relative overflow-hidden ${
                    store.safetyValid 
                    ? 'border-[#00FFC2] bg-[#00FFC2] text-black shadow-[0_0_40px_rgba(0,255,194,0.2)]' 
                    : 'border-white/5 bg-white/[0.02] text-white/20'
                }`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-pulse" />
                <Zap size={48} />
                <span className="text-3xl font-black italic uppercase tracking-tighter">Deploy_Link</span>
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-60">System_Ready_for_Uplink</div>
              </button>
          ) : (
              <div className="flex-1 border border-white/10 bg-white/[0.01] flex flex-col items-center justify-center p-10 text-center gap-4">
                  <Eye size={40} className="text-[#00FFC2] opacity-30" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                      You are viewing a live data feed.<br/>Interaction is restricted to the operator.
                  </p>
                  <div className="mt-6 flex flex-col gap-2 w-full">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00FFC2] animate-progress w-full" />
                      </div>
                      <span className="text-[8px] text-[#00FFC2] font-black uppercase">Data_Stream_Stable</span>
                  </div>
              </div>
          )}
        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="h-8 border-t border-white/5 flex items-center justify-between px-6 text-[8px] text-gray-600 uppercase font-bold tracking-[0.2em]">
        <span>© NORD_VANTIX_PULSE // SECURED_TERMINAL</span>
        <div className="flex gap-6">
            <span>Grid_Ref: 42.112 // 09.34</span>
            <span className="text-[#00FFC2]">Sys_Status: Operational</span>
        </div>
      </footer>
    </div>
  );
}

// ─── MINI COMPOSANTS DE STYLE ───────────────────────────────────────────────

function HeaderStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex flex-col items-start gap-1">
            <span className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none">{label}</span>
            <span className="text-xs font-black uppercase italic" style={{ color }}>{value}</span>
        </div>
    );
}

function DataBar({ label, percent, color }: { label: string, percent: number, color: string }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-[8px] font-black tracking-widest uppercase">
                <span className="text-white/60">{label}</span>
                <span style={{ color }}>{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
            </div>
        </div>
    );
}

function MiniMetric({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-white/[0.03] border border-white/5 p-2 flex flex-col items-center">
            <span className="text-[7px] text-white/20 uppercase font-black">{label}</span>
            <span className="text-[10px] text-white font-black italic">{value}</span>
        </div>
    );
}

function ObjectiveData({ label, value }: { label: string, value: string }) {
    return (
        <div className="border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-1">
            <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{label}</span>
            <span className="text-sm text-white font-black italic">{value}</span>
        </div>
    );
}