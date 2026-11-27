import { create } from "zustand";

interface WorkspaceMembersStore {
  selectedUserId: string;
  role: string;
  setSelectedUserId: (selectedUserId: string) => void;
  setRole: (role: string) => void;
}

export const useWorkspaceMembersStore = create<WorkspaceMembersStore>((set) => ({
  selectedUserId: "",
  role: "",
  setSelectedUserId: (selectedUserId) => set({ selectedUserId }),
  setRole: (role) => set({ role }),
}));
