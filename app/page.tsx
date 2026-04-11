"use client";

import Link from "next/link";

/* ================================================================
   TYPES
================================================================ */
interface HudRow {
  k: string;
  v: string;
  cls?: string;
}
interface MiniBar {
  label: string;
  pct: number;
  val: string;
}

/* ================================================================
   NETWORK CONNECTION SVG LINES
   (lignes diagonales entre nœuds comme dans l'image)
================================================================ */
function ConnectionLines() {
  // Coordonnées en % de la zone
  const lines = [
    { x1: "32%", y1: "22%", x2: "50%", y2: "48%" },
    { x1: "50%", y1: "48%", x2: "65%", y2: "26%" },
    { x1: "50%", y1: "48%", x2: "72%", y2: "44%" },
    { x1: "32%", y1: "22%", x2: "20%", y2: "40%" },
    { x1: "50%", y1: "48%", x2: "38%", y2: "62%" },
    { x1: "50%", y1: "48%", x2: "58%", y2: "65%" },
    { x1: "65%", y1: "26%", x2: "72%", y2: "44%" },
    { x1: "20%", y1: "40%", x2: "38%", y2: "62%" },
    { x1: "32%", y1: "22%", x2: "50%", y2: "16%" },
  ];
  return (
    <svg
      className="connections-svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {lines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(124,58,237,0.18)"
          strokeWidth="0.25"
          style={{ animation: `lineFlash ${2.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </svg>
  );
}

/* ================================================================
   NŒUDS RÉSEAU (carrés violets sur la carte)
================================================================ */
const NET_NODES = [
  { x: "30%",  y: "20%",  delay: "0s"    },
  { x: "48%",  y: "14%",  delay: "0.5s"  },
  { x: "64%",  y: "24%",  delay: "1.0s"  },
  { x: "71%",  y: "42%",  delay: "0.3s"  },
  { x: "57%",  y: "64%",  delay: "0.8s"  },
  { x: "37%",  y: "61%",  delay: "1.3s"  },
  { x: "19%",  y: "38%",  delay: "1.7s"  },
  { x: "80%",  y: "58%",  delay: "0.6s"  },
  { x: "24%",  y: "55%",  delay: "2.0s"  },
];

function NetworkNode({ x, y, delay, square }: { x: string; y: string; delay: string; square?: boolean }) {
  if (square) {
    return (
      <div className="net-node-square" style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)" }} />
    );
  }
  return (
    <div className="net-node" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
      <div className="net-node-core" />
      <div className="net-node-ping" style={{ animationDelay: delay }} />
      <div className="net-node-ping2" style={{ animationDelay: delay }} />
    </div>
  );
}

/* ================================================================
   TOPBAR
================================================================ */
function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <div className="live-dot" />
        <span className="brand-name">NORD.VANTIX</span>
        <span className="brand-sep">&nbsp;:&nbsp;</span>
        <span className="brand-sub">PULSE</span>
      </div>
      <div className="topbar-stats">
        <div className="top-stat">
          WATCHERS:&nbsp;
          <span className="top-stat-val">842</span>
          <span className="top-stat-live">&nbsp;(LIVE)</span>
        </div>
        <div className="top-stat hidden md:flex">
          CLAN:&nbsp;<span className="top-stat-val">NORD.VANTIX</span>
        </div>
      </div>
    </header>
  );
}

/* ================================================================
   SYSINFO COINS
================================================================ */
function SysInfoLeft() {
  return (
    <div className="sysinfo-block">
      <div>INITIALIZING…</div>
      <div>SESSION:&nbsp;<span className="sv">EUE29PTFB</span></div>
      <div>LATENCY:&nbsp;<span className="sg">L460</span></div>
      <div className="bar-txt">▓▓▓▓▒▒░░&nbsp;78%</div>
    </div>
  );
}

function SysInfoRight() {
  return (
    <div className="sysinfo-right">
      <div><span className="sa">⚡ DATA STREAM</span></div>
      <div>NODES:&nbsp;<span className="sv">8 / 8</span></div>
      <div>ENCRYPT:&nbsp;<span className="sg">AES-256</span></div>
      <div>KILL SW:&nbsp;<span className="sr">ARMED</span></div>
    </div>
  );
}

/* ================================================================
   HUD PANEL
================================================================ */
function HudPanel({
  title,
  rows,
  bars,
  posClass,
  floatClass,
  delayMs,
}: {
  title: string;
  rows: HudRow[];
  bars?: MiniBar[];
  posClass: string;
  floatClass?: string;
  delayMs: number;
}) {
  return (
    <div
      className={`hud-panel ${posClass} ${floatClass ?? ""}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="hud-title">{title}</div>
      {rows.map((r, i) => (
        <div key={i} className="hud-row">
          <span className="hud-key">{r.k}</span>
          <span className={`hud-val ${r.cls ?? "v-dim"}`}>{r.v}</span>
        </div>
      ))}
      {bars && (
        <div className="mini-bar-wrap">
          {bars.map((b, i) => (
            <div key={i} className="mini-bar-row">
              <span className="mini-bar-label">{b.label}</span>
              <div className="mini-bar-track">
                <div className="mini-bar-fill" style={{ width: `${b.pct}%` }} />
              </div>
              <span className="mini-bar-val">{b.val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   ORB CENTRAL
================================================================ */
function CentralOrb() {
  return (
    <div className="orb-container">
      {/* Halos diffus */}
      <div className="orb-halo-outer" />
      <div className="orb-halo-mid" />

      {/* Anneaux */}
      <div className="orb-ring-3" />
      <div className="orb-ring-2" />
      <div className="orb-ring-1" />
      <div className="orb-arc-bottom" />

      {/* Radar */}
      <div className="orb-radar" />

      {/* Noyau */}
      <div className="orb-core" />

      {/* Titre et CTA superposés */}
      <div className="title-group">
        {/* GLITCH PULSE */}
        <div className="glitch-container">
          <div className="glitch-layer glitch-layer-red" aria-hidden="true">PULSE</div>
          <div className="glitch-layer glitch-layer-cyan" aria-hidden="true">PULSE</div>
          <h1 className="glitch-main-text">PULSE</h1>
        </div>

        {/* Sous-titre */}
        <p className="subtitle-text">Tactical Operations Hub</p>

        {/* Boutons */}
        <div className="cta-row">
          <Link href="/terminal" className="cta-btn cta-btn-watcher">
            WATCHER
          </Link>
          <Link href="/register" className="cta-btn cta-btn-player">
            PLAYER
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   BOTTOM ENCRYPTION LINE
================================================================ */
function EncLine() {
  return (
    <div className="enc-line">
      <div className="enc-item">
        <span>🔒</span>
        ENCRYPTION:&nbsp;AES-256&nbsp;<span className="enc-ok">(ACTIVE)</span>
      </div>
      <div className="enc-item">
        <span>🌐</span>
        PLAYER LOCATION
      </div>
      <div className="enc-item">
        <span className="enc-prize">$1,244,500</span>
      </div>
    </div>
  );
}

/* ================================================================
   STATUS BAR
================================================================ */
function StatusBar() {
  return (
    <div className="status-bar">
      <div style={{ display: "flex", gap: 20 }}>
        <div className="sbar-item">
          🔒 AES-256&nbsp;<span className="sb-ok">ACTIVE</span>
        </div>
        <div className="sbar-item">
          SERVER_LATENCY:&nbsp;<span className="sb-ok">14MS (OPTIMAL)</span>
        </div>
        <div className="sbar-item hidden md:flex">
          ACTIVE_PLAYERS:&nbsp;<span className="sb-inf">12</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 20 }}>
        <div className="sbar-item hidden md:flex">
          GLOBAL_PRIZE_POOL:&nbsp;<span className="sb-wrn">$1.2M</span>
        </div>
        <div className="sbar-item">
          CLAN:&nbsp;<span className="sb-inf">NORD.VANTIX</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   TICKER
================================================================ */
const TICKER_ITEMS = [
  { label: "AES-256",          val: "ACTIVE",           cls: "tk-g" },
  { label: "SERVER_LATENCY",   val: "14MS (OPTIMAL)",   cls: "tk-g" },
  { label: "ACTIVE_PLAYERS",   val: "12",               cls: "tk-v" },
  { label: "GLOBAL_PRIZE_POOL",val: "$1.2M",            cls: "tk-a" },
  { label: "CLAN",             val: "NORD.VANTIX",      cls: "tk-v" },
  { label: "BTC/USD",          val: "94,320.44 ▲+2.3%", cls: "tk-g" },
  { label: "ETH/USD",          val: "3,442.17 ▲+1.1%",  cls: "tk-g" },
  { label: "GOLD/OZ",          val: "3,118.90 ▼−0.4%",  cls: "tk-r" },
  { label: "NODE_EU-WEST",     val: "ONLINE",           cls: "tk-g" },
  { label: "NODE_AP-EAST",     val: "ONLINE",           cls: "tk-g" },
  { label: "NODE_US-EAST",     val: "DEGRADED",         cls: "tk-a" },
  { label: "VPN_CHAIN",        val: "TOR→SOCKS5→OBFS4", cls: "tk-v" },
  { label: "UPTIME",           val: "99.97%",           cls: "tk-g" },
  { label: "KILL_SWITCH",      val: "ARMED",            cls: "tk-r" },
  { label: "SESSION",          val: "EUE29PTFB",        cls: "tk-w" },
];

function Ticker() {
  // Doubler pour boucle sans saut
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-strip">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="tk">
            <span className="tk-sep">▸</span>
            <span style={{ color: "rgba(100,116,139,0.55)" }}>{item.label}:</span>
            {" "}
            <span className={item.cls}>{item.val}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   PAGE PRINCIPALE
================================================================ */
export default function PulsePage() {
  return (
    <main className="pulse-stage">
      {/* Scanline mobile */}
      <div className="scanline-beam" />

      {/* Couche carte monde + ambiance */}
      <div className="world-layer" />

      {/* Grille 3D perspective */}
      <div className="grid-perspective">
        <div className="grid-surface" />
      </div>

      {/* TOPBAR */}
      <TopBar />

      {/* Infos coins */}
      <SysInfoLeft />
      <SysInfoRight />

      {/* Lignes de connexion réseau */}
      <ConnectionLines />

      {/* Nœuds réseau sur la carte */}
      {NET_NODES.map((n, i) => (
        <NetworkNode
          key={i}
          x={n.x}
          y={n.y}
          delay={n.delay}
          square={i % 3 === 1}
        />
      ))}

      {/* ── HUD GAUCHE ── */}
      <HudPanel
        title="◈ SYS STATUS"
        posClass="hud-topleft"
        floatClass="float-a"
        delayMs={200}
        rows={[
          { k: "EU-WEST", v: "ONLINE",  cls: "v-ok"  },
          { k: "AP-EAST", v: "ONLINE",  cls: "v-ok"  },
          { k: "US-EAST", v: "DEGRAD",  cls: "v-wrn" },
          { k: "TOR",     v: "ACTIVE",  cls: "v-ok"  },
          { k: "OBFS4",   v: "ACTIVE",  cls: "v-ok"  },
        ]}
        bars={[
          { label: "CPU",  pct: 74, val: "74%" },
          { label: "MEM",  pct: 58, val: "58%" },
          { label: "NET",  pct: 91, val: "91%" },
        ]}
      />

      <HudPanel
        title="◈ STREAMS"
        posClass="hud-midleft"
        floatClass="float-b"
        delayMs={400}
        rows={[
          { k: "LIVE",     v: "7",     cls: "v-ok"  },
          { k: "WATCHERS", v: "842",   cls: "v-inf" },
          { k: "PING",     v: "14ms",  cls: "v-ok"  },
          { k: "PKT LOSS", v: "0.01%", cls: "v-wrn" },
          { k: "BITRATE",  v: "4.8M",  cls: "v-ok"  },
        ]}
      />

      <HudPanel
        title="◈ CLAN STATS"
        posClass="hud-btmleft"
        floatClass="float-a"
        delayMs={600}
        rows={[
          { k: "MEMBERS",  v: "48",     cls: "v-inf" },
          { k: "RANK",     v: "#3 GLOB",cls: "v-ok"  },
          { k: "W/L",      v: "74/12",  cls: "v-ok"  },
          { k: "KDA",      v: "3.8",    cls: "v-ok"  },
        ]}
      />

      {/* ── HUD DROIT ── */}
      <HudPanel
        title="◈ PAYOUTS"
        posClass="hud-topright"
        floatClass="float-b"
        delayMs={300}
        rows={[
          { k: "RANK #1", v: "$48,200", cls: "v-ok"  },
          { k: "RANK #2", v: "$31,000", cls: "v-ok"  },
          { k: "RANK #3", v: "$18,500", cls: "v-wrn" },
          { k: "RANK #4", v: "$9,750",  cls: "v-dim" },
          { k: "POOL",    v: "$1.2M",   cls: "v-wrn" },
        ]}
      />

      <HudPanel
        title="◈ MARKET"
        posClass="hud-midright"
        floatClass="float-a"
        delayMs={500}
        rows={[
          { k: "BTC",  v: "$94,320", cls: "v-ok"  },
          { k: "ETH",  v: "$3,442",  cls: "v-ok"  },
          { k: "GOLD", v: "$3,118",  cls: "v-dng" },
          { k: "S&P",  v: "5,814",   cls: "v-ok"  },
          { k: "VOL",  v: "2.8M",    cls: "v-inf" },
        ]}
      />

      {/* ORB CENTRAL */}
      <CentralOrb />

      {/* Ligne encryption bas centre */}
      <EncLine />

      {/* Barre de status */}
      <StatusBar />

      {/* Ticker défilant */}
      <Ticker />
    </main>
  );
}
