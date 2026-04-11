"use client";
import { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AgentUplink() {
  const [active, setActive] = useState(false);
  const [token, setToken] = useState("");
  const [currentId, setCurrentId] = useState("");

  const initializeUplink = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const agentId = urlParams.get('id') || 'UNKNOWN';
    setCurrentId(agentId);

    try {
      // A. On prévient Supabase que l'agent est en ligne
      const { error } = await supabase
        .from('live_sessions')
        .insert([{ 
          player_id: agentId, 
          bounty: Math.floor(Math.random() * 5000) + 1000 // Prix de départ au hasard pour le test
        }]);

      if (error) throw error;

      // B. On récupère le token de stream
      const resp = await fetch(`/api/get-participant-token?room=room-${agentId}&username=Agent_${agentId}`);
      const data = await resp.json();
      
      setToken(data.token);
      setActive(true);
    } catch (err) {
      console.error("Erreur d'initialisation:", err);
      alert("Échec de la liaison avec le centre de commande.");
    }
  };

  // Optionnel : Supprimer la session quand on ferme la page (Furtivité)
  useEffect(() => {
    return () => {
      // Ici on pourrait ajouter une logique pour supprimer la ligne Supabase au départ
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-[#a855f7] font-mono flex flex-col items-center justify-center p-6 text-center">
      {!active ? (
        <div className="space-y-8">
          <div className="w-24 h-24 border-2 border-[#a855f7] rounded-full mx-auto animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 border border-[#a855f7] rounded-full"></div>
          </div>
          <h1 className="tracking-[0.5em] text-xl">NORD.VANTIX_UPLINK</h1>
          <p className="text-[10px] text-[#a855f7]/60">EN ATTENTE D'AUTORISATION DU TERMINAL</p>
          <button 
            onClick={initializeUplink}
            className="px-10 py-4 border border-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all uppercase text-xs tracking-[0.3em]"
          >
            ACTIVER_LIAISON_SATELLITE
          </button>
        </div>
      ) : (
        <div className="w-full h-screen relative">
          <LiveKitRoom
            video={true} audio={false} token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect={true}
          >
            <VideoConference />
          </LiveKitRoom>
        </div>
      )}
    </main>
  );
}