import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import AnimatedInput from '../ui/AnimatedInput'
import AnimatedNumber from '../ui/AnimatedNumber'
import GlassCard from '../ui/GlassCard'
import ResetButton from '../shared/ResetButton'
import TVChart from '../charts/TVChart'
import UnitToggle from '../shared/UnitToggle'
import { useTheme } from '../../hooks/useTheme'
import { calcReturnRate, calcAnnualizedRate, calcHoldingAmount, calcHoldingProfit, calcRealReturn } from '../../utils/calculations'
import { formatNumber, Currency, getCurrencySymbol } from '../../utils/formatters'

import type { DurationUnit } from '../shared/UnitToggle'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

type LastEditedField = 'profit' | 'amount' | null
type ChartType = 'trend' | 'comparison'

interface ReturnData {
  buyAmount: string
  holdingProfit: string
  holdingAmount: string
  holdingDays: string
  unit: DurationUnit
  inflationEnabled: boolean
  inflationRate: string
}

const STORAGE_KEY = 'fincalc-return-data'

const defaultData: ReturnData = {
  buyAmount: '',
  holdingProfit: '',
  holdingAmount: '',
  holdingDays: '',
  unit: 'day',
  inflationEnabled: false,
  inflationRate: '',
}

function unitToDays(value: number, unit: DurationUnit): number {
  if (unit === 'month') return value * 30
  if (unit === 'year') return value * 365
  return value
}

