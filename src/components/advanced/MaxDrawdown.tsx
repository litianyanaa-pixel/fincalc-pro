import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'
import GlassCard from '../ui/GlassCard'
import AnimatedInput from '../ui/AnimatedInput'
import { calcMaxDrawdown } from '../../utils/calculations'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

export default function MaxDrawdown() {
  const { t } = useTranslation()
  const { config } = useTheme()

  const [valuesInput, setValuesInput] = useState('100, 110, 105, 115, 95, 120, 130')
  const [result, setResult] = useState<{ maxDrawdown: number; peakIndex: number; troughIndex: number } | null>(null)
  const [parsedValues, setParsedValues] = useState<number[]>([])

  const handleCalculate = () => {
    const values = valuesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((n) => !isNaN(n))

    if (values.length < 2) return

    const dd = calcMaxDrawdown(values)
    setResult(dd)
    setParsedValues(values)
  }

  const chartOption = useMemo(() => {
    if (!result || parsedValues.length === 0) return null

    const periods = parsedValues.map((_, i) => `${i + 1}`)

    // Calculate running peak and drawdown series
    let runningPeak = parsedValues[0]
    const ddSeries: number[] = []
    parsedValues.forEach((v) => {
      if (v > runningPeak) runningPeak = v
      ddSeries.push(((runningPeak - v) / runningPeak) * 100)
    })

    const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart

    return {
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 40,
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: tooltipBg,
        borderColor: 'rgba(239,68,68,0.2)',
        textStyle: { color: tooltipText, fontSize: 12 },
      },
      xAxis: {
        type: 'category' as const,
        data: periods,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: '{value}%',
        },
        splitLine: { lineStyle: { color: splitColor } },
      },
      series: [
        {
          type: 'line',
          data: ddSeries,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#ef4444', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239,68,68,0.35)' },
              { offset: 1, color: 'rgba(239,68,68,0.02)' },
            ]),
          },
        },
      ],
      animation: true,
      animationDuration: 800,
    }
  }, [result, parsedValues, t, config.chart])

  return (
    <GlassCard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('drawdown.title')}
        </h3>

        <div className="flex flex-col gap-3 mb-4">
          <AnimatedInput
            label={t('drawdown.values')}
            value={valuesInput}
            onChange={setValuesInput}
            placeholder="100, 110, 105, 115, 95, 120, 130"
            allowMulti
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalculate}
          className="w-full py-2.5 rounded-xl font-medium text-sm"
          style={{
            background: 'var(--gradient-accent)',
            color: 'var(--tab-active-text)',
          }}
        >
          {t('drawdown.calculate')}
        </motion.button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <div className="glass-card p-4 rounded-xl text-center mb-4">
              <div className="text-[15px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('drawdown.maxDrawdown')}
              </div>
              <div className="font-num text-3xl font-bold" style={{ color: '#ef4444' }}>
                {result.maxDrawdown.toFixed(2)}%
              </div>
              <div className="text-[15px] font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
                {t('drawdown.peakTrough', {
                  peak: result.peakIndex + 1,
                  trough: result.troughIndex + 1,
                })}
              </div>
            </div>

            {chartOption && (
              <ReactEChartsCore
                echarts={echarts}
                option={chartOption}
                style={{ height: 260, width: '100%' }}
                notMerge
                lazyUpdate
              />
            )}
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  )
}
