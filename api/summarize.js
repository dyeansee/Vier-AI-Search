// ============================================================
// POST /api/summarize — 多模型回答聚合总结
// 请求:  { query: string, answers: [{ id, answer }] }
// 响应:  { summary: string, summarizer: string, latencyMs }
//
// 用 summarizerId()（默认 deepseek，可用 SUMMARIZER_MODEL 覆盖）
// 对各模型回答做综合结论 / 分歧点 / 采信建议。
// ============================================================
import { chat, LLMError, PROVIDERS } from './_lib/llm.js';
import { guardPost, fail } from './_lib/http.js';
import { summarizerId, SUMMARIZE_PROMPT, MAX_QUERY_CHARS } from './_lib/config.js';

// 每条回答参与总结的最大字符数，防止 prompt 过长
const MAX_ANSWER_CHARS = 4_000;

export default async function handler(req, res) {
  if (guardPost(req, res)) return;

  const { query, answers } = req.body || {};
  if (!query || typeof query !== 'string' || !query.trim()) {
    return fail(res, 400, 'query 不能为空');
  }
  if (query.length > MAX_QUERY_CHARS) {
    return fail(res, 400, `query 超长（最大 ${MAX_QUERY_CHARS} 字符）`);
  }
  if (!Array.isArray(answers) || answers.length === 0) {
    return fail(res, 400, 'answers 不能为空');
  }

  const valid = answers.filter(
    (a) => a && typeof a.answer === 'string' && a.answer.trim()
  );
  if (valid.length === 0) {
    return fail(res, 400, 'answers 中没有有效回答');
  }

  const sections = valid.map((a) => {
    const label = PROVIDERS[a.id]?.label || a.id || '未知模型';
    return `【${label}】\n${a.answer.slice(0, MAX_ANSWER_CHARS)}`;
  });
  const userContent = `用户问题：${query.trim()}\n\n各模型回答：\n\n${sections.join('\n\n')}`;

  const id = summarizerId();
  const started = Date.now();
  try {
    const summary = await chat(id, [
      { role: 'system', content: SUMMARIZE_PROMPT },
      { role: 'user', content: userContent },
    ]);
    return res.status(200).json({ summary, summarizer: id, latencyMs: Date.now() - started });
  } catch (err) {
    const status = err instanceof LLMError ? err.status : 500;
    const message = err instanceof LLMError ? err.message : String(err.message || err);
    return fail(res, status >= 400 && status < 600 ? status : 502, `总结失败: ${message}`);
  }
}
