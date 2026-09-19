// ============================================================
// 大模型供应商配置注册表（仅服务端使用，密钥一律走环境变量）
// key 与前端 ALL_MODELS 的 id 一一对应（HeroSection.jsx）
//
// protocol:
//   openai    — OpenAI 兼容 /chat/completions（绝大多数国产模型均兼容）
//   anthropic — Anthropic /v1/messages 专有协议
// envKey:  Vercel 环境变量名（vercel env add <NAME>）
// baseUrlEnv: 可选，用环境变量覆盖 url（自部署模型 / New API 网关均走这里，
//             设置后 envKey 填网关令牌即可，见 deploy/new-api/README.md）
// enabled: false 表示无官方托管 API，需自部署后配 baseUrlEnv 才可用
// ============================================================

export const PROVIDERS = {
  deepseek: {
    label: 'DeepSeek V3',
    protocol: 'openai',
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    envKey: 'DEEPSEEK_API_KEY',
    baseUrlEnv: 'DEEPSEEK_BASE_URL',
    docs: 'https://platform.deepseek.com/api-docs',
    enabled: true,
  },
  tongyi: {
    label: '通义千问',
    protocol: 'openai',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-plus',
    envKey: 'DASHSCOPE_API_KEY',
    baseUrlEnv: 'DASHSCOPE_BASE_URL',
    docs: 'https://help.aliyun.com/zh/model-studio/',
    enabled: true,
  },
  kimi: {
    label: 'Kimi K2',
    protocol: 'openai',
    url: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'kimi-k2-0711-preview',
    envKey: 'MOONSHOT_API_KEY',
    baseUrlEnv: 'MOONSHOT_BASE_URL',
    docs: 'https://platform.moonshot.cn/docs',
    enabled: true,
  },
  zhipu: {
    label: '智谱 GLM',
    protocol: 'openai',
    url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-plus',
    envKey: 'ZHIPU_API_KEY',
    baseUrlEnv: 'ZHIPU_BASE_URL',
    docs: 'https://open.bigmodel.cn/dev/api',
    enabled: true,
  },
  doubao: {
    label: '豆包 Pro',
    protocol: 'openai',
    url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-1-5-pro-32k-250115',
    envKey: 'ARK_API_KEY',
    baseUrlEnv: 'ARK_BASE_URL',
    docs: 'https://www.volcengine.com/docs/82379',
    enabled: true,
  },
  longchat: {
    label: 'LongChat',
    protocol: 'openai',
    // 开源模型无官方托管 API，自部署（vLLM/Ollama）后用 LONGCHAT_BASE_URL 指向
    url: '',
    baseUrlEnv: 'LONGCHAT_BASE_URL',
    model: 'longchat-13b-16k',
    envKey: 'LONGCHAT_API_KEY',
    docs: 'https://github.com/lm-sys/FastChat',
    enabled: false,
  },
  minimax: {
    label: 'MiniMax Text-01',
    protocol: 'openai',
    url: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
    model: 'MiniMax-Text-01',
    envKey: 'MINIMAX_API_KEY',
    baseUrlEnv: 'MINIMAX_BASE_URL',
    docs: 'https://platform.minimaxi.com/document',
    enabled: true,
  },
  hunyuan: {
    label: '腾讯混元 Turbo',
    protocol: 'openai',
    url: 'https://api.hunyuan.cloud.tencent.com/v1/chat/completions',
    model: 'hunyuan-turbo',
    envKey: 'HUNYUAN_API_KEY',
    baseUrlEnv: 'HUNYUAN_BASE_URL',
    docs: 'https://cloud.tencent.com/document/product/1729',
    enabled: true,
  },
  mimo: {
    label: '小米 MiMo',
    protocol: 'openai',
    // 开源模型无官方托管 API，自部署后用 MIMO_BASE_URL 指向
    url: '',
    baseUrlEnv: 'MIMO_BASE_URL',
    model: 'mimo-7b-rl',
    envKey: 'MIMO_API_KEY',
    docs: 'https://github.com/XiaomiMiMo/MiMo',
    enabled: false,
  },
  gpt4: {
    label: 'GPT-4o',
    protocol: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    envKey: 'OPENAI_API_KEY',
    baseUrlEnv: 'OPENAI_BASE_URL',
    docs: 'https://platform.openai.com/docs',
    enabled: true,
  },
  claude: {
    label: 'Claude Sonnet 4',
    protocol: 'anthropic',
    url: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    envKey: 'ANTHROPIC_API_KEY',
    baseUrlEnv: 'ANTHROPIC_BASE_URL',
    docs: 'https://docs.anthropic.com',
    enabled: true,
  },
  gemini: {
    label: 'Gemini 2.5 Flash',
    protocol: 'openai',
    // Google 官方提供的 OpenAI 兼容端点
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.5-flash',
    envKey: 'GEMINI_API_KEY',
    baseUrlEnv: 'GEMINI_BASE_URL',
    docs: 'https://ai.google.dev/gemini-api/docs',
    enabled: true,
  },
};

