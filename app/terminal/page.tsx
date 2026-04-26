"use client";
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LiveKitRoom, useTracks, VideoTrack, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { 
  ChevronLeft, Activity, Target, Fingerprint, 
  Crosshair, Search, SlidersHorizontal, ChevronDown, Check
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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin mb-4" />
      <span className="text-[10px] text-[#00FFC2] animate-pulse uppercase font-black tracking-widest">Searching_Signal...</span>
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const categories = [
    { id: "ALL_COMMS", label: "ALL_COMMS" },
    { id: "HIGH_VALUE", label: "HIGH_VALUE (>$500)" },
    { id: "STANDARD", label: "STANDARD" }
  ];

  // =========================================================================
  // VUE 1 : TERMINAL D'INTERCEPTION (STREAM)
  // =========================================================================
  if (selectedPlayer) {
    return (
      <main className="h-screen w-full bg-[#020202] font-mono text-white flex flex-col overflow-hidden p-2 gap-2 relative">
        {/* HEADER */}
        <div className="h-14 w-full border border-white/10 bg-white/[0.02] flex items-center justify-between px-6">
          <button 
            onClick={() => {setSelectedPlayer(null); setWatcherToken("");}} 
            className="flex items-center gap-2 text-gray-500 hover:text-[#00FFC2] text-[9px] font-black uppercase transition-colors"
          >
            <ChevronLeft size={14} /> Abort_Link
          </button>
          <div className="flex items-center gap-3 text-[#00FFC2]">
            <Activity size={18} className="animate-pulse" />
            <span className="text-xs italic uppercase">Monitoring_Node_{selectedPlayer.id.substring(0,6)}</span>
          </div>
          <div className="text-right">
            <span className="text-[7px] text-gray-600 block uppercase">Signal</span>
            <span className="text-[9px] text-[#00FFC2]">ENCRYPTED</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-2 overflow-hidden">
          {/* SIDEBAR GAUCHE */}
          <aside className="col-span-3 border border-white/10 p-4 flex flex-col gap-6 bg-white/[0.01]">
            <div className="flex items-center gap-2 text-[#00FFC2] border-b border-white/5 pb-2">
              <Fingerprint size={14} />
              <span className="text-[9px] font-black uppercase">Intercept_Data</span>
            </div>
            <div className="mt-auto border border-white/5 h-40 relative flex items-center justify-center bg-black">
              <Crosshair size={60} className="text-white/5 animate-pulse" />
            </div>
          </aside>

          {/* ZONE VIDÉO PRINCIPALE */}
          <section className="col-span-6 border border-white/10 bg-black relative overflow-hidden">
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
                <div className="absolute inset-0 flex items-center justify-center animate-pulse text-gray-700 text-[10px] uppercase tracking-[0.5em]">
                  Establishing_Uplink...
                </div>
             )}
             
             {/* INFO OVERLAY SUR LA VIDÉO */}
             <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent pointer-events-none">
                <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[8px] text-[#00FFC2] font-black uppercase block flex items-center gap-2">
                        <Target size={12}/> Active_Objective
                      </span>
                      <h2 className="text-xl font-black italic uppercase text-white max-w-md line-clamp-2">
                        {selectedPlayer.objective}
                      </h2>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-gray-500 uppercase block">Bounty</span>
                      <div className="text-4xl font-black text-[#00FFC2] italic">${selectedPlayer.bounty}</div>
                    </div>
                </div>
             </div>
          </section>

          {/* SIDEBAR DROITE / LOGS */}
          <aside className="col-span-3 border border-white/10 p-4 opacity-50 italic text-[9px] space-y-2 bg-white/[0.01]">
            <p className="text-gray-500">{'>'} Scanning frequencies...</p>
            {watcherToken && <p className="text-[#00FFC2]">{'>'} Uplink established.</p>}
            <p className="text-gray-500">{'>'} Intercepting packets...</p>
          </aside>
        </div>
      </main>
    );
  }

  // =========================================================================
  // VUE 2 : LISTE GLOBALE (TERMINAL HOME)
  // =========================================================================
  return (
    <main className="min-h-screen bg-[#050505] flex flex-col p-6 font-mono text-white">
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-8">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Terminal_V4</h2>
          <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-[0.2em]">Global_Encryption_Active</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-500 uppercase font-black">Active_Ops</div>
          <div className="text-5xl font-black text-[#00FFC2]">
            {filteredOps.length} <span className="text-xl text-gray-600">/ {activePlayers.length}</span>
          </div>
        </div>
      </div>

      {/* MODULE DE RECHERCHE ET FILTRES (AVEC MENU DÉROULANT) */}
      <div className="flex flex-col md:flex-row gap-0 mb-8 border border-white/10 bg-white/[0.01] items-stretch shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Barre de recherche (à gauche) */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#00FFC2]" />
          <input
            type="text"
            placeholder="SCAN_OBJECTIVES_OR_NODE_ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full bg-transparent border-none py-4 pl-14 pr-6 text-xs text-[#00FFC2] outline-none transition-colors placeholder:text-gray-700 uppercase focus:bg-white/[0.02]"
          />
        </div>
        
        {/* Séparateur vertical */}
        <div className="hidden md:block w-[1px] bg-white/10 my-2"></div>

        {/* Menu Déroulant Catégories (à droite) */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-4 h-full px-6 py-4 bg-transparent hover:bg-white/[0.02] transition-colors border-t md:border-t-0 border-white/10 min-w-[200px]"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-gray-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFC2]">
                {categories.find(c => c.id === activeCategory)?.label || "FILTER"}
              </span>
            </div>
            <ChevronDown size={14} className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Le Menu (Panel) */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-[240px] bg-[#0a0a0a] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50">
              <div className="p-2 flex flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 text-left transition-colors border border-transparent ${
                      activeCategory === cat.id 
                        ? 'bg-[#00FFC2]/10 border-[#00FFC2]/30 text-[#00FFC2]' 
                        : 'text-gray-500 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                    {activeCategory === cat.id && <Check size={12} className="text-[#00FFC2]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GRILLE DES RÉSULTATS */}
      {filteredOps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-white/5 rounded-lg bg-white/[0.01] opacity-20 italic">
          <p className="animate-pulse">{activePlayers.length === 0 ? "Waiting for active signals..." : "NO_MATCHING_SIGNALS_FOUND"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredOps.map((player) => (
            <div 
              key={player.id} 
              onClick={() => setSelectedPlayer(player)} 
              className="group relative border border-white/10 aspect-video bg-zinc-900/40 overflow-hidden hover:border-[#00FFC2] transition-all cursor-pointer shadow-2xl"
            >
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <span className="bg-black/90 px-3 py-1.5 border border-[#00FFC2]/30 text-[9px] font-black uppercase text-[#00FFC2]">
                    NODE_{player.id.substring(0, 6)}
                  </span>
                  {player.bounty >= 500 && (
                     <span className="text-[8px] text-red-500 border border-red-500/30 bg-red-500/10 px-2 py-1 uppercase tracking-widest animate-pulse">HVT</span>
                  )}
                </div>
                
                <div>
                  <div className="text-[8px] text-gray-500 uppercase tracking-widest mb-1 truncate">{player.objective}</div>
                  <div className="text-4xl font-black italic tracking-tighter group-hover:text-[#00FFC2] transition-colors">
                    ${player.bounty}
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Effet de scanline au survol */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}