import { useState, useCallback, useRef, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'

interface AnimatedInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suffix?: string
  prefix?: string
  allowMulti?: boolean
}

export default function AnimatedInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
  prefix,
  allowMulti,
}: AnimatedInputProps) {
  const [focused, setFocused] = useState(false)
  const prefixRef = useRef<HTMLSpanElement>(null)
  const [padLeft, setPadLeft] = useState(36)

  useLayoutEffect(() => {
    if (prefixRef.current) {
      setPadLeft(prefixRef.current.offsetWidth + 20)
    }
  }, [prefix])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      if (allowMulti) {
        if (/^[0-9.,\s-]*$/.test(raw)) {
          onChange(raw)
        }
      } else {
        if (/^-?\d*\.?\d*$/.test(raw)) {
          onChange(raw)
        }
      }
    },
    [onChange, allowMulti],
  )

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {label.split(/([（(][^）)]*[）)])/g).map((part, i) =>
          /^[（(]/.test(part) ? <span key={i} style={{ fontWeight: 400 }}>{part}</span> : part
        )}
      </label>
      <div className="relative">
        <motion.div
          animate={{
            boxShadow: focused
              ? '0 0 0 2px rgba(0, 212, 255, 0.08), 0 0 12px rgba(0, 212, 255, 0.06)'
              : '0 0 0 0px rgba(0, 212, 255, 0), 0 0 0px rgba(0, 212, 255, 0)',
          }}
          transition={{ duration: 0.3 }}
          className="rounded-[10px]"
        >
          <div className="relative flex items-center">
            {prefix && (
              <span
                ref={prefixRef}
                className="absolute left-3 font-num text-[16px] font-bold pointer-events-none z-[2]"
                style={{ color: 'var(--accent-cyan)' }}
              >
                {prefix}
              </span>
            )}
            <input
              type="text"
              inputMode={allowMulti ? 'text' : 'decimal'}
              value={value}
              onChange={handleChange}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              className={`glass-input font-num ${suffix ? 'pr-11' : ''}`}
              style={prefix ? { paddingLeft: `${padLeft}px`, caretColor: 'var(--text-primary)' } : undefined}
            />
            {suffix && (
              <span
                className="absolute right-3.5 text-sm pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              >
                {suffix}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
