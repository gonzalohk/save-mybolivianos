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

export default function DashboardPage() {
  const [showAlerts, setShowAlerts] = useState(false)
  const { count } = useAlerts()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 pt-12 pb-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-muted text-sm">Buenos días 👋</p>
          <h1 className="text-xl font-bold text-white">Mi resumen</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Campana de alertas con badge de conteo */}
          <button
            onClick={() => setShowAlerts(true)}
            className="relative w-10 h-10 bg-surface border border-line rounded-2xl flex items-center justify-center"
          >
            <Bell size={18} className={count > 0 ? 'text-amber-400' : 'text-muted'} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-error rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
          <div className="w-10 h-10 gradient-brand rounded-full flex items-center justify-center text-lg shadow-lg">
            🇧🇴
          </div>
        </div>
      </div>

      <BalanceHeader />
      <QuickStats />
      <ExchangeRateWidget />
      <RecentActivity />

      <AlertsPanel open={showAlerts} onClose={() => setShowAlerts(false)} />
    </motion.div>
  )
}
