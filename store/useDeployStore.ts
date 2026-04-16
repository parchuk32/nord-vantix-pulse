import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MID' | 'EXTREME';
export type ConnectionMode = 'realtime' | 'optimized' | 'datasaver';
export type HudMode = 'minimal' | 'full';
export type Theme = 'cyber' | 'neon' | 'ghost' | 'blood' | 'ice';
export type ChatSize = 'small' | 'medium' | 'large';
export type MessageHistory = 10 | 50 | 100 | 500;
export type ServerRegion = 'auto' | 'eu-west' | 'us-east' | 'us-west' | 'ap-southeast';

// ─── INTERFACE PRINCIPALE ─────────────────────────────────────────────────────

interface DeployState {
  // --- DEPLOY & LIVEKIT ---
  hardwareReady: boolean;
  networkStable: boolean;
  aiApproved: boolean;
  safetyValid: boolean;
  isLive: boolean;
  streamToken: string | null;
  roomName: string | null;

  // --- MISSION DATA ---
  logs: string[];
  riskLevel: RiskLevel;
  payout: number;
  signatureData: string | null;

  // --- ALL SETTINGS (12 MODULES) ---
  settings: {
    // 👤 PROFIL & IDENTITÉ
    profile: {
      username: string;
      displayName: string;
      bio: string;
      userId: string;
      avatarUrl: string | null;
      avatarType: 'upload' | 'generated';
      bannerUrl: string | null;
      language: string;
    };

    // 🎥 AUDIO / VIDÉO
    av: {
      cameraEnabled: boolean;
      micEnabled: boolean;
      selectedMicId: string | null;
      selectedCamId: string | null;
      selectedAudioOutputId: string | null;
      micTestActive: boolean;
      micVolume: number; // 0-100 vu-meter value
      voiceScrambler: boolean; // Brouilleur de voix
      dynamicWatermark: boolean; // Filigrane invisible anti-leak
      antiScreenCapture: boolean; // Bloque les captures d'écran (DRM)
    };

    // 📡 CONNEXION & TEMPS RÉEL
    connection: {
      mode: ConnectionMode;
      showPing: boolean;
      autoReconnect: boolean;
      forceSync: boolean;
      serverRegion: ServerRegion;
      ping: number | null; // ms, live
    };

    // 💬 CHAT AVANCÉ
    chat: {
      globalChatEnabled: boolean;
      privateMsgEnabled: boolean;
      antispam: boolean;
      wordFilter: boolean;
      showTimestamps: boolean;
      showAvatars: boolean;
      chatSize: ChatSize;
      chatOpacity: number; // 0-100
      messageHistory: MessageHistory;
      autoTranslate: boolean;
      highlightMentions: boolean;
    };

    // 🔔 NOTIFICATIONS
    notifications: {
      onMessage: boolean;
      onMention: boolean;
      onAgentActivity: boolean;
      volume: number; // 0-100
      pushEnabled: boolean;
      silentMode: boolean;
    };

    // 🎮 INTERFACE / HUD
    hud: {
      theme: Theme;
      accentColor: string;
      hudMode: HudMode;
      uiScale: number; // 80-130
      animationsEnabled: boolean;
      glowEffect: boolean;
      blurEffect: boolean;
      crtEffect: boolean;
      scanlineIntensity: number; // 0-1
      crosshairVisible: boolean;
    };

    // ⚡ PERFORMANCE & DATA
    performance: {
      lowPerformanceMode: boolean;
      disableAutoVideo: boolean;
      fpsLimit: number; // 30 | 60 | 120
      disableAnimations: boolean;
      dataCompression: boolean;
      localCache: boolean;
      autoMemoryClear: boolean;
      backgroundMode: boolean;
    };

    // 🔐 CONFIDENTIALITÉ & SÉCURITÉ
    privacy: {
      publicProfile: boolean;
      showOnlineStatus: boolean;
      allowInvites: boolean;
      allowPrivateMsg: boolean;
      hideActivity: boolean;
      historyVisible: boolean;
      mfaEnabled: boolean;
      securityScore: number;
      lastPasswordChange: string;
      ghostProtocol: boolean; // Masque toute présence réseau
      hardwareSpoofing: boolean; // Falsifie l'empreinte du navigateur (Canvas/WebGL)
      ipMasking: boolean; // Routage forcé via relais proxy
      zeroKnowledgeE2E: boolean; // Chiffrement de bout en bout strict
    };

    // 📊 DONNÉES & PERSONNALISATION
    data: {
      cloudBackup: boolean;
      multiDeviceSync: boolean;
      autoBurnLogs: boolean; // Destruction des logs à la déconnexion
      panicWipeReady: boolean; // Armement du bouton de destruction
    };

    // 🧠 AGENTS / GAMEPLAY
    agents: {
      defaultAgent: string;
      autoJoinAgent: boolean;
      bountyNotifications: boolean;
      showAgentStats: boolean;
      defaultSpectator: boolean;
    };

    // 🚪 COMPTE
    account: {
      email: string;
      plan: string;
      cardLast4: string;
      nextBilling: string;
    };

    // 🔗 APPS & INTÉGRATIONS
    apps: {
      discordLinked: boolean;
      telegramLinked: boolean;
      apiKey: string;
    };

    // 🎁 REFERRAL
    referral: {
      code: string;
      recruits: number;
      totalEarned: number;
    };
  };

