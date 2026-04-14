"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shield, Lock, User, Zap, ChevronRight, LogIn, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Initialisation Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "", 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function RegisterPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("SYSTEM_READY");

  // Gestion des changements dans les champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIQUE D'AUTHENTIFICATION (LOGIN & REGISTER) ---
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(isLogin ? "VERIFYING_CLEARANCE..." : "ENCRYPTING_DATA...");

    try {
      if (isLogin) {
        // --- CONNEXION ---
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        setStatus("SUCCESS: ACCESS_GRANTED");
        setTimeout(() => router.push('/'), 1500); // Redirection vers l'accueil

      } else {
        // --- INSCRIPTION ---
        if (!formData.username) throw new Error("AGENT_ID_REQUIRED");
        if (formData.password.length < 8) throw new Error("CODE_TOO_WEAK_MIN_8_CHARS");

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: { 
            data: { username: formData.username, role: 'agent' },
            emailRedirectTo: `${window.location.origin}/`,
          }
        });

        if (error) throw error;

        // Redirection vers la page d'attente de confirmation
        setStatus("SUCCESS: REDIRECTING_TO_VERIFICATION");
        setTimeout(() => router.push('/verify-email'), 1500);
      }
    } catch (err: any) {
      setStatus(`ERROR: ${err.message.toUpperCase()}`);
      setLoading(false);
    }
  };

  // --- MOT DE PASSE OUBLIÉ ---
  const handleResetPassword = async () => {
    if (!formData.email) {
      setStatus("ERROR: ENTER_EMAIL_FIRST");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setStatus(`ERROR: ${error.message.toUpperCase()}`);
    else setStatus("SUCCESS: RESET_LINK_SENT");
  };

  // --- CALCUL DE LA FORCE DU MOT DE PASSE ---
  const getStrength = () => {
    const len = formData.password.length;
    if (len === 0) return { w: '0%', c: 'bg-gray-800' };
    if (len < 6) return { w: '33%', c: 'bg-red-500 shadow-[0_0_10px_red]' };
    if (len < 10) return { w: '66%', c: 'bg-yellow-500 shadow-[0_0_10px_yellow]' };
    return { w: '100%', c: 'bg-[#00FFC2] shadow-[0_0_10px_#00FFC2]' };
  };

  const strength = getStrength();

  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* EFFETS DE FOND */}
      <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#a855f7]/5 via-transparent to-transparent opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-md bg-black border border-white/10 p-8 relative z-20 shadow-[0_0_80px_rgba(168,85,247,0.05)]">
        
        {/* HEADER TACTIQUE */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-[#a855f7]/10 border border-[#a855f7]/30 rounded-full mb-4">
            <Shield className="text-[#a855f7]" size={32} />
          </div>
          <h1 className="text-2xl font-black italic tracking-[0.2em] uppercase">
            {isLogin ? "Access_Login" : "Enlistment_Portal"}
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em]">Nord.Vantix // Secure_Gateway_v4.2</p>
        </div>

        {/* BARRE DE STATUS DYNAMIQUE */}
        <div className="mb-6 bg-white/5 border border-white/5 p-2 flex justify-between items-center h-8">
          <span className="text-[7px] text-gray-400 uppercase tracking-widest italic">Connection: Secure</span>
          <span className={`text-[8px] font-bold uppercase ${status.includes('ERROR') ? 'text-red-500 animate-pulse' : 'text-[#a855f7]'}`}>
            {'>'} {status}
          </span>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Champ Username (Affiché uniquement pour l'inscription) */}
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7]" size={16} />
              <input 
                name="username" required type="text" placeholder="AGENT_ID (USERNAME)" 
                className="w-full bg-[#0a0a0a] border border-white/10 py-4 pl-12 pr-4 text-xs focus:border-[#a855f7] outline-none transition-all placeholder:text-gray-800"
                onChange={handleChange}
              />
            </div>
          )}

          {/* Champ Email */}
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7]" size={16} />
            <input 
              name="email" required type="email" placeholder="SECURE_EMAIL" 
              className="w-full bg-[#0a0a0a] border border-white/10 py-4 pl-12 pr-4 text-xs focus:border-[#a855f7] outline-none transition-all placeholder:text-gray-800"
              onChange={handleChange}
            />
          </div>

          {/* Champ Password */}
          <div className="relative group">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7]" size={16} />
            <input 
              name="password" required type={showPassword ? "text" : "password"} placeholder="ACCESS_CODE (PASSWORD)" 
              className="w-full bg-[#0a0a0a] border border-white/10 py-4 pl-12 pr-4 text-xs focus:border-[#a855f7] outline-none transition-all placeholder:text-gray-800"
              onChange={handleChange}
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {/* Barre de force (Uniquement pour l'inscription) */}
          {!isLogin && (
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-500 ${strength.c}`}
                style={{ width: strength.w }}
              />
            </div>
          )}

          {/* Bouton Principal */}
          <button 
            disabled={loading} type="submit"
            className="w-full py-4 bg-[#a855f7] text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#b975ff] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : isLogin ? "Authorize_Access" : "Enlist_Agent"}
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* OPTIONS DE NAVIGATION BASSE */}
        <div className="mt-6 flex flex-col gap-4 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setStatus("SYSTEM_READY"); }}
            className="text-[9px] text-gray-400 hover:text-[#a855f7] transition-colors uppercase tracking-widest"
          >
            {isLogin ? "[ Request_New_Enlistment ]" : "[ Already_Authorized?_Login ]"}
          </button>

          {isLogin && (
            <button 
              onClick={handleResetPassword}
              className="text-[8px] text-gray-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-1"
            >
              <RefreshCw size={10} /> Forgot_Access_Code?_Reset
            </button>
          )}
          
          <Link href="/" className="text-[8px] text-gray-800 uppercase hover:text-white transition-colors tracking-widest pt-4 border-t border-white/5">
            {">"} Abort_Mission_Return_to_Surface
          </Link>
        </div>
      </div>
    </main>
  );
}