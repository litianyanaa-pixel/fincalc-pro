import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GlassCard from '../ui/GlassCard'
import ResetButton from '../shared/ResetButton'
import { useTheme } from '../../hooks/useTheme'
import type { ThemeConfig } from '../../themes'
import MonteCarloChart from '../charts/MonteCarloChart'
import { monteCarloSimulation } from '../../utils/calculations'

interface SimulationResult {
  percentiles: {
    p5: number[]
    p25: number[]
    p50: number[]
    p75: number[]
    p95: number[]
  }
  principal: number
  medianFinal: number
  p5Final: number
  p95Final: number
  probLoss: number
}

interface MCData {
  principal: string
  expectedReturn: string
  volatility: string
  years: string
  simulations: string
}

const STORAGE_KEY = 'fincalc-mc-data'
const defaultMCData: MCData = {
  principal: '10000',
  expectedReturn: '8',
  volatility: '20',
  years: '10',
  simulations: '1000',
}

const sliderStyle = `
  input[type=range].mc-slider {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 6px; border-radius: 3px; outline: none;
    cursor: pointer; background: transparent;
  }
  input[type=range].mc-slider::-webkit-slider-runnable-track {
    height: 6px; border-radius: 3px;
    background: inherit;
  }
  input[type=range].mc-slider::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff;
    border: 3px solid #7c3aed;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    cursor: pointer; margin-top: -5px;
    position: relative; z-index: 1;
  }
  input[type=range].mc-slider::-moz-range-track {
    height: 6px; border-radius: 3px;
    background: inherit;
  }
  input[type=range].mc-slider::-moz-range-thumb {
    width: 16px; height: 16px; border-radius: 50%;
    background: #fff; border: 3px solid #7c3aed;
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    cursor: pointer;
  }
  .light input[type=range].mc-slider::-webkit-slider-thumb {
    background: #fff;
    border-color: #3b82f6;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .light input[type=range].mc-slider::-moz-range-thumb {
    background: #fff;
    border-color: #3b82f6;
    box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  }
  .yeshu input[type=range].mc-slider::-webkit-slider-thumb {
    background: #FFD700;
    border-color: #E60012;
    box-shadow: 2px 2px 0 #000;
  }
  .yeshu input[type=range].mc-slider::-moz-range-thumb {
    background: #FFD700;
    border-color: #E60012;
    box-shadow: 2px 2px 0 #000;
  }
  .niupi input[type=range].mc-slider::-webkit-slider-thumb {
    background: #ff0;
    border-color: #f0f;
    box-shadow: 2px 2px 0 #0f0;
  }
  .niupi input[type=range].mc-slider::-moz-range-thumb {
    background: #ff0;
    border-color: #f0f;
    box-shadow: 2px 2px 0 #0f0;
  }
  .phub input[type=range].mc-slider::-webkit-slider-thumb {
    background: #fff;
    border-color: #ff9000;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
  .phub input[type=range].mc-slider::-moz-range-thumb {
    background: #fff;
    border-color: #ff9000;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
`

