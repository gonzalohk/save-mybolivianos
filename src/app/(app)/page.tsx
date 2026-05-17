'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { BalanceHeader } from '@/components/dashboard/balance-header'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { ExchangeRateWidget } from '@/components/dashboard/exchange-rate-widget'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { useAlerts } from '@/hooks/use-alerts'
import { useAuthStore } from '@/stores/auth-store'

export default function DashboardPage() {
  const [showAlerts, setShowAlerts] = useState(false)
  const { count } = useAlerts()
  const user = useAuthStore((s) => s.user)

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'bienvenido'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 pt-5 pb-28 space-y-3.5"
    >
      {/* Header */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="text-center">
          <p className="text-muted text-[13px]">Hola, {firstName} 👋</p>
          <h1 className="text-[24px] font-bold text-white leading-tight mt-0.5">Mi resumen</h1>
        </div>
        <button
          onClick={() => setShowAlerts(true)}
          className="absolute right-0 w-10 h-10 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <Bell size={18} className={count > 0 ? 'text-amber-400' : 'text-muted'} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-error rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>

      <BalanceHeader />
      <QuickStats />
      <ExchangeRateWidget />

      {/* Recent Activity header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-sm font-semibold text-muted">Actividad reciente</h3>
      </div>
      <RecentActivity />

      <AlertsPanel open={showAlerts} onClose={() => setShowAlerts(false)} />
    </motion.div>
  )
}
