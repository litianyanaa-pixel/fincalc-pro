import { useEffect, useRef } from 'react'
import { createChart, ColorType, LineStyle } from 'lightweight-charts'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../hooks/useTheme'

interface TrendDataPoint {
  time: string
  value: number
}

interface TrendChartProps {
  data: TrendDataPoint[]
}

export default function TrendChart({ data }: TrendChartProps) {
  const { t } = useTranslation()
  const { config } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addLineSeries']> | null>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }

    const textColor = config.chart.textColor
    const gridColor = config.chart.splitColor
    const borderColor = config.chart.axisLineColor

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor, style: LineStyle.Solid },
        horzLines: { color: gridColor, style: LineStyle.Solid },
      },
      width: containerRef.current.clientWidth,
      height: 280,
      rightPriceScale: {
        borderColor,
      },
      timeScale: {
        borderColor,
      },
      crosshair: {
        vertLine: { color: 'rgba(0,229,255,0.3)' },
        horzLine: { color: 'rgba(0,229,255,0.3)' },
      },
    })

    const series = chart.addLineSeries({
      color: '#00e5ff',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    })

    series.setData(data)
    chart.timeScale().fitContent()

    chartRef.current = chart
    seriesRef.current = series

    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth })
      }
    }

    const observer = new ResizeObserver(handleResize)
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [data, config.chart])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--text-muted)' }}>
        {t('charts.noData')}
      </div>
    )
  }

  return <div ref={containerRef} className="w-full rounded-xl overflow-hidden" />
}
