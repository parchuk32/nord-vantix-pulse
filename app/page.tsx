"use client";

import Link from "next/link";
import {
  Shield,
  Wifi,
  Globe,
  Activity,
  Lock,
  Eye,
  Zap,
  TrendingUp,
  Server,
  Users,
  Clock,
  ChevronRight,
  Radio,
} from "lucide-react";

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function TopBar() {
  return (
    <header className="top-bar fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-violet-400 animate-ping opacity-60" />
        </div>
        <span className="text-xs tracking-[0.3em] text-violet-300 font-bold uppercase">NORD.VANTIX</span>
        <span className="text-xs text-slate-600 tracking-widest">::</span>
        <span className="text-xs tracking-[0.3em] text-slate-400 uppercase">PULSE</span>
      </div>

      <div className="flex items-center gap-6 text-[0.6rem] tracking-[0.2em] text-slate-500 uppercase">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3 h-3 text-violet-400" />
          <span className="text-slate-300">WATCHERS:</span>
          <span className="text-violet-300 font-bold animate-blink">842</span>
          <span className="text-green-400">(LIVE)</span>
        </span>
        <span className="hidden md:flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-violet-400" />
          <span className="text-slate-300">CLAN:</span>
          <span className="text-violet-300 font-bold">NORD.VANTIX</span>
        </span>
      </div>
    </header>
  );
}

function SystemInfoTopLeft() {
  return (
    <div className="absolute top-20 left-4 z-20 text-[0.55rem] tracking-[0.15em] text-slate-500 leading-5 animate-hud-appear opacity-0" style={{ animationDelay: "0.3s" }}>
      <div className="flex items-center gap-2">
        <Clock className="w-2.5 h-2.5 text-violet-500" />
        <span className="text-slate-400">INITIALIZING...</span>
      </div>
      <div>SESSION: <span className="text-violet-400">EUE29PTFB</span></div>
      <div>LATENCY: <span className="text-green-400">L460</span></div>
      <div className="mt-1 text-violet-600/50">▓▓▓▓▒▒░░ 78%</div>
    </div>
  );
}

interface HudRow {
  label: string;
  value: string;
  status?: "ok" | "warn" | "danger" | "neutral";
}

