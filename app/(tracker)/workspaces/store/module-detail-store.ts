import { create } from "zustand";

interface ModuleDetailStore {
  selectedIds: string[];
  setSelectedIds: (selectedIds: string[]) => void;
}

export const useModuleDetailStore = create<ModuleDetailStore>((set) => ({
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
}));
