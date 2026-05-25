import { useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export type DurationUnit = 'day' | 'month' | 'year'

interface UnitToggleProps {
  value: DurationUnit
  onChange: (unit: DurationUnit) => void
  layoutId: string
}

const units: DurationUnit[] = ['day', 'month', 'year']

export default function UnitToggle({ value, onChange, layoutId }: UnitToggleProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0 })

  const activeIndex = units.indexOf(value)

  useLayoutEffect(() => {
    const btn = btnRefs.current[activeIndex]
    const container = containerRef.current
    if (btn && container) {
      const cr = container.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      setPill({ left: br.left - cr.left, width: br.width })
    }
  }, [value, activeIndex])

  return (
    <div ref={containerRef} className="unit-toggle-container" style={{ position: 'relative' }}>
      <motion.div
        initial={false}
        animate={{ x: pill.left, width: pill.width }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: 0,
          borderRadius: 8,
          background: 'var(--gradient-accent)',
          zIndex: 0,
        }}
      />
      {units.map((u, i) => {
        const isActive = value === u
        return (
          <button
            key={u}
            ref={(el) => { btnRefs.current[i] = el }}
            onClick={() => onChange(u)}
            className="unit-toggle-btn relative z-10"
            type="button"
            style={{ color: isActive ? '#fff' : 'var(--text-muted)' }}
          >
            {t(`common.${u}`)}
          </button>
        )
      })}
    </div>
  )
}
