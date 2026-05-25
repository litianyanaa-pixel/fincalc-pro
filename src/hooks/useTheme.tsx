import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { themes, themeNames, type ThemeName, type ThemeConfig } from '../themes'

const VALID_THEMES = new Set<string>(themeNames)

const themeColors: Record<string, string> = {
  dark: '#060b18',
  light: '#f0f2f5',
  yeshu: '#FFD700',
  niupi: '#1a0030',
  phub: '#000',
}

interface ThemeContextValue {
  theme: ThemeName
  toggleTheme: () => void
  setTheme: (name: ThemeName) => void
  isDark: boolean
  config: ThemeConfig
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: true,
  config: themes.dark,
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('fincalc-theme')
    if (saved && VALID_THEMES.has(saved)) return saved as ThemeName
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    const cfg = themes[theme]
    document.documentElement.classList.remove(...themeNames.map(n => themes[n].cssClass))
    document.documentElement.classList.add(cfg.cssClass)
    localStorage.setItem('fincalc-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme] || '#060b18')
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const idx = themeNames.indexOf(prev)
      return themeNames[(idx + 1) % themeNames.length]
    })
  }, [])

  const setTheme = useCallback((name: ThemeName) => setThemeState(name), [])

  const config = useMemo(() => themes[theme], [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: config.isDark, config }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
