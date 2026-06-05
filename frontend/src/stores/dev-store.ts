"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "customer" | "seller" | "admin" | "support"

interface DevStore {
  mockRole: UserRole
  setMockRole: (role: UserRole) => void
  isMockPanelOpen: boolean
  toggleMockPanel: () => void
}

export const useDevStore = create<DevStore>()(
  persist(
    (set) => ({
      mockRole: "customer",
      setMockRole: (role) => set({ mockRole: role }),
      isMockPanelOpen: false,
      toggleMockPanel: () =>
        set((s) => ({ isMockPanelOpen: !s.isMockPanelOpen })),
    }),
    { name: "aureon-dev-store" },
  ),
)
