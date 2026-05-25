import { describe, it, expect } from 'vitest'
import {
  calcReturnRate,
  calcAnnualizedRate,
  calcHoldingAmount,
  calcHoldingProfit,
  calcSimpleProfit,
  calcCompoundAmount,
  calcCompoundProfit,
  generateCompoundSeries,
  generateSimpleSeries,
  calcReverseReturn,
  calcSharpeRatio,
  calcMaxDrawdown,
  calcPortfolioStats,
  monteCarloSimulation,
  calcDCASeries,
  calcDCASummary,
  calcGoalPlan,
  calcRealReturn,
} from '../utils/calculations'

// ========================
// 1. 收益率计算模块
// ========================
describe('收益率计算', () => {
  describe('calcReturnRate', () => {
    it('正常计算收益率', () => {
      expect(calcReturnRate(10000, 1000)).toBe(10)
    })

    it('零收益', () => {
      expect(calcReturnRate(10000, 0)).toBe(0)
    })

    it('负收益（亏损）', () => {
      expect(calcReturnRate(10000, -2000)).toBe(-20)
    })

    it('买入金额为零时返回0', () => {
      expect(calcReturnRate(0, 1000)).toBe(0)
    })

    it('大额投资计算', () => {
      expect(calcReturnRate(1000000, 150000)).toBe(15)
    })
  })

  describe('calcAnnualizedRate', () => {
    it('持有一整年的年化收益率', () => {
      expect(calcAnnualizedRate(10, 365)).toBeCloseTo(10, 5)
    })

    it('持有半年的年化收益率应翻倍', () => {
      expect(calcAnnualizedRate(10, 182.5)).toBeCloseTo(20, 5)
    })

    it('持有0天返回0', () => {
      expect(calcAnnualizedRate(10, 0)).toBe(0)
    })

    it('持有1天的年化收益率', () => {
      expect(calcAnnualizedRate(10, 1)).toBeCloseTo(3650, 0)
    })

    it('持有730天（两年）的年化收益率应减半', () => {
      expect(calcAnnualizedRate(20, 730)).toBeCloseTo(10, 5)
    })
  })

  describe('calcHoldingAmount', () => {
    it('买入金额 + 收益 = 持仓金额', () => {
      expect(calcHoldingAmount(10000, 1000)).toBe(11000)
    })

    it('负收益时持仓金额减少', () => {
      expect(calcHoldingAmount(10000, -3000)).toBe(7000)
    })

    it('零收益时持仓金额等于买入金额', () => {
      expect(calcHoldingAmount(10000, 0)).toBe(10000)
    })
  })

  describe('calcHoldingProfit', () => {
    it('持仓金额 - 买入金额 = 收益', () => {
      expect(calcHoldingProfit(10000, 12000)).toBe(2000)
    })

    it('持仓金额低于买入金额时为负收益', () => {
      expect(calcHoldingProfit(10000, 8000)).toBe(-2000)
    })

    it('持仓金额等于买入金额时收益为0', () => {
      expect(calcHoldingProfit(10000, 10000)).toBe(0)
    })
  })
})

// ========================
// 2. 收益反推模块
// ========================
describe('收益反推计算', () => {
  describe('calcReverseReturn', () => {
    it('一年期正常计算', () => {
      const result = calcReverseReturn(10000, 10, 365)
      expect(result.profit).toBe(1000)
      expect(result.total).toBe(11000)
    })

    it('半年期计算', () => {
      const result = calcReverseReturn(10000, 12, 182.5)
      expect(result.profit).toBeCloseTo(600, 0)
      expect(result.total).toBeCloseTo(10600, 0)
    })

    it('零天投资', () => {
      const result = calcReverseReturn(10000, 10, 0)
      expect(result.profit).toBe(0)
      expect(result.total).toBe(10000)
    })

    it('零利率', () => {
      const result = calcReverseReturn(50000, 0, 365)
      expect(result.profit).toBe(0)
      expect(result.total).toBe(50000)
    })

    it('结果保留两位小数', () => {
      const result = calcReverseReturn(10000, 7, 100)
      expect(result.profit).toBe(Math.round(result.profit * 100) / 100)
      expect(result.total).toBe(Math.round(result.total * 100) / 100)
    })
  })
})

