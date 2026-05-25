# FinCalc Pro

专业投资收益分析桌面应用，基于 Tauri + React + TypeScript 构建。

## 功能概览

### 收益率计算
输入买入金额、持仓收益/持仓金额、持有时长，实时计算收益率与年化收益率，自动联动智能推算。

### 收益反推
根据年化收益率、本金和投资时长，反推预期收益和到期总金额，支持天/月/年灵活切换单位。

### 复利计算
单利/复利双模式对比，可视化资产增长曲线，直观展示复利效应带来的超额收益。

### 定投计算
模拟每月定额投资的增长轨迹，展示总投入 vs 资产价值的面积图，支持通胀调整查看实际收益。

### 高级分析工具
- **蒙特卡洛模拟** — 基于随机模拟预测未来收益分布，滑块实时调参
- **夏普比率** — 衡量风险调整后的收益表现
- **最大回撤** — 分析最大亏损区间和波动性
- **投资组合分析** — 多资产组合收益与风险分析，含 Sharpe 指标
- **投资对比** — 多笔投资并排对比
- **目标规划器** — 根据目标金额反推每月定投计划

### 多币种支持
支持 CNY / USD / EUR / GBP / JPY 五种货币符号切换（仅显示，不换算汇率）。

### 国际化
支持中文、英语、日语、韩语、法语五种语言。

## 五种主题风格

| 暗色 | 浅色 |
|:---:|:---:|
| ![dark](docs/screenshot-dark.png) | ![light](docs/screenshot-light.png) |

| 椰树 | 牛皮癣 |
|:---:|:---:|
| ![yeshu](docs/screenshot-yeshu.png) | ![niupi](docs/screenshot-niupi.png) |

| PH |
|:---:|
| ![phub](docs/screenshot-phub.png) |

## 技术栈

- **桌面框架**: Tauri (Rust)
- **前端**: React 18 + TypeScript
- **构建工具**: Vite
- **图表**: ECharts (tree-shaken) + Lightweight Charts
- **动画**: Framer Motion
- **样式**: Tailwind CSS + CSS Custom Properties
- **国际化**: react-i18next
- **主题系统**: 集中式 ThemeConfig 架构，组件零感知

## 项目结构

```
src/
├── themes/          # 主题配置（dark/light/yeshu/niupi/phub）
├── hooks/           # React hooks（useTheme, useLocalStorage, useChartTheme）
├── components/
│   ├── modules/     # 主功能模块（ReturnCalc, DCACalc, CompoundCalc...）
│   ├── advanced/    # 高级分析工具（MonteCarlo, SharpeRatio, PortfolioAnalysis...）
│   ├── charts/      # 图表组件（GrowthChart, MonteCarloChart, TVChart...）
│   ├── layout/      # 布局组件（Header, TabBar, BottomBar）
│   ├── shared/      # 共享组件（ResetButton, UnitToggle, CurrencySelector...）
│   └── ui/          # 基础 UI（GlassCard, AnimatedInput, AnimatedNumber, ThemeToggle）
├── utils/           # 工具函数（calculations, formatters, risk）
├── i18n/            # 国际化（zh/en/ja/ko/fr）
├── styles/          # 全局样式（globals.css）
└── test/            # 测试文件
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev

# 运行测试
npx vitest run

# 生产构建
npx vite build

# 打包桌面应用
npx tauri build --bundles nsis
```

## 构建 Windows 安装包

需要 Rust 工具链和 MinGW-w64（gnu 工具链）或 MSVC Build Tools：

```bash
npx tauri build --bundles nsis
```

输出的安装包位于 `src-tauri/target/release/bundle/nsis/`。

## License

MIT
