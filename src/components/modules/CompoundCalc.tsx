import { useState, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

import AnimatedInput from '../ui/AnimatedInput'
import AnimatedNumber from '../ui/AnimatedNumber'
import GlassCard from '../ui/GlassCard'
import ResetButton from '../shared/ResetButton'
import { useTheme } from '../../hooks/useTheme'
import {
  calcSimpleProfit,
  calcCompoundProfit,
  calcCompoundAmount,
  generateCompoundSeries,
  generateSimpleSeries,
  calcRealReturn,
} from '../../utils/calculations'
import { Currency, getCurrencySymbol } from '../../utils/formatters'

type Mode = 'simple' | 'compound'

interface CompoundData {
  principal: string
  annualRate: string
  years: string
  mode: Mode
  inflationEnabled: boolean
  inflationRate: string
}

const STORAGE_KEY = 'fincalc-compound-data'

const defaultData: CompoundData = {
  principal: '',
  annualRate: '',
  years: '',
  mode: 'compound',
  inflationEnabled: false,
  inflationRate: '',
}

export default function CompoundCalc({ currency = 'CNY' as Currency }: { currency?: Currency }) {
  const { t } = useTranslation()
  const { config } = useTheme()
  const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart
  const sym = getCurrencySymbol(currency)
  const [data, setData] = useState<CompoundData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch {
      return defaultData
    }
  })
  const saveTimer = useRef<ReturnType<typeof setTimeout>>()

  const saveData = useCallback((d: CompoundData) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
      } catch { /* quota */ }
    }, 300)
  }, [])

  const update = useCallback(
    (field: keyof CompoundData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const setMode = useCallback(
    (mode: Mode) => {
      setData((prev) => {
        const next = { ...prev, mode }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const principal = parseFloat(data.principal) || 0
  const annualRate = parseFloat(data.annualRate) || 0
  const years = parseFloat(data.years) || 0

  const isCompound = data.mode === 'compound'
  const hasResults = principal > 0 && annualRate > 0 && years > 0

  const finalProfit = useMemo(
    () => (isCompound
      ? calcCompoundProfit(principal, annualRate, years)
      : calcSimpleProfit(principal, annualRate, years)),
    [principal, annualRate, years, isCompound],
  )

  const finalAmount = useMemo(
    () => (isCompound
      ? calcCompoundAmount(principal, annualRate, years)
      : principal + finalProfit),
    [principal, annualRate, years, isCompound, finalProfit],
  )

  const simpleProfit = useMemo(
    () => calcSimpleProfit(principal, annualRate, years),
    [principal, annualRate, years],
  )

  const compoundProfit = useMemo(
    () => calcCompoundProfit(principal, annualRate, years),
    [principal, annualRate, years],
  )

  const compoundAdvantage = compoundProfit - simpleProfit

  const inflationRateNum = parseFloat(data.inflationRate) || 0
  const realRate = data.inflationEnabled && inflationRateNum > 0 && annualRate > 0
    ? calcRealReturn(annualRate, inflationRateNum)
    : 0

  // Chart
  const chartOption = useMemo(() => {
    if (!hasResults) return null

    const simpleSeries = generateSimpleSeries(principal, annualRate, years)
    const compoundSeries = generateCompoundSeries(principal, annualRate, years)

    const categories = simpleSeries.map((s) => `${s.year}`)

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
          formatter: (val: number) => sym + Math.round(val),
        },
      },
      series: [
        {
          name: t('compoundCalc.simple'),
          type: 'line' as const,
          data: simpleSeries.map((s) => s.value),
          smooth: true,
          symbol: 'none',
          itemStyle: { color: '#00d68f' },
          lineStyle: { color: '#00d68f', width: 2 },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0,214,143,0.2)' },
                { offset: 1, color: 'rgba(0,214,143,0.01)' },
              ],
            },
          },
        },
        {
          name: t('compoundCalc.compound'),
          type: 'line' as const,
          data: compoundSeries.map((s) => s.value),
          smooth: true,
          symbol: 'none',
          itemStyle: { color: '#00e5ff' },
          lineStyle: { color: '#00e5ff', width: 2 },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0,229,255,0.2)' },
                { offset: 1, color: 'rgba(0,229,255,0.01)' },
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
          const items = (Array.isArray(params) ? params : [params]) as any[]
          return items.map((p: any) =>
            `${p.marker} ${p.seriesName}<br/>${sym}${parseFloat(p.value).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          ).join('<br/>')
        },
      },
    }
  }, [principal, annualRate, years, hasResults, t, sym, textColor, axisLineColor, splitColor, tooltipBg, tooltipText])

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
            label={t('compoundCalc.principal')}
            value={data.principal}
            onChange={(v) => update('principal', v)}

            prefix={sym}
          />
          <AnimatedInput
            label={t('compoundCalc.annualRate')}
            value={data.annualRate}
            onChange={(v) => update('annualRate', v)}

          />
          <AnimatedInput
            label={t('compoundCalc.years')}
            value={data.years}
            onChange={(v) => update('years', v)}

          />

          {/* Mode Toggle */}
          <div>
            <p className="text-[15px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('compoundCalc.mode')}
            </p>
            <div className="mode-toggle-container w-full">
              {(['simple', 'compound'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMode(mode)}
                  className="relative z-10 flex-1 rounded-lg px-4 py-2.5 text-[15px] font-semibold transition-colors duration-200"
                  style={{ color: data.mode === mode ? '#fff' : 'var(--text-muted)' }}
                >
                  {data.mode === mode && (
                    <motion.div
                      layoutId="compound-mode-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'var(--gradient-accent)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{t(`compoundCalc.${mode}`)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Results */}
      <GlassCard>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('compoundCalc.finalProfit')}
              </p>
              <AnimatedNumber value={finalProfit} decimals={2} colored prefix={sym + ' '} />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {t('compoundCalc.finalAmount')}
              </p>
              <AnimatedNumber value={finalAmount} decimals={2} prefix={sym + ' '} />
            </div>
            {isCompound && (
              <div>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('compoundCalc.compoundAdvantage')}
                </p>
                <AnimatedNumber
                  value={compoundAdvantage}
                  decimals={2}
                  colored
                  prefix={sym + ' '}
                />
              </div>
            )}
          </div>

          {/* Inflation Adjustment */}
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
                      {annualRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('inflation.realReturn')}
                    </p>
                    <p className="font-num text-sm font-semibold" style={{ color: realRate >= 0 ? '#00d68f' : '#f87171' }}>
                      {realRate.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('inflation.hint')}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Formula */}
          {hasResults && (
            <div className="formula-box mt-4 text-xs text-[var(--text-muted)]">
              {isCompound
                ? t('compoundCalc.formulaCompound')
                : t('compoundCalc.formulaSimple')}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Growth Chart */}
      {chartOption && (
        <GlassCard>
          <div className="p-4 md:p-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('compoundCalc.growthChart')}
            </h3>
            <ReactEChartsCore
              echarts={echarts}
              option={chartOption}
              style={{ height: 260 }}
              opts={{ renderer: 'svg' }}
              notMerge
              lazyUpdate
            />
          </div>
        </GlassCard>
      )}
    </div>
  )
}