// ========================
// 3. 复利计算模块
// ========================
describe('复利计算', () => {
  describe('calcSimpleProfit', () => {
    it('单利正常计算', () => {
      expect(calcSimpleProfit(10000, 10, 3)).toBe(3000)
    })

    it('零年数', () => {
      expect(calcSimpleProfit(10000, 10, 0)).toBe(0)
    })

    it('零利率', () => {
      expect(calcSimpleProfit(10000, 0, 5)).toBe(0)
    })
  })

  describe('calcCompoundAmount', () => {
    it('一年复利', () => {
      expect(calcCompoundAmount(10000, 10, 1)).toBeCloseTo(11000, 2)
    })

    it('多年复利', () => {
      // 10000 * (1.1)^3 = 13310
      expect(calcCompoundAmount(10000, 10, 3)).toBeCloseTo(13310, 0)
    })

    it('零年复利等于本金', () => {
      expect(calcCompoundAmount(10000, 10, 0)).toBe(10000)
    })

    it('高利率多年复利', () => {
      // 1000 * (1.5)^10 ≈ 57665.04
      expect(calcCompoundAmount(1000, 50, 10)).toBeCloseTo(57665.04, 0)
    })
  })

  describe('calcCompoundProfit', () => {
    it('复利收益 = 终值 - 本金', () => {
      expect(calcCompoundProfit(10000, 10, 1)).toBeCloseTo(1000, 2)
    })

    it('复利收益应大于单利收益', () => {
      const simpleProfit = calcSimpleProfit(10000, 10, 10)
      const compoundProfit = calcCompoundProfit(10000, 10, 10)
      expect(compoundProfit).toBeGreaterThan(simpleProfit)
    })
  })

  describe('generateCompoundSeries', () => {
    it('生成年数+1个数据点', () => {
      const series = generateCompoundSeries(10000, 10, 5)
      expect(series).toHaveLength(6) // 0~5年
    })

    it('第0年等于本金', () => {
      const series = generateCompoundSeries(10000, 10, 5)
      expect(series[0].value).toBe(10000)
      expect(series[0].profit).toBe(0)
    })

    it('逐年递增', () => {
      const series = generateCompoundSeries(10000, 10, 5)
      for (let i = 1; i < series.length; i++) {
        expect(series[i].value).toBeGreaterThan(series[i - 1].value)
      }
    })

    it('最后一年终值正确', () => {
      const series = generateCompoundSeries(10000, 10, 3)
      expect(series[3].value).toBeCloseTo(13310, 0)
    })
  })

  describe('generateSimpleSeries', () => {
    it('生成年数+1个数据点', () => {
      const series = generateSimpleSeries(10000, 10, 5)
      expect(series).toHaveLength(6)
    })

    it('第0年等于本金', () => {
      const series = generateSimpleSeries(10000, 10, 5)
      expect(series[0].value).toBe(10000)
    })

    it('每年等额增长', () => {
      const series = generateSimpleSeries(10000, 10, 5)
      const diff = series[1].value - series[0].value
      for (let i = 2; i < series.length; i++) {
        expect(series[i].value - series[i - 1].value).toBeCloseTo(diff, 2)
      }
    })
  })
})

// ========================
// 4. 蒙特卡洛模拟
// ========================
describe('蒙特卡洛模拟', () => {
  it('返回正确数量的模拟路径', () => {
    const result = monteCarloSimulation(10000, 8, 15, 1, 100)
    expect(result.paths).toHaveLength(50) // 最多返回50条
  })

  it('每条路径的长度等于月数+1', () => {
    const result = monteCarloSimulation(10000, 8, 15, 2, 100)
    const expectedLength = 2 * 12 + 1 // 25个月度点
    result.paths.forEach(path => {
      expect(path).toHaveLength(expectedLength)
    })
  })

  it('每条路径起始值等于本金', () => {
    const result = monteCarloSimulation(10000, 8, 15, 1, 50)
    result.paths.forEach(path => {
      expect(path[0]).toBe(10000)
    })
  })

  it('百分位数组长度正确', () => {
    const result = monteCarloSimulation(10000, 8, 15, 2, 100)
    const expectedLength = 2 * 12 + 1
    expect(result.percentiles.p5).toHaveLength(expectedLength)
    expect(result.percentiles.p50).toHaveLength(expectedLength)
    expect(result.percentiles.p95).toHaveLength(expectedLength)
  })

  it('中位数应在合理范围内（正收益时）', () => {
    const result = monteCarloSimulation(10000, 10, 5, 10, 1000)
    const finalMedian = result.percentiles.p50[result.percentiles.p50.length - 1]
    expect(finalMedian).toBeGreaterThan(10000)
  })

  it('高波动率的分布应更宽', () => {
    const lowVol = monteCarloSimulation(10000, 8, 5, 5, 500)
    const highVol = monteCarloSimulation(10000, 8, 30, 5, 500)
    const lowSpread = lowVol.percentiles.p95[lowVol.percentiles.p95.length - 1] - lowVol.percentiles.p5[lowVol.percentiles.p5.length - 1]
    const highSpread = highVol.percentiles.p95[highVol.percentiles.p95.length - 1] - highVol.percentiles.p5[highVol.percentiles.p5.length - 1]
    expect(highSpread).toBeGreaterThan(lowSpread)
  })
})

