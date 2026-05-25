import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Currency } from '../../utils/formatters'

const currencyOptions: { value: Currency; symbol: string; label: string }[] = [
  { value: 'CNY', symbol: '¥', label: 'CNY' },
  { value: 'USD', symbol: '$', label: 'USD' },
  { value: 'EUR', symbol: '€', label: 'EUR' },
  { value: 'GBP', symbol: '£', label: 'GBP' },
  { value: 'JPY', symbol: '¥', label: 'JPY' },
]

interface CurrencySelectorProps {
  value: Currency
  onChange: (currency: Currency) => void
}

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = currencyOptions.find((o) => o.value === value) || currencyOptions[0]

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="glow-btn !py-[7px] !px-3 !text-sm !font-semibold !rounded-lg flex items-center gap-1.5 cursor-pointer"
      >
        <span style={{ color: 'var(--accent-cyan)' }}>{current.symbol}</span>
        <span>{current.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 py-1 rounded-xl z-50 min-w-[120px]"
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {currencyOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm font-semibold transition-colors duration-150 flex items-center gap-2"
              style={{
                color: opt.value === value ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: opt.value === value ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (opt.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                if (opt.value !== value) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ color: 'var(--accent-cyan)', width: '14px' }}>{opt.symbol}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <span className="tooltip-trigger relative inline-flex items-center justify-center" style={{ color: 'var(--text-muted)', cursor: 'default' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span className="tooltip-content">
          {t('common.currencyDisclaimer')}
        </span>
      </span>
    </div>
  )
}
