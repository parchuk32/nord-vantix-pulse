"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  Menu, Search, User, Bell, MonitorPlay, 
  Target, Shield, Users, LayoutGrid
} from 'lucide-react';
import '@livekit/components-styles';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// --- CATÉGORIES OFFICIELLES PULSE ---
const CATEGORIES = [
  "STREET", 
  "FOOD", 
  "FITNESS", 
  "EXPLORE", 
  "PRANK", 
  "CHAOS"
];

// --- GÉNÉRATEUR DE FAUX LIVES (TEST UI) ---
const generateFakeLives = (amount: number) => {
  const mockObjectives: Record<string, string[]> = {
    "STREET": ["Faire le robot au carrefour", "Chanter dans le métro", "Demander son chemin en criant", "Convaincre un passant d'échanger sa veste"],
    "FOOD": ["Manger un oignon cru", "Challenge piment habanero", "Cul sec d'un mélange mystère", "Manger un repas sans les mains"],
    "FITNESS": ["50 pompes chrono", "Traverser le parc en poirier", "100 burpees de suite", "Sprint sur 2km"],
    "EXPLORE": ["Visiter le cimetière de nuit", "Toucher le panneau de la ville voisine", "Aller dans la ruelle sombre", "Trouver une cabine téléphonique"],
    "PRANK": ["Appeler une pizzeria pour commander un burger", "Faire croire à un ami que j'ai été arrêté", "Faux sondage absurde en rue"],
    "CHAOS": ["Le chat choisit ma coupe de cheveux", "Viewer control pendant 1h", "Je dis OUI à tout dans le chat"]
  };

  return Array.from({ length: amount }).map((_, i) => {
    const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const objectivesList = mockObjectives[randomCat];
    const randomObj = objectivesList[Math.floor(Math.random() * objectivesList.length)];
    
    return {
      id: `mock-uuid-${Math.random().toString(36).substring(2, 10)}`,
      user_id: `operator-${i}`,
      objective: randomObj,
      category: randomCat,
      bounty: Math.floor(Math.random() * 800) + 20, // Entre $20 et $820
      min_viewers: Math.floor(Math.random() * 50) + 1, // Entre 1k et 50k
      status: 'active'
    };
  });
};

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
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- MOCK FETCH (On simule l'appel backend) ---
  useEffect(() => {
    // On génère 45 faux streams pour tester la grille
    setActivePlayers(generateFakeLives(200));

    // VRAI CODE COMMENTÉ POUR ÉVITER LES REQUÊTES
    /*
    const fetchSessions = async () => {
      const { data } = await supabase.from('missions').select('*').eq('status', 'active');
      if (data) setActivePlayers(data);
    };
    fetchSessions();
    const channel = supabase.channel('terminal-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => { fetchSessions(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
    */
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

  // --- FILTRAGE LOCAL ---
  const filteredOps = activePlayers.filter(player => {
    const matchesSearch = player.objective?.toLowerCase().includes(searchQuery.toLowerCase()) || player.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "ALL" || player.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex flex-col font-sans overflow-hidden">
      
      {/* =========================================================================
          TOP NAVBAR
          ========================================================================= */}
      <nav className="h-14 bg-[#121212] border-b border-white/5 flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4 w-1/4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setSelectedPlayer(null); setActiveCategory("ALL");}}>
            <Shield size={24} className="text-[#00FFC2]" />
            <span className="font-black text-xl tracking-tight uppercase hidden sm:block">PULSE</span>
          </div>
        </div>

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

        <div className="flex items-center justify-end gap-3 w-1/4">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
            <Bell size={18} />
          </button>
          <div className="h-8 w-8 rounded-full bg-[#00FFC2] flex items-center justify-center cursor-pointer border border-black shadow-[0_0_10px_rgba(0,255,194,0.3)]">
            <User size={16} className="text-black" />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        
        {/* =========================================================================
            LEFT SIDEBAR (Navigation Catégories)
            ========================================================================= */}
        <aside className={`${isSidebarOpen ? 'w-60' : 'w-14'} bg-[#121212] border-r border-white/5 flex flex-col transition-all duration-300 shrink-0`}>
          <div className="p-3">
            <h3 className={`text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2 ${!isSidebarOpen && 'text-center'}`}>
              {isSidebarOpen ? 'Catégories' : <LayoutGrid size={16} className="mx-auto" />}
            </h3>
            
            <div className="space-y-1">
              <button 
                onClick={() => {setActiveCategory("ALL"); setSelectedPlayer(null);}}
                className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${activeCategory === "ALL" && !selectedPlayer ? 'bg-[#00FFC2]/10 text-[#00FFC2]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
              >
                {isSidebarOpen ? <span className="text-sm font-bold truncate">TOUT AFFICHER</span> : <span className="mx-auto text-xs font-black">ALL</span>}
              </button>

              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => {setActiveCategory(cat); setSelectedPlayer(null);}}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${activeCategory === cat && !selectedPlayer ? 'bg-[#00FFC2]/10 text-[#00FFC2]' : 'hover:bg-white/5 text-gray-300 hover:text-white'}`}
                >
                  {isSidebarOpen ? <span className="text-sm font-bold truncate">{cat}</span> : <span className="mx-auto text-[10px] font-black">{cat.substring(0,3)}</span>}
                </button>
              ))}
            </div>

            {isSidebarOpen && <hr className="border-white/5 my-4 mx-2" />}
            
            <h3 className={`text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-2 ${!isSidebarOpen && 'hidden'}`}>
              Top Streams
            </h3>
            <div className="space-y-1">
              {activePlayers.slice(0, 5).map(player => (
                <button 
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`w-full flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors ${selectedPlayer?.id === player.id ? 'bg-white/10' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black border border-white/10">N{player.id.substring(8,10)}</div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#121212]"></div>
                  </div>
                  {isSidebarOpen && (
                    <div className="flex-1 text-left truncate">
                      <div className="text-sm font-bold truncate">{player.objective}</div>
                      <div className="text-xs text-gray-500 truncate">{player.category}</div>
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
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="w-full bg-black aspect-video relative group border-b border-white/5">
                  {watcherToken ? (
                    <LiveKitRoom video={false} audio={true} token={watcherToken} serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL} connect={true} className="h-full w-full">
                      <VideoRenderer />
                      <RoomAudioRenderer />
                    </LiveKitRoom>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-pulse text-sm font-bold text-gray-600">Connexion au flux sécurisé...</div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">EN DIRECT</div>
                </div>

                <div className="p-6 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-[#00FFC2] flex items-center justify-center text-xl font-black shrink-0">
                    N{selectedPlayer.id.substring(8,10)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold mb-1">{selectedPlayer.objective}</h1>
                    <div className="flex items-center gap-4 text-sm font-medium mb-3">
                      <span className="text-[#00FFC2] font-bold">Opérateur {selectedPlayer.id.substring(8,14)}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">{selectedPlayer.category}</span>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-[#00FFC2]">Prime: ${selectedPlayer.bounty}</span>
                    </div>
                  </div>
                  <button className="bg-[#00FFC2] hover:bg-[#00cc99] text-black font-black uppercase text-sm px-6 py-3 rounded-md transition-colors flex items-center gap-2">
                    <Target size={18} /> Payer Prime
                  </button>
                </div>
              </div>

              {/* Chat Sidebar */}
              <div className="w-full lg:w-80 bg-[#121212] border-l border-white/5 flex flex-col shrink-0">
                <div className="h-12 border-b border-white/5 flex items-center justify-center font-bold text-sm">CHAT WATCHER</div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm">
                  <div className="text-gray-500 italic text-center text-xs">Bienvenue dans la salle cryptée.</div>
                  <div className="flex gap-2"><span className="text-[#00FFC2] font-bold">Anon_77:</span><span className="text-gray-300">Il va vraiment le faire ?</span></div>
                  <div className="flex gap-2"><span className="text-purple-400 font-bold">Watcher_X:</span><span className="text-gray-300">J'ajoute 50$ s'il court.</span></div>
                </div>
                <div className="p-4 border-t border-white/5">
                  <div className="bg-[#1f1f1f] border border-white/10 rounded-md p-2 flex items-center">
                    <input type="text" placeholder="Envoyer un message..." className="bg-transparent w-full outline-none text-sm px-2" disabled />
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* --- VUE GRILLE (DIRECTORY) --- */
            <div className="p-8 max-w-7xl mx-auto w-full">
              <h1 className="text-3xl font-black uppercase tracking-tight mb-8">
                {activeCategory === "ALL" ? "Tous les flux tactiques" : `Catégorie : ${activeCategory}`}
              </h1>
              
              {filteredOps.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-bold">Aucune transmission en cours dans cette catégorie.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredOps.map((player) => (
                    <div key={player.id} className="group cursor-pointer" onClick={() => setSelectedPlayer(player)}>
                      <div className="w-full aspect-video bg-[#1f1f1f] rounded-lg relative overflow-hidden mb-2 border border-transparent group-hover:border-[#00FFC2] transition-colors">
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded uppercase">LIVE</div>
                        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Users size={10} /> {player.min_viewers}k
                        </div>
                        <div className="w-full h-full opacity-10 flex items-center justify-center">
                          <MonitorPlay size={40} className="text-[#00FFC2] opacity-50" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                          N{player.id.substring(8,10)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <h3 className="text-sm font-bold truncate group-hover:text-[#00FFC2] transition-colors">{player.objective}</h3>
                          <span className="text-xs text-gray-400 truncate">Opérateur {player.id.substring(8,14)}</span>
                          <div className="flex gap-1 mt-1">
                            <span className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] font-bold text-gray-300 truncate">{player.category}</span>
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