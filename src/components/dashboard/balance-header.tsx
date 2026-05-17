'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'
import { useWallets } from '@/hooks/use-wallets'
import { useExchangeRate } from '@/hooks/use-exchange-rate'
import { useUIStore } from '@/stores/ui-store'
import { formatCurrency } from '@/utils/currency'
import { Skeleton } from '@/components/ui/skeleton'

export function BalanceHeader() {
  const { totalUSD, totalBOB, balanceByUSD, balanceByBOB, isLoading } = useWallets()
  const { bobPerUsd } = useExchangeRate()
  const { privacyMode, togglePrivacyMode } = useUIStore()

  if (isLoading) {
    return (
      <div className="gradient-brand rounded-3xl p-6 space-y-3">
        <Skeleton className="h-4 w-24 bg-white/20" />
        <Skeleton className="h-10 w-40 bg-white/30" rounded="rounded-xl" />
        <Skeleton className="h-4 w-32 bg-white/20" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="gradient-brand rounded-3xl p-6 shadow-xl shadow-brand/20 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'white', transform: 'translate(-30%, 30%)' }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/70 text-sm font-medium">Patrimonio total</span>
          <button
            onClick={togglePrivacyMode}
            className="text-white/70 p-1"
          >
            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Main balance */}
        <motion.div
          key={privacyMode ? 'hidden' : 'visible'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl font-bold text-white mb-1 tracking-tight"
        >
          {privacyMode ? '••••••' : formatCurrency(totalUSD, 'USD')}
        </motion.div>
        <p className="text-white/60 text-sm mb-5">
          {privacyMode ? '≈ ••••••' : `≈ ${formatCurrency(totalBOB, 'BOB')}`}
        </p>

        {/* Currency breakdown */}
        <div className="flex gap-4">
          <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full bg-white/80" />
              <span className="text-white/70 text-xs">USD</span>
            </div>
            <span className="text-white font-semibold text-base">
              {privacyMode ? '••••' : formatCurrency(balanceByUSD, 'USD')}
            </span>
          </div>
          <div className="flex-1 bg-white/10 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F5C518' }} />
              <span className="text-white/70 text-xs">BOB</span>
            </div>
            <span className="text-white font-semibold text-base">
              {privacyMode ? '••••' : formatCurrency(balanceByBOB, 'BOB')}
            </span>
          </div>
        </div>

        {/* Exchange rate indicator */}
        <div className="flex items-center gap-1.5 mt-4">
          <TrendingUp size={12} className="text-white/50" />
          <span className="text-white/50 text-xs">1 USD = {bobPerUsd} BOB</span>
        </div>
      </div>
    </motion.div>
  )
}
