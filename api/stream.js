// ============================================================
// POST /api/stream — 聚合搜索（SSE 流式）
// 请求:  { query: string, models: string[], history?: [{role, content}] }
// 响应:  text/event-stream，每行一个 JSON 事件：
//   { type: 'delta', id, text }        某模型的增量 token
//   { type: 'done',  id, latencyMs }   某模型完成
//   { type: 'error', id, error }       某模型失败（不影响其他模型）
//   { type: 'end' }                    全部模型结束
// ============================================================
import { chatStream, LLMError } from './_lib/llm.js';
import { guardPost, parseSearchBody, buildMessages } from './_lib/http.js';

function send(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

async function streamOne(res, id, messages) {
  const started = Date.now();
  try {
    await chatStream(id, messages, (text) => send(res, { type: 'delta', id, text }));
    send(res, { type: 'done', id, latencyMs: Date.now() - started });
  } catch (err) {
    const message = err instanceof LLMError ? err.message : String(err.message || err);
    send(res, { type: 'error', id, error: message });
  }
}

export default async function handler(req, res) {
  if (guardPost(req, res)) return;

  const parsed = parseSearchBody(req, res);
  if (!parsed) return;
  const { query, modelIds, history } = parsed;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const messages = buildMessages(query, history);
  await Promise.all(modelIds.map((id) => streamOne(res, id, messages)));

  send(res, { type: 'end' });
  res.end();
}
