# 实现计划

> **状态**：✅ MVP原型已完成（2026-07-02）

## Task 1: 项目脚手架 ✅
- 使用 Vite + React 19 创建项目
- 安装依赖：tailwindcss v4, motion 12, class-variance-authority
- 配置 Tailwind CSS v4
- 文件：vite.config.js, package.json

## Task 2: 全局样式 + 布局 ✅
- 纯黑背景 #000000 + CSS变量（颜色、间距）
- card/pill/pill-active/shiny-text/liquid-path-toggle 工具类
- 响应式工具类 .hide-scrollbar, .text-rendering-optimize
- 基础布局：min-h-screen flex flex-col
- 文件：src/index.css

## Task 3: Header 组件 ✅
- LogoIcon + ShinyText "Gravlens" + "引力透镜" + "多模型聚合搜索"
- backdrop-blur, 点击Logo重置搜索
- 文件：src/components/Header.jsx

## Task 4: HeroSection + MorphPanel ✅
- ShinyText大标题 + 副标题（仅idle显示）
- MorphPanel（ColorOrb + spring变形 + "问AI"/"思考中..."）
- 模型选择标签（pill badge行）
- "选择AI"按钮 → createPortal居中弹窗 + backdrop-filter模糊
- 停止搜索按钮（搜索中显示）
- 预设示例问题chips
- 文件：src/components/HeroSection.jsx, src/components/ui/ai-input.jsx

## Task 5: 模拟数据 ✅
- 3个典型问题场景 + 3个追问场景
- 流式输出模拟（逐模型返回）
- simulateSearch(progress callback) 模式
- 文件：src/data/mockResults.js

## Task 6: ResultsSection ✅
- 搜索结果容器 + 搜索阶段管理
- 对话历史面包屑
- 追问上下文指示器（BorderGlow包裹）
- 追问输入框（stage=done时显示）
- 文件：src/components/ResultsSection.jsx

## Task 7: SummaryCard ✅
- 共识结论 + 差异分析 + 综合建议
- 可信度评分（响应式进度条 + 分色：≥90白/≥75浅灰/<75深灰）
- 复制总结按钮（clipboard API）
- 文件：src/components/SummaryCard.jsx

## Task 8: FloatingAnswerPanel ✅
- BorderGlow容器包裹
- 模型badge行（flex-1等分，点击展开手风琴）
- 多开手风琴（Set存储展开状态）
- 工具栏：完成进度 + 全部展开/收起
- 每个答案独立BorderGlow包裹
- 来源标注 + 共识高亮
- 文件：src/components/FloatingAnswerPanel.jsx

## Task 9: QueryBubble ✅
- 用户问题聊天气泡（直角border框）
- ShinyText文字效果
- 长文自动折叠（60字符阈值）+ 展开/收起按钮
- 文件：src/components/QueryBubble.jsx

## Task 10: RelatedQuestions + PathModeToggle ✅
- BorderGlow容器，仅stage=done时显示
- PathModeToggle（记忆/新对话）置于框内顶部
- 预设追问建议（按queryKey匹配）+ 通用追问
- 追问输入框
- 文件：src/components/RelatedQuestions.jsx, src/components/PathModeToggle.jsx

## Task 11: GlassBackground ✅
- Canvas 2D 绘制3个移动渐变光晕（靛蓝/翡翠/琥珀）
- CSS点阵网格 + 暗角vignette
- 文件：src/components/GlassBackground.jsx

## Task 12: BorderGlow + ShinyText + GooeyNav ✅
- BorderGlow：鼠标跟踪边缘光效组件 + CSS
- ShinyText：光泽文字动画（useAnimationFrame + useTransform）
- GooeyNav：粘性粒子导航效果
- 文件：src/components/ui/BorderGlow.jsx, ShinyText.jsx, GooeyNav.jsx

## Task 13: Footer ✅
- 双栏布局：Logo + 项目名 / Demo标识 + 技术栈
- 文件：src/components/Footer.jsx

## Task 14: App主组件整合 ✅
- App级状态管理（selectedModels, pathMode已提升）
- 搜索流程控制 + handleSearch/handleStopSearch/handleFollowUp
- 各组件组合 + 条件渲染
- 文件：src/App.jsx

## Task 15: 响应式适配 ✅
- 移动端布局优化
- pill自动缩小（sm断点）
- hide-scrollbar工具类
- SummaryCard可信度条响应式

## 构建产物（当前）
- JS: 393.14 KB (gzip: 125.76 KB)
- CSS: 41.87 KB (gzip: 8.40 KB)
- 构建时间: ~100ms
