import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'zh', label: '中文', short: '中' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: '日' },
  { code: 'ko', label: '한국어', short: '한' },
  { code: 'fr', label: 'Français', short: 'FR' },
]

interface LangSelectorProps {
  lang: string
  onLangChange: (lang: string) => void
}

export default function LangSelector({ lang, onLangChange }: LangSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const current = languages.find((l) => l.code === lang) || languages[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="glow-btn !py-[7px] !px-3 !text-sm !font-semibold !rounded-lg flex items-center gap-1.5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {current.short}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 py-1 rounded-xl z-50 min-w-[140px]"
          style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => { onLangChange(l.code); setOpen(false) }}
              className="w-full text-left px-4 py-2 text-sm font-semibold transition-colors duration-150"
              style={{
                color: l.code === lang ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                background: l.code === lang ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (l.code !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                if (l.code !== lang) e.currentTarget.style.background = 'transparent'
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
