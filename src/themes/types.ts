export type ThemeName = 'dark' | 'light' | 'yeshu' | 'niupi' | 'phub'

export interface ThemeConfig {
  name: ThemeName
  cssClass: string
  isDark: boolean

  chart: {
    textColor: string
    axisLineColor: string
    splitColor: string
    tooltipBg: string
    tooltipText: string
    legendColor: string
  }

  slider: {
    filledColor: string
    trackColor: string
    thumbBorder: string
  }

  area: {
    outerFill: string
    innerFill: string
  }
}
