"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Lock, User, Zap, ChevronRight, LogIn } from 'lucide-react';
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

  // --- ENRÔLEMENT (CRÉATION DE COMPTE) ---
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
      setStatus("ERROR: ENLISTMENT_FAILED // " + error.message.toUpperCase());
      setLoading(false);
    } else {
      setStatus("SUCCESS: AGENT_ENLISTED");
      setTimeout(() => window.location.href = "/terminal", 2000);
    }
  };

  // --- CONNEXION (LOGIN EXISTANT) ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
       setStatus("ERROR: CREDENTIALS_REQUIRED");
       return;
    }
    setLoading(true);
    setStatus("VERIFYING_CLEARANCE...");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login Error:", error);
      setStatus("ERROR: ACCESS_DENIED // INVALID_CREDENTIALS");
      setLoading(false);
    } else {
      setStatus("SUCCESS: CLEARANCE_GRANTED");
      setTimeout(() => window.location.href = "/terminal", 1000);
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

        {/* FORMULAIRE MANUEL */}
        <form className="space-y-4">
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

          <div className="flex gap-4 pt-2">
            <button 
              onClick={handleLogin}
              disabled={loading}
              type="button"
              className="flex-1 py-4 bg-transparent border border-gray-700 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-white hover:border-white transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogIn size={14} /> LOGIN
            </button>

            <button 
              onClick={handleRegister}
              disabled={loading}
              type="button"
              className="flex-[2] py-4 bg-[#a855f7] text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#b975ff] transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#a855f7]/20 active:scale-95"
            >
              {loading ? "PROCESSING..." : "ENLIST"}
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
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