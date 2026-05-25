import { useState, useMemo, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import GlassCard from '../ui/GlassCard'
import AnimatedInput from '../ui/AnimatedInput'
import ResetButton from '../shared/ResetButton'
import { useTheme } from '../../hooks/useTheme'
import { calcGoalPlan, calcDCASeries } from '../../utils/calculations'
import { getCurrencySymbol, Currency } from '../../utils/formatters'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

interface GoalData {
  targetAmount: string
  annualRate: string
  years: string
}

const STORAGE_KEY = 'fincalc-goal-data'
const defaultData: GoalData = { targetAmount: '', annualRate: '', years: '' }

export default function GoalPlanner({ currency = 'CNY' as Currency }: { currency?: Currency }) {
  const { t } = useTranslation()
  const { config } = useTheme()
  const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart
  const sym = getCurrencySymbol(currency)

  const [data, setData] = useState<GoalData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData
    } catch {
      return defaultData
    }
  })

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const saveData = useCallback((d: GoalData) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch { /* quota */ }
    }, 300)
  }, [])

  const update = useCallback(
    (field: keyof GoalData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const handleReset = useCallback(() => {
    setData(defaultData)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const target = parseFloat(data.targetAmount) || 0
  const rate = parseFloat(data.annualRate) || 0
  const y = parseFloat(data.years) || 0
  const hasInput = target > 0 && rate > 0 && y > 0

  const result = useMemo(
    () => hasInput ? calcGoalPlan(target, rate, y) : null,
    [target, rate, y, hasInput],
  )

  const growthSeries = useMemo(() => {
    if (!result || result.monthlyInvest <= 0) return []
    return calcDCASeries(result.monthlyInvest, rate, y)
  }, [result, rate, y])

  const chartOption = useMemo(() => {
    if (growthSeries.length < 2) return null

    const categories = growthSeries.map((s) => {
      const yr = Math.floor(s.month / 12)
      return s.month % 12 === 0 ? `${yr}y` : ''
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
          name: t('goalPlanner.investedLine'),
          type: 'line' as const,
          data: growthSeries.map((s) => s.totalInvested),
          smooth: false,
          symbol: 'none',
          itemStyle: { color: '#64748b' },
          lineStyle: { color: '#64748b', width: 2, type: 'dashed' as const },
        },
        {
          name: t('goalPlanner.targetLine'),
          type: 'line' as const,
          data: growthSeries.map(() => target),
          smooth: false,
          symbol: 'none',
          itemStyle: { color: '#f59e0b' },
          lineStyle: { color: '#f59e0b', width: 2, type: 'dotted' as const },
        },
        {
          name: t('dcaCalc.valueLine'),
          type: 'line' as const,
          data: growthSeries.map((s) => s.totalValue),
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
      },
    }
  }, [growthSeries, target, t, sym, textColor, axisLineColor, splitColor, tooltipBg, tooltipText])

  return (
    <GlassCard>
      <ResetButton onClick={handleReset} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('goalPlanner.title')}
        </h3>

        <div className="flex flex-col gap-3 mb-4">
          <AnimatedInput
            label={t('goalPlanner.targetAmount')}
            value={data.targetAmount}
            onChange={(v) => update('targetAmount', v)}

            prefix={sym}
          />
          <AnimatedInput
            label={t('goalPlanner.annualRate')}
            value={data.annualRate}
            onChange={(v) => update('annualRate', v)}

            suffix="%"
          />
          <AnimatedInput
            label={t('goalPlanner.years')}
            value={data.years}
            onChange={(v) => update('years', v)}

          />
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4"
          >
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('goalPlanner.monthlyInvest')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#00e5ff' }}>
                  {sym}{result.monthlyInvest.toLocaleString()}
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('goalPlanner.totalInvested')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#94a3b8' }}>
                  {sym}{result.totalInvested.toLocaleString()}
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('goalPlanner.expectedProfit')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#00d68f' }}>
                  {sym}{result.profit.toLocaleString()}
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {t('goalPlanner.formula')}
            </p>
          </motion.div>
        )}

        {chartOption && (
          <div className="mt-4">
            <ReactEChartsCore
              echarts={echarts}
              option={chartOption}
              style={{ height: 240 }}
              opts={{ renderer: 'svg' }}
              notMerge
              lazyUpdate
            />
          </div>
        )}
      </motion.div>
    </GlassCard>
  )
}
