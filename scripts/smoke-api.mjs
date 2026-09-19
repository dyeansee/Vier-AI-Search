// ============================================================
// 后端接口冒烟测试（无需真实密钥 / 无需启动服务器）
// 运行: node scripts/smoke-api.mjs
// 用 mock req/res 直接调用各 handler，验证校验分支与优雅降级。
// ============================================================
import searchHandler from '../api/search.js';
import streamHandler from '../api/stream.js';
import summarizeHandler from '../api/summarize.js';
import suggestHandler from '../api/suggest.js';
import modelsHandler from '../api/models.js';
import healthHandler from '../api/health.js';

let passed = 0;
let failed = 0;

function makeReq({ method = 'POST', body = {}, ip = '1.2.3.4', origin } = {}) {
  return {
    method,
    body,
    headers: { 'x-forwarded-for': ip, ...(origin ? { origin } : {}) },
    socket: { remoteAddress: ip },
  };
}

function makeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    chunks: [],
    ended: false,
    jsonBody: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
    writeHead(code, headers = {}) {
      this.statusCode = code;
      for (const [k, v] of Object.entries(headers)) this.headers[k.toLowerCase()] = v;
      return this;
    },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.jsonBody = obj; this.ended = true; return this; },
    write(chunk) { this.chunks.push(String(chunk)); return true; },
    end() { this.ended = true; return this; },
  };
  return res;
}

function check(name, cond, detail = '') {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name} ${detail}`); }
}

function sseEvents(res) {
  return res.chunks
    .join('')
    .split('\n\n')
    .filter((l) => l.startsWith('data: '))
    .map((l) => JSON.parse(l.slice(6)));
}

// ---------- health ----------
console.log('\n[GET /api/health]');
{
  const res = makeRes();
  healthHandler(makeReq({ method: 'GET' }), res);
  check('200 ok', res.statusCode === 200 && res.jsonBody.status === 'ok');
  check('12 个模型', res.jsonBody.totalModels === 12, `got ${res.jsonBody.totalModels}`);
  check('configured=0（无密钥）', res.jsonBody.configuredModels === 0);
}
{
  const res = makeRes();
  healthHandler(makeReq({ method: 'POST' }), res);
  check('POST → 405', res.statusCode === 405);
}

// ---------- models ----------
console.log('\n[GET /api/models]');
{
  const res = makeRes();
  modelsHandler(makeReq({ method: 'GET' }), res);
  check('200 + 12 个模型', res.statusCode === 200 && res.jsonBody.models.length === 12);
  check('全部 configured=false', res.jsonBody.models.every((m) => m.configured === false));
  check('不泄露 envKey', res.jsonBody.models.every((m) => !('envKey' in m)));
}
{
  const res = makeRes();
  modelsHandler(makeReq({ method: 'DELETE' }), res);
  check('DELETE → 405', res.statusCode === 405);
}

// ---------- search ----------
console.log('\n[POST /api/search]');
{
  const res = makeRes();
  await searchHandler(makeReq({ method: 'GET' }), res);
  check('GET → 405', res.statusCode === 405);
}
{
  const res = makeRes();
  await searchHandler(makeReq({ body: { query: '', models: ['deepseek'] } }), res);
  check('空 query → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await searchHandler(makeReq({ body: { query: 'hi', models: [] } }), res);
  check('空 models → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await searchHandler(makeReq({ body: { query: 'hi', models: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] } }), res);
  check('7 个模型 → 400（上限 6）', res.statusCode === 400);
}
{
  const res = makeRes();
  await searchHandler(makeReq({ body: { query: 'hi', models: ['deepseek'], history: 'bad' } }), res);
  check('history 非数组 → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await searchHandler(
    makeReq({ body: { query: 'hi', models: ['deepseek', 'nonexist'], history: [{ role: 'user', content: '早' }] } }),
    res
  );
  const results = res.jsonBody?.results || [];
  check('无密钥 → 200 优雅降级', res.statusCode === 200 && results.length === 2);
  check('deepseek 报"未配置"', results[0]?.ok === false && /未配置/.test(results[0]?.error || ''));
  check('未知模型报"未知模型"', results[1]?.ok === false && /未知模型/.test(results[1]?.error || ''));
}

// ---------- stream ----------
console.log('\n[POST /api/stream]');
{
  const res = makeRes();
  await streamHandler(makeReq({ body: { query: 'hi' } }), res);
  check('缺 models → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await streamHandler(makeReq({ body: { query: 'hi', models: ['deepseek', 'claude'] } }), res);
  const events = sseEvents(res);
  check('SSE Content-Type', /text\/event-stream/.test(res.headers['content-type'] || ''));
  check('无密钥 → 每模型 error 事件', events.filter((e) => e.type === 'error').length === 2);
  check('最后是 end 事件', events.at(-1)?.type === 'end' && res.ended);
}

// ---------- summarize ----------
console.log('\n[POST /api/summarize]');
{
  const res = makeRes();
  await summarizeHandler(makeReq({ body: { query: 'hi' } }), res);
  check('缺 answers → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await summarizeHandler(makeReq({ body: { query: 'hi', answers: [{ id: 'x', answer: '  ' }] } }), res);
  check('全空 answers → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await summarizeHandler(
    makeReq({ body: { query: 'hi', answers: [{ id: 'deepseek', answer: '答案A' }] } }),
    res
  );
  check('无密钥 → 503 + 未配置', res.statusCode === 503 && /未配置/.test(res.jsonBody?.error || ''));
}

// ---------- suggest ----------
console.log('\n[POST /api/suggest]');
{
  const res = makeRes();
  await suggestHandler(makeReq({ body: {} }), res);
  check('缺 query → 400', res.statusCode === 400);
}
{
  const res = makeRes();
  await suggestHandler(makeReq({ body: { query: 'hi', answer: '参考' } }), res);
  check('无密钥 → 503 + 未配置', res.statusCode === 503 && /未配置/.test(res.jsonBody?.error || ''));
}

// ---------- CORS ----------
console.log('\n[CORS]');
{
  const res = makeRes();
  await searchHandler(makeReq({ method: 'OPTIONS', origin: 'http://localhost:5173' }), res);
  check('预检 → 204', res.statusCode === 204 && res.ended);
  check('允许来源回显', res.headers['access-control-allow-origin'] === 'http://localhost:5173');
}
{
  const res = makeRes();
  await searchHandler(makeReq({ method: 'OPTIONS', origin: 'https://evil.com' }), res);
  check('陌生来源不回显 ACAO', !res.headers['access-control-allow-origin']);
}

// ---------- 限流（同一 IP 连打，默认 60s/20 次）----------
console.log('\n[限流 429]');
{
  const ip = '9.9.9.9';
  let last;
  for (let i = 0; i < 21; i++) {
    last = makeRes();
    await searchHandler(makeReq({ ip, body: { query: 'hi', models: ['deepseek'] } }), last);
  }
  check('第 21 次 → 429', last.statusCode === 429);
  check('带 Retry-After', Number(last.headers['retry-after']) >= 1);
}

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
