# AGENTS.md — PolyGlass AI 聚合搜索原型

> 面向 AI Agent 的项目上下文入口。本项目为纯前端原型，无后端依赖。

## 项目定位

「AI 答案验证引擎」——用户输入问题后并行调用多个 AI 模型（DeepSeek / 千问 / 豆包等），流式展示各模型答案，再由总结模型生成共识/差异/建议三段式结论。解决"不敢信单一 AI 答案"的痛点。

当前为 **MVP 模拟阶段**：所有模型回答和总结来自预设 mock 数据（`src/data/mockResults.js`），尚未接入真实 API。

## 技术栈

| 层 | 选型 | 版本 |
|---|---|---|
| 框架 | React | 19 |
| 构建 | Vite | 8 |
| 样式 | Tailwind CSS（@tailwindcss/vite 插件） | v4 |
| 动画 | framer-motion / motion | 12 |
| WebGL | ogl | 1.0 |
| 组件基础 | class-variance-authority + @radix-ui/react-slot | — |
| Lint | oxlint（react hooks error / only-export-components warn） | — |
| 测试 | vitest + @testing-library/react + jsdom | — |

## 命令

```bash
npm run dev        # 启动开发服务器（Vite HMR）
npm run build      # 生产构建 → dist/
npm run preview    # 预览生产构建
npm run lint       # oxlint 检查
npm run test       # vitest 单次运行
npm run test:watch # vitest 监听模式
```

## 核心模块

### 1. 搜索状态机（useSearchStateMachine）

全局搜索状态由 `src/hooks/useSearchStateMachine.js` hook 管理，App.jsx 消费该 hook 获取 `searchState` 与全部 handler。stage 流转：

```
idle → searching → summarizing → done
                                  ↓ 追问
                            searching → ...
```

关键字段：`stage`、`query`、`modelAnswers`、`summaryResult`、`history`（对话归档）、`selectedModels`、`pathMode`（memory/new）。

`handleSearch` 区分首次搜索与追问（isFollowUp），追问时历史对话自动归档到 `history[]`。状态转移逻辑抽为纯函数 reducer（`reduceStartSearch` / `reduceProgress` / `reduceStopSearch`）导出，单元测试见 `src/__tests__/searchStateMachine.test.js`。

### 2. 结果聚合（ResultsSection → FloatingAnswerPanel → SummaryCard）

- **FloatingAnswerPanel**：CSS Grid 两行两列布局展示模型卡片；支持 hover 浮窗预览和全展开模式。12 个模型配置声明在 `MODEL_CONFIG`。
- **SummaryCard**：渲染 AI 总结三段式（共识/差异/建议）+ 可信度进度条（分色阈值：≥90 白 / ≥75 浅灰 / <75 深灰）。
- **simulateSearch**（`src/data/mockResults.js`）：模拟流式过程——逐模型延迟回调 → summarizing → done。支持 3 主场景 + 3 追问场景。

### 3. WebGL 背景（Strands + GlassBackground）

- **Strands**（`src/components/ui/Strands.jsx`）：基于 ogl 的 GLSL 光束动画，用作页面加载 splash。支持 props 驱动 uniform 实时更新（颜色/数量/速度/辉光等）；含可选球形玻璃折射后处理 pass。
- **GlassBackground**（`src/components/GlassBackground.jsx`）：Canvas 2D 三色渐变光晕 + CSS 点阵网格 + 暗角 vignette，作为固定背景氛围层。

## 目录约定

```
src/
├── App.jsx              # 顶层编排，消费 useSearchStateMachine 渲染全部组件
├── main.jsx             # 入口，挂载 React root
├── index.css            # Tailwind v4 @theme 变量 + 全局工具类
├── lib/utils.js         # cn() 等通用工具
├── hooks/
│   └── useSearchStateMachine.js  # 搜索状态机（状态 + 纯函数 reducer）
├── __tests__/
│   └── searchStateMachine.test.js # 状态机单元测试（vitest）
├── components/          # 业务组件（PascalCase 命名）
│   ├── ui/              # 底层 UI 原子（BorderGlow / ShinyText / Strands / button）
│   └── ...              # 页面级组件（Header / HeroSection / ResultsSection 等）
└── data/
    └── mockResults.js   # 模拟数据 + simulateSearch 逻辑
```

- 路径别名：`@` → `./src`（vite.config.js）
- 组件命名：文件名 = 导出名（PascalCase）
- 圆角：全局 `border-radius: 0`（直角是核心视觉特征）
- 色彩：纯黑背景 `#000000`，文字白 `#FAFAFA`，弱灰 `#AAAAAA`，边框 `#1a1a1a`

## 设计语言摘要

「纯黑科技简约（Black Tech Minimalism）」——纯黑底 + 白字 + 直角边框 + 微光效（ShinyText 光泽扫过、BorderGlow 鼠标跟踪边缘光、ColorOrb 三色旋转）。详见 [docs/design.md](docs/design.md)。

## 验收标准

1. `npm run build` 零错误零警告
2. `npm run lint` 通过（oxlint react/rules-of-hooks error 级别）
3. 三个预设场景完整走通：idle → searching（逐模型返回）→ summarizing → done（总结卡 + 追问入口）
4. 追问流程：点击追问建议 → 历史归档 → 新一轮 searching → done
5. 响应式：Desktop 3 列 / Tablet 紧凑 / Mobile 单列全宽
6. 页面加载动画（Strands WebGL）正常渲染，500ms 后 fade-out
7. `prefers-reduced-motion` 下所有动画退化为瞬时

## 相关文档

| 文档 | 说明 |
|------|------|
| [docs/design.md](docs/design.md) | 产品设计文档：交互流程、组件树、数据流、视觉规范 |
| [docs/plan.md](docs/plan.md) | 实现计划（15 task 已全部完成） |
| [docs/review.md](docs/review.md) | 代码审查报告：构建产物、组件检查、交互完整性、遗留项 |

## 已知边界 & 遗留项

- 模型选择器选中模型后并未实际过滤 `simulateSearch` 结果（P3）
- 通用追问（非预设追问）无对应 mock 数据（P3）
- GlassBackground 未针对 `prefers-reduced-motion` 做 Canvas 停帧降级（P3）
- 构建产物体积：JS 393 KB (gzip 126 KB)、CSS 42 KB (gzip 8.4 KB)
