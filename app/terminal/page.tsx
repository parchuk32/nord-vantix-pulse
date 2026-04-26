"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Menu, Search, User, Bell, MessageSquare, 
  MonitorPlay, ChevronLeft, Target, Shield, Users
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- RENDU VIDÉO SÉCURISÉ ---
function VideoRenderer() {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  if (tracks.length > 0) {
    return <VideoTrack trackRef={tracks[0]} className="absolute inset-0 w-full h-full object-cover" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
      <div className="w-12 h-12 border-4 border-[#00FFC2] border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-sm font-bold text-[#00FFC2] animate-pulse">EN ATTENTE DU SIGNAL VIDÉO...</span>
    </div>
  );
}

export default function WatcherTerminal() {
  // --- STATES ---
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [watcherToken, setWatcherToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- FETCH & REALTIME ---
  const fetchSessions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data) setActivePlayers(data);
  };

  useEffect(() => {
    fetchSessions();
    const channel = supabase
      .channel('terminal-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => { 
        fetchSessions(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- LOGIQUE DE CONNEXION AU FLUX ---
  useEffect(() => {
    if (!selectedPlayer) {
      setWatcherToken("");
      return;
    }

    const connectToStream = async () => {
      try {
        const roomName = `mission_${selectedPlayer.id}`; 
        const resp = await fetch(`/api/get-participant-token?room=${roomName}&username=WATCHER_${Math.floor(Math.random() * 1000)}`);
        const data = await resp.json();
        if (data.token) setWatcherToken(data.token);
      } catch (e) { 
        console.error("Échec de connexion:", e); 
      }
    };

    connectToStream();
  }, [selectedPlayer]);

  // --- FILTRAGE ---
  const filteredOps = activePlayers.filter(player => 
    player.objective?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    player.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      
      {/* =========================================================================
          TOP NAVBAR (Façon Twitch/Kick)
          ========================================================================= */}
      <nav className="h-14 bg-[#121212] border-b border-white/5 flex items-center justify-between px-4 z-50 shrink-0">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-4 w-1/4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
            <Menu size={20} />
          </button>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setSelectedPlayer(null)}
          >
            <Shield size={24} className="text-[#00FFC2]" />
            <span className="font-black text-xl tracking-tight uppercase hidden sm:block">
              PULSE
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="w-1/2 max-w-xl flex justify-center">
          <div className="relative w-full flex items-center bg-[#1f1f1f] border border-transparent hover:border-white/20 focus-within:border-[#00FFC2] focus-within:bg-black rounded-full overflow-hidden transition-all h-9">
            <input
              type="text"
              placeholder="Rechercher une opération..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none px-4 text-sm font-medium placeholder:text-gray-500"
            />
            <button className="h-full px-4 bg-white/5 hover:bg-white/10 flex items-center justify-center">
              <Search size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center justify-end gap-3 w-1/4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
            <Bell size={18} />
          </button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#00FFC2] to-blue-600 flex items-center justify-center cursor-pointer border border-black">
            <User size={16} className="text-black" />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        
        {/* =========================================================================
            LEFT SIDEBAR (Chaînes/Opérations Actives)
            ========================================================================= */}
        <aside className={`${isSidebarOpen ? 'w-60' : 'w-14'} bg-[#121212] border-r border-white/5 flex flex-col transition-all duration-300 shrink-0`}>
          <div className="p-3">
            <h3 className={`text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1 ${!isSidebarOpen && 'text-center'}`}>
              {isSidebarOpen ? 'Opérations Recommandées' : <MonitorPlay size={16} className="mx-auto" />}
            </h3>
            
            <div className="space-y-1">
              {activePlayers.map(player => (
                <button 
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors ${selectedPlayer?.id === player.id ? 'bg-white/10' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black border border-white/10">
                      N{player.id.substring(0,2)}
                    </div>
                    {/* Badge "En direct" */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121212]"></div>
                  </div>
                  
                  {isSidebarOpen && (
                    <div className="flex-1 text-left truncate">
                      <div className="text-sm font-bold truncate">Opérateur {player.id.substring(0,4)}</div>
                      <div className="text-xs text-gray-500 truncate">{player.objective}</div>
                    </div>
                  )}
                  
                  {isSidebarOpen && (
                    <div className="flex items-center gap-1 text-xs font-bold">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      {player.min_viewers || 1}k
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN CONTENT AREA
            ========================================================================= */}
        <main className="flex-1 flex flex-col bg-[#0a0a0a] overflow-y-auto">
          
          {selectedPlayer ? (
            /* --- VUE STREAM (THEATER MODE) --- */
            <div className="flex-1 flex flex-col lg:flex-row h-full">
              {/* Colonne Gauche: Vidéo + Infos */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Lecteur Vidéo */}
                <div className="w-full bg-black aspect-video relative group border-b border-white/5">
                  {watcherToken ? (
                    <LiveKitRoom 
                      video={false} 
                      audio={true} 
                      token={watcherToken} 
                      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} 
                      connect={true} 
                      className="h-full w-full"
                    >
                      <VideoRenderer />
                      <RoomAudioRenderer />
                    </LiveKitRoom>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse text-sm font-bold text-gray-600">Connexion au flux sécurisé...</div>
                    </div>
                  )}
                  
                  {/* Badge LIVE overlay */}
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">
                    EN DIRECT
                  </div>
                </div>

                {/* Stream Info (Sous la vidéo) */}
                <div className="p-6 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-[#00FFC2] flex items-center justify-center text-xl font-black shrink-0">
                    N{selectedPlayer.id.substring(0,2)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold mb-1">{selectedPlayer.objective}</h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <span className="text-[#00FFC2] hover:underline cursor-pointer">Opérateur {selectedPlayer.id.substring(0,6)}</span>
                      <span className="text-gray-400">Contrat Spécial</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">Tactical</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">Bounty: ${selectedPlayer.bounty}</span>
                    </div>
                  </div>
                  {/* Bouton Suivre/Soutenir */}
                  <div className="flex gap-2">
                    <button className="bg-[#00FFC2] hover:bg-[#00cc99] text-black font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-2">
                      <Target size={18} /> Soutenir
                    </button>
                  </div>
                </div>
              </div>

              {/* Colonne Droite: Chat (Mockup) */}
              <div className="w-full lg:w-80 bg-[#121212] border-l border-white/5 flex flex-col shrink-0">
                <div className="h-12 border-b border-white/5 flex items-center justify-center font-bold text-sm">
                  CHAT DE MISSION
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
                  <div className="text-gray-500 italic text-center text-xs">Bienvenue dans la salle de chat cryptée.</div>
                  <div className="flex gap-2">
                    <span className="text-blue-400 font-bold shrink-0">Overwatch:</span>
                    <span className="text-gray-200">Position confirmée, en attente de visuel.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-purple-400 font-bold shrink-0">Viper_99:</span>
                    <span className="text-gray-200">La prime vient de monter sur cette zone.</span>
                  </div>
                </div>
                <div className="p-4 border-t border-white/5">
                  <div className="bg-[#1f1f1f] border border-white/10 rounded-md p-2 flex items-center focus-within:border-[#00FFC2]">
                    <input type="text" placeholder="Envoyer un message..." className="bg-transparent w-full outline-none text-sm px-2" disabled />
                  </div>
                  <div className="flex justify-end mt-2">
                    <button className="bg-[#00FFC2]/20 text-[#00FFC2] px-3 py-1.5 rounded text-xs font-bold" disabled>Chat</button>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* --- VUE GRILLE (DIRECTORY) --- */
            <div className="p-8 max-w-7xl mx-auto w-full">
              <h1 className="text-3xl font-bold mb-8">Flux Tactiques Recommandés</h1>
              
              {filteredOps.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold">Aucune transmission en cours.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredOps.map((player) => (
                    <div key={player.id} className="group cursor-pointer" onClick={() => setSelectedPlayer(player)}>
                      
                      {/* Thumbnail */}
                      <div className="w-full aspect-video bg-[#1f1f1f] rounded-lg relative overflow-hidden mb-2 border border-transparent group-hover:border-[#00FFC2] transition-colors">
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">LIVE</div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Users size={10} /> {player.min_viewers || 1}k
                        </div>
                        {/* Simulation de miniature (Placeholder) */}
                        <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                      </div>

                      {/* Infos de la carte */}
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                          N{player.id.substring(0,2)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <h3 className="text-sm font-bold truncate group-hover:text-[#00FFC2] transition-colors" title={player.objective}>
                            {player.objective}
                          </h3>
                          <span className="text-xs text-gray-400 truncate">Opérateur {player.id.substring(0,6)}</span>
                          <div className="flex gap-1 mt-1">
                            <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold text-gray-300 truncate">Contrat</span>
                            {player.bounty >= 500 && (
                              <span className="px-2 py-0.5 bg-[#00FFC2]/20 text-[#00FFC2] rounded-full text-[10px] font-bold truncate">HVT</span>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}