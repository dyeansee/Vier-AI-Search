// ============================================================
// 轻量限流：单实例内存滑动窗口（按 IP）
// Serverless 场景下每个实例独立计数，作为第一道闸门足够；
// 需要跨实例精确限流时可换 Upstash Redis，接口保持不变。
// ============================================================

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 20;

// ip -> 时间戳数组
const hits = new Map();

export function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  let list = hits.get(ip);
  if (!list) {
    list = [];
    hits.set(ip, list);
  }
  // 清掉窗口外的记录
  while (list.length && list[0] < windowStart) list.shift();

  if (list.length >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((list[0] + WINDOW_MS - now) / 1000);
    return { ok: false, retryAfterSec: Math.max(retryAfterSec, 1) };
  }

  list.push(now);

  // 防止 Map 无限增长：超过 5000 个 IP 时清空最早写入的一半
  if (hits.size > 5000) {
    const keys = [...hits.keys()].slice(0, 2500);
    for (const k of keys) hits.delete(k);
  }

  return { ok: true, remaining: MAX_REQUESTS - list.length };
}
