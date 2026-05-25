// Return rate: (holdingProfit / buyAmount) * 100
export function calcReturnRate(buyAmount: number, holdingProfit: number): number {
  if (buyAmount === 0) return 0
  return (holdingProfit / buyAmount) * 100
}

// Annualized return rate
export function calcAnnualizedRate(returnRate: number, days: number): number {
  if (days <= 0) return 0
  return returnRate * (365 / days)
}

// Holding amount = buyAmount + holdingProfit
export function calcHoldingAmount(buyAmount: number, holdingProfit: number): number {
  return buyAmount + holdingProfit
}

// Holding profit = holdingAmount - buyAmount
export function calcHoldingProfit(buyAmount: number, holdingAmount: number): number {
  return holdingAmount - buyAmount
}

// Simple interest: profit = principal * rate * time
export function calcSimpleProfit(principal: number, annualRate: number, years: number): number {
  return principal * (annualRate / 100) * years
}

// Compound interest: A = P * (1 + r)^t
export function calcCompoundAmount(principal: number, annualRate: number, years: number): number {
  return principal * Math.pow(1 + annualRate / 100, years)
}

export function calcCompoundProfit(principal: number, annualRate: number, years: number): number {
  return calcCompoundAmount(principal, annualRate, years) - principal
}

// Generate compound growth series for chart
export function generateCompoundSeries(principal: number, annualRate: number, years: number): { year: number; value: number; profit: number }[] {
  const series = []
  for (let y = 0; y <= years; y++) {
    const value = principal * Math.pow(1 + annualRate / 100, y)
    series.push({ year: y, value: Math.round(value * 100) / 100, profit: Math.round((value - principal) * 100) / 100 })
  }
  return series
}

// Generate simple interest series for comparison
export function generateSimpleSeries(principal: number, annualRate: number, years: number): { year: number; value: number; profit: number }[] {
  const series = []
  for (let y = 0; y <= years; y++) {
    const value = principal + principal * (annualRate / 100) * y
    series.push({ year: y, value: Math.round(value * 100) / 100, profit: Math.round((value - principal) * 100) / 100 })
  }
  return series
}

// Reverse calculation: given annual rate, principal, days → profit and total
export function calcReverseReturn(principal: number, annualRate: number, days: number): { profit: number; total: number } {
  const profit = principal * (annualRate / 100) * (days / 365)
  return { profit: Math.round(profit * 100) / 100, total: Math.round((principal + profit) * 100) / 100 }
}

// Monte Carlo simulation
export function monteCarloSimulation(
  principal: number,
  expectedReturn: number,
  volatility: number,
  years: number,
  simulations: number = 1000
): { paths: number[][]; percentiles: { p5: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] } } {
  const monthlySteps = years * 12
  const monthlyReturn = expectedReturn / 100 / 12
  const monthlyVol = volatility / 100 / Math.sqrt(12)
  const paths: number[][] = []

  for (let s = 0; s < simulations; s++) {
    const path = [principal]
    for (let m = 1; m <= monthlySteps; m++) {
      const random = gaussianRandom()
      const ret = monthlyReturn + monthlyVol * random
      path.push(path[m - 1] * (1 + ret))
    }
    paths.push(path)
  }

  const percentiles: { p5: number[]; p25: number[]; p50: number[]; p75: number[]; p95: number[] } = { p5: [], p25: [], p50: [], p75: [], p95: [] }
  for (let m = 0; m <= monthlySteps; m++) {
    const values = paths.map(p => p[m]).sort((a, b) => a - b)
    percentiles.p5.push(values[Math.floor(simulations * 0.05)])
    percentiles.p25.push(values[Math.floor(simulations * 0.25)])
    percentiles.p50.push(values[Math.floor(simulations * 0.5)])
    percentiles.p75.push(values[Math.floor(simulations * 0.75)])
    percentiles.p95.push(values[Math.floor(simulations * 0.95)])
  }

  return { paths: paths.slice(0, 50), percentiles }
}

// Sharpe Ratio: (return - riskFreeRate) / stdDev
export function calcSharpeRatio(returns: number[], riskFreeRate: number = 0.03): number {
  if (returns.length < 2) return 0
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length
  const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1))
  if (stdDev === 0) return 0
  return (avgReturn - riskFreeRate) / stdDev
}