  // --- ACTIONS ---
  setToken: (token: string, room: string) => void;
  setModuleStatus: (module: string, status: boolean) => void;
  addLog: (msg: string) => void;
  setRisk: (level: RiskLevel) => void;
  setSignature: (data: string) => void;
  updateSettings: <K extends keyof DeployState['settings']>(
    category: K,
    newSettings: Partial<DeployState['settings'][K]>
  ) => void;
  isSystemReady: () => boolean;
  resetSettings: () => void;
  exportData: () => string;
  clearChatHistory: () => void;
  disconnectAllDevices: () => void;
  setPing: (ms: number) => void;
  setMicVolume: (vol: number) => void;
}

// ─── VALEURS PAR DÉFAUT ───────────────────────────────────────────────────────

const DEFAULT_SETTINGS: DeployState['settings'] = {
  profile: {
    username: 'TRISTAN',
    displayName: 'Tristan',
    bio: 'OPERATOR_ELITE',
    userId: 'NVP-001-TRISTAN',
    avatarUrl: null,
    avatarType: 'generated',
    bannerUrl: null,
    language: 'EN',
  },
  av: {
    cameraEnabled: false,
    micEnabled: false,
    selectedMicId: null,
    selectedCamId: null,
    selectedAudioOutputId: null,
    micTestActive: false,
    micVolume: 0,
    voiceScrambler: false,
    dynamicWatermark: true,
    antiScreenCapture: false,
  },
  connection: {
    mode: 'realtime',
    showPing: true,
    autoReconnect: true,
    forceSync: false,
    serverRegion: 'auto',
    ping: null,
  },
  chat: {
    globalChatEnabled: true,
    privateMsgEnabled: true,
    antispam: true,
    wordFilter: false,
    showTimestamps: true,
    showAvatars: true,
    chatSize: 'medium',
    chatOpacity: 90,
    messageHistory: 50,
    autoTranslate: false,
    highlightMentions: true,
  },
  notifications: {
    onMessage: true,
    onMention: true,
    onAgentActivity: true,
    volume: 70,
    pushEnabled: true,
    silentMode: false,
  },
  hud: {
    theme: 'cyber',
    accentColor: '#00FFC2',
    hudMode: 'full',
    uiScale: 100,
    animationsEnabled: true,
    glowEffect: true,
    blurEffect: false,
    crtEffect: true,
    scanlineIntensity: 0.5,
    crosshairVisible: false,
  },
  performance: {
    lowPerformanceMode: false,
    disableAutoVideo: false,
    fpsLimit: 60,
    disableAnimations: false,
    dataCompression: false,
    localCache: true,
    autoMemoryClear: false,
    backgroundMode: false,
  },
  privacy: {
    publicProfile: true,
    showOnlineStatus: true,
    allowInvites: true,
    allowPrivateMsg: true,
    hideActivity: false,
    historyVisible: true,
    mfaEnabled: true,
    securityScore: 90,
    lastPasswordChange: '2026-04-01',
    ghostProtocol: false,
    hardwareSpoofing: true,
    ipMasking: true,
    zeroKnowledgeE2E: true,
  },
  data: {
    cloudBackup: true,
    multiDeviceSync: false,
    autoBurnLogs: true,
    panicWipeReady: false,
  },
  agents: {
    defaultAgent: 'ALPHA-7',
    autoJoinAgent: false,
    bountyNotifications: true,
    showAgentStats: true,
    defaultSpectator: false,
  },
  account: {
    email: 'ops@nord-vantix.com',
    plan: 'ULTRA_OPERATOR',
    cardLast4: '8842',
    nextBilling: '2026-05-12',
  },
  apps: {
    discordLinked: true,
    telegramLinked: false,
    apiKey: 'px_live_992x8vM4qL',
  },
  referral: {
    code: 'NORD-VANTIX-001',
    recruits: 12,
    totalEarned: 1250,
  },
};

