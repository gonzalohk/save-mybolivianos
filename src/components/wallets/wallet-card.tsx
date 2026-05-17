'use client'

import { motion } from 'framer-motion'
import { WALLET_TYPES } from '@/types/app.types'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import { Badge } from '@/components/ui/badge'
import type { Wallet } from '@/types/app.types'

interface WalletCardProps {
  wallet: Wallet
  onClick?: () => void
}

export function WalletCard({ wallet, onClick }: WalletCardProps) {
  const typeConfig = WALLET_TYPES.find((t) => t.type === wallet.type)

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl p-4 cursor-pointer shrink-0 w-48"
      style={{
        background: `linear-gradient(135deg, ${wallet.color}22 0%, ${wallet.color}08 100%)`,
        border: `1px solid ${wallet.color}33`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${wallet.color}20` }}
        >
          {typeConfig?.icon ?? '💰'}
        </div>
        <Badge
          label={wallet.currency}
          variant={wallet.currency === 'USD' ? 'success' : 'warning'}
          size="sm"
        />
      </div>

      <p className="text-xs text-muted mb-1 truncate">{wallet.name}</p>
      <CurrencyDisplay
        amount={wallet.balance}
        currency={wallet.currency}
        className="text-lg font-bold text-white block"
      />
    </motion.div>
  )
}
