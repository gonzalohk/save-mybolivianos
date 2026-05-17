'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

interface ExchangeRateState {
  bobPerUsd: number
  lastUpdated: string | null
  setRate: (rate: number) => void
  /** Carga el tipo de cambio desde el user metadata de Supabase (sin llamada extra a la API). */
  syncFromUser: (rate?: number) => void
}

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set) => ({
      bobPerUsd: 6.97,
      lastUpdated: null,
      setRate: (rate) => {
        set({ bobPerUsd: rate, lastUpdated: new Date().toISOString() })
        // Persiste en el user metadata para sincronizar entre dispositivos
        createClient().auth.updateUser({ data: { bob_per_usd: rate } })
      },
      syncFromUser: (rate?: number) => {
        if (rate && typeof rate === 'number' && rate > 0) {
          set({ bobPerUsd: rate })
        }
      },
    }),
    { name: 'smb-exchange-rate' }
  )
)
