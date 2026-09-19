// ============================================================
// POST /api/suggest — 相关问题推荐
// 请求:  { query: string, answer?: string }
// 响应:  { suggestions: string[], latencyMs }
//
// 用 summarizerId() 模型按 SUGGEST_PROMPT 生成 3 个后续问题；
// 模型输出解析失败时优雅降级为空数组，不报错。
// ============================================================
import { chat, LLMError } from './_lib/llm.js';
import { guardPost, fail } from './_lib/http.js';
import { summarizerId, SUGGEST_PROMPT, MAX_QUERY_CHARS } from './_lib/config.js';

// 参考回答参与生成的最大字符数
const MAX_ANSWER_CHARS = 3_000;

// 从模型输出里尽力抠出字符串数组（容忍 ```json 包裹、前后废话）
function parseSuggestions(text) {
  const match = String(text).match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const arr = JSON.parse(match[0]);
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s) => typeof s === 'string' && s.trim())
      .map((s) => s.trim())
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (guardPost(req, res)) return;

  const { query, answer } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return fail(res, 400, 'query 不能为空');
  }
  if (query.length > MAX_QUERY_CHARS) {
    return fail(res, 400, `query 超长（最大 ${MAX_QUERY_CHARS} 字符）`);
  }

  let userContent = `用户问题：${query.trim()}`;
  if (typeof answer === 'string' && answer.trim()) {
    userContent += `\n\n参考回答：${answer.trim().slice(0, MAX_ANSWER_CHARS)}`;
  }

  const started = Date.now();
  try {
    const raw = await chat(summarizerId(), [
      { role: 'system', content: SUGGEST_PROMPT },
      { role: 'user', content: userContent },
    ]);
    return res
      .status(200)
      .json({ suggestions: parseSuggestions(raw), latencyMs: Date.now() - started });
  } catch (err) {
    const status = err instanceof LLMError ? err.status : 500;
    const message = err instanceof LLMError ? err.message : String(err.message || err);
    return fail(res, status >= 400 && status < 600 ? status : 502, `推荐失败: ${message}`);
  }
}