// ─── STORE ────────────────────────────────────────────────────────────────────

export const useDeployStore = create<DeployState>()(
  persist(
    (set, get) => ({
      // Deploy statuts
      hardwareReady: false,
      networkStable: false,
      aiApproved: false,
      safetyValid: false,
      isLive: false,
      streamToken: null,
      roomName: null,
      signatureData: null,

      logs: ['[SYSTEM] Pulse_OS v4.0.2 - Full Enterprise Node Online.'],
      riskLevel: 'MID',
      payout: 7500,

      settings: DEFAULT_SETTINGS,

      // ── ACTIONS ──

      setToken: (token, room) => set({ streamToken: token, roomName: room }),

      addLog: (msg) =>
        set((s) => ({
          logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...s.logs].slice(0, 15),
        })),

      setModuleStatus: (mod, stat) => set((s) => ({ ...s, [mod]: stat })),

      setSignature: (data) => set({ signatureData: data }),

      setRisk: (level) => {
        const mult: Record<RiskLevel, number> = { LOW: 0.5, MID: 1, EXTREME: 2.5 };
        set({ riskLevel: level, payout: 7500 * mult[level] });
      },

      updateSettings: (category, newSettings) =>
        set((s) => ({
          settings: {
            ...s.settings,
            [category]: {
              ...s.settings[category],
              ...newSettings,
            },
          },
        })),

      isSystemReady: () => {
        const s = get();
        return s.aiApproved && s.safetyValid;
      },

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      exportData: () => {
        const s = get();
        const exportObj = {
          exported_at: new Date().toISOString(),
          username: s.settings.profile.username,
          settings: s.settings,
          logs: s.logs,
          riskLevel: s.riskLevel,
        };
        return JSON.stringify(exportObj, null, 2);
      },

      clearChatHistory: () => set({ logs: [] }),

      disconnectAllDevices: () =>
        set({ streamToken: null, roomName: null, isLive: false }),

      setPing: (ms) =>
        set((s) => ({
          settings: {
            ...s.settings,
            connection: { ...s.settings.connection, ping: ms },
          },
        })),

      setMicVolume: (vol) =>
        set((s) => ({
          settings: {
            ...s.settings,
            av: { ...s.settings.av, micVolume: vol },
          },
        })),
    }),
    {
      name: 'nord-vantix-pulse-store',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);