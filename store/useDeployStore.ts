import { create } from 'zustand';

interface DeployState {
  // --- ÉTATS DE DÉPLOIEMENT & LIVEKIT ---
  hardwareReady: boolean;
  networkStable: boolean;
  aiApproved: boolean;
  safetyValid: boolean;
  isLive: boolean;
  streamToken: string | null;
  roomName: string | null;
  
  // --- DONNÉES DE MISSION ---
  logs: string[];
  riskLevel: 'LOW' | 'MID' | 'EXTREME';
  payout: number;
  signatureData: string | null; // Stocke l'image base64 de la signature
  
  // --- RÉGLAGES RÉELS (PROD - 8 MODULES) ---
  settings: {
    general: { username: string; email: string; bio: string; language: string };
    security: { mfaEnabled: boolean; lastPasswordChange: string; securityScore: number };
    billing: { plan: string; cardLast4: string; nextBilling: string };
    notifications: { push: boolean; email: boolean; tacticalComms: boolean };
    apps: { discordLinked: boolean; telegramLinked: boolean; apiKey: string };
    branding: { accentColor: string; crtEffect: boolean; scanlineIntensity: number };
    referral: { code: string; recruits: number; totalEarned: number };
    sharing: { publicProfile: boolean; anonymousMode: boolean };
  };

  // --- ACTIONS ---
  setToken: (token: string, room: string) => void;
  setModuleStatus: (module: string, status: boolean) => void;
  addLog: (msg: string) => void;
  setRisk: (level: 'LOW' | 'MID' | 'EXTREME') => void;
  setSignature: (data: string) => void;
  updateSettings: (category: string, newSettings: any) => void;
  isSystemReady: () => boolean;
}

export const useDeployStore = create<DeployState>((set, get) => ({
  // Initialisation des statuts
  hardwareReady: false,
  networkStable: false,
  aiApproved: false,
  safetyValid: false,
  isLive: false,
  streamToken: null,
  roomName: null,
  signatureData: null,
  
  logs: ["[SYSTEM] Pulse_OS v4.0.2 - Full Enterprise Node Online."],
  riskLevel: 'MID',
  payout: 7500,

  // Données Utilisateur & Préférences (Les 8 colonnes max out)
  settings: {
    general: { username: 'TRISTAN', email: 'ops@nord-vantix.com', bio: 'OPERATOR_ELITE', language: 'EN' },
    security: { mfaEnabled: true, lastPasswordChange: '2026-04-01', securityScore: 90 },
    billing: { plan: 'ULTRA_OPERATOR', cardLast4: '8842', nextBilling: '2026-05-12' },
    notifications: { push: true, email: false, tacticalComms: true },
    apps: { discordLinked: true, telegramLinked: false, apiKey: 'px_live_992x8vM4qL' },
    branding: { accentColor: '#00FFC2', crtEffect: true, scanlineIntensity: 0.5 },
    referral: { code: 'NORD-VANTIX-001', recruits: 12, totalEarned: 1250 },
    sharing: { publicProfile: true, anonymousMode: false },
  },

  // Injection du Token pour LiveKit
  setToken: (token, room) => set({ streamToken: token, roomName: room }),

  // Logique des Logs : On garde les 15 derniers pour la lisibilité
  addLog: (msg) => set((s) => ({ 
    logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...s.logs].slice(0, 15) 
  })),

  // Gestion des Modules (HW, AI, SAFE, etc.)
  setModuleStatus: (mod, stat) => set((s) => ({ ...s, [mod]: stat })),

  // Enregistrement de la signature dessinée
  setSignature: (data) => set({ signatureData: data }),

  // Calcul dynamique du Payout selon le risque choisi
  setRisk: (level) => {
    const mult = { LOW: 0.5, MID: 1, EXTREME: 2.5 };
    set({ 
      riskLevel: level, 
      payout: 7500 * mult[level] 
    });
  },

  // Mise à jour profonde des catégories de Settings
  updateSettings: (category, newSettings) => set((s) => ({
    settings: {
      ...s.settings,
      [category]: { 
        ...(s.settings[category as keyof typeof s.settings] as object), 
        ...newSettings 
      }
    }
  })),

  // Le "Gatekeeper" : Si ça renvoie false, le bouton Lock & Deploy est gris
  isSystemReady: () => {
    const s = get();
    // Oblige l'IA et la Sécurité (signature) à être OK
    return s.aiApproved && s.safetyValid; 
  }
}));