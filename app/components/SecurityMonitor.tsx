"use client";
import { useTracks, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';

export default function SecurityMonitor() {
  // NOUVELLE MÉTHODE : On demande directement au serveur LiveKit 
  // de nous donner toutes les pistes "Caméra" actives.
  const tracks = useTracks([Track.Source.Camera]);

  if (tracks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/80 border border-red-500/30">
        <span className="text-red-500 animate-pulse font-mono text-xs tracking-widest">
          AWAITING_SIGNAL // NO_VIDEO_FEED
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full grid grid-cols-1 gap-2 p-2">
      {tracks.map((trackRef) => (
        <div key={trackRef.participant.sid} className="relative w-full h-full border border-[#a855f7]/30 bg-black overflow-hidden rounded-md group">
          
          {/* On passe directement la référence officielle générée par useTracks */}
          <VideoTrack
            trackRef={trackRef}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          
          {/* Overlay d'information (Style Cyberpunk) */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono border border-[#a855f7]/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[#a855f7] uppercase font-bold">
              {trackRef.participant.identity}
            </span>
          </div>
          
          <div className="absolute top-2 right-2 text-[8px] font-mono text-[#a855f7]/50">
            REC // ENCRYPTED
          </div>
        </div>
      ))}
    </div>
  );
}