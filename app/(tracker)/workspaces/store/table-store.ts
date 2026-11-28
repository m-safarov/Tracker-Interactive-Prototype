import { create } from "zustand";

export type TaskStatus = "backlog" | "todo" | "inProgress" | "inReview" | "done" | "cancelled";

interface TableStore {
  search: string;
  statusFilter: TaskStatus | null;
  setSearch: (search: string) => void;
  toggleStatus: (status: TaskStatus) => void;
  reset: () => void;
}

export const useTableStore = create<TableStore>((set) => ({
  search: "",
  statusFilter: null,
  setSearch: (search) => set({ search }),
  toggleStatus: (status) => set((state) => ({
    statusFilter: state.statusFilter === status ? null : status,
  })),
  reset: () => set({ search: "", statusFilter: null }),
}));