export default function ReturnCalc({ currency = 'CNY' as Currency }: { currency?: Currency }) {
  const { t } = useTranslation()
  const { config } = useTheme()
  const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart
  const sym = getCurrencySymbol(currency)
  const [data, setData] = useState<ReturnData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch {
      return defaultData
    }
  })
  const lastEdited = useRef<LastEditedField>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const [chartType, setChartType] = useState<ChartType>('trend')

  // Chart toggle pill position
  const chartToggleRef = useRef<HTMLDivElement>(null)
  const chartBtnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [chartPill, setChartPill] = useState({ left: 0, width: 0 })
  const chartTypes: ChartType[] = ['trend', 'comparison']

  useLayoutEffect(() => {
    const idx = chartTypes.indexOf(chartType)
    const btn = chartBtnRefs.current[idx]
    const container = chartToggleRef.current
    if (btn && container) {
      const cr = container.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      setChartPill({ left: br.left - cr.left, width: br.width })
    }
  }, [chartType])

  // Debounced save to localStorage
  const saveData = useCallback((d: ReturnData) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
      } catch { /* quota */ }
    }, 300)
  }, [])

  const update = useCallback(
    (field: keyof ReturnData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value }

        const buy = parseFloat(next.buyAmount) || 0
        const profit = parseFloat(next.holdingProfit) || 0
        const amount = parseFloat(next.holdingAmount) || 0

        // Smart linking
        if (field === 'holdingProfit') {
          lastEdited.current = 'profit'
          if (buy !== 0) {
            next.holdingAmount = formatNumber(calcHoldingAmount(buy, profit))
          }
        } else if (field === 'holdingAmount') {
          lastEdited.current = 'amount'
          if (buy !== 0) {
            next.holdingProfit = formatNumber(calcHoldingProfit(buy, amount))
          }
        } else if (field === 'buyAmount' && buy !== 0) {
          // Recalculate the non-last-edited field
          if (lastEdited.current === 'profit') {
            next.holdingAmount = formatNumber(calcHoldingAmount(buy, profit))
          } else if (lastEdited.current === 'amount') {
            next.holdingProfit = formatNumber(calcHoldingProfit(buy, amount))
          }
        }

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

  // Computed results
  const buyNum = parseFloat(data.buyAmount) || 0
  const profitNum = parseFloat(data.holdingProfit) || 0
  const durationValue = parseFloat(data.holdingDays) || 0
  const daysNum = unitToDays(durationValue, data.unit)

  const returnRate = buyNum !== 0 ? calcReturnRate(buyNum, profitNum) : 0
  const annualizedRate = daysNum > 0 ? calcAnnualizedRate(returnRate, daysNum) : 0
  const hasResults = buyNum !== 0 && (profitNum !== 0 || parseFloat(data.holdingAmount) !== 0)
  const inflationRateNum = parseFloat(data.inflationRate) || 0
  const realAnnualizedRate = data.inflationEnabled && inflationRateNum > 0 && annualizedRate !== 0
    ? calcRealReturn(annualizedRate, inflationRateNum)
    : 0

  // ECharts profit trend over holding period
  const chartOption = useMemo(() => {
    if (buyNum === 0 || daysNum <= 0) return null

    const points = 30
    const dailyProfit = profitNum / daysNum
    const categories: string[] = []
    const values: number[] = []

    for (let i = 0; i <= points; i++) {
      const day = Math.round((i / points) * daysNum)
      categories.push(`D${day}`)
      values.push(Math.round((buyNum + dailyProfit * day) * 100) / 100)
    }

    return {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 16, bottom: 30, left: 60 },
      xAxis: {
        type: 'category' as const,
        data: categories,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 10 },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: splitColor } },
        axisLabel: {
          color: textColor,
          fontSize: 10,
          formatter: (val: number) => sym + formatNumber(val, 0),
        },
      },
      series: [
        {
          type: 'line' as const,
          data: values,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#00e5ff', width: 2 },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0,229,255,0.25)' },
                { offset: 1, color: 'rgba(0,229,255,0.02)' },
              ],
            },
          },
        },
      ],
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: tooltipBg,
        borderColor: 'rgba(0,229,255,0.2)',
        textStyle: { color: tooltipText, fontSize: 12 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params
          return `${p.name}<br/>${sym}${formatNumber(p.value, 2)}`
        },
      },
    }
  }, [buyNum, profitNum, daysNum, sym, textColor, axisLineColor, splitColor, tooltipBg, tooltipText])

  // TVChart daily data points
  const tvChartData = useMemo(() => {
    if (buyNum === 0 || daysNum <= 0) return []
    const dailyProfit = profitNum / daysNum
    const points = Math.min(daysNum, 120)
    const result: { time: string; value: number }[] = []
    for (let i = 0; i <= points; i++) {
      const day = Math.round((i / points) * daysNum)
      const date = new Date(Date.now() + day * 86400000).toISOString().split('T')[0]
      result.push({ time: date, value: Math.round((buyNum + dailyProfit * day) * 100) / 100 })
    }
    return result
  }, [buyNum, profitNum, daysNum])

  const handleReset = useCallback(() => {
    setData(defaultData)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <GlassCard>
        <ResetButton onClick={handleReset} />
        <div className="p-4 md:p-6 space-y-4">
          <AnimatedInput
            label={t('returnCalc.buyAmount')}
            value={data.buyAmount}
            onChange={(v) => update('buyAmount', v)}

            prefix={sym}
          />

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
            <span>{t('returnCalc.smartLink')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedInput
              label={t('returnCalc.holdingProfit')}
              value={data.holdingProfit}
              onChange={(v) => update('holdingProfit', v)}

              prefix={sym}
            />
            <AnimatedInput
              label={t('returnCalc.holdingAmount')}
              value={data.holdingAmount}
              onChange={(v) => update('holdingAmount', v)}

              prefix={sym}
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <label className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('returnCalc.holdingDays')}
              </label>
              <UnitToggle value={data.unit} onChange={setUnit} layoutId="return-unit-pill" />
            </div>
            <AnimatedInput
              label=""
              value={data.holdingDays}
              onChange={(v) => update('holdingDays', v)}

            />
          </div>
        </div>
      </GlassCard>

      {/* Results */}
      <GlassCard>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('returnCalc.returnRate')}
              </p>
              <AnimatedNumber value={returnRate} suffix="%" decimals={2} colored />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('returnCalc.annualizedRate')}
              </p>
              <AnimatedNumber value={annualizedRate} suffix="%" decimals={2} colored />
            </div>
          </div>

          {hasResults && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={data.inflationEnabled}
                  onChange={() => {
                    setData((prev) => {
                      const next = { ...prev, inflationEnabled: !prev.inflationEnabled }
                      saveData(next)
                      return next
                    })
                  }}
                  className="accent-cyan-500"
                />
                <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('inflation.toggle')}
                </span>
              </label>
              {data.inflationEnabled && (
                <AnimatedInput
                  label={t('inflation.rate')}
                  value={data.inflationRate}
                  onChange={(v) => update('inflationRate', v)}

                  suffix="%"
                />
              )}
              {data.inflationEnabled && inflationRateNum > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('inflation.nominalReturn')}
                    </p>
                    <p className="font-num text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {annualizedRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('inflation.realReturn')}
                    </p>
                    <p className="font-num text-sm font-semibold" style={{ color: realAnnualizedRate >= 0 ? '#00d68f' : '#f87171' }}>
                      {realAnnualizedRate.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('inflation.hint')}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {hasResults && (
            <div className="formula-box mt-4 text-xs text-[var(--text-muted)] space-y-1">
              <div>{t('returnCalc.formulaRate')}</div>
              <div>{t('returnCalc.formulaAnnualized')}</div>
              <div>{t('returnCalc.formulaHoldingAmount')}</div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Chart */}
      {chartOption && (
        <GlassCard>
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div ref={chartToggleRef} className="unit-toggle-container" style={{ position: 'relative' }}>
                <motion.div
                  initial={false}
                  animate={{ x: chartPill.left, width: chartPill.width }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  style={{
                    position: 'absolute', top: 3, bottom: 3, left: 0,
                    borderRadius: 8,
                    background: 'var(--gradient-accent)',
                    zIndex: 0,
                  }}
                />
                {chartTypes.map((ct, i) => {
                  const isActive = chartType === ct
                  return (
                    <button
                      key={ct}
                      ref={(el) => { chartBtnRefs.current[i] = el }}
                      onClick={() => setChartType(ct)}
                      className="unit-toggle-btn relative z-10"
                      type="button"
                      style={{ color: isActive ? '#fff' : 'var(--text-muted)' }}
                    >
                      {t(`chart.${ct}`)}
                    </button>
                  )
                })}
              </div>
            </div>
            {chartType === 'trend' ? (
              <TVChart data={tvChartData} height={260} />
            ) : (
              <ReactEChartsCore
                echarts={echarts}
                option={chartOption}
                style={{ height: 220 }}
                opts={{ renderer: 'svg' }}
                notMerge
                lazyUpdate
              />
            )}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
