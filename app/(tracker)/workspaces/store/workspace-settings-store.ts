import { create } from "zustand";

interface WorkspaceSettingsStore {
  newOwnerId: string;
  setNewOwnerId: (newOwnerId: string) => void;
}

export const useWorkspaceSettingsStore = create<WorkspaceSettingsStore>((set) => ({
  newOwnerId: "",
  setNewOwnerId: (newOwnerId) => set({ newOwnerId }),
}));
