import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme, ThemeProvider } from './hooks/useTheme'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Currency } from './utils/formatters'
import Header from './components/layout/Header'
import TabBar from './components/layout/TabBar'
import BottomBar from './components/layout/BottomBar'
import ReturnCalc from './components/modules/ReturnCalc'
import ReverseCalc from './components/modules/ReverseCalc'
import CompoundCalc from './components/modules/CompoundCalc'
import AdvancedPanel from './components/advanced/AdvancedPanel'
import DCACalc from './components/modules/DCACalc'

const tabKeys = ['returnCalc', 'reverseCalc', 'compoundCalc', 'dcaCalc', 'advanced'] as const

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

function AppContent() {
  const { theme, setTheme } = useTheme()
  const { i18n } = useTranslation()
  const [currency, setCurrency] = useLocalStorage<Currency>('fincalc-currency', 'CNY')
  const [activeTab, setActiveTab] = useState(0)

  const handleLangChange = useCallback((lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('fincalc-lang', lang)
  }, [i18n])

  const tabVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const renderTab = () => {
    switch (activeTab) {
      case 0: return <ReturnCalc currency={currency} />
      case 1: return <ReverseCalc currency={currency} />
      case 2: return <CompoundCalc currency={currency} />
      case 3: return <DCACalc currency={currency} />
      case 4: return <AdvancedPanel currency={currency} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="bg-mesh" />
      <div className="bg-grid" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header
          theme={theme}
          setTheme={setTheme}
          currency={currency}
          onCurrencyChange={setCurrency}
          lang={i18n.language}
          onLangChange={handleLangChange}
          activeTab={activeTab}
        />

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 mt-4">
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderTab()}
            </motion.div>
          </AnimatePresence>
        </main>

        <BottomBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  )
}
