import type { ThemeConfig } from './types'

export const darkTheme: ThemeConfig = {
  name: 'dark',
  cssClass: 'dark',
  isDark: true,

  chart: {
    textColor: 'rgba(255,255,255,0.5)',
    axisLineColor: 'rgba(255,255,255,0.1)',
    splitColor: 'rgba(255,255,255,0.06)',
    tooltipBg: 'rgba(6,11,24,0.9)',
    tooltipText: '#e0e0e0',
    legendColor: 'rgba(255,255,255,0.7)',
  },

  slider: {
    filledColor: '#7c3aed',
    trackColor: 'rgba(255,255,255,0.1)',
    thumbBorder: '#7c3aed',
  },

  area: {
    outerFill: 'rgba(139,92,246,0.22)',
    innerFill: 'rgba(34,211,238,0.22)',
  },
}
