'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useWallets } from '@/hooks/use-wallets'
import { WalletCard } from '@/components/wallets/wallet-card'
import { AddWalletDrawer } from '@/components/wallets/add-wallet-drawer'
import { SkeletonWalletCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import { useRouter } from 'next/navigation'

export default function WalletsPage() {
  const router = useRouter()
  const { wallets, totalUSD, totalBOB, isLoading } = useWallets()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Cuentas</h1>
          <p className="text-muted text-sm mt-0.5">Todas tus billeteras</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Total balance */}
      {!isLoading && wallets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="gradient-dark rounded-2xl p-4 mb-5 border border-line-light"
        >
          <p className="text-xs text-muted mb-1">Balance total equivalente</p>
          <div className="flex items-end gap-3">
            <CurrencyDisplay amount={totalUSD} currency="USD" className="text-2xl font-bold text-white" />
            <CurrencyDisplay amount={totalBOB} currency="BOB" className="text-base text-muted mb-0.5" />
          </div>
        </motion.div>
      )}

      {/* Wallet grid */}
      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {[1, 2, 3].map((i) => <SkeletonWalletCard key={i} />)}
        </div>
      ) : wallets.length === 0 ? (
        <EmptyState
          icon="👛"
          title="Sin cuentas aún"
          description="Agrega tu primera cuenta para empezar a trackear tu dinero"
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus size={18} /> Agregar cuenta
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {wallets.map((wallet, i) => (
            <motion.div
              key={wallet.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <WalletCard
                wallet={wallet}
                onClick={() => router.push(`/wallets/${wallet.id}`)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <AddWalletDrawer open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
