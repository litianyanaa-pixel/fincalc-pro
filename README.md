# FinCalc Pro

> 投资收益分析工作台 | Investment Return Analysis Workstation

专业投资收益分析桌面应用，基于 Tauri + React + TypeScript 构建，支持 Windows 平台。

[English](./README_EN.md)

## 功能模块

### 收益率计算

最常用的投资收益速算工具。输入以下任意组合，实时计算收益率与年化收益率：

- **买入金额** + **持仓收益** → 自动算出收益率、年化收益率、持仓金额
- **买入金额** + **持仓金额** → 自动反推持仓收益，进而计算收益率
- **持有时长** — 支持天/月/年三种单位自由切换
- 智能联动：填写任意一项，自动推算其余字段
- 内置公式展示：收益率 = 持仓收益 ÷ 买入金额 × 100%
- 双图表模式：收益走势图 + 对比图，可切换查看
- 风险等级自动评定（亏损/保守/稳健/优秀/极强）
- 支持通胀调整，查看名义收益 vs 实际收益

### 收益反推

已知年化收益率和投资时长，反推预期收益：

- 输入年化收益率、本金金额、投资时长
- 输出预期收益、到期总金额
- 时长单位支持天/月/年切换
- 公式展示：到期收益 = 本金 × 年化收益率 × 时间(年)

### 复利计算

单利与复利的直观对比工具：

- 输入本金、年化收益率、投资年限
- 双模式切换：单利 / 复利
- 输出总收益、最终资产、复利多赚部分
- 资产增长曲线图：单利线 vs 复利线，复利区域高亮
- 图表标注：最终值标记点、均值参考线
- 支持通胀调整
- 公式展示

### 定投计算

模拟长期定投的资产累积效果：

- 输入月定投金额、预期年化收益率、定投年限
- 输出总投入、终值、收益额、收益率、年化收益率
- 面积图：总投入虚线 vs 资产价值实线，面积差为收益区间
- 支持通胀调整：开启后显示名义收益与实际收益对比
- 公式展示：每月末投入固定金额，按月复利累积

## 高级分析工具

### 蒙特卡洛模拟

基于随机模拟预测投资组合的未来收益分布：

- 五个可调参数：本金、预期年化收益、波动率、投资年限、模拟次数
- 每个参数配有滑块实时拖拽调参，400ms 防抖自动计算
- 运行模拟后展示：
  - 5%-95% 和 25%-75% 概率区间的面积图
  - 中位数曲线 + 本金参考线
  - 中位数终值、5%分位、95%分位、亏损概率

### 夏普比率

衡量风险调整后的收益表现：

- 输入历史收益率序列（英文逗号分隔）和无风险利率
- 输出夏普比率数值
- 自动评级：≥1 优秀、0.5~1 中等、<0.5 较差
- 附详细解释说明

### 最大回撤分析

分析资产净值的最大亏损区间：

- 输入资产净值序列（英文逗号分隔）
- 输出最大回撤百分比
- 标注峰值期 → 谷底期
- 配有净值走势图，回撤区间高亮

### 投资组合分析

多资产组合的收益与风险综合分析：

- 支持多资产输入：权重自动归一化、各资产历史收益率
- 输出：组合预期收益、组合波动率、组合夏普比率
- 权重自动归一化至总和 100%

### 投资对比

多笔投资并排对比收益：

- 动态添加/删除投资项
- 每项输入本金、收益率、年限
- 柱状图对比各笔投资的收益

### 目标规划器

根据目标金额反推定投计划：

- 输入目标金额、预期年化收益率、投资年限
- 输出每月需定投金额、总投入、预计收益
- 增长曲线图：累计投入线 + 目标金额线 + 资产价值线
- 公式：每月定投 = 目标金额 × 月利率 ÷ ((1+月利率)^月数 - 1)

## 通用特性

### 数据持久化
所有计算器的输入自动保存到 localStorage，刷新页面不丢失数据，每个模块配有清空重置按钮。

### 多币种
支持 CNY（¥）/ USD（$）/ EUR（€）/ GBP（£）/ JPY（JP¥）五种货币符号切换（仅做显示，未换算汇率）。

### 国际化
支持中文、English、日本語、한국어、Français 五种语言，顶部一键切换。

### 通胀调整
收益率计算、复利计算、定投计算均支持可选的通胀调整开关，基于 Fisher 近似公式计算实际收益。

### 图表系统
- ECharts（tree-shaken 按需加载）：面积图、柱状图、折线图、概率分布图
- Lightweight Charts：收益走势图
- 所有图表自适应主题配色，支持暗色/亮色/自定义主题
- 图表标注：最大值标记点、均值参考线、盈亏平衡线

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

