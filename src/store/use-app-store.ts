import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Active modal
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  // Onboarding draft persistence
  onboardingDraft: Record<string, unknown> | null;
  setOnboardingDraft: (data: Record<string, unknown> | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Modal
      activeModal: null,
      openModal: (id) => set({ activeModal: id }),
      closeModal: () => set({ activeModal: null }),

      // Onboarding
      onboardingDraft: null,
      setOnboardingDraft: (data) => set({ onboardingDraft: data }),
    }),
    {
      name: "trademind-app-store",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        onboardingDraft: state.onboardingDraft,
      }),
    }
  )
);
