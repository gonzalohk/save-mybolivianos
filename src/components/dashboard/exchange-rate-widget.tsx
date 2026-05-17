'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import { useExchangeRateStore } from '@/stores/exchange-rate-store'

export function ExchangeRateWidget() {
  const { bobPerUsd, setRate } = useExchangeRateStore()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(bobPerUsd.toString())

  const handleSave = () => {
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) setRate(parsed)
    setEditing(false)
  }

  const handleCancel = () => {
    setValue(bobPerUsd.toString())
    setEditing(false)
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6C63FF, #4F46E5)' }}
        >
          $↔
        </div>
        <div>
          <p className="text-[10px] text-muted font-medium tracking-wide uppercase mb-0.5">Tipo de cambio</p>
          {editing ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted">1 USD =</span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                className="bg-elevated border border-brand/40 rounded-lg px-2 py-0.5 w-16 text-white text-sm tabular-nums"
                step="0.01"
                autoFocus
              />
              <span className="text-sm text-muted">BOB</span>
            </div>
          ) : (
            <p className="text-sm font-semibold text-white tabular-nums">
              1 USD = <span style={{ color: '#FBBF24' }}>{bobPerUsd}</span> BOB
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,212,170,0.12)', color: '#00D4AA' }}
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,77,77,0.12)', color: '#FF4D4D' }}
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <button
            onClick={() => { setValue(bobPerUsd.toString()); setEditing(true) }}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Edit2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}

