# New API 网关部署（gw.vier.cc）

把多家大模型 API 统一收口到自建网关，Gravlens 后端通过 `*_BASE_URL` 指向它；
计费 / 用户体系 / 订阅套餐都在网关层完成，随时从按量制切换或并行订阅制。

```
用户 → Gravlens (ai.vier.cc, Vercel)
         ↓ *_BASE_URL 指向
      New API (VPS, gw.vier.cc)   ← 订阅套餐 / 计费 / 渠道调度
         ↓ 渠道
      DeepSeek / 通义 / Kimi / GPT / Claude / Gemini … 官方 API
```

## 一、准备

1. 一台 VPS（1C1G 起步即可），装好 Docker + Compose 插件
2. DNS 平台添加 A 记录：`gw.vier.cc → VPS 公网 IP`（Caddy 会自动签 HTTPS 证书）

## 二、部署（VPS 上执行）

```bash
# 1. 上传本目录到 VPS（或 git clone 后 cd 进来）
scp -r deploy/new-api user@vps:~/new-api && ssh user@vps && cd ~/new-api

# 2. 配置密钥
cp .env.example .env
openssl rand -hex 32   # 把输出填进 .env 的 SESSION_SECRET

# 3. 启动
docker compose up -d

# 4. 验证
curl -s https://gw.vier.cc/api/status | head -c 200
```

首次访问 `https://gw.vier.cc` 用默认账号 `root / 123456` 登录，**立即改密码**。

## 三、后台初始化（按顺序）

1. **渠道**：控制台 → 渠道 → 新建，逐家填入官方 API Key
   - 模型名与 Gravlens 保持一致：`deepseek-chat`、`qwen-plus`、`kimi-k2-0711-preview`、
     `glm-4-plus`、`doubao-1-5-pro-32k-250115`、`MiniMax-Text-01`、`hunyuan-turbo`、
     `gpt-4o`、`claude-sonnet-4-20250514`、`gemini-2.5-flash`
   - 同一模型可建多渠道自动负载均衡
2. **令牌**：控制台 → 令牌 → 新建一个给 Gravlens 后端专用的 `sk-` 令牌（限定可用模型）
3. **计费**：系统设置 → 支付，配易支付或 Stripe；
   订阅制走 `/console/subscription` 创建套餐（可与按量余额并存）
4. **限流**：系统设置里按需配置（Gravlens 自身已有 IP 限流作为第一道闸门）

## 四、接入 Gravlens

在 Vercel（或本地 `.env.local`）设置，**无需改任何代码**：

```bash
# 想走网关的模型：BASE_URL 指向网关，API_KEY 填第 2 步的 New API 令牌
DEEPSEEK_BASE_URL=https://gw.vier.cc
DEEPSEEK_API_KEY=sk-xxxx
OPENAI_BASE_URL=https://gw.vier.cc
OPENAI_API_KEY=sk-xxxx
ANTHROPIC_BASE_URL=https://gw.vier.cc   # Claude 走网关的 /v1/messages
ANTHROPIC_API_KEY=sk-xxxx
# …其余模型同理，见项目根 .env.example；不设 BASE_URL 的模型继续直连官方
```

## 五、运维

```bash
docker compose pull && docker compose up -d   # 升级
tar czf backup.tgz data/                      # 备份（SQLite + 日志全在 data/）
docker compose logs -f new-api                # 看日志
```

安全提醒：上游渠道只挂官方 API。sub2api 之类订阅转 API 违反厂商 ToS，
不要垫在对外收费的产品下面。