function HudPanel({ title, rows, className, icon: Icon, floatClass, delayClass }: { 
  title: string; 
  rows: HudRow[]; 
  className?: string; 
  icon: React.ElementType; 
  floatClass?: string; 
  delayClass?: string; 
}) {
  const statusColor = (s?: string) => {
    switch (s) {
      case "ok": return "hud-value-highlight";
      case "warn": return "hud-value-warn";
      case "danger": return "hud-value-danger";
      default: return "hud-value";
    }
  };

  return (
    <div className={`hud-panel p-3 w-44 animate-hud-appear opacity-0 ${floatClass ?? ""} ${delayClass ?? ""} ${className ?? ""}`}>
      <div className="hud-label flex items-center gap-1.5 uppercase tracking-widest text-[0.6rem]">
        <Icon className="w-2.5 h-2.5 text-violet-400" />
        {title}
      </div>
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between items-center mb-1">
          <span className="text-[0.55rem] tracking-wider text-slate-500 uppercase">{r.label}</span>
          <span className={`${statusColor(r.status)} font-bold`}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function NetworkNode({ x, y, delay }: { x: string; y: string; delay: string }) {
  return (
    <div className="node absolute" style={{ left: x, top: y }}>
      <div className="node-dot" />
      <div className="node-ping" style={{ animationDelay: delay }} />
    </div>
  );
}

function CentralOrb() {
  return (
    <div className="orb-container">
      <div className="absolute rounded-full" style={{ width: 420, height: 420, background: "radial-gradient(circle, rgba(109,40,217,0.15) 0%, transparent 70%)", filter: "blur(20px)" }} />
      <div className="orb-ring orb-ring-3" />
      <div className="orb-ring orb-ring-2" />
      <div className="orb-ring orb-ring-1" />
      <div className="orb-radar" />
      <div className="orb-core" />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="glitch-wrapper">
          <div className="glitch-text-r" aria-hidden="true">PULSE</div>
          <div className="glitch-text-b" aria-hidden="true">PULSE</div>
          <h1 className="glitch-text text-white font-black italic">PULSE</h1>
        </div>
        <p className="text-[0.6rem] tracking-[0.4em] text-violet-300/70 mt-1 uppercase font-bold">Tactical Operations Hub</p>
      </div>
    </div>
  );
}

const NODES = [
  { x: "22%", y: "28%", delay: "0s" },
  { x: "38%", y: "18%", delay: "0.5s" },
  { x: "64%", y: "22%", delay: "1.1s" },
  { x: "71%", y: "38%", delay: "0.3s" },
  { x: "55%", y: "62%", delay: "0.8s" },
  { x: "30%", y: "58%", delay: "1.4s" },
  { x: "78%", y: "55%", delay: "0.6s" },
  { x: "15%", y: "45%", delay: "1.8s" },
];

export default function PulseLandingPage() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-void flex flex-col font-mono">
      <div className="scanline" />
      <TopBar />
      <main className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div className="world-map-bg" />
        <div className="tactical-grid">
          <div className="tactical-grid-inner" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(76,29,149,0.25) 0%, transparent 70%), radial-gradient(ellipse 100% 100% at 50% 100%, rgba(15,5,40,0.9) 0%, transparent 60%)" }} />
        
        {NODES.map((n, i) => (
          <NetworkNode key={i} x={n.x} y={n.y} delay={n.delay} />
        ))}

        <div className="absolute left-4 top-1/3 z-20 flex flex-col gap-3 animate-float-a">
          <HudPanel title="SYS STATUS" icon={Server} rows={[{ label: "EU-WEST", value: "ONLINE", status: "ok" }, { label: "AP-EAST", value: "ONLINE", status: "ok" }, { label: "US-EAST", value: "DEGRAD", status: "warn" }, { label: "TOR", value: "ACTIVE", status: "ok" }]} />
          <HudPanel title="STREAMS" icon={Radio} rows={[{ label: "LIVE", value: "7", status: "ok" }, { label: "WATCHERS", value: "842", status: "ok" }, { label: "PING", value: "14ms", status: "ok" }, { label: "PKT LOSS", value: "0.01%", status: "warn" }]} />
        </div>

        <div className="absolute right-4 top-1/3 z-20 flex flex-col gap-3 animate-float-b">
          <HudPanel title="PAYOUTS" icon={TrendingUp} rows={[{ label: "RANK #1", value: "$48,200", status: "ok" }, { label: "RANK #2", value: "$31,000", status: "ok" }, { label: "RANK #3", value: "$18,500", status: "warn" }, { label: "RANK #4", value: "$9,750", status: "neutral" }]} />
          <HudPanel title="MARKET" icon={Activity} rows={[{ label: "BTC", value: "$94,320", status: "ok" }, { label: "ETH", value: "$3,442", status: "ok" }, { label: "GOLD", value: "$3,118", status: "danger" }]} />
        </div>

        <SystemInfoTopLeft />
        <div className="absolute top-20 right-4 z-20 text-[0.55rem] tracking-[0.15em] text-slate-600 leading-5 text-right animate-hud-appear opacity-0 delay-400">
          <div className="flex items-center justify-end gap-2 text-amber-400/70 uppercase">
            <Zap className="w-2.5 h-2.5 text-amber-400" /> DATA STREAM
          </div>
          <div>NODES: <span className="text-violet-400">8 / 8</span></div>
          <div>ENCRYPT: <span className="text-green-400">AES-256</span></div>
          <div>KILL SW: <span className="text-red-400">ARMED</span></div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-0">
          <CentralOrb />
          <div className="flex items-center gap-4 mt-6 z-10 animate-hud-appear opacity-0 delay-500">
            <Link href="/terminal" className="btn-primary">
              <Eye className="w-3 h-3" /> WATCHER
            </Link>
            <Link href="/register" className="btn-secondary">
              <ChevronRight className="w-3 h-3" /> PLAYER
            </Link>
          </div>
        </div>

        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="flex items-center justify-between px-6 z-10 w-full max-w-2xl animate-hud-appear opacity-0 delay-700 font-bold">
            <span className="text-[0.55rem] tracking-[0.2em] text-slate-600 uppercase flex items-center gap-1.5">
              <Lock className="w-2.5 h-2.5 text-green-500" /> ENCRYPTION: AES-256 <span className="text-green-400">(ACTIVE)</span>
            </span>
            <span className="text-[0.55rem] tracking-[0.2em] text-slate-600 uppercase flex items-center gap-1.5">
              <Globe className="w-2.5 h-2.5 text-violet-500" /> PLAYER LOCATION
            </span>
            <span className="text-[0.6rem] tracking-[0.1em] text-violet-300">$1,244,500</span>
          </div>
        </div>
      </main>

      {/* FOOTER TICKER */}
      <footer className="bottom-bar fixed bottom-0 left-0 right-0 z-50">
        <div className="ticker-wrap bg-black/80 border-t border-violet-500/30 overflow-hidden whitespace-nowrap py-1">
          <div className="ticker-content flex items-center animate-ticker text-[0.6rem] tracking-widest text-slate-500 uppercase">
            {[
              { label: "AES-256", value: "ACTIVE" },
              { label: "SERVER", value: "OPTIMAL" },
              { label: "PLAYERS", value: "12" },
              { label: "PRIZE_POOL", value: "$1.2M" },
              { label: "BTC/USD", value: "94,320.44" },
              { label: "GOLD/OZ", value: "3,118.90" },
              { label: "STATUS", value: "EU-WEST OK" }
            ].map((item, i) => (
              <span key={i} className="mx-6">
                <span className="text-violet-500 mr-2">▸</span>
                {item.label}: <span className="text-slate-300 font-bold">{item.value}</span>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}