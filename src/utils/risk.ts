export type RiskLevel = 'loss' | 'conservative' | 'stable' | 'excellent' | 'extreme'

export interface RiskInfo {
  level: RiskLevel
  labelZh: string
  labelEn: string
  color: string
  bgColor: string
  descriptionZh: string
  descriptionEn: string
}

const riskMap: Record<RiskLevel, RiskInfo> = {
  loss: {
    level: 'loss',
    labelZh: '亏损',
    labelEn: 'Loss',
    color: '#ff3d71',
    bgColor: 'rgba(255, 61, 113, 0.1)',
    descriptionZh: '当前处于亏损状态',
    descriptionEn: 'Currently at a loss',
  },
  conservative: {
    level: 'conservative',
    labelZh: '保守',
    labelEn: 'Conservative',
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)',
    descriptionZh: '低收益率，风险较低',
    descriptionEn: 'Low return rate, low risk',
  },
  stable: {
    level: 'stable',
    labelZh: '稳健',
    labelEn: 'Stable',
    color: '#00d68f',
    bgColor: 'rgba(0, 214, 143, 0.1)',
    descriptionZh: '稳健收益，风险适中',
    descriptionEn: 'Stable returns, moderate risk',
  },
  excellent: {
    level: 'excellent',
    labelZh: '优秀',
    labelEn: 'Excellent',
    color: '#00e5ff',
    bgColor: 'rgba(0, 229, 255, 0.1)',
    descriptionZh: '优秀收益率，注意风险',
    descriptionEn: 'Excellent return, watch for risk',
  },
  extreme: {
    level: 'extreme',
    labelZh: '极强',
    labelEn: 'Extreme',
    color: '#7c3aed',
    bgColor: 'rgba(124, 58, 237, 0.1)',
    descriptionZh: '极高收益，高风险预警',
    descriptionEn: 'Extreme return, high risk alert',
  },
}

export function getRiskLevel(returnRate: number): RiskInfo {
  if (returnRate < 0) return riskMap.loss
  if (returnRate < 5) return riskMap.conservative
  if (returnRate < 15) return riskMap.stable
  if (returnRate < 30) return riskMap.excellent
  return riskMap.extreme
}

export type SafetyZone = 'low' | 'medium' | 'high' | 'extreme'

export interface SafetyInfo {
  zone: SafetyZone
  labelZh: string
  labelEn: string
  color: string
}

export function getSafetyZone(returnRate: number): SafetyInfo {
  const absRate = Math.abs(returnRate)
  if (absRate < 5) return { zone: 'low', labelZh: '低风险', labelEn: 'Low Risk', color: '#00d68f' }
  if (absRate < 15) return { zone: 'medium', labelZh: '中风险', labelEn: 'Medium Risk', color: '#ffd700' }
  if (absRate < 30) return { zone: 'high', labelZh: '高风险', labelEn: 'High Risk', color: '#ff9800' }
  return { zone: 'extreme', labelZh: '极高风险', labelEn: 'Extreme Risk', color: '#ff3d71' }
}
