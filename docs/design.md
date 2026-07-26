# AI聚合搜索页 — 设计文档

> **项目**：PolyGlass — AI多模型聚合搜索页
> **设计语言**：纯黑科技简约（Black Tech Minimalism）
> **更新**：2026-07-02

## 产品定位

「多模型搜索 + AI总结引擎」：用户输入一个问题，同时发送给多个AI模型，展示各模型答案，最后由总结模型生成综合结论。

**核心差异化**：不是"又一个AI搜索"，而是「AI答案验证引擎」——解决用户"不敢信单一AI答案"的痛点。

## 核心交互流程

```
搜索框输入 → 提交 → MorphPanel"问AI"变"思考中..." → 并行调用3个模型
→ 流式展示各模型答案(BorderGlow手风琴) → AI总结生成(复制按钮)
→ RelatedQuestions(PathModeToggle追问/新对话 + 追问建议 + 追问输入)
```

## 页面结构

```
┌──────────────────────────────────────────────┐
│  HEADER：Logo + ShinyText品牌 + 导航          │
├──────────────────────────────────────────────┤
│  GlassBackground：Canvas光晕+点阵+暗角        │
├──────────────────────────────────────────────┤
│  HERO（仅idle显示）：                          │
│  - ShinyText标题 + MorphPanel + 停止按钮      │
│  - 模型pill + "选择AI"(居中弹窗)              │
│  - 预设示例问题（可点击chips）                 │
├──────────────────────────────────────────────┤
│  RESULTS AREA（搜索后显示）                    │
│  ┌────────────────────────────────────────┐  │
│  │  QueryBubble：用户问题(ShinyText+折叠)   │  │
│  │  FloatingAnswerPanel：BorderGlow手风琴   │  │
│  │  SummaryCard：AI总结(共识/差异/建议)      │  │
│  │  RelatedQuestions：追问+路径切换+输入框   │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│  FOOTER：双栏布局(Logo + 技术栈)               │
└──────────────────────────────────────────────┘
```

## 组件树

```
App
├── GlassBackground (Canvas渐变光晕 + 点阵网格 + 暗角)
├── Header (LogoIcon + ShinyText品牌 + Logo重置)
├── HeroSection
│   ├── ShinyText Title (仅idle)
│   ├── MorphPanel (ColorOrb + "问AI"/"思考中...")
│   ├── StopSearchButton (搜索中)
│   ├── ModelSelector (pill + "选择AI" + 居中弹窗)
│   └── PresetQuestions (pill ×3)
├── ResultsSection
│   ├── ConversationHistoryBreadcrumb
│   ├── QueryBubble (ShinyText + 长文折叠60字符)
│   ├── FloatingAnswerPanel (BorderGlow + 手风琴多开 + 工具栏)
│   ├── SummaryCard (共识/差异/建议 + 可信度分色 + 复制)
│   ├── RelatedQuestions (PathModeToggle + 追问建议 + 追问输入)
│   └── Footer
```

## 数据流

```
MorphPanel (用户输入/预设问题)
    ↓ onSearch(key, mode)
App state: { stage:'searching', query, selectedModels, ... }
    ↓ simulateSearch() — 3个模型逐个返回
setModelAnswers[] → currentModelIndex++
    ↓ 所有模型返回完成
stage:'summarizing' → AI总结模拟
    ↓
stage:'done' → 渲染完整ResultsSection + RelatedQuestions
    ↓ 用户追问(RelatedQuestions)
handleFollowUp(key, label) → handleSearch(key, 'memory')
```

状态管理（App级）：
- `stage: 'idle' | 'searching' | 'summarizing' | 'done'`
- `query: string` — 当前搜索词
- `queryKey: string` — 场景key
- `modelAnswers: ModelAnswer[]` — 各模型答案
- `summaryResult: SummaryResult | null` — AI总结
- `isSearching: boolean`
- `currentModelIndex: number`
- `isFollowUp: boolean`
- `conversationHistory: HistoryEntry[]`
- `selectedModels: string[]` — 已选模型ID列表
- `pathMode: 'memory' | 'new'` — 追问路径模式

## 预设模拟数据

3个典型问题场景 + 3个追问场景：

| 场景 | key | 类型 | 可信度 |
|------|-----|------|--------|
| 新能源汽车趋势 | `new_energy` | 共识型 | 92% |
| React vs Vue | `react_vue` | 分歧型 | 78% |
| 远程工作效率 | `remote_work` | 建议型 | 88% |

| 追问 | key | 基于场景 |
|------|-----|---------|
| 哪些品牌值得关注 | `new_energy__brands` | new_energy |
| 从哪个开始学 | `react_vue__learn` | react_vue |
| 免费工具推荐 | `remote_work__tools` | remote_work |

## 视觉设计方向 — 纯黑科技简约

- **背景**：纯黑 #000000 + GlassBackground氛围层（Canvas光晕+点阵+暗角）
- **主色**：#FAFAFA（白），#F8F8F8（次白），#AAAAAA（弱灰），#555555（禁灰）
- **圆角**：全部 0px，直角边框是核心视觉特征（ColorOrb除外）
- **字体**：Inter/SF Pro Display (标题) + SF Mono/JetBrains Mono (数据)
- **动效**：ShinyText光泽扫过、ColorOrb三色旋转、MorphPanel弹性变形、手风琴展开

### 色彩系统

| 用途 | 色值 |
|------|------|
| 背景 | `#000000` |
| 卡片背景 | `#0a0a0a` |
| pill/badge | `#141414` |
| 边框默认 | `#1a1a1a` |
| 边框hover | `#333333` |
| 文字主 | `#FAFAFA` |
| 文字辅 | `#F8F8F8` |
| 文字弱 | `#AAAAAA` |
| ColorOrb | `#6366f1` + `#14b8a6` + `#fbbf24` |

### 关键UI组件

| 组件 | 特点 |
|------|------|
| MorphPanel | ColorOrb + spring变形 + "问AI"→"思考中..." |
| BorderGlow | 鼠标跟踪边缘光效 + 渐变边框 |
| ShinyText | 光泽扫过动画（标题+问题文本） |
| PathModeToggle | 纯CSS液态滑块（记忆/新对话） |
| QueryBubble | ShinyText + 60字符自动折叠 |
| ModelSelector弹窗 | createPortal居中 + backdrop-filter模糊 |

## 响应式

- Desktop (>1024px)：搜索框居中 max-w-2xl，3列网格
- Tablet (768-1024px)：搜索框居中，紧凑布局
- Mobile (<768px)：全宽，单列堆叠，pill自动缩小

## 技术选型

- React 19 + Vite 8
- Tailwind CSS v4
- motion (framer-motion) 12+
- class-variance-authority + @radix-ui/react-slot
- 纯模拟数据，无后端依赖

### 文件结构

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── lib/utils.js
├── components/
│   ├── GlassBackground.jsx
│   ├── Header.jsx
│   ├── HeroSection.jsx
│   ├── PathModeToggle.jsx
│   ├── QueryBubble.jsx
│   ├── ResultsSection.jsx
│   ├── FloatingAnswerPanel.jsx
│   ├── SummaryCard.jsx
│   ├── RelatedQuestions.jsx
│   ├── Footer.jsx
│   └── ui/
│       ├── ai-input.jsx (MorphPanel+ColorOrb)
│       ├── BorderGlow.jsx / .css
│       ├── ShinyText.jsx
│       ├── GooeyNav.jsx / .css
│       └── button.jsx
└── data/
    └── mockResults.js
```
