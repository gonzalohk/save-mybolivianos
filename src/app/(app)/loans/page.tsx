'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useLoans } from '@/hooks/use-loans'
import { LoanCard } from '@/components/loans/loan-card'
import { AddLoanDrawer } from '@/components/loans/add-loan-drawer'
import { SkeletonCard } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { CurrencyDisplay } from '@/components/ui/currency-display'
import { cn } from '@/utils/cn'

type Tab = 'lent' | 'borrowed'

export default function LoansPage() {
  const { lentLoans, borrowedLoans, totalLentUSD, totalBorrowedUSD, isLoading } = useLoans()
  const [activeTab, setActiveTab] = useState<Tab>('lent')
  const [showAdd, setShowAdd] = useState(false)

  const currentLoans = activeTab === 'lent' ? lentLoans : borrowedLoans
  const currentTotal = activeTab === 'lent' ? totalLentUSD : totalBorrowedUSD

  return (
    <div className="px-4 pt-12 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Préstamos</h1>
          <p className="text-muted text-sm mt-0.5">Registro de deudas</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 gradient-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-surface border border-line rounded-2xl p-1">
        {(['lent', 'borrowed'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              activeTab === tab
                ? tab === 'lent'
                  ? 'bg-success/15 text-success'
                  : 'bg-error/15 text-error'
                : 'text-muted'
            )}
          >
            {tab === 'lent' ? '💚 Me deben' : '🔴 Debo'}
          </button>
        ))}
      </div>

      {/* Total */}
      {!isLoading && currentLoans.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between bg-surface border border-line rounded-2xl px-4 py-3 mb-4"
        >
          <span className="text-sm text-muted">Total pendiente</span>
          <CurrencyDisplay
            amount={currentTotal}
            currency="USD"
            className={`text-lg font-bold ${activeTab === 'lent' ? 'text-success' : 'text-error'}`}
          />
        </motion.div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : currentLoans.length === 0 ? (
        <EmptyState
          icon={activeTab === 'lent' ? '🤲' : '🙏'}
          title={activeTab === 'lent' ? 'Nadie te debe nada' : 'No debes nada'}
          description={
            activeTab === 'lent'
              ? 'Registra cuando prestas dinero'
              : 'Registra cuando alguien te presta dinero'
          }
          action={
            <Button onClick={() => setShowAdd(true)}>
              <Plus size={18} /> Registrar préstamo
            </Button>
          }
        />
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {currentLoans.map((loan, i) => (
            <LoanCard key={loan.id} loan={loan} index={i} />
          ))}
        </motion.div>
      )}

      <AddLoanDrawer
        open={showAdd}
        onClose={() => setShowAdd(false)}
        defaultType={activeTab}
      />
    </div>
  )
}
