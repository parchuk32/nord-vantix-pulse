"use client";
import { useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';

export default function AgentUplink() {
  const [active, setActive] = useState(false);
  const [token, setToken] = useState("");

  const initializeUplink = async () => {
    // On génère le token automatiquement pour la salle de SL0TE
    const resp = await fetch(`/api/get-participant-token?room=room-SLOTE&username=Agent_Slote`);
    const data = await resp.json();
    setToken(data.token);
    setActive(true);
  };

  return (
    <main className="min-h-screen bg-black text-[#a855f7] font-mono flex flex-col items-center justify-center p-6">
      {!active ? (
        <div className="text-center space-y-8">
          <div className="w-24 h-24 border-2 border-[#a855f7] rounded-full mx-auto animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 border border-[#a855f7] rounded-full"></div>
          </div>
          <h1 className="tracking-[0.5em] text-xl">NORD.VANTIX_UPLINK</h1>
          <button 
            onClick={initializeUplink}
            className="px-10 py-4 border border-[#a855f7] hover:bg-[#a855f7] hover:text-white transition-all uppercase text-xs tracking-[0.3em]"
          >
            Établir la liaison
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
            <div className="absolute top-4 left-4 z-50 bg-black/50 p-2 text-[8px] border border-[#a855f7]">
              ENCRYPTED_FEED // SIGNAL_STRENGTH: OPTIMAL
            </div>
          </LiveKitRoom>
        </div>
      )}
    </main>
  );
}