import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

interface TabBarProps {
  activeTab: number
  onTabChange: (index: number) => void
}

const tabKeys = ['returnCalc', 'reverseCalc', 'compoundCalc', 'dcaCalc', 'advanced'] as const

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useTranslation()

  return (
    <nav
      className="relative inline-flex gap-0.5 p-1 rounded-2xl tab-container"
    >
      {tabKeys.map((key, index) => {
        const isActive = activeTab === index
        return (
          <button
            key={key}
            onClick={() => onTabChange(index)}
            className="relative z-10 flex-shrink-0 px-5 py-2 rounded-xl text-[15px] font-semibold transition-colors duration-200"
            style={{ color: isActive ? 'var(--tab-active-text)' : 'var(--text-secondary)' }}
          >
            {isActive && (
              <motion.div
                layoutId="main-tab-pill"
                className="absolute inset-0 rounded-xl tab-active-bg"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{t(`tabs.${key}`)}</span>
          </button>
        )
      })}
    </nav>
  )
}
