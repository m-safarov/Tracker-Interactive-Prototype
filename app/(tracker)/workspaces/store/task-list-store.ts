import { create } from "zustand";

type TaskFilters = {
  search?: string;
  state?: string;
  priority?: string;
  assignee?: string;
  label?: string;
};

type TaskListStore = {
  filtersByProject: Record<string, TaskFilters>;
  setFilters: (projectId: string, values: TaskFilters) => void;
};

export const useTaskListStore = create<TaskListStore>((set) => ({
  filtersByProject: {},
  setFilters: (projectId, values) => set((store) => ({
    filtersByProject: {
      ...store.filtersByProject,
      [projectId]: { ...store.filtersByProject[projectId], ...values },
    },
  })),
}));
