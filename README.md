# Vier Search

Vier Search（产品名 Gravlens，中文「引力透镜」）是一个黑色科技风的多模型 AI 聚合搜索原型：用户输入问题后，多个模拟模型并行返回答案，再生成共识、差异和建议总结。

## 当前阶段

当前版本暂不接入真实 API，重点验证产品交互和搜索结果呈现：

- 支持预设问题和任意文本问题
- 支持记忆追问与新对话
- 支持模型选择并过滤模拟回答
- 支持逐模型流式模拟、总结卡片和结果展开
- 停止搜索后会忽略迟到的异步结果
- 未配置真实后端时自动使用通用 mock 结果

真实模型 API、联网引用、登录和持久化暂不在当前阶段范围内。

## 技术栈

- React 19
- Vite 8
- Tailwind CSS 4
- Framer Motion / Motion
- Vitest + Testing Library
- Oxlint

## 本地运行

```bash
npm install
npm run dev
```

## 验证命令

```bash
npm run test
npm run lint
npm run build
```

后端 API 目录和部署模板已经保留在仓库中，但前端当前不会依赖它们，可以独立运行 mock 演示。
