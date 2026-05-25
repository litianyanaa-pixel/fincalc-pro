import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import MonteCarlo from './MonteCarlo'
import SharpeRatio from './SharpeRatio'
import MaxDrawdown from './MaxDrawdown'
import PortfolioAnalysis from './PortfolioAnalysis'
import InvestmentComparison from './InvestmentComparison'
import GoalPlanner from './GoalPlanner'
import { Currency } from '../../utils/formatters'

const tools = ['monteCarlo', 'sharpeRatio', 'maxDrawdown', 'portfolio', 'comparison', 'goalPlanner'] as const

export default function AdvancedPanel({ currency = 'CNY' as Currency }: { currency?: Currency }) {
  const { t } = useTranslation()
  const [activeTool, setActiveTool] = useState<string>('monteCarlo')

  return (
    <div className="space-y-6">
      <GlassCard>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--accent-purple)' }}>
          {t('advanced.title')}
        </h2>
        <div className="inline-flex gap-0.5 p-1 rounded-2xl tab-container">
          {tools.map(tool => {
            const isActive = activeTool === tool
            return (
              <button
                key={tool}
                onClick={() => setActiveTool(tool)}
                className="relative z-10 flex-shrink-0 px-4 py-2 rounded-xl text-[14px] font-semibold transition-colors duration-200"
                style={{ color: isActive ? 'var(--tab-active-text)' : 'var(--text-secondary)' }}
              >
                {isActive && (
                  <motion.div
                    layoutId="adv-tab-pill"
                    className="absolute inset-0 rounded-xl tab-active-bg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t(`advanced.${tool}`)}</span>
              </button>
            )
          })}
        </div>
      </GlassCard>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTool}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTool === 'monteCarlo' && <MonteCarlo />}
          {activeTool === 'sharpeRatio' && <SharpeRatio />}
          {activeTool === 'maxDrawdown' && <MaxDrawdown />}
          {activeTool === 'portfolio' && <PortfolioAnalysis />}
          {activeTool === 'comparison' && <InvestmentComparison />}
          {activeTool === 'goalPlanner' && <GoalPlanner currency={currency} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