function ParamGroup({
  label, value, suffix, placeholder, themeConfig,
  sliderValue, min, max, step, hint,
  onInputChange, onSliderChange,
}: {
  label: string
  value: string; suffix?: string; placeholder?: string
  themeConfig: ThemeConfig
  sliderValue: number; min: number; max: number; step: number
  hint: string
  onInputChange: (v: string) => void
  onSliderChange: (v: string) => void
}) {
  const pct = Math.max(0, Math.min(100, ((sliderValue - min) / (max - min)) * 100))
  const { filledColor, trackColor } = themeConfig.slider

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'var(--param-group-bg, rgba(255,255,255,0.04))',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {label}
        </span>
        <span className="text-[13px] font-num font-medium" style={{ color: 'var(--accent-cyan)' }}>
          {parseFloat(value || '0').toLocaleString()}{suffix || ''}
        </span>
      </div>
      <input
        type="range" className="mc-slider"
        min={min} max={max} step={step}
        value={sliderValue}
        onChange={(e) => onSliderChange(e.target.value)}
        style={{
          background: `linear-gradient(to right, ${filledColor} ${pct}%, ${trackColor} ${pct}%)`,
        }}
      />
      <div className="flex justify-between items-center mt-1">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{hint}</span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {min.toLocaleString()} — {max.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export default function MonteCarlo() {
  const { t } = useTranslation()
  const { config } = useTheme()

  const [data, setData] = useState<MCData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? { ...defaultMCData, ...JSON.parse(saved) } : defaultMCData
    } catch {
      return defaultMCData
    }
  })
  const [result, setResult] = useState<SimulationResult | null>(null)
  const autoTimer = useRef<ReturnType<typeof setTimeout>>()

  const saveTimer = useRef<ReturnType<typeof setTimeout>>()
  const saveData = useCallback((d: MCData) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch { /* quota */ }
    }, 300)
  }, [])

  const update = useCallback(
    (field: keyof MCData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value }
        saveData(next)
        return next
      })
    },
    [saveData],
  )

  const principal = data.principal
  const expectedReturn = data.expectedReturn
  const volatility = data.volatility
  const years = data.years
  const simulations = data.simulations

  const runSim = useCallback(() => {
    const p = parseFloat(principal) || 0
    const r = parseFloat(expectedReturn) || 0
    const v = parseFloat(volatility) || 0
    const y = parseInt(years, 10) || 0
    const s = parseInt(simulations, 10) || 1000

    if (p <= 0 || y <= 0) return

    const sim = monteCarloSimulation(p, r, v, y, s)
    const finalValues = sim.paths.map((path) => path[path.length - 1])
    const probLoss = finalValues.filter((val) => val < p).length / finalValues.length

    setResult({
      percentiles: sim.percentiles,
      principal: p,
      medianFinal: sim.percentiles.p50[sim.percentiles.p50.length - 1],
      p5Final: sim.percentiles.p5[sim.percentiles.p5.length - 1],
      p95Final: sim.percentiles.p95[sim.percentiles.p95.length - 1],
      probLoss,
    })
  }, [principal, expectedReturn, volatility, years, simulations])

  const autoRun = useCallback(() => {
    clearTimeout(autoTimer.current)
    autoTimer.current = setTimeout(runSim, 400)
  }, [runSim])

  useEffect(() => () => {
    clearTimeout(autoTimer.current)
    clearTimeout(saveTimer.current)
  }, [])

  const handleReset = useCallback(() => {
    setData(defaultMCData)
    setResult(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <GlassCard>
      <ResetButton onClick={handleReset} />
      <style>{sliderStyle}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('monteCarlo.title')}
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <ParamGroup
            label={t('monteCarlo.principal')}
            value={principal} themeConfig={config}
            sliderValue={parseFloat(principal) || 1000}
            min={1000} max={1000000} step={1000}
            hint={t('monteCarlo.sliderHintPrincipal')}
            onInputChange={(v) => { update('principal', v); autoRun() }}
            onSliderChange={(v) => { update('principal', v); autoRun() }}
          />
          <ParamGroup
            label={t('monteCarlo.expectedReturn')}
            value={expectedReturn} suffix="%" themeConfig={config}
            sliderValue={parseFloat(expectedReturn) || 0}
            min={-10} max={50} step={0.5}
            hint={t('monteCarlo.sliderHintReturn')}
            onInputChange={(v) => { update('expectedReturn', v); autoRun() }}
            onSliderChange={(v) => { update('expectedReturn', v); autoRun() }}
          />
          <ParamGroup
            label={t('monteCarlo.volatility')}
            value={volatility} suffix="%" themeConfig={config}
            sliderValue={parseFloat(volatility) || 1}
            min={1} max={80} step={1}
            hint={t('monteCarlo.sliderHintVolatility')}
            onInputChange={(v) => { update('volatility', v); autoRun() }}
            onSliderChange={(v) => { update('volatility', v); autoRun() }}
          />
          <ParamGroup
            label={t('monteCarlo.years')}
            value={years} themeConfig={config}
            sliderValue={parseFloat(years) || 1}
            min={1} max={50} step={1}
            hint={t('monteCarlo.sliderHintYears')}
            onInputChange={(v) => { update('years', v); autoRun() }}
            onSliderChange={(v) => { update('years', v); autoRun() }}
          />
        </div>

        <ParamGroup
          label={t('monteCarlo.simulations')}
          value={simulations} themeConfig={config}
          sliderValue={parseFloat(simulations) || 100}
          min={100} max={5000} step={100}
          hint={t('monteCarlo.sliderHintSimulations')}
          onInputChange={(v) => { update('simulations', v); autoRun() }}
          onSliderChange={(v) => { update('simulations', v); autoRun() }}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={runSim}
          className="w-full py-2.5 rounded-xl font-medium text-sm mt-4"
          style={{
            background: 'var(--gradient-accent)',
            color: 'var(--tab-active-text)',
          }}
        >
          {t('monteCarlo.runSimulation')}
        </motion.button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <MonteCarloChart percentiles={result.percentiles} principal={result.principal} />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('monteCarlo.medianFinal')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#00e5ff' }}>
                  {Math.round(result.medianFinal).toLocaleString()}
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('monteCarlo.p5Final')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#f59e0b' }}>
                  {Math.round(result.p5Final).toLocaleString()}
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('monteCarlo.p95Final')}
                </div>
                <div className="font-num font-semibold" style={{ color: '#00d68f' }}>
                  {Math.round(result.p95Final).toLocaleString()}
                </div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {t('monteCarlo.probLoss')}
                </div>
                <div
                  className="font-num font-semibold"
                  style={{ color: result.probLoss > 0.2 ? '#ef4444' : result.probLoss > 0.05 ? '#f59e0b' : '#00d68f' }}
                >
                  {(result.probLoss * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  )
}