// Max Drawdown
export function calcMaxDrawdown(values: number[]): { maxDrawdown: number; peakIndex: number; troughIndex: number } {
  let maxDrawdown = 0
  let peak = values[0]
  let peakIndex = 0
  let resultPeak = 0
  let resultTrough = 0

  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i]
      peakIndex = i
    }
    const drawdown = (peak - values[i]) / peak
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
      resultPeak = peakIndex
      resultTrough = i
    }
  }

  return { maxDrawdown: maxDrawdown * 100, peakIndex: resultPeak, troughIndex: resultTrough }
}

// Gaussian random (Box-Muller)
function gaussianRandom(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// DCA (Dollar-Cost Averaging) series
export function calcDCASeries(
  monthlyInvest: number,
  annualRate: number,
  years: number
): { month: number; totalInvested: number; totalValue: number; profit: number }[] {
  const monthlyRate = annualRate / 100 / 12
  const totalMonths = Math.round(years * 12)
  const series = [{ month: 0, totalInvested: 0, totalValue: 0, profit: 0 }]
  let totalValue = 0
  for (let m = 1; m <= totalMonths; m++) {
    totalValue = (totalValue + monthlyInvest) * (1 + monthlyRate)
    const totalInvested = monthlyInvest * m
    series.push({
      month: m,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      profit: Math.round((totalValue - totalInvested) * 100) / 100,
    })
  }
  return series
}

export function calcDCASummary(
  series: ReturnType<typeof calcDCASeries>
): { totalInvested: number; totalValue: number; profit: number; returnRate: number; annualizedReturn: number } {
  if (series.length < 2) return { totalInvested: 0, totalValue: 0, profit: 0, returnRate: 0, annualizedReturn: 0 }
  const last = series[series.length - 1]
  const totalInvested = last.totalInvested
  const totalValue = last.totalValue
  const profit = last.profit
  const returnRate = totalInvested > 0 ? (profit / totalInvested) * 100 : 0
  const years = last.month / 12
  const annualizedReturn = totalInvested > 0 && years > 0
    ? (Math.pow(totalValue / totalInvested, 1 / years) - 1) * 100
    : 0
  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalValue: Math.round(totalValue * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    returnRate: Math.round(returnRate * 100) / 100,
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
  }
}

// Goal Planner: given target amount, rate, years → required monthly investment
export function calcGoalPlan(
  targetAmount: number,
  annualRate: number,
  years: number
): { monthlyInvest: number; totalInvested: number; profit: number } {
  if (targetAmount <= 0 || years <= 0) return { monthlyInvest: 0, totalInvested: 0, profit: 0 }
  const monthlyRate = annualRate / 100 / 12
  const totalMonths = Math.round(years * 12)
  let monthlyInvest: number
  if (monthlyRate === 0) {
    monthlyInvest = targetAmount / totalMonths
  } else {
    // FV = PMT * ((1+r)^n - 1) / r → PMT = FV * r / ((1+r)^n - 1)
    monthlyInvest = targetAmount * monthlyRate / (Math.pow(1 + monthlyRate, totalMonths) - 1)
  }
  const totalInvested = monthlyInvest * totalMonths
  return {
    monthlyInvest: Math.round(monthlyInvest * 100) / 100,
    totalInvested: Math.round(totalInvested * 100) / 100,
    profit: Math.round((targetAmount - totalInvested) * 100) / 100,
  }
}

// Real return adjusted for inflation (Fisher approximation)
export function calcRealReturn(nominalRate: number, inflationRate: number): number {
  if (inflationRate === 0) return nominalRate
  return ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100
}

// Portfolio analysis - expected return and volatility
export function calcPortfolioStats(
  weights: number[],
  returns: number[][],
  riskFreeRate: number = 0.03
): { expectedReturn: number; volatility: number; sharpe: number } {
  const n = weights.length
  if (n === 0 || returns.length === 0) return { expectedReturn: 0, volatility: 0, sharpe: 0 }

  const meanReturns = returns.map(r => r.reduce((a, b) => a + b, 0) / r.length)
  const expectedReturn = weights.reduce((sum, w, i) => sum + w * meanReturns[i], 0)

  const portfolioReturns: number[] = []
  for (let t = 0; t < returns[0].length; t++) {
    let ret = 0
    for (let i = 0; i < n; i++) {
      ret += weights[i] * returns[i][t]
    }
    portfolioReturns.push(ret)
  }

  const avgReturn = portfolioReturns.reduce((a, b) => a + b, 0) / portfolioReturns.length
  const volatility = Math.sqrt(portfolioReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (portfolioReturns.length - 1)) * Math.sqrt(12)

  return {
    expectedReturn: expectedReturn * 100,
    volatility: volatility * 100,
    sharpe: (expectedReturn - riskFreeRate) / (volatility || 1)
  }
}
