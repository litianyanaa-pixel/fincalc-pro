import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getRiskLevel, getSafetyZone } from '../../utils/risk'

interface RiskBadgeProps {
  returnRate?: number
  risk?: ReturnType<typeof getRiskLevel>
}

export default function RiskBadge({ returnRate, risk: riskProp }: RiskBadgeProps) {
  const { i18n } = useTranslation()
  const risk = riskProp || (returnRate !== undefined ? getRiskLevel(returnRate) : getRiskLevel(0))
  const safety = getSafetyZone(returnRate ?? 0)
  const isZh = i18n.language === 'zh'
  const label = isZh ? risk.labelZh : risk.labelEn
  const safetyLabel = isZh ? safety.labelZh : safety.labelEn

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-start gap-1.5"
    >
      <span
        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          color: risk.color,
          backgroundColor: risk.bgColor,
          border: `1px solid ${risk.color}33`,
        }}
      >
        {label}
      </span>
      <span className="text-xs" style={{ color: safety.color }}>
        {safetyLabel}
      </span>
    </motion.div>
  )
}
