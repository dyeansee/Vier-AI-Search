// ============================================================
// GET /api/health — 健康检查
// 响应: { status, uptime, configuredModels, totalModels, timestamp }
// 不暴露任何密钥或供应商细节，仅供部署监控探活。
// ============================================================
import { PROVIDERS, isConfigured } from './_lib/llm.js';
import { applyCors } from './_lib/http.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const providers = Object.values(PROVIDERS);
  const configured = providers.filter(isConfigured).length;

  return res.status(200).json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    configuredModels: configured,
    totalModels: providers.length,
    timestamp: new Date().toISOString(),
  });
}
