"use client";
import { useState, useEffect, useRef } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { createClient } from '@supabase/supabase-js';
import { Terminal, Send, Shield, Activity, MapPin, Zap } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function PlayerHUD() {
  const [active, setActive] = useState(false);
  const [token, setToken] = useState("");
  const [agentId, setAgentId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialisation de la liaison
  const initialize = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || 'GHOST_UNIT';
    setAgentId(id);

    const { data: tokenData } = await fetch(`/api/get-participant-token?room=room-${id}&username=${id}`).then(res => res.json());
    
    await supabase.from('live_sessions').upsert([{ player_id: id, status: 'active' }], { onConflict: 'player_id' });
    
    setToken(tokenData);
    setActive(true);
  };

  // Gestion du Chat Realtime
  useEffect(() => {
    if (!active) return;
    const fetchMsgs = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('player_id', agentId).order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMsgs();

    const channel = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
      payload => setMessages(prev => [...prev, payload.new])
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [active, agentId]);

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from('chat_messages').insert([{ player_id: agentId, sender: 'PLAYER', message: newMessage }]);
    setNewMessage("");
  };

  if (!active) return (
    <main className="h-screen bg-black flex items-center justify-center font-mono">
       <button onClick={initialize} className="p-6 border-2 border-[#a855f7] text-[#a855f7] animate-pulse tracking-[0.5em] hover:bg-[#a855f7] hover:text-black transition-all">
         INITIATE_UPLINK
       </button>
    </main>
  );

  return (
    <main className="h-screen w-screen bg-black relative overflow-hidden font-mono text-[#a855f7]">
      {/* EFFET DE SCANLINES */}
      <div className="absolute inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />

      <LiveKitRoom video={true} audio={false} token={token} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
        <VideoConference />
        
        {/* HUD OVERLAY LAYER */}
        <div className="absolute inset-0 z-40 p-4 flex flex-col justify-between pointer-events-none">
          
          {/* TOP BAR: SYSTEM STATUS */}
          <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/60 border-l-2 border-[#a855f7] p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[10px] mb-1">
                <Shield size={12} /> <span>ENCRYPTION_ACTIVE: AES-256</span>
              </div>
              <div className="text-white text-xs font-bold tracking-widest animate-pulse">
                MISSION: RECON_LEVEL_04
              </div>
            </div>
            
            <div className="text-right space-y-1">
              <div className="text-red-500 text-xs font-bold flex items-center justify-end gap-2">
                REC <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <div className="text-[10px] text-gray-500">SIGNAL_STRENGTH: 98%</div>
            </div>
          </div>

          {/* MIDDLE: CHAT & TELEMETRY */}
          <div className="flex-1 flex justify-between items-center my-4 overflow-hidden">
            {/* Left: Telemetry */}
            <div className="space-y-6">
              <div className="bg-black/40 p-2 border border-[#a855f7]/20">
                <Activity size={16} className="mb-2" />
                <div className="text-[10px] text-white">BPM: 114</div>
                <div className="w-20 h-1 bg-gray-800 mt-1"><div className="w-2/3 h-full bg-red-500 animate-pulse" /></div>
              </div>
              <div className="bg-black/40 p-2 border border-[#a855f7]/20">
                <MapPin size={16} className="mb-2" />
                <div className="text-[8px] text-gray-400">LAT: 46.0483</div>
                <div className="text-[8px] text-gray-400">LON: -73.6124</div>
              </div>
            </div>

            {/* Right: Real-time Chat */}
            <div className="w-64 h-full flex flex-col pointer-events-auto bg-black/60 backdrop-blur-md border border-[#a855f7]/30">
              <div className="p-2 border-b border-[#a855f7]/30 bg-[#a855f7]/10 text-[10px] font-bold flex items-center gap-2">
                <Terminal size={12} /> WATCHER_COMMS
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
                {messages.map((m, i) => (
                  <div key={i} className="text-[9px]">
                    <span className={m.sender === 'PLAYER' ? 'text-gray-400' : 'text-white'}>[{m.sender}]:</span> {m.message}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendMsg} className="p-2 border-t border-[#a855f7]/30 flex gap-1">
                <input 
                  value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  className="bg-black border border-[#a855f7]/50 text-[10px] p-1 flex-1 focus:outline-none"
                  placeholder="TYPE_MSG..."
                />
                <button type="submit" className="bg-[#a855f7] text-black p-1"><Send size={12}/></button>
              </form>
            </div>
          </div>

          {/* BOTTOM BAR: BOUNTY & SYSTEM LOGS */}
          <div className="flex justify-between items-end border-t border-[#a855f7]/30 pt-4 bg-black/40">
            <div className="max-w-[200px] hidden md:block">
               <div className="text-[8px] text-gray-500 animate-pulse">
                 {'>'} SYSTEM_CHECK... OK<br/>
                 {'>'} UPLINK_STABLE... OK<br/>
                 {'>'} GPS_LOCKED... OK
               </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#a855f7] tracking-widest uppercase">Current_Bounty</div>
              <div className="text-3xl text-white font-black italic tracking-tighter">$4,500</div>
            </div>
          </div>
        </div>
      </LiveKitRoom>
    </main>
  );
}