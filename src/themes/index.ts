import type { ThemeName, ThemeConfig } from './types'
import { darkTheme } from './dark'
import { lightTheme } from './light'
import { yeshuTheme } from './yeshu'
import { niupiTheme } from './niupi'
import { phubTheme } from './phub'

export type { ThemeName, ThemeConfig }

export const themes: Record<ThemeName, ThemeConfig> = {
  dark: darkTheme,
  light: lightTheme,
  yeshu: yeshuTheme,
  niupi: niupiTheme,
  phub: phubTheme,
}

export const themeNames: ThemeName[] = ['dark', 'light', 'yeshu', 'niupi', 'phub']
