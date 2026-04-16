import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── TYPES & UNIONS ──────────────────────────────────────────────────────────

export type RiskLevel = 'LOW' | 'MID' | 'EXTREME';
export type ConnectionMode = 'realtime' | 'optimized' | 'datasaver';
export type HudMode = 'minimal' | 'full';
export type Theme = 'cyber' | 'neon' | 'ghost' | 'blood' | 'ice';
export type ChatSize = 'small' | 'medium' | 'large';
export type MessageHistory = 10 | 50 | 100 | 500;
export type ServerRegion = 'auto' | 'eu-west' | 'us-east' | 'us-west' | 'ap-southeast';

// ─── INTERFACE DU STORE ──────────────────────────────────────────────────────

interface DeployState {
  // --- ÉTATS DE DÉPLOIEMENT ---
  hardwareReady: boolean;
  networkStable: boolean;
  aiApproved: boolean;
  safetyValid: boolean;
  isLive: boolean;
  streamToken: string | null;
  roomName: string | null;

  // --- DONNÉES DE MISSION ---
  logs: string[];
  riskLevel: RiskLevel;
  payout: number;
  signatureData: string | null;

  // --- LES 12 MODULES DE RÉGLAGES ---
  settings: {
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
    av: {
      cameraEnabled: boolean;
      micEnabled: boolean;
      selectedMicId: string | null;
      selectedCamId: string | null;
      selectedAudioOutputId: string | null;
      micTestActive: boolean;
      micVolume: number;
      voiceScrambler: boolean;
      dynamicWatermark: boolean;
      antiScreenCapture: boolean;
    };
    connection: {
      mode: ConnectionMode;
      showPing: boolean;
      autoReconnect: boolean;
      forceSync: boolean;
      serverRegion: ServerRegion;
      ping: number | null;
    };
    chat: {
      globalChatEnabled: boolean;
      privateMsgEnabled: boolean;
      antispam: boolean;
      wordFilter: boolean;
      showTimestamps: boolean;
      showAvatars: boolean;
      chatSize: ChatSize;
      chatOpacity: number;
      messageHistory: MessageHistory;
      autoTranslate: boolean;
      highlightMentions: boolean;
    };
    notifications: {
      onMessage: boolean;
      onMention: boolean;
      onAgentActivity: boolean;
      volume: number;
      pushEnabled: boolean;
      silentMode: boolean;
    };
    hud: {
      theme: Theme;
      accentColor: string;
      hudMode: HudMode;
      uiScale: number;
      animationsEnabled: boolean;
      glowEffect: boolean;
      blurEffect: boolean;
      crtEffect: boolean;
      scanlineIntensity: number;
      crosshairVisible: boolean;
    };
    performance: {
      lowPerformanceMode: boolean;
      disableAutoVideo: boolean;
      fpsLimit: number;
      disableAnimations: boolean;
      dataCompression: boolean;
      localCache: boolean;
      autoMemoryClear: boolean;
      backgroundMode: boolean;
    };
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
      ghostProtocol: boolean;
      hardwareSpoofing: boolean;
      ipMasking: boolean;
      zeroKnowledgeE2E: boolean;
    };
    data: {
      cloudBackup: boolean;
      multiDeviceSync: boolean;
      autoBurnLogs: boolean;
      panicWipeReady: boolean;
    };
    agents: {
      defaultAgent: string;
      autoJoinAgent: boolean;
      bountyNotifications: boolean;
      showAgentStats: boolean;
      defaultSpectator: boolean;
    };
    account: {
      email: string;
      plan: string;
      cardLast4: string;
      nextBilling: string;
    };
    apps: {
      discordLinked: boolean;
      telegramLinked: boolean;
      apiKey: string;
    };
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

// ─── CONFIGURATION PAR DÉFAUT ────────────────────────────────────────────────

const DEFAULT_SETTINGS: DeployState['settings'] = {
  profile: {
    username: 'OPERATOR',
    displayName: 'Operator_01',
    bio: 'NORD_VANTIX_ELITE_FORCE',
    userId: 'NVX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    avatarUrl: null,
    avatarType: 'generated',
    bannerUrl: null,
    language: 'FR',
  },
  av: {
    cameraEnabled: false,
    micEnabled: false,
    selectedMicId: null,
    selectedCamId: null,
    selectedAudioOutputId: null,
    micTestActive: false,
    micVolume: 50,
    voiceScrambler: false,
    dynamicWatermark: true,
    antiScreenCapture: true,
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
    wordFilter: true,
    showTimestamps: true,
    showAvatars: true,
    chatSize: 'medium',
    chatOpacity: 90,
    messageHistory: 100,
    autoTranslate: false,
    highlightMentions: true,
  },
  notifications: {
    onMessage: true,
    onMention: true,
    onAgentActivity: true,
    volume: 80,
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
    blurEffect: true,
    crtEffect: true,
    scanlineIntensity: 0.3,
    crosshairVisible: false,
  },
  performance: {
    lowPerformanceMode: false,
    disableAutoVideo: false,
    fpsLimit: 60,
    disableAnimations: false,
    dataCompression: true,
    localCache: true,
    autoMemoryClear: true,
    backgroundMode: false,
  },
  privacy: {
    publicProfile: false,
    showOnlineStatus: true,
    allowInvites: true,
    allowPrivateMsg: true,
    hideActivity: false,
    historyVisible: false,
    mfaEnabled: true,
    securityScore: 85,
    lastPasswordChange: new Date().toISOString(),
    ghostProtocol: false,
    hardwareSpoofing: true,
    ipMasking: false,
    zeroKnowledgeE2E: true,
  },
  data: {
    cloudBackup: true,
    multiDeviceSync: true,
    autoBurnLogs: false,
    panicWipeReady: false,
  },
  agents: {
    defaultAgent: 'GHOST-X',
    autoJoinAgent: true,
    bountyNotifications: true,
    showAgentStats: true,
    defaultSpectator: false,
  },
  account: {
    email: 'ops@nord-vantix.com',
    plan: 'ELITE_NODE',
    cardLast4: '****',
    nextBilling: '2026-12-31',
  },
  apps: {
    discordLinked: false,
    telegramLinked: false,
    apiKey: 'VTX-' + Math.random().toString(36).substr(2, 16).toUpperCase(),
  },
  referral: {
    code: 'NVX-REF-01',
    recruits: 0,
    totalEarned: 0,
  },
};

// ─── CRÉATION DU STORE ───────────────────────────────────────────────────────

export const useDeployStore = create<DeployState>()(
  persist(
    (set, get) => ({
      // État initial
      hardwareReady: false,
      networkStable: true,
      aiApproved: true,
      safetyValid: false,
      isLive: false,
      streamToken: null,
      roomName: null,
      signatureData: null,
      logs: ['[SYSTEM] Pulse_OS v4.0.2 Initialized.'],
      riskLevel: 'MID',
      payout: 7500,
      settings: DEFAULT_SETTINGS,

      // Actions
      setToken: (token, room) => set({ streamToken: token, roomName: room }),

      addLog: (msg) =>
        set((state) => ({
          logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...state.logs].slice(0, 20),
        })),

      setModuleStatus: (mod, stat) => set((state) => ({ ...state, [mod]: stat })),

      setSignature: (data) => set({ signatureData: data }),

      setRisk: (level) => {
        const multipliers: Record<RiskLevel, number> = { LOW: 0.5, MID: 1, EXTREME: 3.5 };
        set({ riskLevel: level, payout: 7500 * multipliers[level] });
      },

      updateSettings: (category, newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: {
              ...state.settings[category],
              ...newSettings,
            },
          },
        })),

      isSystemReady: () => {
        const s = get();
        return s.safetyValid && s.networkStable;
      },

      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),

      exportData: () => {
        const s = get();
        return JSON.stringify({
          exported_at: new Date().toISOString(),
          profile: s.settings.profile.username,
          config: s.settings,
        }, null, 2);
      },

      clearChatHistory: () => set({ logs: [] }),

      disconnectAllDevices: () => set({ streamToken: null, roomName: null, isLive: false }),

      setPing: (ms) =>
        set((state) => ({
          settings: {
            ...state.settings,
            connection: { ...state.settings.connection, ping: ms },
          },
        })),

      setMicVolume: (vol) =>
        set((state) => ({
          settings: {
            ...state.settings,
            av: { ...state.settings.av, micVolume: vol },
          },
        })),
    }),
    {
      name: 'vtx-pulse-storage', // Nom de la clé dans le localStorage
      partialize: (state) => ({ settings: state.settings, safetyValid: state.safetyValid }), // On ne persiste que les réglages et la validité du contrat
    }
  )
);