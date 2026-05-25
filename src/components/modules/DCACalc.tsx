import { useState, useCallback, useMemo, useRef } from 'react'
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
import { useTheme } from '../../hooks/useTheme'
import { calcDCASeries, calcDCASummary, calcRealReturn } from '../../utils/calculations'
import { Currency, getCurrencySymbol } from '../../utils/formatters'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

interface DCAData {
  monthlyInvest: string
  annualRate: string
  years: string
  inflationEnabled: boolean
  inflationRate: string
}

const STORAGE_KEY = 'fincalc-dca-data'

const defaultData: DCAData = {
  monthlyInvest: '',
  annualRate: '',
  years: '',
  inflationEnabled: false,
  inflationRate: '',
}

export default function DCACalc({ currency = 'CNY' as Currency }: { currency?: Currency }) {
  const { t } = useTranslation()
  const { config } = useTheme()
  const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart
  const sym = getCurrencySymbol(currency)

  const [data, setData] = useState<DCAData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch {
      return defaultData
    }
  })

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const saveData = useCallback((d: DCAData) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch { /* quota */ }
    }, 300)
  }, [])

  const update = useCallback(
    (field: keyof DCAData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const monthlyInvest = parseFloat(data.monthlyInvest) || 0
  const annualRate = parseFloat(data.annualRate) || 0
  const years = parseFloat(data.years) || 0
  const hasResults = monthlyInvest > 0 && annualRate > 0 && years > 0

  const series = useMemo(
    () => hasResults ? calcDCASeries(monthlyInvest, annualRate, years) : [],
    [monthlyInvest, annualRate, years, hasResults],
  )

  const summary = useMemo(
    () => hasResults ? calcDCASummary(series) : null,
    [series, hasResults],
  )

  const inflationRateNum = parseFloat(data.inflationRate) || 0
  const realReturnRate = data.inflationEnabled && inflationRateNum > 0 && summary && summary.annualizedReturn !== 0
    ? calcRealReturn(summary.annualizedReturn, inflationRateNum)
    : 0

  const chartOption = useMemo(() => {
    if (!hasResults || series.length < 2) return null

    const categories = series.map((s) => {
      const y = Math.floor(s.month / 12)
      const m = s.month % 12
      return m === 0 ? `${y}y` : ''
    })

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
          name: t('dcaCalc.investedLine'),
          type: 'line' as const,
          data: series.map((s) => s.totalInvested),
          smooth: false,
          symbol: 'none',
          itemStyle: { color: '#64748b' },
          lineStyle: { color: '#64748b', width: 2, type: 'dashed' as const },
        },
        {
          name: t('dcaCalc.valueLine'),
          type: 'line' as const,
          data: series.map((s) => s.totalValue),
          smooth: true,
          symbol: 'none',
          itemStyle: { color: '#00e5ff' },
          lineStyle: { color: '#00e5ff', width: 2 },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0,229,255,0.25)' },
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
  }, [series, hasResults, t, sym, textColor, axisLineColor, splitColor, tooltipBg, tooltipText])

  const handleReset = useCallback(() => {
    setData(defaultData)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <div className="space-y-4">
      <GlassCard>
        <ResetButton onClick={handleReset} />
        <div className="p-4 md:p-6 space-y-4">
          <AnimatedInput
            label={t('dcaCalc.monthlyInvest')}
            value={data.monthlyInvest}
            onChange={(v) => update('monthlyInvest', v)}

            prefix={sym}
          />
          <AnimatedInput
            label={t('dcaCalc.annualRate')}
            value={data.annualRate}
            onChange={(v) => update('annualRate', v)}

            suffix="%"
          />
          <AnimatedInput
            label={t('dcaCalc.years')}
            value={data.years}
            onChange={(v) => update('years', v)}

          />
        </div>
      </GlassCard>

      {summary && (
        <GlassCard>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('dcaCalc.totalInvested')}
                </p>
                <AnimatedNumber value={summary.totalInvested} decimals={2} prefix={sym + ' '} />
              </div>
              <div>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('dcaCalc.totalValue')}
                </p>
                <AnimatedNumber value={summary.totalValue} decimals={2} prefix={sym + ' '} />
              </div>
              <div>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('dcaCalc.profit')}
                </p>
                <AnimatedNumber value={summary.profit} decimals={2} colored prefix={sym + ' '} />
              </div>
              <div>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('dcaCalc.returnRate')}
                </p>
                <AnimatedNumber value={summary.returnRate} decimals={2} suffix="%" colored />
              </div>
              <div>
                <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('dcaCalc.annualizedReturn')}
                </p>
                <AnimatedNumber value={summary.annualizedReturn} decimals={2} suffix="%" colored />
              </div>
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
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
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
                        {summary!.annualizedReturn.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {t('inflation.realReturn')}
                      </p>
                      <p className="font-num text-sm font-semibold" style={{ color: realReturnRate >= 0 ? '#00d68f' : '#f87171' }}>
                        {realReturnRate.toFixed(2)}%
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
              <div className="formula-box mt-4 text-xs text-[var(--text-muted)]">
                {t('dcaCalc.formula')}
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {chartOption && (
        <GlassCard>
          <div className="p-4 md:p-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('dcaCalc.growthChart')}
            </h3>
            <ReactEChartsCore
              echarts={echarts}
              option={chartOption}
              style={{ height: 280 }}
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
