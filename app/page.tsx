"use client";

import SecurityMonitor from './components/SecurityMonitor';
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';

// 1. Connexion Supabase (Extérieur pour éviter les doublons)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// 2. Le composant Vidéo (Le moniteur)
function VideoMonitor({ room, name }: { room: string, name: string }) {
  const [token, setToken] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      try {
        const resp = await fetch(`/api/get-participant-token?room=${room}&username=${name}`);
        const data = await resp.json();
        if (data.token) setToken(data.token);
      } catch (e) {
        console.error("Erreur Token:", e);
      }
    };
    getToken();
  }, [room, name]);

  if (!token) return <div className="h-48 bg-black animate-pulse border-b border-gray-800" />;

  if (!isJoined) {
    return (
      <button 
        onClick={() => setIsJoined(true)}
        className="w-full h-48 bg-[#0a0a0a] border-b border-gray-800 flex items-center justify-center group hover:bg-[#111] transition-colors"
      >
        <span className="text-[#a855f7] text-[10px] tracking-[0.3em] group-hover:scale-110 transition-transform">
          [ INITIALIZE_FEED ]
        </span>
      </button>
    );
  }

  return (
    <div className="w-full h-48 bg-black border-b border-gray-800 relative overflow-hidden">
      <LiveKitRoom
        video={false}
        audio={false}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        connect={true}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <SecurityMonitor /> 
        </div>
      </LiveKitRoom>
    </div>
  );
}

// 3. La carte du joueur (Indépendante)
function LiveCard({ player }: { player: any }) {
  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden relative group hover:border-[#a855f7] transition-all duration-300 bg-black/40">
      <VideoMonitor room={`room-${player.player_id}`} name="Terminal_Watcher" />
      <div className="p-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-[#a855f7] bg-[#a855f7]/10 px-2 py-0.5 border border-[#a855f7]/20 uppercase">
            ID: {player.player_id}
          </span>
          <span className="text-[10px] text-red-500 animate-pulse font-bold">● LIVE</span>
        </div>
        <div className="text-right">
          <span className="text-lg text-[#facc15] font-bold tabular-nums">${player.bounty}</span>
        </div>
      </div>
    </div>
  );
}

// 4. Le Terminal Principal (Exporté par défaut)
export default function WatcherTerminal() {
  const [activePlayers, setActivePlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from('live_sessions').select('*');
      if (data) setActivePlayers(data);
    };

    fetchSessions();

    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_sessions' }, () => {
        fetchSessions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-gray-400 font-mono p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-end border-b border-gray-900 pb-6 mb-10">
          <div>
            <h1 className="text-3xl tracking-[0.3em] text-white font-black uppercase italic">
              NORD.VANTIX <span className="text-[#a855f7] not-italic">:: PULSE</span>
            </h1>
            <p className="text-[10px] text-gray-600 mt-2 tracking-[0.2em]">TERMINAL_STATUS: <span className="text-green-500">ONLINE</span></p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-600 uppercase">Active_Nodes</div>
            <div className="text-2xl text-white font-light">{activePlayers.length}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activePlayers.map((player) => (
            <LiveCard key={player.id} player={player} />
          ))}
        </div>
      </div>
    </main>
  );
}