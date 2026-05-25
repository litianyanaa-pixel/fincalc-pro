import { describe, it, expect } from 'vitest'
import zh from '../i18n/locales/zh'
import en from '../i18n/locales/en'
import ja from '../i18n/locales/ja'
import ko from '../i18n/locales/ko'
import fr from '../i18n/locales/fr'

// 获取对象的所有嵌套键路径
function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

const locales = { zh, en, ja, ko, fr }

describe('i18n 国际化完整性', () => {
  const zhKeys = getAllKeys(zh)

  it('所有语言文件拥有相同的键', () => {
    for (const [name, locale] of Object.entries(locales)) {
      const localeKeys = getAllKeys(locale)
      expect(localeKeys.sort()).toEqual(zhKeys.sort())
    }
  })

  it('所有语言文件没有空值', () => {
    for (const [name, locale] of Object.entries(locales)) {
      const keys = getAllKeys(locale)
      keys.forEach(key => {
        const value = key.split('.').reduce((o, k) => o[k], locale as any)
        expect(value, `${name} 的 ${key} 不能为空`).toBeTruthy()
        expect(typeof value, `${name} 的 ${key} 必须是字符串`).toBe('string')
      })
    }
  })

  it('en.ts 覆盖所有必要模块', () => {
    expect(en.app).toBeDefined()
    expect(en.tabs).toBeDefined()
    expect(en.returnCalc).toBeDefined()
    expect(en.reverseCalc).toBeDefined()
    expect(en.compoundCalc).toBeDefined()
    expect(en.advanced).toBeDefined()
    expect(en.comparison).toBeDefined()
    expect(en.monteCarlo).toBeDefined()
    expect(en.sharpe).toBeDefined()
    expect(en.drawdown).toBeDefined()
    expect(en.portfolio).toBeDefined()
    expect(en.risk).toBeDefined()
    expect(en.chart).toBeDefined()
    expect(en.common).toBeDefined()
  })

  it('comparison 模块包含所有必要键', () => {
    for (const locale of Object.values(locales)) {
      expect(locale.comparison.remove).toBeTruthy()
      expect(locale.comparison.principal).toBeTruthy()
      expect(locale.comparison.rate).toBeTruthy()
      expect(locale.comparison.years).toBeTruthy()
      expect(locale.comparison.add).toBeTruthy()
      expect(locale.comparison.profit).toBeTruthy()
    }
  })

  it('5种语言文件都存在且完整', () => {
    expect(Object.keys(locales)).toHaveLength(5)
    expect(locales.zh).toBeDefined()
    expect(locales.en).toBeDefined()
    expect(locales.ja).toBeDefined()
    expect(locales.ko).toBeDefined()
    expect(locales.fr).toBeDefined()
  })
})
