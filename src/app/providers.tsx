'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)
  const syncFromUser = useExchangeRateStore((s) => s.syncFromUser)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initialize()
      .then(() => setReady(true))
      .catch(() => setReady(true))
  }, [initialize])

  // Sincroniza el tipo de cambio desde el user metadata al iniciar sesión
  // o al cambiar de cuenta. Funciona en cualquier dispositivo nuevo.
  useEffect(() => {
    syncFromUser(user?.user_metadata?.bob_per_usd)
  }, [user, syncFromUser])

  if (!ready) return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
    </div>
  )
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  )
}
