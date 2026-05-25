import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'
import { useTheme } from '../../hooks/useTheme'

interface TVChartProps {
  data: { time: string; value: number }[]
  color?: string
  height?: number
}

export default function TVChart({ data, color = '#22d3ee', height = 260 }: TVChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const { config } = useTheme()

  useEffect(() => {
    if (!containerRef.current || data.length < 2) return

    const textColor = config.chart.textColor
    const gridColor = config.chart.splitColor
    const borderColor = config.chart.axisLineColor
    const crosshairColor = 'rgba(0,212,255,0.2)'

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: containerRef.current.clientWidth,
      height,
      rightPriceScale: { borderColor },
      timeScale: { borderColor, rightOffset: 4 },
      crosshair: {
        vertLine: { color: crosshairColor, width: 1, style: 2 },
        horzLine: { color: crosshairColor, width: 1, style: 2 },
      },
    })

    const series = chart.addAreaSeries({
      lineColor: color,
      topColor: `${color}33`,
      bottomColor: `${color}05`,
      lineWidth: 2,
    })

    series.setData(data)
    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [data, color, height, config.chart])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} />
      <style>{`
        .tv-lightweight-charts { overflow: hidden !important; }
        a[href*="tradingview"], a[href*="tradingview"] ~ * { display: none !important; }
        div[data-name="legend"] { display: none !important; }
      `}</style>
    </div>
  )
}
