'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ExchangeRateState {
  bobPerUsd: number
  lastUpdated: string | null
  setRate: (rate: number) => void
}

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set) => ({
      bobPerUsd: 6.97,
      lastUpdated: null,
      setRate: (rate) =>
        set({ bobPerUsd: rate, lastUpdated: new Date().toISOString() }),
    }),
    { name: 'smb-exchange-rate' }
  )
)
