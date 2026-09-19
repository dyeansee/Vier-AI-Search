// ============================================================
// HTTP 工具层：CORS、参数校验、限流接入、错误响应统一格式
// ============================================================
import {
  SYSTEM_PROMPT,
  MAX_MODELS_PER_REQUEST,
  MAX_HISTORY_MESSAGES,
  MAX_HISTORY_CHARS,
  MAX_QUERY_CHARS,
} from './config.js';
import { checkRateLimit } from './ratelimit.js';

const DEFAULT_ORIGINS = 'http://localhost:5173,http://localhost:3000,https://ai.vier.cc';

export function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  const first = (Array.isArray(xf) ? xf[0] : xf || '').split(',')[0].trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

/**
 * CORS 处理。返回 true 表示是预检请求且已应答，调用方应直接 return。
 */
export function applyCors(req, res) {
  const origin = req.headers.origin || '';
  const allowed = (process.env.ALLOWED_ORIGINS || DEFAULT_ORIGINS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

/**
 * POST 接口公共入口检查：方法、CORS、限流。
 * 通过返回 null；被拦截时已写响应，返回非 null。
 */
export function guardPost(req, res) {
  if (applyCors(req, res)) return 'preflight';
  if (req.method !== 'POST') return fail(res, 405, 'Method Not Allowed');
  const limit = checkRateLimit(getClientIp(req));
  if (!limit.ok) {
    res.setHeader('Retry-After', String(limit.retryAfterSec));
    return fail(res, 429, `请求过于频繁，请 ${limit.retryAfterSec}s 后重试`);
  }
  return null;
}

/**
 * 校验并规范化 { query, models, history }。
 * 出错时写 400 响应并返回 null。
 */
export function parseSearchBody(req, res, { requireModels = true } = {}) {
  const { query, models, history } = req.body || {};

  if (!query || typeof query !== 'string' || !query.trim()) {
    fail(res, 400, 'query 不能为空');
    return null;
  }
  if (query.length > MAX_QUERY_CHARS) {
    fail(res, 400, `query 超长（最大 ${MAX_QUERY_CHARS} 字符）`);
    return null;
  }

  let modelIds = [];
  if (requireModels) {
    if (!Array.isArray(models) || models.length === 0) {
      fail(res, 400, 'models 不能为空');
      return null;
    }
    if (models.length > MAX_MODELS_PER_REQUEST) {
      fail(res, 400, `单次最多同时调用 ${MAX_MODELS_PER_REQUEST} 个模型`);
      return null;
    }
    modelIds = models.map(String);
  }

  let safeHistory = [];
  if (history != null) {
    if (!Array.isArray(history)) {
      fail(res, 400, 'history 必须是数组');
      return null;
    }
    safeHistory = history
      .filter(
        (m) =>
          m &&
          (m.role === 'user' || m.role === 'assistant') &&
          typeof m.content === 'string' &&
          m.content.trim()
      )
      .slice(-MAX_HISTORY_MESSAGES);
    let total = safeHistory.reduce((n, m) => n + m.content.length, 0);
    while (total > MAX_HISTORY_CHARS && safeHistory.length) {
      total -= safeHistory.shift().content.length;
    }
  }

  return { query: query.trim(), modelIds, history: safeHistory };
}

/**
 * 组装统一 messages：system + 多轮历史 + 当前问题
 */
export function buildMessages(query, history = [], systemPrompt = SYSTEM_PROMPT) {
  return [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: query },
  ];
}
