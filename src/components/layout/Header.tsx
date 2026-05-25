import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import CurrencySelector from '../shared/CurrencySelector'
import ThemeToggle from '../ui/ThemeToggle'
import LangSelector from '../shared/LangSelector'
import type { Currency } from '../../utils/formatters'
import type { ThemeName } from '../../themes'

const tabKeys = ['returnCalc', 'reverseCalc', 'compoundCalc', 'dcaCalc', 'advanced'] as const

interface HeaderProps {
  theme: ThemeName
  setTheme: (name: ThemeName) => void
  currency: Currency
  onCurrencyChange: (currency: Currency) => void
  lang: string
  onLangChange: (lang: string) => void
  activeTab: number
}

export default function Header({
  theme,
  setTheme,
  currency,
  onCurrencyChange,
  lang,
  onLangChange,
  activeTab,
}: HeaderProps) {
  const { t } = useTranslation()
  const [compact, setCompact] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const sentinel = document.getElementById('header-sentinel')
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Invisible sentinel to detect when header scrolls out of view */}
      <div id="header-sentinel" style={{ height: 1 }} />

      <header
        ref={headerRef}
        className="glass-card"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          overflow: 'visible',
          transition: 'padding 0.25s ease',
          paddingTop: compact ? 6 : 12,
          paddingBottom: compact ? 6 : 12,
          paddingLeft: 16,
          paddingRight: 16,
          marginBottom: compact ? 0 : 16,
        }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left: Logo + Title/Subtitle stacked */}
          <div className="flex items-center gap-2.5">
            <div
              className="rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
              style={{
                background: 'var(--gradient-accent)',
                width: compact ? 28 : 40,
                height: compact ? 28 : 40,
                fontSize: compact ? 12 : 16,
                flexShrink: 0,
                transition: 'all 0.25s ease',
              }}
            >
              FC
            </div>
            <div className="flex items-stretch">
              <div className="flex flex-col justify-center">
                <h1
                  className="font-extrabold tracking-tight leading-tight"
                  style={{
                    background: 'var(--logo-gradient)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: 'gradient-text 4s linear infinite',
                    fontSize: compact ? 15 : 22,
                    lineHeight: compact ? '20px' : '28px',
                    transition: 'font-size 0.25s ease, line-height 0.25s ease',
                  }}
                >
                  FinCalc Pro
                </h1>
                <p
                  className="font-semibold leading-tight"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: compact ? 10 : 14,
                    lineHeight: compact ? '13px' : '18px',
                    marginTop: compact ? 1 : 2,
                    transition: 'font-size 0.25s ease, line-height 0.25s ease, margin-top 0.25s ease',
                  }}
                >
                  {t('app.subtitle')}
                </p>
              </div>

              {/* Current tab indicator — spans full title block height */}
              <AnimatePresence>
                {compact && (
                  <motion.span
                    initial={{ opacity: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, marginLeft: 10 }}
                    exit={{ opacity: 0, marginLeft: 0 }}
                    className="font-semibold whitespace-nowrap flex items-center"
                    style={{
                      color: 'var(--tab-active-text)',
                      background: 'var(--gradient-accent)',
                      fontSize: 11,
                      padding: '0 8px',
                      borderRadius: 4,
                    }}
                  >
                    {t(`tabs.${tabKeys[activeTab]}`)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 md:gap-3" style={{ position: 'relative', zIndex: 100 }}>
            <CurrencySelector value={currency} onChange={onCurrencyChange} />
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <LangSelector lang={lang} onLangChange={onLangChange} />
          </div>
        </div>
      </header>

      {/* Spacer for non-compact mode margin */}
      {!compact && <div className="md:mb-4" />}
    </>
  )
}