- **暗色** — 深邃暗蓝基底，青色/紫色渐变强调
- **浅色** — 清爽灰白底，蓝色系渐变
- **椰树** — 经典大黄底 + 红色粗边框 + 黑色硬阴影，复古包装风
- **牛皮癣** — 深紫底 + 品红/青色撞色，零圆角硬核排版
- **PH** — 纯黑底 + 橙色色块拼接，极简硬切风格

主题系统采用集中式 ThemeConfig 架构，所有颜色 token 统一管理，新增主题仅需添加一个配置文件。

## 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Tauri 1.x (Rust) |
| 前端框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 图表库 | ECharts (tree-shaken) + Lightweight Charts |
| 动画 | Framer Motion |
| 样式 | Tailwind CSS + CSS Custom Properties |
| 国际化 | react-i18next |
| 离线缓存 | PWA (Workbox) |
| 测试 | Vitest + @testing-library/react |

## 项目结构

```
src/
├── themes/              # 主题配置
│   ├── types.ts         # ThemeConfig 接口定义
│   ├── dark.ts          # 暗色主题
│   ├── light.ts         # 浅色主题
│   ├── yeshu.ts         # 椰树主题
│   ├── niupi.ts         # 牛皮癣主题
│   ├── phub.ts          # PH 主题
│   └── index.ts         # 主题注册表
├── hooks/               # React Hooks
│   ├── useTheme.tsx     # 主题上下文 + 切换逻辑
│   └── useLocalStorage.ts
├── components/
│   ├── modules/         # 主功能模块
│   │   ├── ReturnCalc.tsx       # 收益率计算
│   │   ├── ReverseCalc.tsx      # 收益反推
│   │   ├── CompoundCalc.tsx     # 复利计算
│   │   └── DCACalc.tsx          # 定投计算
│   ├── advanced/        # 高级分析工具
│   │   ├── MonteCarlo.tsx       # 蒙特卡洛模拟
│   │   ├── SharpeRatio.tsx      # 夏普比率
│   │   ├── MaxDrawdown.tsx      # 最大回撤
│   │   ├── PortfolioAnalysis.tsx # 投资组合
│   │   ├── InvestmentComparison.tsx # 投资对比
│   │   ├── GoalPlanner.tsx      # 目标规划器
│   │   └── AdvancedPanel.tsx    # 高级工具面板
│   ├── charts/          # 图表组件
│   │   ├── GrowthChart.tsx      # 增长曲线
│   │   ├── ReturnChart.tsx      # 收益走势
│   │   ├── MonteCarloChart.tsx  # 蒙特卡洛概率图
│   │   ├── TVChart.tsx          # TradingView 风格图
│   │   └── TrendChart.tsx      # 趋势图
│   ├── layout/          # 布局
│   │   ├── Header.tsx           # 顶部导航栏
│   │   ├── TabBar.tsx           # 桌面标签栏
│   │   └── BottomBar.tsx        # 移动端底栏
│   ├── shared/          # 共享组件
│   │   ├── ResetButton.tsx      # 清空按钮（橡皮擦图标）
│   │   ├── UnitToggle.tsx       # 天/月/年切换胶囊
│   │   ├── CurrencySelector.tsx # 币种选择器
│   │   ├── LangSelector.tsx     # 语言选择器
│   │   └── RiskBadge.tsx        # 风险等级徽章
│   └── ui/              # 基础 UI 组件
│       ├── GlassCard.tsx        # 毛玻璃卡片
│       ├── AnimatedInput.tsx    # 动效输入框
│       ├── AnimatedNumber.tsx   # 数字滚动动画
│       └── ThemeToggle.tsx      # 主题选择下拉框
├── utils/
│   ├── calculations.ts  # 核心计算函数
│   ├── formatters.ts    # 格式化工具
│   └── risk.ts          # 风险评级
├── i18n/
│   └── locales/         # zh / en / ja / ko / fr
├── styles/
│   └── globals.css      # 全局样式 + 主题变量
└── test/                # 单元测试 + 组件测试
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发模式（前端热更新 + Tauri 窗口）
npm run tauri dev

# 仅启动前端
npm run dev

# 运行单元测试
npx vitest run

# 类型检查
npx tsc --noEmit

# 生产构建（前端）
npx vite build
```

## 构建 Windows 安装包

### 环境要求

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (stable)
- MinGW-w64（gnu 工具链）— 需要 `windres` 在 PATH 中
  - 如果使用 MSYS2：`pacman -S mingw-w64-x86_64-gcc`
  - 确保 `C:\msys64\mingw64\bin` 在系统 PATH

### 构建

```bash
# gnu 工具链（需要 windres）
export PATH="/c/msys64/mingw64/bin:$PATH"
npx tauri build --bundles nsis
```

输出的安装包位于 `src-tauri/target/release/bundle/nsis/FinCalc Pro_1.0.0_x64-setup.exe`。

## License

MIT