// ========================
// 5. 夏普比率
// ========================
describe('夏普比率', () => {
  it('正常计算', () => {
    const returns = [0.05, 0.08, 0.03, 0.10, 0.06]
    const sharpe = calcSharpeRatio(returns, 0.03)
    expect(sharpe).toBeGreaterThan(0)
  })

  it('所有收益率相同时标准差为0，返回0', () => {
    const returns = [0.05, 0.05, 0.05, 0.05]
    expect(calcSharpeRatio(returns, 0.03)).toBe(0)
  })

  it('只有一个数据点时返回0', () => {
    expect(calcSharpeRatio([0.1], 0.03)).toBe(0)
  })

  it('空数组返回0', () => {
    expect(calcSharpeRatio([], 0.03)).toBe(0)
  })

  it('高收益低波动应得高夏普', () => {
    const goodReturns = [0.10, 0.12, 0.11, 0.10, 0.12]
    const badReturns = [0.02, -0.05, 0.15, -0.10, 0.08]
    const goodSharpe = calcSharpeRatio(goodReturns, 0.03)
    const badSharpe = calcSharpeRatio(badReturns, 0.03)
    expect(goodSharpe).toBeGreaterThan(badSharpe)
  })
})

// ========================
// 6. 最大回撤
// ========================
describe('最大回撤', () => {
  it('单调递增序列无回撤', () => {
    const result = calcMaxDrawdown([100, 110, 120, 130, 140])
    expect(result.maxDrawdown).toBe(0)
  })

  it('简单回撤场景', () => {
    // 100 -> 120 -> 90 -> 110
    // 最大回撤: 从120到90 = 25%
    const result = calcMaxDrawdown([100, 120, 90, 110])
    expect(result.maxDrawdown).toBeCloseTo(25, 1)
    expect(result.peakIndex).toBe(1)
    expect(result.troughIndex).toBe(2)
  })

  it('持续下跌场景', () => {
    const result = calcMaxDrawdown([100, 90, 80, 70])
    // 从100跌到70 = 30%
    expect(result.maxDrawdown).toBeCloseTo(30, 1)
    expect(result.peakIndex).toBe(0)
    expect(result.troughIndex).toBe(3)
  })

  it('V形恢复场景', () => {
    // 100 -> 50 -> 120
    // 最大回撤: 从100到50 = 50%
    const result = calcMaxDrawdown([100, 50, 120])
    expect(result.maxDrawdown).toBeCloseTo(50, 1)
  })

  it('两个数据点', () => {
    const result = calcMaxDrawdown([100, 80])
    expect(result.maxDrawdown).toBeCloseTo(20, 1)
  })
})

// ========================
// 7. 投资组合分析
// ========================
describe('投资组合分析', () => {
  it('单资产组合', () => {
    const weights = [1]
    const returns = [[0.05, 0.08, 0.03, 0.10]]
    const result = calcPortfolioStats(weights, returns, 0.03)
    expect(result.expectedReturn).toBeGreaterThan(0)
  })

  it('空权重返回0', () => {
    const result = calcPortfolioStats([], [], 0.03)
    expect(result.expectedReturn).toBe(0)
    expect(result.volatility).toBe(0)
    expect(result.sharpe).toBe(0)
  })

  it('双资产组合', () => {
    const weights = [0.6, 0.4]
    const returns = [
      [0.05, 0.08, 0.03],
      [0.04, 0.06, 0.02],
    ]
    const result = calcPortfolioStats(weights, returns, 0.03)
    expect(result.expectedReturn).toBeGreaterThan(0)
    expect(result.volatility).toBeGreaterThan(0)
  })

  it('等权三资产组合', () => {
    const weights = [1 / 3, 1 / 3, 1 / 3]
    const returns = [
      [0.10, 0.05, 0.08],
      [0.04, 0.06, 0.03],
      [0.07, 0.09, 0.05],
    ]
    const result = calcPortfolioStats(weights, returns, 0.03)
    expect(result.expectedReturn).toBeGreaterThan(0)
    expect(typeof result.sharpe).toBe('number')
  })
})

