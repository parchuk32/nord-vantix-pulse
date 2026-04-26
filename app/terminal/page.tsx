"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  ChevronLeft, Activity, Target, Fingerprint, 
  Crosshair, Search, SlidersHorizontal 
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
    return <VideoTrack trackRef={tracks[0]} className="absolute inset-0 w-full h-full object-cover rounded-xl" />;
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] rounded-xl border border-white/5">
      <div className="w-10 h-10 border-2 border-[#ffa31a] border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-xs text-[#ffa31a] animate-pulse font-bold tracking-wider">Recherche du signal...</span>
    </div>
  );
}

export default function WatcherTerminal() {
  // --- STATES DE DONNÉES ---
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [watcherToken, setWatcherToken] = useState("");

  // --- STATES DE FILTRAGE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL_COMMS");

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
        
        if (data.token) {
          setWatcherToken(data.token);
        }
      } catch (e) { 
        console.error("Échec de connexion:", e); 
      }
    };

    connectToStream();
  }, [selectedPlayer]);

  // --- LOGIQUE DE FILTRAGE LOCAL ---
  const filteredOps = activePlayers.filter(player => {
    const matchesSearch = 
      player.objective?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      player.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      activeCategory === "ALL_COMMS" ||
      (activeCategory === "HIGH_VALUE" && player.bounty >= 500) ||
      (activeCategory === "STANDARD" && player.bounty < 500);

    return matchesSearch && matchesCategory;
  });

  // =========================================================================
  // VUE 1 : TERMINAL D'INTERCEPTION (STREAM)
  // =========================================================================
  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#000000] text-white flex flex-col overflow-hidden font-sans relative">
        {/* HEADER */}
        <div className="h-16 w-full bg-[#0f0f0f] border-b border-white/5 flex items-center justify-between px-6 z-10">
          <button 
            onClick={() => {setSelectedPlayer(null); setWatcherToken("");}} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b1b1b] text-gray-300 hover:text-white hover:bg-[#2a2a2a] text-sm font-bold transition-all"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <div className="flex items-center gap-3 text-[#ffa31a]">
            <Activity size={20} className="animate-pulse" />
            <span className="font-bold tracking-wide">Monitoring_Node_{selectedPlayer.id.substring(0,6)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-gray-400 font-medium">ENCRYPTÉ</span>
          </div>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
          {/* ZONE VIDÉO PRINCIPALE */}
          <section className="lg:col-span-3 bg-[#0a0a0a] rounded-2xl relative overflow-hidden shadow-2xl border border-white/5 flex flex-col">
             <div className="flex-1 relative">
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
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse text-gray-500 text-sm font-medium tracking-widest">
                    Établissement de la connexion...
                  </div>
               )}
             </div>
             
             {/* INFO BAR SOUS LA VIDÉO */}
             <div className="h-24 bg-[#0f0f0f] border-t border-white/5 p-4 flex justify-between items-center px-6">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Objectif Actif</span>
                  <h2 className="text-lg font-bold text-white max-w-2xl truncate">
                    {selectedPlayer.objective}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Prime (Bounty)</span>
                  <div className="text-3xl font-black text-[#ffa31a]">${selectedPlayer.bounty}</div>
                </div>
             </div>
          </section>

          {/* SIDEBAR DROITE / LOGS */}
          <aside className="bg-[#0f0f0f] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
              <Fingerprint size={16} /> Intercept Data
            </h3>
            <div className="flex-1 bg-[#0a0a0a] rounded-xl border border-white/5 p-4 font-mono text-xs text-gray-500 space-y-2 overflow-y-auto">
              <p>{'>'} Scan des fréquences en cours...</p>
              {watcherToken && <p className="text-[#ffa31a]">{'>'} Liaison établie avec succès.</p>}
              <p>{'>'} Interception des paquets réseau...</p>
              <p className="animate-pulse">{'>'} En attente de données...</p>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  // =========================================================================
  // VUE 2 : LISTE GLOBALE (DASHBOARD STYLE)
  // =========================================================================
  return (
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans">
      
      {/* HEADER ET RECHERCHE FIXES */}
      <div className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-white/10 px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* TOP BAR */}
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
              Terminal<span className="text-[#ffa31a]">V4</span>
            </h2>
            <div className="flex items-center gap-4 bg-[#1b1b1b] px-4 py-2 rounded-full border border-white/5">
              <div className="text-xs text-gray-400 font-bold uppercase">Opérations Actives</div>
              <div className="text-xl font-black text-white">
                {filteredOps.length} <span className="text-gray-500 text-sm">/ {activePlayers.length}</span>
              </div>
            </div>
          </div>

          {/* MODULE DE RECHERCHE FAÇON "PH" */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Barre de recherche arrondie */}
            <div className="relative flex-1 w-full">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un objectif, un ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1b1b1b] hover:bg-[#222222] border-2 border-transparent focus:border-[#ffa31a] transition-all py-3.5 pl-14 pr-6 text-sm text-white rounded-full outline-none placeholder:text-gray-500 font-medium"
              />
            </div>
            
            {/* Catégories (Pillules) */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto hide-scrollbar pb-2 md:pb-0">
              <FilterButton label="Tout afficher" active={activeCategory === "ALL_COMMS"} onClick={() => setActiveCategory("ALL_COMMS")} />
              <FilterButton label="Haute Valeur" active={activeCategory === "HIGH_VALUE"} onClick={() => setActiveCategory("HIGH_VALUE")} />
              <FilterButton label="Standard" active={activeCategory === "STANDARD"} onClick={() => setActiveCategory("STANDARD")} />
            </div>
          </div>
        </div>
      </div>

      {/* GRILLE DES RÉSULTATS */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-8">
        {filteredOps.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center rounded-3xl bg-[#0f0f0f] border border-white/5">
            <Target size={48} className="text-gray-600 mb-4" />
            <p className="text-gray-400 font-medium text-lg">
              {activePlayers.length === 0 ? "Aucun signal détecté pour le moment." : "Aucune mission ne correspond à cette recherche."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOps.map((player) => (
              <div 
                key={player.id} 
                onClick={() => setSelectedPlayer(player)} 
                className="group relative bg-[#0f0f0f] border border-white/5 rounded-2xl overflow-hidden hover:border-[#ffa31a]/50 transition-all cursor-pointer shadow-lg hover:shadow-[#ffa31a]/10 hover:-translate-y-1"
              >
                {/* Zone Image/Video placeholder */}
                <div className="aspect-video bg-[#1a1a1a] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent z-10" />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className="bg-[#ffa31a] text-black px-3 py-1 text-xs font-black rounded-full">
                      NODE_{player.id.substring(0, 6)}
                    </span>
                    {player.bounty >= 500 && (
                      <span className="bg-white text-black px-3 py-1 text-xs font-black rounded-full shadow-lg">
                        HVT
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Infos */}
                <div className="p-5 flex flex-col gap-2">
                  <h3 className="text-sm text-gray-300 font-medium line-clamp-2 min-h-[40px] group-hover:text-white transition-colors">
                    {player.objective}
                  </h3>
                  <div className="text-2xl font-black text-white mt-2 group-hover:text-[#ffa31a] transition-colors">
                    ${player.bounty}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// --- UTILS COMPONENT ---
function FilterButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-6 py-3.5 text-sm font-bold rounded-full transition-all duration-200 ${
        active
          ? 'bg-[#ffa31a] text-black shadow-[0_0_20px_rgba(255,163,26,0.2)]'
          : 'bg-[#1b1b1b] text-gray-300 hover:bg-[#2a2a2a] hover:text-white border border-transparent'
      }`}
    >
      {label}
    </button>
  );
}