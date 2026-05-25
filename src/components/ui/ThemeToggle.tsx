import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ThemeName } from '../../themes'

interface ThemeToggleProps {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const themeList: { key: ThemeName; label: string; icon: JSX.Element }[] = [
  {
    key: 'dark',
    label: 'DARK',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    key: 'light',
    label: 'light',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ),
  },
  {
    key: 'yeshu',
    label: 'CLASSIC',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="9" fill="#8B4513" stroke="#5D2E0C" strokeWidth="1.5" />
        <ellipse cx="12" cy="8" rx="7" ry="3" fill="#4A2508" stroke="#5D2E0C" strokeWidth="1" />
        <circle cx="9" cy="8" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="13" cy="7.5" r="1" fill="#fff" opacity="0.6" />
      </svg>
    ),
  },
  {
    key: 'niupi',
    label: 'laser',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2" stroke="#f0f" strokeWidth="2" />
        <text x="12" y="16" textAnchor="middle" fill="#ff0" fontSize="10" fontFamily="monospace" fontWeight="bold">AD</text>
        <line x1="0" y1="0" x2="6" y2="6" stroke="#f0f" strokeWidth="1.5" />
        <line x1="24" y1="0" x2="18" y2="6" stroke="#f0f" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    key: 'phub',
    label: 'PH',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <rect x="1" y="4" width="22" height="16" rx="2" fill="#000" stroke="#ff9000" strokeWidth="1.5" />
        <text x="7" y="16" fill="#fff" fontSize="9" fontFamily="sans-serif" fontWeight="bold">P</text>
        <text x="13" y="16" fill="#ff9000" fontSize="9" fontFamily="sans-serif" fontWeight="bold">H</text>
      </svg>
    ),
  },
]

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = themeList.find(t => t.key === theme)!

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="glow-btn flex items-center justify-center w-[38px] h-[34px] !p-0 !rounded-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Select theme"
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {current.icon}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 rounded-xl py-1 z-[200] min-w-[110px]"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glass)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {themeList.map(t => (
              <button
                key={t.key}
                onClick={() => { setTheme(t.key); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors hover:bg-white/10"
                style={{
                  color: t.key === theme ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  fontWeight: t.key === theme ? 700 : 500,
                }}
              >
                <span style={{ opacity: t.key === theme ? 1 : 0.6 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
