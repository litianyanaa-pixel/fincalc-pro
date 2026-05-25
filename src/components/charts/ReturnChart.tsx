import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  GraphicComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'

echarts.use([LineChart, GridComponent, TooltipComponent, GraphicComponent, MarkLineComponent, CanvasRenderer])

interface ReturnChartProps {
  buyAmount: number
  holdingProfit: number
  holdingDays: number
}

export default function ReturnChart({ buyAmount, holdingProfit, holdingDays }: ReturnChartProps) {
  const { t } = useTranslation()
  const { config } = useTheme()

  const option = useMemo(() => {
    if (!buyAmount || holdingDays <= 0) return null

    const dailyProfit = holdingProfit / holdingDays
    const days = Array.from({ length: holdingDays + 1 }, (_, i) => i)
    const values = days.map((d) => {
      const v = buyAmount + dailyProfit * d
      return Math.round(v * 100) / 100
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
        borderColor: 'rgba(0,229,255,0.2)',
        textStyle: { color: tooltipText, fontSize: 12 },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0]
          return `${t('charts.day')}: ${p.name}<br/>${t('charts.amount')}: ${p.value.toLocaleString()}`
        },
      },
      xAxis: {
        type: 'category' as const,
        data: days,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { show: false },
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { lineStyle: { color: splitColor } },
      },
      series: [
        {
          type: 'line',
          data: values,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#00e5ff', width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,229,255,0.3)' },
              { offset: 1, color: 'rgba(0,229,255,0.02)' },
            ]),
          },
          markLine: {
            data: [{ yAxis: buyAmount, name: 'Break-even' }],
            lineStyle: { color: '#f59e0b', type: 'dashed' as const, width: 1 },
            label: { fontSize: 10 },
          },
        },
      ],
      animation: true,
      animationDuration: 800,
    }
  }, [buyAmount, holdingProfit, holdingDays, t, config.chart])

  if (!option) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--text-muted)' }}>
        {t('charts.noData')}
      </div>
    )
  }

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 280, width: '100%' }}
      notMerge
      lazyUpdate
    />
  )
}
