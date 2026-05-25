import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../ui/GlassCard'
import AnimatedInput from '../ui/AnimatedInput'
import { calcSharpeRatio } from '../../utils/calculations'

function getResultColor(sharpe: number): string {
  if (sharpe >= 1) return '#00d68f'
  if (sharpe >= 0.5) return '#f59e0b'
  return '#ef4444'
}

export default function SharpeRatio() {
  const { t } = useTranslation()

  const [returnsInput, setReturnsInput] = useState('0.05, 0.08, -0.02, 0.12, 0.03')
  const [riskFreeRate, setRiskFreeRate] = useState('3')
  const [result, setResult] = useState<number | null>(null)

  const handleCalculate = () => {
    const returns = returnsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((n) => !isNaN(n))

    if (returns.length < 2) return

    const rf = parseFloat(riskFreeRate) || 0
    const sharpe = calcSharpeRatio(returns, rf / 100)
    setResult(sharpe)
  }

  const resultColor = result !== null ? getResultColor(result) : 'var(--text-primary)'

  return (
    <GlassCard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('sharpe.title')}
        </h3>

        <div className="flex flex-col gap-3 mb-4">
          <AnimatedInput
            label={t('sharpe.returns')}
            value={returnsInput}
            onChange={setReturnsInput}
            placeholder="0.05, 0.08, -0.02, 0.12, 0.03"
            allowMulti
          />
          <AnimatedInput
            label={t('sharpe.riskFreeRate')}
            value={riskFreeRate}
            onChange={setRiskFreeRate}
            placeholder="3"
            suffix="%"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalculate}
          className="w-full py-2.5 rounded-xl font-medium text-sm"
          style={{
            background: 'var(--gradient-accent)',
            color: 'var(--tab-active-text)',
          }}
        >
          {t('sharpe.calculate')}
        </motion.button>

        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <div className="glass-card p-4 rounded-xl text-center">
              <div className="text-[15px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('sharpe.result')}
              </div>
              <div className="font-num text-3xl font-bold" style={{ color: resultColor }}>
                {result.toFixed(3)}
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {t('sharpe.explanation')}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="glass-card p-2 rounded-lg">
                <span style={{ color: '#00d68f' }}>{t('sharpe.good')} (&ge;1)</span>
              </div>
              <div className="glass-card p-2 rounded-lg">
                <span style={{ color: '#f59e0b' }}>{t('sharpe.moderate')} (0.5-1)</span>
              </div>
              <div className="glass-card p-2 rounded-lg">
                <span style={{ color: '#ef4444' }}>{t('sharpe.poor')} (&lt;0.5)</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  )
}
