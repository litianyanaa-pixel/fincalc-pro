import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface BottomBarProps {
  activeTab: number
  onTabChange: (index: number) => void
}

const tabKeys = ['returnCalc', 'reverseCalc', 'compoundCalc', 'dcaCalc', 'advanced'] as const

// Simple SVG icons for each tab
const icons = [
  // ReturnCalc - chart trending up
  <svg key="rc" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>,
  // ReverseCalc - reverse arrow
  <svg key="rv" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>,
  // CompoundCalc - layers/stack
  <svg key="cc" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>,
  // DCACalc - calendar/clock
  <svg key="dca" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>,
  // Advanced - sliders
  <svg key="adv" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>,
]

export default function BottomBar({ activeTab, onTabChange }: BottomBarProps) {
  const { t } = useTranslation()

  return (
    <div className="bottom-bar md:hidden">
      <div className="flex items-center justify-around">
        {tabKeys.map((key, index) => {
          const isActive = activeTab === index
          return (
            <button
              key={key}
              onClick={() => onTabChange(index)}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent-cyan)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className="transition-colors duration-200"
                style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
              >
                {icons[index]}
              </span>
              <span
                className="text-[10px] font-semibold transition-colors duration-200"
                style={{ color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)' }}
              >
                {t(`tabs.${key}`)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
