import { create } from 'zustand';

/**
 * Minimal UI store to verify Zustand is configured correctly.
 * Will be expanded with auth state, sidebar state, etc. in later tasks.
 */
const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

export default useUIStore;
