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
  signatureData: string | null; // Stocke l'image base64 de la signature
  
  // --- RÉGLAGES RÉELS (PROD) ---
  settings: {
    account: { 
      username: string; 
      status: string; 
      reputation: number;
      bio: string;
    };
    notifications: { alerts: boolean; tacticalComms: boolean };
    appearance: { 
      accentColor: string; 
      crtEffect: boolean; 
      quality: string;
      scanlineIntensity: number; 
    };
    privacy: { 
      stealthMode: boolean; 
      dataEncryption: string;
      showLocation: boolean;
    };
  };

  // --- ACTIONS ---
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
  signatureData: null,
  
  logs: ["[SYSTEM] Pulse_OS v4.0.2 initialized... Ready for uplink."],
  riskLevel: 'MID',
  payout: 7500,

  // Données Utilisateur & Préférences (Celles que tes inputs modifient)
  settings: {
    account: { 
      username: 'TRISTAN', 
      status: 'OPERATOR_ELITE', 
      reputation: 450,
      bio: 'CLANDESTINE_OPERATOR' 
    },
    notifications: { alerts: true, tacticalComms: true },
    appearance: { 
      accentColor: '#00FFC2', 
      crtEffect: true, 
      quality: '4K_ULTRA',
      scanlineIntensity: 0.5 
    },
    privacy: { 
      stealthMode: false, 
      dataEncryption: 'AES-256-GCM',
      showLocation: false 
    },
  },

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