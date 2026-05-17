'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { useWallets } from '@/hooks/use-wallets'
import { useUIStore } from '@/stores/ui-store'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { formatCurrency } from '@/utils/currency'
import { Skeleton } from '@/components/ui/skeleton'

export function BalanceHeader() {
  const { totalUSD, totalBOB, balanceByUSD, balanceByBOB, isLoading } = useWallets()
  const { bobPerUsd } = useExchangeRateStore()
  const { privacyMode, togglePrivacyMode } = useUIStore()

  if (isLoading) {
    return (
      <div
        className="rounded-3xl p-6 space-y-3"
        style={{ background: 'linear-gradient(145deg, #1B2C6E 0%, #1E40AF 50%, #2563EB 100%)' }}
      >
        <Skeleton className="h-3 w-28 bg-white/15" />
        <Skeleton className="h-12 w-44 bg-white/20" />
        <Skeleton className="h-3 w-36 bg-white/15" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="flex-1 h-[72px] bg-white/15" />
          <Skeleton className="flex-1 h-[72px] bg-white/15" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1B2C6E 0%, #1E40AF 50%, #2563EB 100%)',
        boxShadow: '0 24px 64px rgba(30, 64, 175, 0.4)',
      }}
    >
      {/* Orb decorations */}
      <div
        className="absolute -top-16 -right-16 w-52 h-52 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Label row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/55 text-[11px] font-semibold tracking-[0.12em] uppercase">
            Patrimonio total
          </span>
          <button
            onClick={togglePrivacyMode}
            className="text-white/50 p-1 -mr-1 active:text-white/80 transition-colors"
          >
            {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Main balance */}
        <motion.p
          key={privacyMode ? 'hidden' : 'visible'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[42px] font-bold text-white tracking-tight leading-none"
        >
          {privacyMode ? '••••••' : formatCurrency(totalUSD, 'USD')}
        </motion.p>

        {/* BOB conversion */}
        <p className="text-white/45 text-sm mt-2 mb-5 font-medium">
          {privacyMode ? '≈ ••••••' : `≈ ${formatCurrency(totalBOB, 'BOB')}`}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-white/10 mb-4" />

        {/* Currency sub-cards */}
        <div className="flex gap-3">
          <div
            className="flex-1 rounded-2xl px-4 py-3.5"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-[7px] h-[7px] rounded-full bg-white/70" />
              <span className="text-white/55 text-[10px] font-semibold tracking-widest">USD</span>
            </div>
            <span className="text-white font-semibold text-[15px] leading-none">
              {privacyMode ? '••••' : formatCurrency(balanceByUSD, 'USD')}
            </span>
          </div>
          <div
            className="flex-1 rounded-2xl px-4 py-3.5"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: '#FBBF24' }} />
              <span className="text-white/55 text-[10px] font-semibold tracking-widest">BOB</span>
            </div>
            <span className="text-white font-semibold text-[15px] leading-none">
              {privacyMode ? '••••' : formatCurrency(balanceByBOB, 'BOB')}
            </span>
          </div>
        </div>

        {/* Rate footnote */}
        <p className="text-white/30 text-[11px] mt-3.5 text-right">
          1 USD = {bobPerUsd} BOB
        </p>
      </div>
    </motion.div>
  )
}

