import type { ThemeConfig } from './types'

export const phubTheme: ThemeConfig = {
  name: 'phub',
  cssClass: 'phub',
  isDark: true,

  chart: {
    textColor: 'rgba(255,255,255,0.5)',
    axisLineColor: 'rgba(255,255,255,0.08)',
    splitColor: 'rgba(255,255,255,0.05)',
    tooltipBg: 'rgba(20,20,20,0.95)',
    tooltipText: '#fff',
    legendColor: '#ccc',
  },

  slider: {
    filledColor: '#ff9000',
    trackColor: 'rgba(255,255,255,0.08)',
    thumbBorder: '#ff9000',
  },

  area: {
    outerFill: 'rgba(255,144,0,0.15)',
    innerFill: 'rgba(255,144,0,0.25)',
  },
}
