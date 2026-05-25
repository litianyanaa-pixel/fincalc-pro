import type { ThemeConfig } from './types'

export const lightTheme: ThemeConfig = {
  name: 'light',
  cssClass: 'light',
  isDark: false,

  chart: {
    textColor: '#555',
    axisLineColor: 'rgba(0,0,0,0.12)',
    splitColor: 'rgba(0,0,0,0.06)',
    tooltipBg: 'rgba(255,255,255,0.95)',
    tooltipText: '#222',
    legendColor: '#333',
  },

  slider: {
    filledColor: '#3b82f6',
    trackColor: 'rgba(0,0,0,0.1)',
    thumbBorder: '#3b82f6',
  },

  area: {
    outerFill: 'rgba(139,92,246,0.18)',
    innerFill: 'rgba(34,211,238,0.18)',
  },
}
