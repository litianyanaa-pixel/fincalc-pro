import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// 初始化 i18n（必须在组件渲染前）
import '../i18n'

import ThemeToggle from '../components/ui/ThemeToggle'
import AnimatedNumber from '../components/ui/AnimatedNumber'
import RiskBadge from '../components/shared/RiskBadge'
import CurrencySelector from '../components/shared/CurrencySelector'
import LangSelector from '../components/shared/LangSelector'

// ========================
// 1. ThemeToggle 组件
// ========================
describe('ThemeToggle 主题切换', () => {
  it('渲染暗色模式图标', () => {
    render(<ThemeToggle theme="dark" setTheme={vi.fn()} />)
    expect(screen.getByLabelText('Select theme')).toBeInTheDocument()
  })

  it('渲染亮色模式图标', () => {
    render(<ThemeToggle theme="light" setTheme={vi.fn()} />)
    expect(screen.getByLabelText('Select theme')).toBeInTheDocument()
  })

  it('点击触发 setTheme 回调', async () => {
    const setTheme = vi.fn()
    render(<ThemeToggle theme="dark" setTheme={setTheme} />)
    await userEvent.click(screen.getByLabelText('Select theme'))
    // Dropdown opens, then click the "light" option
    const lightBtn = screen.getByText('light')
    await userEvent.click(lightBtn)
    expect(setTheme).toHaveBeenCalledWith('light')
  })
})

// ========================
// 2. AnimatedNumber 组件
// ========================
describe('AnimatedNumber 动画数字', () => {
  it('渲染初始值', () => {
    render(<AnimatedNumber value={1234.56} />)
    expect(screen.getByText(/1,234/)).toBeInTheDocument()
  })

  it('显示前缀', () => {
    render(<AnimatedNumber value={100} prefix="¥" />)
    expect(screen.getByText('¥')).toBeInTheDocument()
  })

  it('显示后缀', () => {
    const { container } = render(<AnimatedNumber value={10} suffix="%" />)
    expect(container.textContent).toContain('%')
  })

  it('正数颜色类', () => {
    const { container } = render(<AnimatedNumber value={100} positive={true} />)
    expect(container.querySelector('.result-positive')).toBeTruthy()
  })

  it('负数颜色类', () => {
    const { container } = render(<AnimatedNumber value={-50} positive={false} />)
    expect(container.querySelector('.result-negative')).toBeTruthy()
  })
})

// ========================
// 3. RiskBadge 组件
// ========================
describe('RiskBadge 风险徽章', () => {
  it('显示风险标签文字', () => {
    render(<RiskBadge returnRate={10} />)
    // 默认中文环境，应显示中文标签
    expect(screen.getByText('稳健')).toBeTruthy()
  })

  it('显示安全区间文字', () => {
    render(<RiskBadge returnRate={10} />)
    expect(screen.getByText('中风险')).toBeTruthy()
  })

  it('亏损状态显示正确', () => {
    render(<RiskBadge returnRate={-10} />)
    expect(screen.getByText('亏损')).toBeTruthy()
  })

  it('极强状态显示正确', () => {
    render(<RiskBadge returnRate={50} />)
    expect(screen.getByText('极强')).toBeTruthy()
  })

  it('接受risk prop直接传入', async () => {
    const { getRiskLevel } = await import('../utils/risk')
    const risk = getRiskLevel(20)
    render(<RiskBadge risk={risk} />)
    expect(screen.getByText('优秀')).toBeTruthy()
  })
})

// ========================
// 4. CurrencySelector 组件
// ========================
describe('CurrencySelector 币种选择', () => {
  it('渲染当前币种代码', () => {
    render(<CurrencySelector value="CNY" onChange={vi.fn()} />)
    expect(screen.getByText('CNY')).toBeInTheDocument()
  })

  it('显示货币符号', () => {
    render(<CurrencySelector value="USD" onChange={vi.fn()} />)
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('点击打开下拉菜单显示所有币种', async () => {
    render(<CurrencySelector value="CNY" onChange={vi.fn()} />)
    const button = screen.getByText('CNY').closest('button')!
    await userEvent.click(button)
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(screen.getByText('EUR')).toBeInTheDocument()
    expect(screen.getByText('GBP')).toBeInTheDocument()
    expect(screen.getByText('JPY')).toBeInTheDocument()
  })

  it('选择新币种触发回调', async () => {
    const onChange = vi.fn()
    render(<CurrencySelector value="CNY" onChange={onChange} />)
    const button = screen.getByText('CNY').closest('button')!
    await userEvent.click(button)
    await userEvent.click(screen.getByText('USD'))
    expect(onChange).toHaveBeenCalledWith('USD')
  })
})

// ========================
// 5. LangSelector 组件
// ========================
describe('LangSelector 语言选择', () => {
  it('渲染当前语言缩写', () => {
    render(<LangSelector lang="zh" onLangChange={vi.fn()} />)
    expect(screen.getByText('中')).toBeInTheDocument()
  })

  it('显示英文缩写', () => {
    render(<LangSelector lang="en" onLangChange={vi.fn()} />)
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('点击打开语言下拉菜单', async () => {
    render(<LangSelector lang="zh" onLangChange={vi.fn()} />)
    const button = screen.getByText('中').closest('button')!
    await userEvent.click(button)
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('日本語')).toBeInTheDocument()
    expect(screen.getByText('한국어')).toBeInTheDocument()
    expect(screen.getByText('Français')).toBeInTheDocument()
  })

  it('切换语言触发回调', async () => {
    const onLangChange = vi.fn()
    render(<LangSelector lang="zh" onLangChange={onLangChange} />)
    const button = screen.getByText('中').closest('button')!
    await userEvent.click(button)
    await userEvent.click(screen.getByText('English'))
    expect(onLangChange).toHaveBeenCalledWith('en')
  })
})