// 单模型请求超时（毫秒）
export const REQUEST_TIMEOUT_MS = 30_000;

// 流式请求超时（长回答需要更宽裕）
export const STREAM_TIMEOUT_MS = 60_000;

// 单次请求最多同时调用的模型数
export const MAX_MODELS_PER_REQUEST = 6;

// 多轮对话限制：最多携带的历史消息条数 / 总字符数
export const MAX_HISTORY_MESSAGES = 20;
export const MAX_HISTORY_CHARS = 16_000;

// 单条问题最大长度
export const MAX_QUERY_CHARS = 4_000;

// 总结/相关问题默认使用的模型 id（可用 SUMMARIZER_MODEL 环境变量覆盖）
export function summarizerId() {
  return process.env.SUMMARIZER_MODEL || 'deepseek';
}

// 聚合回答的系统提示词
export const SYSTEM_PROMPT =
  '你是 Gravlens 聚合搜索的回答者之一。请用简体中文简洁、准确地回答用户问题，直接给出答案，不要重复问题。';

// 总结对比的系统提示词
export const SUMMARIZE_PROMPT =
  '你是 Gravlens 的答案聚合员。用户向多个 AI 模型提出了同一问题，下面是各模型的回答。' +
  '请用简体中文输出：1) 综合结论（各模型的共识，2-4 句）；2) 分歧点（如果有，指出哪个模型说法不同）；3) 建议采信度最高的回答。不要逐条复述原文。';

// 相关问题推荐的系统提示词
export const SUGGEST_PROMPT =
  '你是搜索引擎的相关问题推荐器。根据用户的问题（和可选的参考回答），生成 3 个用户接下来最可能想问的中文问题。' +
  '只输出 JSON 数组，形如 ["问题1","问题2","问题3"]，不要任何其他内容。';

/**
 * 取某个供应商的最终请求地址。
 * baseUrlEnv 存在且已设置时覆盖官方 url（自部署 / New API 网关），
 * 路径按协议拼接：anthropic → /v1/messages，其余 → /v1/chat/completions。
 */
export function resolveUrl(provider) {
  if (provider.baseUrlEnv && process.env[provider.baseUrlEnv]) {
    const base = process.env[provider.baseUrlEnv].replace(/\/$/, '');
    const path = provider.protocol === 'anthropic' ? '/v1/messages' : '/v1/chat/completions';
    return base + path;
  }
  return provider.url;
}

/**
 * 供应商是否可用：enabled 且已配置密钥（或已配自部署地址）
 */
export function isConfigured(provider) {
  const hasKey = Boolean(process.env[provider.envKey]);
  const hasBaseUrl = Boolean(provider.baseUrlEnv && process.env[provider.baseUrlEnv]);
  return provider.enabled ? hasKey : hasBaseUrl;
}
