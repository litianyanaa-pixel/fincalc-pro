export type Currency = 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY'

const currencySymbols: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: 'JP¥',
}

export function getCurrencySymbol(currency: Currency): string {
  return currencySymbols[currency]
}

export function formatNumber(value: number, decimals: number = 2): string {
  const parts = value.toFixed(decimals).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export function formatCurrency(value: number, currency: Currency = 'CNY'): string {
  return `${currencySymbols[currency]}${formatNumber(value)}`
}

export function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${formatNumber(value, decimals)}%`
}

export function parseNumberInput(value: string): number {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

export function formatInputValue(value: string): string {
  const num = parseNumberInput(value)
  if (num === 0 && value === '') return ''
  return formatNumber(num)
}
