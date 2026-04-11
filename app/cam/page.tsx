"use client";
import { useState, useEffect, useRef } from 'react';
import { LiveKitRoom, VideoConference, AudioConference, ControlBar } from '@livekit/components-react';
import { createClient } from '@supabase/supabase-js';
import { Terminal, Send, Shield, Zap } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

export default function PlayerHUD() {
  const [active, setActive] = useState(false);
  const [token, setToken] = useState("");
  const [agentId, setAgentId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const initialize = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || 'GHOST';
    setAgentId(id);

    try {
      const resp = await fetch(`/api/get-participant-token?room=room-${id}&username=${id}`);
      const data = await resp.json();
      
      // On s'assure que Supabase sait qu'on est en ligne
      await supabase.from('live_sessions').upsert([
        { player_id: id, status: 'active', bounty: 4500 }
      ], { onConflict: 'player_id' });
      
      setToken(data.token);
      setActive(true);
    } catch (e) { alert("Erreur d'uplink"); }
  };

  // Realtime Chat
  useEffect(() => {
    if (!active) return;
    const channel = supabase.channel('chat').on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'chat_messages' }, 
      payload => setMessages(prev => [...prev, payload.new])
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [active]);

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await supabase.from('chat_messages').insert([{ player_id: agentId, sender: 'PLAYER', message: newMessage }]);
    setNewMessage("");
  };

  if (!active) return (
    <main className="h-screen bg-black flex items-center justify-center font-mono p-6">
       <button onClick={initialize} className="w-full py-8 border-2 border-[#a855f7] text-[#a855f7] font-black tracking-[0.5em] uppercase hover:bg-[#a855f7] hover:text-black transition-all">
         INITIALIZE_UPLINK
       </button>
    </main>
  );

  return (
    <main className="h-screen w-screen bg-black relative overflow-hidden font-mono">
      
      {/* 1. LA CAMÉRA (Arrière-plan total) */}
      <div className="absolute inset-0 z-0">
        <LiveKitRoom 
          video={true} audio={true} token={token} 
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
          connect={true}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>

      {/* 2. LE HUD (Par-dessus la caméra) */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4">
        
        {/* TOP : Status */}
        <div className="flex justify-between items-start">
          <div className="bg-black/60 backdrop-blur-md border-l-2 border-[#a855f7] p-3">
            <div className="text-[8px] text-[#a855f7] tracking-[0.3em] uppercase">System_Active</div>
            <div className="text-white text-[10px] font-bold tracking-widest uppercase">Mission: Recon_Sector_04</div>
          </div>
          <div className="bg-black/60 p-2 text-right">
             <div className="text-red-500 text-[10px] font-black animate-pulse">REC ●</div>
             <div className="text-[8px] text-gray-400">ID: {agentId}</div>
          </div>
        </div>

        {/* MIDDLE : CHAT (Seulement à droite, plus compact) */}
        <div className="flex justify-end h-1/3 my-4">
          <div className="w-48 flex flex-col pointer-events-auto bg-black/40 backdrop-blur-sm border border-white/10">
            <div className="p-1 bg-white/5 text-[8px] font-bold text-gray-400 border-b border-white/10 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={10} /> Comms_Link
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[9px]">
              {messages.slice(-5).map((m, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-[#a855f7] font-bold">{m.sender}:</span> <span className="text-white">{m.message}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendMsg} className="p-1 border-t border-white/10 flex gap-1">
              <input 
                value={newMessage} onChange={e => setNewMessage(e.target.value)}
                className="bg-transparent text-[9px] p-1 flex-1 focus:outline-none text-white"
                placeholder="Type..."
              />
              <button type="submit" className="text-[#a855f7]"><Send size={10}/></button>
            </form>
          </div>
        </div>

        {/* BOTTOM : Bounty & Signal */}
        <div className="flex justify-between items-end">
          <div className="bg-black/60 p-2 border border-white/10">
             <div className="text-[8px] text-gray-500 uppercase">Uplink_Signal</div>
             <div className="flex gap-1 mt-1">
               {[1,2,3,4,5].map(b => <div key={b} className={`w-1 h-3 ${b < 5 ? 'bg-[#a855f7]' : 'bg-gray-800'}`} />)}
             </div>
          </div>
          
          <div className="bg-black/80 p-3 border-t-2 border-[#a855f7]">
            <div className="text-[8px] text-[#a855f7] tracking-widest uppercase">Current_Bounty</div>
            <div className="text-2xl text-white font-black italic tabular-nums">$4,500</div>
          </div>
        </div>
      </div>

      {/* SCANLINES (Effet visuel léger) */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </main>
  );
}