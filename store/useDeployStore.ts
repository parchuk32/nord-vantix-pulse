import { create } from 'zustand';

interface DeployState {
  hardwareReady: boolean; networkStable: boolean; aiApproved: boolean; safetyValid: boolean;
  logs: string[]; riskLevel: 'LOW' | 'MID' | 'EXTREME'; payout: number;
  // Real Settings
  streamConfig: { quality: string; overlayColor: string; lowLatency: boolean };
  setModuleStatus: (module: string, status: boolean) => void;
  addLog: (msg: string) => void;
  setRisk: (level: 'LOW' | 'MID' | 'EXTREME') => void;
  updateSettings: (newSettings: any) => void;
  isSystemReady: () => boolean;
}

export const useDeployStore = create<DeployState>((set, get) => ({
  hardwareReady: false, networkStable: false, aiApproved: false, safetyValid: false,
  logs: ["[SYSTEM] Initialization sequence started..."],
  riskLevel: 'MID', payout: 7500,
  streamConfig: { quality: '4K_ULTRA', overlayColor: '#00FFC2', lowLatency: true },
  
  addLog: (msg) => set((s) => ({ logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...s.logs].slice(0, 15) })),
  setModuleStatus: (mod, stat) => set((s) => ({ ...s, [mod]: stat })),
  setRisk: (level) => {
    const mult = { LOW: 0.5, MID: 1, EXTREME: 2.5 };
    set({ riskLevel: level, payout: 7500 * mult[level] });
  },
  updateSettings: (newSettings) => set((s) => ({ streamConfig: { ...s.streamConfig, ...newSettings } })),
  isSystemReady: () => {
    const s = get();
    return s.hardwareReady && s.networkStable && s.aiApproved && s.safetyValid;
  }
}));