import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '../../hooks/useTheme'
import GlassCard from '../ui/GlassCard'
import AnimatedInput from '../ui/AnimatedInput'

interface Investment {
  name: string
  principal: string
  rate: string
  years: string
}

const defaultInvestment = (): Investment => ({
  name: '',
  principal: '',
  rate: '',
  years: '',
})

export default function InvestmentComparison() {
  const { t } = useTranslation()
  const { config } = useTheme()
  const [investments, setInvestments] = useState<Investment[]>([defaultInvestment(), defaultInvestment()])

  const update = (index: number, field: keyof Investment, value: string) => {
    setInvestments((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addRow = () => {
    if (investments.length < 5) {
      setInvestments((prev) => [...prev, defaultInvestment()])
    }
  }

  const removeRow = (index: number) => {
    if (investments.length > 2) {
      setInvestments((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const results = useMemo(() => {
    return investments.map((inv, i) => {
      const p = parseFloat(inv.principal) || 0
      const r = parseFloat(inv.rate) || 0
      const y = parseFloat(inv.years) || 0
      const finalAmount = p * Math.pow(1 + r / 100, y)
      const profit = finalAmount - p
      return { name: inv.name || `#${i + 1}`, principal: p, finalAmount, profit, valid: p > 0 && r > 0 && y > 0 }
    })
  }, [investments])

  const chartOption = useMemo(() => {
    const valid = results.filter((r) => r.valid)
    if (valid.length === 0) return null
    const colors = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#f43f5e']
    const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart

    return {
      backgroundColor: 'transparent',
      grid: { top: 20, right: 60, bottom: 30, left: 60 },
      xAxis: {
        type: 'value' as const,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 10 },
        splitLine: { lineStyle: { color: splitColor } },
      },
      yAxis: {
        type: 'category' as const,
        data: valid.map((r) => r.name),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 11 },
      },
      series: [{
        type: 'bar' as const,
        data: valid.map((r, i) => ({
          value: Math.round(r.finalAmount * 100) / 100,
          itemStyle: { color: colors[i % colors.length], borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 24,
        label: {
          show: true,
          position: 'right' as const,
          color: textColor,
          fontSize: 11,
          formatter: (p: any) => p.value.toLocaleString(),
        },
      }],
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: tooltipBg,
        borderColor: 'rgba(0,229,255,0.2)',
        textStyle: { color: tooltipText, fontSize: 12 },
      },
    }
  }, [results, config.chart])

  return (
    <GlassCard>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('advanced.comparison')}
        </h3>

        <div className="space-y-4 mb-4">
          {investments.map((inv, i) => (
            <div key={i} className="glass-card p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  #{i + 1}
                </span>
                {investments.length > 2 && (
                  <button
                    onClick={() => removeRow(i)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.15)' }}
                    title={t('comparison.remove')}
                    type="button"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <AnimatedInput label={t('comparison.principal')} value={inv.principal} onChange={(v) => update(i, 'principal', v)} />
                <AnimatedInput label={t('comparison.rate')} value={inv.rate} onChange={(v) => update(i, 'rate', v)} />
                <AnimatedInput label={t('comparison.years')} value={inv.years} onChange={(v) => update(i, 'years', v)} />
              </div>
            </div>
          ))}
        </div>

        {investments.length < 5 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addRow}
            className="w-full py-2 rounded-xl text-sm font-semibold mb-4"
            style={{ border: '1px dashed var(--border-glass)', color: 'var(--text-muted)' }}
          >
            {t('comparison.add')}
          </motion.button>
        )}

        {results.some((r) => r.valid) && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {results.map((r, i) => r.valid && (
              <div key={i} className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {r.name}
                </div>
                <div className="font-num text-lg font-bold" style={{ color: ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#f43f5e'][i % 5] }}>
                  {Math.round(r.finalAmount).toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t('comparison.profit')}: {Math.round(r.profit).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {chartOption && (
          <ReactECharts option={chartOption} style={{ height: 200 }} opts={{ renderer: 'svg' }} />
        )}
      </motion.div>
    </GlassCard>
  )
}
