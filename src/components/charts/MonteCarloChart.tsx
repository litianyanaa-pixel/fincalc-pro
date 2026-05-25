import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart, CustomChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'

echarts.use([LineChart, CustomChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer])

interface Percentiles {
  p5: number[]
  p25: number[]
  p50: number[]
  p75: number[]
  p95: number[]
}

interface MonteCarloChartProps {
  percentiles: Percentiles
  principal: number
}

export default function MonteCarloChart({ percentiles, principal }: MonteCarloChartProps) {
  const { t } = useTranslation()
  const { config } = useTheme()

  const option = useMemo(() => {
    const { p5, p25, p50, p75, p95 } = percentiles

    const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText } = config.chart
    const { outerFill, innerFill } = config.area

    return {
      grid: {
        left: 65,
        right: 45,
        top: 15,
        bottom: 40,
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: tooltipBg,
        borderColor: 'rgba(0,229,255,0.2)',
        textStyle: { color: tooltipText, fontSize: 12 },
        formatter: (params: any[]) => {
          const med = params.find((p: any) => p.seriesName === t('monteCarlo.median'))
          if (!med) return ''
          return `${med.marker} ${med.seriesName}<br/>${Math.round(med.value).toLocaleString()}`
        },
      },
      xAxis: {
        type: 'category' as const,
        data: p50.map((_, i) => i),
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { show: false },
        name: t('charts.months'),
        nameTextStyle: { color: textColor, fontSize: 11 },
      },
      yAxis: {
        type: 'value' as const,
        axisLine: { show: false },
        axisLabel: {
          color: textColor,
          fontSize: 11,
          formatter: (val: number) => val.toLocaleString(),
        },
        splitLine: { lineStyle: { color: splitColor } },
      },
      series: [
        {
          type: 'custom',
          name: t('monteCarlo.p5_p95'),
          renderItem: (_params: any, api: any) => {
            const points: number[][] = []
            for (let i = 0; i < p95.length; i++) points.push(api.coord([i, p95[i]]))
            for (let i = p5.length - 1; i >= 0; i--) points.push(api.coord([i, p5[i]]))
            return { type: 'polygon', shape: { points }, style: { fill: outerFill } }
          },
          data: [0],
          z: 1,
          itemStyle: { color: '#8b5cf6' },
          tooltip: { show: false },
        },
        {
          type: 'custom',
          name: t('monteCarlo.p25_p75'),
          renderItem: (_params: any, api: any) => {
            const points: number[][] = []
            for (let i = 0; i < p75.length; i++) points.push(api.coord([i, p75[i]]))
            for (let i = p25.length - 1; i >= 0; i--) points.push(api.coord([i, p25[i]]))
            return { type: 'polygon', shape: { points }, style: { fill: innerFill } }
          },
          data: [0],
          z: 2,
          itemStyle: { color: '#22d3ee' },
          tooltip: { show: false },
        },
        {
          name: t('monteCarlo.median'),
          type: 'line',
          data: p50,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#f59e0b', width: 2.5 },
          itemStyle: { color: '#f59e0b' },
          z: 3,
          markLine: {
            data: [{ yAxis: principal, name: 'Principal' }],
            lineStyle: { color: '#ef4444', type: 'dashed' as const, width: 1 },
            label: { fontSize: 10 },
          },
        },
      ],
      animation: true,
      animationDuration: 800,
    }
  }, [percentiles, t, config.chart, config.area])

  const legendItems = [
    { label: t('monteCarlo.p5_p95'), color: '#8b5cf6' },
    { label: t('monteCarlo.p25_p75'), color: '#22d3ee' },
    { label: t('monteCarlo.median'), color: '#f59e0b' },
  ]
  const legendTextColor = config.chart.legendColor

  return (
    <div>
      {/* Custom HTML legend — full theme control */}
      <div className="flex items-center gap-4 mb-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 10,
                borderRadius: 3,
                backgroundColor: item.color,
              }}
            />
            <span style={{ color: legendTextColor, fontSize: 12 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 320, width: '100%' }}
        notMerge
        lazyUpdate
      />
    </div>
  )
}
