"use client";
import React from 'react';
import { Mail, ShieldAlert, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background FX identique à ton portail */}
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
      
      <div className="w-full max-w-md bg-black border border-[#a855f7]/30 p-8 relative z-20 shadow-[0_0_80px_rgba(168,85,247,0.1)] text-center">
        
        <div className="inline-block p-4 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full mb-6 animate-pulse">
          <Mail className="text-[#a855f7]" size={40} />
        </div>

        <h1 className="text-2xl font-black italic tracking-[0.2em] uppercase mb-4">Signal_Pending</h1>
        
        <div className="space-y-4 text-gray-400 text-xs leading-relaxed uppercase tracking-widest">
          <p>Un lien de vérification a été transmis à ton adresse sécurisée.</p>
          <div className="p-4 bg-white/5 border border-white/5 text-[10px] text-[#a855f7] italic">
            "L'accès au réseau PULSE nécessite une validation d'identité niveau 1."
          </div>
          <p className="text-[9px]">Vérifie tes courriers indésirables si le signal ne parvient pas d'ici 2 minutes.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
          <Link href="/register" className="text-[9px] text-white hover:text-[#a855f7] transition-all flex items-center justify-center gap-2">
            <ChevronLeft size={14} /> Retour au portail
          </Link>
        </div>

      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-800 uppercase tracking-[0.5em] opacity-30">
        Awaiting_Authentication_Response...
      </div>
    </main>
  );
}