// ========================
// 8. DCA定投计算
// ========================
describe('DCA定投计算', () => {
  describe('calcDCASeries', () => {
    it('生成正确的月数数据点', () => {
      const series = calcDCASeries(1000, 10, 3)
      expect(series).toHaveLength(37) // 3年 × 12月 + starting point
    })

    it('第一个月投入正确', () => {
      const series = calcDCASeries(1000, 0, 1)
      expect(series[1].totalInvested).toBe(1000)
    })

    it('零收益率时终值等于总投入', () => {
      const series = calcDCASeries(1000, 0, 1)
      const last = series[series.length - 1]
      expect(last.totalValue).toBeCloseTo(last.totalInvested, 2)
    })

    it('正收益时终值大于总投入', () => {
      const series = calcDCASeries(1000, 10, 3)
      const last = series[series.length - 1]
      expect(last.totalValue).toBeGreaterThan(last.totalInvested)
    })

    it('总投入等于月投额×月数', () => {
      const series = calcDCASeries(500, 8, 2)
      const last = series[series.length - 1]
      expect(last.totalInvested).toBe(500 * 24)
    })
  })

  describe('calcDCASummary', () => {
    it('计算汇总数据正确', () => {
      const series = calcDCASeries(1000, 10, 3)
      const summary = calcDCASummary(series)
      expect(summary.totalInvested).toBe(36000)
      expect(summary.totalValue).toBeGreaterThan(summary.totalInvested)
      expect(summary.profit).toBe(summary.totalValue - summary.totalInvested)
      expect(summary.returnRate).toBeGreaterThan(0)
    })

    it('空序列返回零值', () => {
      const summary = calcDCASummary([])
      expect(summary.totalInvested).toBe(0)
      expect(summary.totalValue).toBe(0)
      expect(summary.profit).toBe(0)
      expect(summary.returnRate).toBe(0)
      expect(summary.annualizedReturn).toBe(0)
    })
  })
})

// ========================
// 9. 目标规划
// ========================
describe('目标规划', () => {
  describe('calcGoalPlan', () => {
    it('计算每月定投额', () => {
      const result = calcGoalPlan(100000, 8, 5)
      expect(result.monthlyInvest).toBeGreaterThan(0)
      expect(result.totalInvested).toBeGreaterThan(0)
      expect(result.profit).toBeGreaterThan(0)
    })

    it('总投入 = 月投额 × 月数', () => {
      const result = calcGoalPlan(100000, 8, 5)
      expect(result.totalInvested).toBeCloseTo(result.monthlyInvest * 60, 0)
    })

    it('目标金额越大月投额越大', () => {
      const small = calcGoalPlan(100000, 8, 5)
      const large = calcGoalPlan(500000, 8, 5)
      expect(large.monthlyInvest).toBeGreaterThan(small.monthlyInvest)
    })

    it('年限越长月投额越小', () => {
      const short = calcGoalPlan(100000, 8, 3)
      const long = calcGoalPlan(100000, 8, 10)
      expect(long.monthlyInvest).toBeLessThan(short.monthlyInvest)
    })

    it('零利率时月投额 = 目标/月数', () => {
      const result = calcGoalPlan(120000, 0, 10)
      expect(result.monthlyInvest).toBe(1000)
    })
  })
})

// ========================
// 10. 通胀调整收益
// ========================
describe('通胀调整收益', () => {
  describe('calcRealReturn', () => {
    it('名义10%通胀3%时实际收益约6.8%', () => {
      const real = calcRealReturn(10, 3)
      expect(real).toBeCloseTo(6.7961, 2)
    })

    it('零通胀时实际收益等于名义收益', () => {
      expect(calcRealReturn(8, 0)).toBe(8)
    })

    it('通胀等于名义收益时实际收益约0', () => {
      const real = calcRealReturn(5, 5)
      expect(real).toBeCloseTo(0, 1)
    })

    it('高通胀时实际收益为负', () => {
      const real = calcRealReturn(5, 10)
      expect(real).toBeLessThan(0)
    })
  })
})
