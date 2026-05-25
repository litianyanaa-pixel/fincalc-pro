import { describe, it, expect } from 'vitest'
import { getRiskLevel, getSafetyZone } from '../utils/risk'

// ========================
// 风险等级评估
// ========================
describe('getRiskLevel 风险等级', () => {
  it('负收益 = 亏损', () => {
    const result = getRiskLevel(-10)
    expect(result.level).toBe('loss')
    expect(result.color).toBe('#ff3d71')
  })

  it('0~5% = 保守', () => {
    const result = getRiskLevel(3)
    expect(result.level).toBe('conservative')
    expect(result.color).toBe('#ff9800')
  })

  it('5~15% = 稳健', () => {
    const result = getRiskLevel(10)
    expect(result.level).toBe('stable')
    expect(result.color).toBe('#00d68f')
  })

  it('15~30% = 优秀', () => {
    const result = getRiskLevel(20)
    expect(result.level).toBe('excellent')
    expect(result.color).toBe('#00e5ff')
  })

  it('30%以上 = 极强', () => {
    const result = getRiskLevel(50)
    expect(result.level).toBe('extreme')
    expect(result.color).toBe('#7c3aed')
  })

  it('边界值：0%属于保守', () => {
    expect(getRiskLevel(0).level).toBe('conservative')
  })

  it('边界值：4.99%属于保守', () => {
    expect(getRiskLevel(4.99).level).toBe('conservative')
  })

  it('边界值：5%属于稳健', () => {
    expect(getRiskLevel(5).level).toBe('stable')
  })

  it('边界值：14.99%属于稳健', () => {
    expect(getRiskLevel(14.99).level).toBe('stable')
  })

  it('边界值：15%属于优秀', () => {
    expect(getRiskLevel(15).level).toBe('excellent')
  })

  it('边界值：29.99%属于优秀', () => {
    expect(getRiskLevel(29.99).level).toBe('excellent')
  })

  it('边界值：30%属于极强', () => {
    expect(getRiskLevel(30).level).toBe('extreme')
  })

  it('包含中英文标签', () => {
    const result = getRiskLevel(10)
    expect(result.labelZh).toBeTruthy()
    expect(result.labelEn).toBeTruthy()
    expect(result.descriptionZh).toBeTruthy()
    expect(result.descriptionEn).toBeTruthy()
  })
})

// ========================
// 安全区间评估
// ========================
describe('getSafetyZone 安全区间', () => {
  it('低风险：0~5%', () => {
    expect(getSafetyZone(3).zone).toBe('low')
  })

  it('中风险：5~15%', () => {
    expect(getSafetyZone(10).zone).toBe('medium')
  })

  it('高风险：15~30%', () => {
    expect(getSafetyZone(20).zone).toBe('high')
  })

  it('极高风险：30%+', () => {
    expect(getSafetyZone(50).zone).toBe('extreme')
  })

  it('负收益率取绝对值', () => {
    expect(getSafetyZone(-10).zone).toBe('medium')
  })

  it('包含中英文标签', () => {
    const result = getSafetyZone(10)
    expect(result.labelZh).toBeTruthy()
    expect(result.labelEn).toBeTruthy()
  })
})
