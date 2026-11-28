import { create } from "zustand";

interface CalendarStore {
  today: Date | null;
  selectedMonth: Date | null;
  search: string;
  setToday: (today: Date) => void;
  setSearch: (search: string) => void;
  moveMonth: (direction: -1 | 1, defaultMonth: Date) => void;
  goToToday: () => void;
  reset: () => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  today: null,
  selectedMonth: null,
  search: "",
  setToday: (today) => set({ today }),
  setSearch: (search) => set({ search }),
  moveMonth: (direction, defaultMonth) => set((state) => {
    const current = state.selectedMonth ?? state.today ?? defaultMonth;
    return { selectedMonth: new Date(current.getFullYear(), current.getMonth() + direction, 1) };
  }),
  goToToday: () => set({ today: new Date(), selectedMonth: null }),
  reset: () => set({ today: null, selectedMonth: null, search: "" }),
}));
