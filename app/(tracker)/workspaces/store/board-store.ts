import { create } from "zustand";

interface BoardStore {
  moved: boolean;
  setMoved: (moved: boolean) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  moved: false,
  setMoved: (moved) => set({ moved }),
}));
