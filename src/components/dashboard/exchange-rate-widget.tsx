'use client'

import { useState } from 'react'
import { RefreshCw, Edit2, Check, X } from 'lucide-react'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'
import { formatShortDate } from '@/utils/date'

export function ExchangeRateWidget() {
  const { bobPerUsd, lastUpdated, setRate } = useExchangeRateStore()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(bobPerUsd.toString())

  const handleSave = () => {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) {
      setRate(parsed)
    }
    setEditing(false)
  }

  const handleCancel = () => {
    setValue(bobPerUsd.toString())
    setEditing(false)
  }

  return (
    <div className="bg-surface border border-line rounded-2xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center text-white text-xs font-bold">
          $
        </div>
        <div>
          <p className="text-xs text-muted">Tipo de cambio</p>
          {editing ? (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted">1 USD =</span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-elevated border border-brand/40 rounded-lg px-2 py-0.5 w-20 text-white text-sm"
                step="0.01"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <span className="text-sm text-muted">BOB</span>
            </div>
          ) : (
            <p className="text-sm font-semibold text-white">
              1 USD = <span className="text-bob">{bobPerUsd}</span> BOB
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center text-success"
            >
              <Check size={15} />
            </button>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-xl bg-error/10 flex items-center justify-center text-error"
            >
              <X size={15} />
            </button>
          </>
        ) : (
          <>
            {lastUpdated && (
              <span className="text-xs text-faint mr-1">{formatShortDate(lastUpdated)}</span>
            )}
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 rounded-xl bg-elevated flex items-center justify-center text-muted"
            >
              <Edit2 size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
