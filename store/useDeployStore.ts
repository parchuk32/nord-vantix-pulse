import { create } from 'zustand';

interface DeployState {
  // --- ÉTATS DE DÉPLOIEMENT ---
  hardwareReady: boolean;
  networkStable: boolean;
  aiApproved: boolean;
  safetyValid: boolean;
  isLive: boolean;
  
  // --- DONNÉES DE MISSION ---
  logs: string[];
  riskLevel: 'LOW' | 'MID' | 'EXTREME';
  payout: number;
  
  // --- RÉGLAGES RÉELS (PROD) ---
  settings: {
    account: { username: string; status: string; reputation: number };
    notifications: { alerts: boolean; tacticalComms: boolean };
    appearance: { accentColor: string; crtEffect: boolean; quality: string };
    privacy: { stealthMode: boolean; dataEncryption: string };
  };

  // --- ACTIONS ---
  setModuleStatus: (module: string, status: boolean) => void;
  addLog: (msg: string) => void;
  setRisk: (level: 'LOW' | 'MID' | 'EXTREME') => void;
  updateSettings: (category: string, newSettings: any) => void;
  isSystemReady: () => boolean;
}

export const useDeployStore = create<DeployState>((set, get) => ({
  // Initialisation
  hardwareReady: false,
  networkStable: false,
  aiApproved: false,
  safetyValid: false,
  isLive: false,
  
  logs: ["[SYSTEM] Pulse_OS v4.0 initialized..."],
  riskLevel: 'MID',
  payout: 7500,

  // Données Utilisateur & Préférences
  settings: {
    account: { username: 'TRISTAN', status: 'OPERATOR_ELITE', reputation: 450 },
    notifications: { alerts: true, tacticalComms: true },
    appearance: { accentColor: '#00FFC2', crtEffect: true, quality: '4K_ULTRA' },
    privacy: { stealthMode: false, dataEncryption: 'AES-256' },
  },

  // Logique des Logs
  addLog: (msg) => set((s) => ({ 
    logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...s.logs].slice(0, 15) 
  })),

  // Gestion des Modules
  setModuleStatus: (mod, stat) => set((s) => ({ ...s, [mod]: stat })),

  // Calcul dynamique du Payout
  setRisk: (level) => {
    const mult = { LOW: 0.5, MID: 1, EXTREME: 2.5 };
    set({ riskLevel: level, payout: 7500 * mult[level] });
  },

  // Mise à jour des catégories de Settings
  updateSettings: (category, newSettings) => set((s) => ({
    settings: {
      ...s.settings,
      [category]: { ...s.settings[category as keyof typeof s.settings], ...newSettings }
    }
  })),

  // Le "Gatekeeper" avant le Live
  isSystemReady: () => {
    const s = get();
    // On peut ajouter networkStable ici si tu veux forcer un bon ping avant le live
    return s.aiApproved && s.safetyValid; 
  }
}));