import { describe, it, expect } from 'vitest'
import {
  getCurrencySymbol,
  formatNumber,
  formatCurrency,
  formatPercent,
  parseNumberInput,
  formatInputValue,
  type Currency,
} from '../utils/formatters'

// ========================
// 1. 货币符号
// ========================
describe('getCurrencySymbol', () => {
  it('返回CNY符号', () => {
    expect(getCurrencySymbol('CNY')).toBe('¥')
  })

  it('返回USD符号', () => {
    expect(getCurrencySymbol('USD')).toBe('$')
  })

  it('返回EUR符号', () => {
    expect(getCurrencySymbol('EUR')).toBe('€')
  })

  it('返回GBP符号', () => {
    expect(getCurrencySymbol('GBP')).toBe('£')
  })

  it('返回JPY符号（JP¥以区分CNY）', () => {
    expect(getCurrencySymbol('JPY')).toBe('JP¥')
  })

  it('所有5种货币都有符号', () => {
    const currencies: Currency[] = ['CNY', 'USD', 'EUR', 'GBP', 'JPY']
    currencies.forEach(c => {
      expect(getCurrencySymbol(c).length).toBeGreaterThan(0)
    })
  })
})

// ========================
// 2. 数字格式化
// ========================
describe('formatNumber', () => {
  it('整数添加千分位', () => {
    expect(formatNumber(1000000)).toBe('1,000,000.00')
  })

  it('保留指定小数位', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57')
  })

  it('保留0位小数', () => {
    expect(formatNumber(1234.5678, 0)).toBe('1,235')
  })

  it('小于1000的数不添加逗号', () => {
    expect(formatNumber(999.99)).toBe('999.99')
  })

  it('0的格式化', () => {
    expect(formatNumber(0)).toBe('0.00')
  })

  it('负数格式化', () => {
    expect(formatNumber(-12345.67)).toBe('-12,345.67')
  })

  it('超大数字', () => {
    expect(formatNumber(1234567890.12)).toBe('1,234,567,890.12')
  })
})

// ========================
// 3. 货币格式化
// ========================
describe('formatCurrency', () => {
  it('CNY格式化', () => {
    expect(formatCurrency(10000, 'CNY')).toBe('¥10,000.00')
  })

  it('USD格式化', () => {
    expect(formatCurrency(5000, 'USD')).toBe('$5,000.00')
  })

  it('默认使用CNY', () => {
    expect(formatCurrency(100)).toBe('¥100.00')
  })

  it('负金额', () => {
    expect(formatCurrency(-100, 'USD')).toBe('$-100.00')
  })
})

// ========================
// 4. 百分比格式化
// ========================
describe('formatPercent', () => {
  it('正数添加加号', () => {
    expect(formatPercent(10)).toBe('+10.00%')
  })

  it('负数不添加加号', () => {
    expect(formatPercent(-5)).toBe('-5.00%')
  })

  it('零', () => {
    expect(formatPercent(0)).toBe('+0.00%')
  })

  it('指定小数位', () => {
    expect(formatPercent(12.345, 1)).toBe('+12.3%')
  })
})

// ========================
// 5. 输入解析
// ========================
describe('parseNumberInput', () => {
  it('正常数字字符串', () => {
    expect(parseNumberInput('1234')).toBe(1234)
  })

  it('带逗号的数字', () => {
    expect(parseNumberInput('1,234.56')).toBe(1234.56)
  })

  it('负数', () => {
    expect(parseNumberInput('-500')).toBe(-500)
  })

  it('空字符串', () => {
    expect(parseNumberInput('')).toBe(0)
  })

  it('非数字字符被过滤', () => {
    expect(parseNumberInput('abc')).toBe(0)
  })

  it('混合字符提取数字', () => {
    expect(parseNumberInput('¥1,000.50')).toBe(1000.5)
  })
})

// ========================
// 6. 输入值格式化
// ========================
describe('formatInputValue', () => {
  it('空字符串保持空', () => {
    expect(formatInputValue('')).toBe('')
  })

  it('数字格式化', () => {
    expect(formatInputValue('10000')).toBe('10,000.00')
  })
})
