import type { ThemeConfig } from './types'

export const niupiTheme: ThemeConfig = {
  name: 'niupi',
  cssClass: 'niupi',
  isDark: true,

  chart: {
    textColor: '#ff0',
    axisLineColor: 'rgba(255,0,255,0.15)',
    splitColor: 'rgba(255,0,255,0.08)',
    tooltipBg: 'rgba(26,0,48,0.95)',
    tooltipText: '#ff0',
    legendColor: '#0ff',
  },

  slider: {
    filledColor: '#f0f',
    trackColor: 'rgba(255,0,255,0.1)',
    thumbBorder: '#f0f',
  },

  area: {
    outerFill: 'rgba(255,0,255,0.18)',
    innerFill: 'rgba(0,255,255,0.15)',
  },
}
