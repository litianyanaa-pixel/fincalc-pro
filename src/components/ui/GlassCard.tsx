import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  animate?: boolean
}

export default function GlassCard({ children, className = '', animate = true }: GlassCardProps) {
  if (!animate) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={`glass-card p-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
