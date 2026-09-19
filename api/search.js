// ============================================================
// POST /api/search — 聚合搜索（非流式）
// 请求:  { query: string, models: string[], history?: [{role, content}] }
// 响应:  { results: [{ id, ok, answer?, error?, latencyMs }], elapsedMs }
//
// 并行调用所选模型，支持多轮对话上下文，单模型失败不影响整体。
// ============================================================
import { chat, LLMError } from './_lib/llm.js';
import { guardPost, parseSearchBody, buildMessages } from './_lib/http.js';

async function askOne(id, messages) {
  const started = Date.now();
  try {
    const answer = await chat(id, messages);
    return { id, ok: true, answer, latencyMs: Date.now() - started };
  } catch (err) {
    const message = err instanceof LLMError ? err.message : String(err.message || err);
    return { id, ok: false, error: message, latencyMs: Date.now() - started };
  }
}

export default async function handler(req, res) {
  if (guardPost(req, res)) return;

  const parsed = parseSearchBody(req, res);
  if (!parsed) return;
  const { query, modelIds, history } = parsed;

  const messages = buildMessages(query, history);
  const started = Date.now();
  const results = await Promise.all(modelIds.map((id) => askOne(id, messages)));

  return res.status(200).json({ results, elapsedMs: Date.now() - started });
}
