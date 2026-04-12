"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Lock, User, Zap, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("AWAITING_INPUT");

  // --- AUTHENTIFICATION GOOGLE ---
  const handleGoogleAuth = async () => {
    setStatus("INITIATING_OAUTH_PROTOCOL...");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/terminal`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error("Google Auth Error:", error);
      setStatus("ERROR: OAUTH_FAILED // " + error.message.toUpperCase());
    }
  };

  // --- ENRÔLEMENT CLASSIQUE ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
       setStatus("ERROR: MISSING_INTEL");
       return;
    }
    setLoading(true);
    setStatus("ENCRYPTING_DATA...");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username, role: 'agent' } }
    });

    if (error) {
      console.error("Auth Error:", error);
      setStatus("ERROR: ACCESS_DENIED // " + error.message.toUpperCase());
      setLoading(false);
    } else {
      setStatus("SUCCESS: AGENT_ENLISTED");
      console.log("Registered:", data);
      setTimeout(() => window.location.href = "/terminal", 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* BACKGROUND FX */}
      <div className="crt-overlay z-10" />
      <div className="scanline z-10" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="w-full max-w-md bg-black border border-white/10 p-8 relative z-20 shadow-[0_0_100px_rgba(168,85,247,0.1)]">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full mb-4">
            <Shield className="text-[#a855f7]" size={32} />
          </div>
          <h1 className="text-2xl font-black italic tracking-[0.2em] uppercase">Enlistment_Portal</h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em]">Nord.Vantix // Level 01 Clearance</p>
        </div>

        {/* STATUS BAR */}
        <div className="mb-6 bg-white/5 border border-white/5 p-2 flex justify-between items-center">
          <span className="text-[8px] text-gray-500 uppercase tracking-widest">Status:</span>
          <span className={`text-[8px] font-bold uppercase ${status.includes('ERROR') ? 'text-red-500 animate-pulse' : 'text-[#a855f7]'}`}>
            {'>'} {status}
          </span>
        </div>

        {/* --- GOOGLE AUTH BUTTON --- */}
        <button 
          onClick={handleGoogleAuth}
          type="button"
          className="w-full py-4 mb-6 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-md"
        >
          {/* Logo Google en SVG Natif */}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          Execute_Google_Uplink
        </button>

        {/* SÉPARATEUR */}
        <div className="flex items-center mb-6 opacity-50">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-[8px] text-gray-400 uppercase tracking-widest">OR_MANUAL_ENLISTMENT</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* FORMULAIRE CLASSIQUE */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              required
              type="text" 
              placeholder="AGENT_ID (USERNAME)" 
              className="w-full bg-[#0a0a0a] border border-white/10 py-4 pl-12 pr-4 text-xs focus:border-[#a855f7] outline-none transition-all placeholder:text-gray-800"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              required
              type="email" 
              placeholder="SECURE_EMAIL" 
              className="w-full bg-[#0a0a0a] border border-white/10 py-4 pl-12 pr-4 text-xs focus:border-[#a855f7] outline-none transition-all placeholder:text-gray-800"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input 
              required
              type="password" 
              placeholder="ACCESS_CODE (PASSWORD)" 
              className="w-full bg-[#0a0a0a] border border-white/10 py-4 pl-12 pr-4 text-xs focus:border-[#a855f7] outline-none transition-all placeholder:text-gray-800"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 mt-2 bg-[#a855f7] text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#b975ff] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#a855f7]/20 active:scale-95"
          >
            {loading ? "PROCESSING..." : "INITIALIZE_ENLISTMENT"}
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <Link href="/" className="text-[8px] text-gray-600 uppercase hover:text-white transition-colors tracking-widest">
            {">"} Abort_Mission_Return_to_Surface
          </Link>
        </div>
      </div>

      {/* FOOTER DECO */}
      <div className="absolute bottom-4 left-4 text-[8px] text-gray-800 uppercase tracking-[0.5em] opacity-30">
        Nord.Vantix // Global_Shadow_Network
      </div>
    </main>
  );
}