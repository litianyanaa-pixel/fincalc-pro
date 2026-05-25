import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ResetButtonProps {
  onClick: () => void
}

export default function ResetButton({ onClick }: ResetButtonProps) {
  const { t } = useTranslation()
  const [show, setShow] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="reset-btn-icon">
        <path d="M20 20H7L3 16a1 1 0 0 1 0-1.41l9.59-9.59a2 2 0 0 1 2.82 0l5.66 5.66a2 2 0 0 1 0 2.82L13 21.18" stroke="var(--accent-cyan)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 20h13" stroke="var(--accent-cyan)" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M6.5 13.5l5 5" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {show && (
        <span
          className="absolute top-full mt-1.5 right-0 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none z-50"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {t('common.clear')}
        </span>
      )}
    </button>
  )
}
