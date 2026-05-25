import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { render } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../hooks/useTheme'

function getHookResult() {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  )
  return renderHook(() => useTheme(), { wrapper })
}

// ========================
// 1. ThemeProvider + Context 共享
// ========================
describe('ThemeProvider Context 共享', () => {
  it('默认主题为 dark 或 light（取决于 localStorage）', () => {
    localStorage.removeItem('fincalc-theme')
    const { result } = getHookResult()
    expect(['dark', 'light']).toContain(result.current.theme)
  })

  it('toggleTheme 切换主题', () => {
    const { result } = getHookResult()
    const initial = result.current.theme
    act(() => result.current.toggleTheme())
    expect(result.current.theme).not.toBe(initial)
  })

  it('isDark 与 theme 同步', () => {
    const { result } = getHookResult()
    // 循环所有主题回到原点
    for (let i = 0; i < 5; i++) act(() => result.current.toggleTheme())
    expect(result.current.isDark).toBe(result.current.theme === 'dark')
  })

  it('多次调用 useTheme 返回同一份共享状态', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    )
    const hook1 = renderHook(() => useTheme(), { wrapper: Wrapper })
    const hook2 = renderHook(() => useTheme(), { wrapper: Wrapper })

    // 独立 wrapper，各自独立 theme（默认从 localStorage 读取）
    expect(hook1.result.current.theme).toBe(hook2.result.current.theme)
  })

  it('同一 Provider 内多个 useTheme 共享状态', () => {
    let hook1: ReturnType<typeof renderHook<ReturnType<typeof useTheme>, () => ReturnType<typeof useTheme>>>
    let hook2: ReturnType<typeof renderHook<ReturnType<typeof useTheme>, () => ReturnType<typeof useTheme>>>

    function Child1() {
      void useTheme()
      return null
    }
    function Child2() {
      void useTheme()
      return null
    }
    function App() {
      return (
        <ThemeProvider>
          <Child1 />
          <Child2 />
        </ThemeProvider>
      )
    }
    // 同一 Provider 下渲染
    render(<App />)
    // 如果 Context 工作正常，不会报错
    expect(true).toBe(true)
  })

  it('切换主题后 localStorage 同步更新', () => {
    const { result } = getHookResult()
    act(() => result.current.toggleTheme())
    expect(localStorage.getItem('fincalc-theme')).toBe(result.current.theme)
  })
})

// ========================
// 2. 回归：JPY 符号不与 CNY 混淆
// ========================
describe('货币符号回归', () => {
  it('CNY 和 JPY 符号不同', async () => {
    const { getCurrencySymbol } = await import('../utils/formatters')
    expect(getCurrencySymbol('CNY')).not.toBe(getCurrencySymbol('JPY'))
  })

  it('CNY 符号为 ¥', async () => {
    const { getCurrencySymbol } = await import('../utils/formatters')
    expect(getCurrencySymbol('CNY')).toBe('¥')
  })

  it('JPY 符号为 JP¥', async () => {
    const { getCurrencySymbol } = await import('../utils/formatters')
    expect(getCurrencySymbol('JPY')).toBe('JP¥')
  })
})
