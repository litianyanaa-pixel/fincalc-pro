import { useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react/lib/core'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, MarkPointComponent, MarkLineComponent, CanvasRenderer])

interface SeriesPoint {
  year: number
  value: number
  profit: number
}

interface GrowthChartProps {
  simpleSeries: SeriesPoint[]
  compoundSeries: SeriesPoint[]
}

export default function GrowthChart({ simpleSeries, compoundSeries }: GrowthChartProps) {
  const { t } = useTranslation()
  const { config } = useTheme()

  const option = useMemo(() => {
    if (!simpleSeries.length || !compoundSeries.length) return null

    const years = compoundSeries.map((p) => p.year)
    const simpleValues = simpleSeries.map((p) => p.value)
    const compoundValues = compoundSeries.map((p) => p.value)

    const { textColor, axisLineColor, splitColor, tooltipBg, tooltipText, legendColor } = config.chart

    return {
      grid: {
        left: 65,
        right: 20,
        top: 50,
        bottom: 40,
      },
      legend: {
        data: [
          { name: t('charts.simpleInterest'), itemStyle: { color: '#00d68f' } },
          { name: t('charts.compoundInterest'), itemStyle: { color: '#00e5ff' } },
        ],
        top: 5,
        textStyle: { color: legendColor, fontSize: 12 },
      },
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: tooltipBg,
        borderColor: 'rgba(0,229,255,0.2)',
        textStyle: { color: tooltipText, fontSize: 12 },
      },
      xAxis: {
        type: 'category' as const,
        data: years,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor, fontSize: 11 },
        splitLine: { show: false },
        name: t('charts.years'),
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
          name: t('charts.simpleInterest'),
          type: 'line',
          data: simpleValues,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#00d68f', width: 2 },
          itemStyle: { color: '#00d68f' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,214,143,0.25)' },
              { offset: 1, color: 'rgba(0,214,143,0.02)' },
            ]),
          },
        },
        {
          name: t('charts.compoundInterest'),
          type: 'line',
          data: compoundValues,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#00e5ff', width: 2 },
          itemStyle: { color: '#00e5ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,229,255,0.25)' },
              { offset: 1, color: 'rgba(0,229,255,0.02)' },
            ]),
          },
          markPoint: {
            data: [{ type: 'max' as const, name: 'Max' }],
            symbolSize: 40,
            label: { fontSize: 10 },
          },
          markLine: {
            data: [{ type: 'average' as const, name: 'Avg' }],
            lineStyle: { color: '#00e5ff', type: 'dashed' as const, width: 1 },
            label: { fontSize: 10 },
          },
        },
      ],
      animation: true,
      animationDuration: 800,
    }
  }, [simpleSeries, compoundSeries, t, config.chart])

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
      style={{ height: 300, width: '100%' }}
      notMerge
      lazyUpdate
    />
  )
}
