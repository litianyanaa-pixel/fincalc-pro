import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../ui/GlassCard'
import AnimatedInput from '../ui/AnimatedInput'
import { calcPortfolioStats } from '../../utils/calculations'

interface PortfolioResult {
  expectedReturn: number
  volatility: number
  sharpe: number
}

function getSharpeColor(sharpe: number): string {
  if (sharpe >= 1) return '#00d68f'
  if (sharpe >= 0.5) return '#f59e0b'
  return '#ef4444'
}

const ASSET_COLORS = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981', '#f43f5e', '#3b82f6', '#ec4899']

export default function PortfolioAnalysis() {
  const { t } = useTranslation()

  const [weightsInput, setWeightsInput] = useState('40, 40, 20')
  const [assetReturns, setAssetReturns] = useState<string[]>([
    '0.05, 0.08, -0.02, 0.12, 0.03',
    '0.03, 0.06, 0.01, -0.04, 0.07',
    '0.02, -0.01, 0.04, 0.05, 0.03',
  ])
  const [result, setResult] = useState<PortfolioResult | null>(null)
  const [normalizedWeights, setNormalizedWeights] = useState<number[]>([])

  const addAsset = () => {
    if (assetReturns.length < 7) {
      setAssetReturns(prev => [...prev, '0.00, 0.00, 0.00, 0.00, 0.00'])
      const parts = weightsInput.split(',').map(s => s.trim()).filter(s => s !== '')
      parts.push('0')
      setWeightsInput(parts.join(', '))
    }
  }

  const removeAsset = (index: number) => {
    if (assetReturns.length <= 2) return
    setAssetReturns(prev => prev.filter((_, i) => i !== index))
    const parts = weightsInput.split(',').map(s => s.trim()).filter(s => s !== '')
    parts.splice(index, 1)
    setWeightsInput(parts.join(', '))
    setResult(null)
  }

  const updateAssetReturn = (index: number, value: string) => {
    setAssetReturns(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleCalculate = () => {
    const rawWeights = weightsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((n) => !isNaN(n))

    const parseReturns = (input: string) =>
      input
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '')
        .map(Number)
        .filter((n) => !isNaN(n))

    const returns: number[][] = assetReturns
      .map(input => parseReturns(input))
      .filter(r => r.length > 0)

    if (rawWeights.length < 2 || returns.length < 2) return

    const activeCount = returns.length
    const weights = rawWeights.slice(0, activeCount)

    const sum = weights.reduce((a, b) => a + b, 0)
    const normalized = sum > 0 ? weights.map((w) => w / sum) : weights.map(() => 1 / activeCount)

    setNormalizedWeights(normalized)

    const stats = calcPortfolioStats(normalized, returns)
    setResult(stats)
  }

  const weightDisplay = useMemo(() => {
    if (normalizedWeights.length === 0) return null
    const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].slice(0, normalizedWeights.length)
    return labels.map((label, i) => ({
      label: `${t('portfolio.asset')} ${label}`,
      weight: (normalizedWeights[i] * 100).toFixed(1),
      color: ASSET_COLORS[i % ASSET_COLORS.length],
    }))
  }, [normalizedWeights, t])

  return (
    <GlassCard>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('portfolio.title')}
        </h3>

        <div className="flex flex-col gap-3 mb-4">
          <AnimatedInput
            label={t('portfolio.weights')}
            value={weightsInput}
            onChange={setWeightsInput}
            placeholder="40, 40, 20"
            suffix="%"
            allowMulti
          />
          {assetReturns.map((ret, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <AnimatedInput
                  label={`${t('portfolio.asset')} ${'ABCDEFG'[i]} ${t('portfolio.returns')}`}
                  value={ret}
                  onChange={(v) => updateAssetReturn(i, v)}
                  placeholder="0.05, 0.08, -0.02, 0.12, 0.03"
                  allowMulti
                />
              </div>
              {assetReturns.length > 2 && (
                <button
                  onClick={() => removeAsset(i)}
                  className="mt-5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0"
                  style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.15)' }}
                  title={t('comparison.remove')}
                  type="button"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {assetReturns.length < 7 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addAsset}
            className="w-full py-2 rounded-xl text-sm font-semibold mb-4"
            style={{ border: '1px dashed var(--border-glass)', color: 'var(--text-muted)' }}
            type="button"
          >
            + {t('comparison.add')}
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCalculate}
          className="w-full py-2.5 rounded-xl font-medium text-sm"
          style={{
            background: 'var(--gradient-accent)',
            color: 'var(--tab-active-text)',
          }}
          type="button"
        >
          {t('portfolio.calculate')}
        </motion.button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            {weightDisplay && (
              <div className="glass-card p-3 rounded-xl mb-4">
                <div className="text-[15px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {t('portfolio.normalizedWeights')}
                </div>
                <div className="flex gap-3 justify-center flex-wrap">
                  {weightDisplay.map((w) => (
                    <span key={w.label} className="text-xs font-num" style={{ color: w.color }}>
                      {w.label}: {w.weight}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('portfolio.expectedReturn')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#00e5ff' }}>
                  {result.expectedReturn.toFixed(2)}%
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('portfolio.volatility')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#f59e0b' }}>
                  {result.volatility.toFixed(2)}%
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('portfolio.sharpe')}
                </div>
                <div className="font-num font-semibold" style={{ color: getSharpeColor(result.sharpe) }}>
                  {result.sharpe.toFixed(3)}
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {t('portfolio.hint')}
            </p>
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  )
}
