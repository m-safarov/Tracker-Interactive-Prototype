import { create } from "zustand";

interface CycleDetailStore {
  selectedIds: string[];
  setSelectedIds: (selectedIds: string[]) => void;
}

export const useCycleDetailStore = create<CycleDetailStore>((set) => ({
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
}));
