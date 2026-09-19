// ============================================================
// 统一 LLM 调用层
// 屏蔽不同厂商的协议差异，对上层暴露一致的 chat / chatStream 接口。
// 所有密钥读取都发生在这里，绝不外传。
// ============================================================
import {
  PROVIDERS,
  REQUEST_TIMEOUT_MS,
  STREAM_TIMEOUT_MS,
  resolveUrl,
  isConfigured,
} from './config.js';

export class LLMError extends Error {
  constructor(message, { status = 500, providerId } = {}) {
    super(message);
    this.name = 'LLMError';
    this.status = status;
    this.providerId = providerId;
  }
}

function getProvider(id) {
  const provider = PROVIDERS[id];
  if (!provider) throw new LLMError(`未知模型: ${id}`, { status: 400, providerId: id });
  if (!isConfigured(provider)) {
    throw new LLMError(`${provider.envKey} 未配置`, { status: 503, providerId: id });
  }
  return provider;
}

// 把统一的 messages 转成 anthropic 的 system + messages 结构
function splitSystem(messages) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const rest = messages.filter((m) => m.role !== 'system');
  return { system, rest };
}

function authHeaders(provider) {
  if (provider.protocol === 'anthropic') {
    return {
      'x-api-key': process.env[provider.envKey] || '',
      'anthropic-version': '2023-06-01',
    };
  }
  return { Authorization: `Bearer ${process.env[provider.envKey] || ''}` };
}

function buildBody(provider, messages, { stream = false, temperature = 0.7, maxTokens = 1024 } = {}) {
  if (provider.protocol === 'anthropic') {
    const { system, rest } = splitSystem(messages);
    return {
      model: provider.model,
      system,
      messages: rest,
      max_tokens: maxTokens,
      stream,
    };
  }
  return {
    model: provider.model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };
}

/**
 * 非流式对话。messages: [{role, content}]，返回纯文本回答。
 */
export async function chat(id, messages, opts = {}) {
  const provider = getProvider(id);
  const res = await fetch(resolveUrl(provider), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(provider) },
    body: JSON.stringify(buildBody(provider, messages, { ...opts, stream: false })),
    signal: AbortSignal.timeout(opts.timeoutMs || REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    throw new LLMError(`HTTP ${res.status}: ${text}`, { status: res.status, providerId: id });
  }
  const data = await res.json();
  if (provider.protocol === 'anthropic') {
    return data.content?.[0]?.text ?? '';
  }
  return data.choices?.[0]?.message?.content ?? '';
}

// 解析 SSE 数据行，抽取增量 token（兼容 openai / anthropic 两种流格式）
function extractDelta(provider, json) {
  if (provider.protocol === 'anthropic') {
    if (json.type === 'content_block_delta') return json.delta?.text || '';
    return '';
  }
  return json.choices?.[0]?.delta?.content || '';
}

/**
 * 流式对话。onToken(text) 每收到一段增量就回调一次，返回完整文本。
 */
export async function chatStream(id, messages, onToken, opts = {}) {
  const provider = getProvider(id);
  const res = await fetch(resolveUrl(provider), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(provider) },
    body: JSON.stringify(buildBody(provider, messages, { ...opts, stream: true })),
    signal: AbortSignal.timeout(opts.timeoutMs || STREAM_TIMEOUT_MS),
  });
  if (!res.ok || !res.body) {
    const text = res.body ? (await res.text()).slice(0, 300) : '无响应体';
    throw new LLMError(`HTTP ${res.status}: ${text}`, { status: res.status, providerId: id });
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;
      try {
        const json = JSON.parse(payload);
        const delta = extractDelta(provider, json);
        if (delta) {
          full += delta;
          onToken(delta);
        }
      } catch {
        // 忽略无法解析的心跳/注释行
      }
    }
  }
  return full;
}

export { PROVIDERS, isConfigured };
