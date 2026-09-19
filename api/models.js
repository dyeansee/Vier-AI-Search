// ============================================================
// GET /api/models — 模型可用性查询接口
// 响应: { models: [{ id, label, model, configured, docs }] }
//
// 前端可据此把未配置密钥的模型置灰，不暴露任何密钥内容。
// ============================================================
import { PROVIDERS, isConfigured } from './_lib/llm.js';
import { applyCors } from './_lib/http.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const models = Object.entries(PROVIDERS).map(([id, p]) => ({
    id,
    label: p.label,
    model: p.model,
    configured: isConfigured(p),
    docs: p.docs,
  }));

  res.setHeader('Cache-Control', 's-maxage=60');
  return res.status(200).json({ models });
}
