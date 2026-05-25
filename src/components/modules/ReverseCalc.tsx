import { useState, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import AnimatedInput from '../ui/AnimatedInput'
import AnimatedNumber from '../ui/AnimatedNumber'
import GlassCard from '../ui/GlassCard'
import UnitToggle from '../shared/UnitToggle'
import ResetButton from '../shared/ResetButton'
import { calcReverseReturn } from '../../utils/calculations'
import { Currency, getCurrencySymbol } from '../../utils/formatters'

import type { DurationUnit } from '../shared/UnitToggle'

interface ReverseData {
  annualRate: string
  principal: string
  duration: string
  unit: DurationUnit
}

const STORAGE_KEY = 'fincalc-reverse-data'

const defaultData: ReverseData = {
  annualRate: '',
  principal: '',
  duration: '',
  unit: 'day',
}

function unitToDays(value: number, unit: DurationUnit): number {
  if (unit === 'month') return value * 30
  if (unit === 'year') return value * 365
  return value
}

export default function ReverseCalc({ currency = 'CNY' as Currency }: { currency?: Currency }) {
  const { t } = useTranslation()
  const sym = getCurrencySymbol(currency)
  const [data, setData] = useState<ReverseData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch {
      return defaultData
    }
  })
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const saveData = useCallback((d: ReverseData) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
      } catch { /* quota */ }
    }, 300)
  }, [])

  const update = useCallback(
    (field: keyof ReverseData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const setUnit = useCallback(
    (unit: DurationUnit) => {
      setData((prev) => {
        const next = { ...prev, unit }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const principal = parseFloat(data.principal) || 0
  const annualRate = parseFloat(data.annualRate) || 0
  const durationValue = parseFloat(data.duration) || 0
  const days = unitToDays(durationValue, data.unit)

  const { profit, total } = useMemo(
    () => calcReverseReturn(principal, annualRate, days),
    [principal, annualRate, days],
  )

  const hasResults = principal !== 0 && annualRate !== 0 && days > 0

  const handleReset = useCallback(() => {
    setData(defaultData)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <GlassCard>
        <ResetButton onClick={handleReset} />
        <div className="p-4 md:p-6 space-y-4">
          <AnimatedInput
            label={t('reverseCalc.annualRate')}
            value={data.annualRate}
            onChange={(v) => update('annualRate', v)}

          />
          <AnimatedInput
            label={t('reverseCalc.principal')}
            value={data.principal}
            onChange={(v) => update('principal', v)}

            prefix={sym}
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <label className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>                {t('reverseCalc.duration')}
              </label>
              <UnitToggle value={data.unit} onChange={setUnit} layoutId="reverse-unit-pill" />
            </div>
            <AnimatedInput
              label=""
              value={data.duration}
              onChange={(v) => update('duration', v)}

            />
          </div>
        </div>
      </GlassCard>

      {/* Results */}
      <GlassCard>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('reverseCalc.expectedProfit')}
              </p>
              <AnimatedNumber value={profit} decimals={2} colored prefix={sym + ' '} />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('reverseCalc.totalAmount')}
              </p>
              <AnimatedNumber value={total} decimals={2} prefix={sym + ' '} />
            </div>
          </div>

          {hasResults && (
            <div className="formula-box mt-4 text-xs text-[var(--text-muted)] space-y-1">
              <div>{t('reverseCalc.formula')}</div>
              <div>{t('reverseCalc.formulaTotal')}</div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
