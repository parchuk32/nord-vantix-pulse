import { create } from 'zustand';

interface DeployState {
  hardwareReady: boolean; networkStable: boolean; aiApproved: boolean; safetyValid: boolean;
  logs: string[]; riskLevel: 'LOW' | 'MID' | 'EXTREME'; payout: number;
  setModuleStatus: (module: string, status: boolean) => void;
  addLog: (msg: string) => void;
  setRisk: (level: 'LOW' | 'MID' | 'EXTREME') => void;
  isSystemReady: () => boolean;
}

export const useDeployStore = create<DeployState>((set, get) => ({
  hardwareReady: false, networkStable: false, aiApproved: false, safetyValid: false,
  logs: ["[SYSTEM] Initialization sequence started..."],
  riskLevel: 'MID', payout: 7500,
  addLog: (msg) => set((s) => ({ logs: [`[${new Date().toLocaleTimeString()}] ${msg}`, ...s.logs].slice(0, 15) })),
  setModuleStatus: (mod, stat) => set((s) => ({ ...s, [mod]: stat })),
  setRisk: (level) => {
    const mult = { LOW: 0.5, MID: 1, EXTREME: 2.5 };
    set({ riskLevel: level, payout: 7500 * mult[level] });
  },
  isSystemReady: () => {
    const s = get();
    return s.hardwareReady && s.networkStable && s.aiApproved && s.safetyValid;
  }
}));