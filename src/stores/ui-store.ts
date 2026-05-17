'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  privacyMode: boolean
  pinEnabled: boolean
  isLocked: boolean
  togglePrivacyMode: () => void
  lockApp: () => void
  unlockApp: () => void
  setPinEnabled: (enabled: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      privacyMode: false,
      pinEnabled: false,
      isLocked: false,
      togglePrivacyMode: () => set((s) => ({ privacyMode: !s.privacyMode })),
      lockApp: () => set({ isLocked: true }),
      unlockApp: () => set({ isLocked: false }),
      setPinEnabled: (enabled) => set({ pinEnabled: enabled }),
    }),
    { name: 'smb-ui' }
  )
)
