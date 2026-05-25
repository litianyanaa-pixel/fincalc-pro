import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '../../utils/formatters'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
  positive?: boolean
  colored?: boolean
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function useAnimatedValue(target: number, duration = 800): number {
  const [display, setDisplay] = useState(target)
  const startRef = useRef<number>(target)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    const from = startRef.current
    if (from === target) return

    startTimeRef.current = performance.now()
    startRef.current = target

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = from + (target - from) * eased
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return display
}

export default function AnimatedNumber({
  value,
  decimals = 2,
  className = '',
  prefix,
  suffix,
  positive,
  colored,
}: AnimatedNumberProps) {
  const animated = useAnimatedValue(value)

  const colorClass =
    positive === true || colored === true
      ? 'result-positive'
      : positive === false
        ? 'result-negative'
        : ''

  const formatted = formatNumber(animated, decimals)

  return (
    <span className={`result-value ${colorClass} ${className}`.trim()}>
      {prefix && <span style={{ fontSize: '0.75em', opacity: 0.7, marginRight: '2px' }}>{prefix}</span>}
      {formatted}
      {suffix}
    </span>
  )
}
