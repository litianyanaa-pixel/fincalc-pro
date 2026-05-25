type Rates = Record<string, number>

const CACHE_KEY = 'fincalc-rates'
const CACHE_TTL = 3600000 // 1 hour

interface CachedRates {
  timestamp: number
  base: string
  rates: Rates
}

let memoryRates: CachedRates | null = null

function getBaseCurrency(): string {
  try {
    const raw = localStorage.getItem('fincalc-currency')
    return raw ? JSON.parse(raw) : 'CNY'
  } catch {
    return 'CNY'
  }
}

export async function fetchRates(): Promise<Rates | null> {
  // Check memory cache
  if (memoryRates && Date.now() - memoryRates.timestamp < CACHE_TTL) {
    return memoryRates.rates
  }

  // Check localStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed: CachedRates = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < CACHE_TTL) {
        memoryRates = parsed
        return parsed.rates
      }
    }
  } catch { /* ignore */ }

  // Fetch from free API
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!res.ok) return null
    const data = await res.json()
    const rates: Rates = {
      CNY: data.rates.CNY || 7.24,
      USD: 1,
      EUR: data.rates.EUR || 0.92,
      GBP: data.rates.GBP || 0.79,
      JPY: data.rates.JPY || 149.5,
    }
    const cached: CachedRates = { timestamp: Date.now(), base: 'USD', rates }
    memoryRates = cached
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cached)) } catch { /* quota */ }
    return rates
  } catch {
    // Fallback static rates
    const fallback: Rates = { CNY: 7.24, USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5 }
    return fallback
  }
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Rates
): number {
  if (from === to) return amount
  const fromRate = rates[from] || 1
  const toRate = rates[to] || 1
  return (amount / fromRate) * toRate
}
