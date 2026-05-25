import type { ThemeConfig } from './types'

export const yeshuTheme: ThemeConfig = {
  name: 'yeshu',
  cssClass: 'yeshu',
  isDark: false,

  chart: {
    textColor: '#333',
    axisLineColor: 'rgba(0,0,0,0.15)',
    splitColor: 'rgba(0,0,0,0.08)',
    tooltipBg: 'rgba(255,255,255,0.95)',
    tooltipText: '#000',
    legendColor: '#000',
  },

  slider: {
    filledColor: '#E60012',
    trackColor: 'rgba(0,0,0,0.1)',
    thumbBorder: '#E60012',
  },

  area: {
    outerFill: 'rgba(0,102,204,0.2)',
    innerFill: 'rgba(230,0,18,0.2)',
  },
}
