import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Galaxy.css';

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uRepulsionRadius;
uniform float uBHRadius;
uniform float uBHGlowInner;
uniform float uBHGlowHalo;
uniform float uBHGlowStrength;
uniform float uBHParticleStrength;
uniform float uBHShakeStrength;
uniform float uMouseActiveFactor;
uniform vec2 uAnnihilateCenter;                                       // 问AI按钮中心（归一化[0,1]，与uMouse同约定，y翻转）
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uDissolve;
uniform vec2 uSeed;   // 每加载随机一次：星场分布种子，避免每次刷新星星排布雷同

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity * 0.56) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity * 0.56;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity * 0.56;
  // 费米式衰减：边缘平滑过渡、无硬 cutoff 环
  m *= 1.0 / (1.0 + d * d * 26.0);
  return m;
}

vec3 StarLayer(vec2 uv, float scale, float layerOffset) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -2; y <= 2; y++) {
    for (int x = -2; x <= 2; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y)) + uSeed;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      // 错落分布：每格静态随机偏移 + 动态漂移，打破规则晶格
      vec2 jitter = vec2(Hash21(si + 11.0), Hash21(si + 13.0)) - 0.5;
      // 无缝循环相位 lp：uTime*uSpeed/18 每 ~60s(@uSpeed0.3) 走满一圈并精确回到起点；
      // 各时间项用整数频率（1/2/3/5）乘 lp，保证整段星空可无缝循环；
      // 每颗星凭独立 hash 相位 (a) 做多频正弦摆动 → 自然、随机的流动感
      float lp = fract(uTime * uSpeed / 18.0) * 6.2831853;
      float a = seed * 6.2831853;
      float driftX = sin(lp + a) * 0.6 + sin(lp * 3.0 + a * 1.7) * 0.4;
      float driftY = cos(lp * 2.0 + a * 1.3) * 0.6 + cos(lp * 5.0 + a * 0.7) * 0.4;
      vec2 pad = vec2(driftX, driftY) * 0.22 + jitter * 0.85;

      // 溶解：以每颗星到屏幕中心的距离为主序，由内向外逐颗消失；
      // 但叠加每颗星独立的随机错落位置 + 随机淡出速度（窗口宽度），
      // 形成更有层次、非整齐圆环的熄灭感。
      float starFade = 1.0;
      if (uDissolve > 0.001) {
        vec2 starUV = id + offset + 0.5 + pad;
        vec2 starScreen = (starUV - layerOffset) / scale;
        float r = length(starScreen);
        float maxDist = length(vec2(0.5 * uResolution.x / uResolution.y, 0.5));
        float rand = Hash21(si + 23.0);   // 错落位置
        float rand2 = Hash21(si + 41.0);  // 淡出速度 / 窗口宽度
        // 以半径为主序，叠加 ±0.35 随机错落 → 仍大体由内向外，但层次更分明
        float center = r + (rand - 0.5) * 0.7;
        // 每颗星淡出窗口宽度随机 → 消失速度随机（窄=快灭，宽=慢消）
        float w = 0.04 + rand2 * 0.16;
        float front = uDissolve * (maxDist + 0.6);
        starFade = smoothstep(front - w, front + w, center);
      }

      // 少量大星星：约 5% 的星点放大并提亮，其余保持原样
      float isBig = step(0.95, seed);
      float bigRand = Hash21(si + 7.0);
      float s = mix(1.0, 2.0 + bigRand * 2.5, isBig);
      float star = Star((gv - offset - pad) / s, flareSize * mix(1.0, 1.6, isBig));
      vec3 color = base;

      float twinkle = 1.25 + 0.25 * sin(lp * 2.0 + a);   // 与 lp 同步的循环闪烁，范围 [1.0, 1.5]
      // 只让约一半星点参与闪烁，其余恒定不闪
      float twinkleOn = step(0.5, Hash21(si + 17.0));
      twinkle = mix(1.0, twinkle, uTwinkleIntensity * twinkleOn);
      star *= twinkle;

      col += star * size * color * mix(1.0, 2.8, isBig) * starFade;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv0 = (vUv * uResolution.xy - focalPx) / uResolution.y;  // 屏幕空间（不旋转），用于黑洞合成
  vec2 uv = uv0;
  vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;

  if (uAutoCenterRepulsion > 0.0) {
    // 常驻中心排斥（本项目未启用，保留兼容）：以屏幕中心为源，半径内把星点向外推
    float centerDist = length(uv);
    float influence = 1.0 - smoothstep(0.0, uRepulsionRadius, centerDist);
    vec2 dir = centerDist > 1e-4 ? uv / centerDist : vec2(0.0);
    uv += dir * influence * uAutoCenterRepulsion * uMouseActiveFactor;
  } else if (uMouseRepulsion) {
    // 光线折射（引力透镜）：以光标为中心、半径 uRepulsionRadius 内对星点做「绕黑洞旋转」的扭转；
    // 越靠近中心扭转越强、随时间持续单向旋转，形成绕黑洞流动的透镜流。强度随 uMouseActiveFactor 淡入淡出。
    float d = length(uv - mousePosUV);
    float influence = 1.0 - smoothstep(0.0, uRepulsionRadius, d);
    vec2 rel = uv - mousePosUV;
    // 绕黑洞旋转的引力透镜：角度 = uTime * 速度，越近转得越多；
    // 速度 0.4 rad/s（≈ 16s 转 1 圈），随 uMouseActiveFactor 淡入淡出。
    float angle = uTime * 0.4 * influence * uMouseActiveFactor;
    float s = sin(angle), c = cos(angle);
    mat2 rot = mat2(c, -s, s, c);
    rel = rot * rel;
    vec2 dir = d > 1e-4 ? rel / d : vec2(0.0);
    // 叠加轻微径向排斥，强化透镜凸出感
    uv = mousePosUV + rel + dir * influence * uRepulsionStrength * 0.6 * uMouseActiveFactor;
  } else {
    uv += (uMouse - vec2(0.5)) * 0.1 * uMouseActiveFactor;
  }

  // 整体旋转纳入同一循环相位：每循环周期转 1 整圈，与星点漂移/闪烁同周期、无缝衔接
  float autoRotAngle = fract(uTime * uSpeed / 18.0) * 6.2831853;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    // 层深度推进也锁定同一循环相位，避免循环边界处层叠跳变（两端 fade→0 已平滑衔接）
    float depth = fract(i + fract(uTime * uSpeed / 18.0));
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32, scale, i * 453.32) * fade;
  }

  // 对比度增强：用幂曲线压暗弥散光晕、提亮核心，让星点更锐利突出（不靠密度/饱和度）
  col = clamp(col, 0.0, 1.0);
  col = pow(col, vec3(1.25)) * 1.4;

  // 曝光调整：整体 -5%，星星再额外 -5%（二者叠加约 -9.75%）
  col *= 0.95; // 整体曝光
  col *= 0.95; // 星星额外曝光

  // 鼠标黑洞：屏幕空间、光标处 —— 中心黑圆（事件视界）+ 径向梯度辉光（白→金）
  // + 绕黑洞切向流动的白色粒子（吸积盘条纹）。
  if (uMouseRepulsion) {
    float active = uMouseActiveFactor;
    // 参考中心：默认屏幕中心；uAnnihilateCenter 指定为「问昕」按钮中心时，堙灭/抖动均相对按钮，消除与屏幕中心的偏移
    vec2 annihilateUV = (uAnnihilateCenter * uResolution.xy - focalPx) / uResolution.y;
    float centerDist = length(mousePosUV - annihilateUV);
    float annihilate = smoothstep(0.0, 0.20, centerDist);
    // 黑洞自身抖动：中心坐标随时间随机抖动；仅在距参考中心约 3 个黑洞直径内发生，
    // 超出该范围黑洞保持平静（不再抖动），且越靠近中心抖得越剧烈
    float shakeZone = 6.0 * uBHRadius;                                    // 约 3 个黑洞直径
    float inZone = 1.0 - smoothstep(0.0, shakeZone, centerDist);          // 中心=1，3直径外=0（平静）
    float shakeAmp = uBHShakeStrength * active * inZone;
    // 保护 Hash21 精度：uTime*25 累积到数千后 dot product 达到 1e6+，内部 sin 完全失真
    // 每 40s wrap 一次到 [0,1000]，Hash21 输入安全
    float sT = mod(uTime * 25.0, 1000.0);
    float sjx = Hash21(vec2(sT, 3.7));
    float sjy = Hash21(vec2(9.1, sT));
    vec2 bhCenter = mousePosUV + (vec2(sjx, sjy) - 0.5) * 2.0 * shakeAmp;
    vec2 rel = uv0 - bhCenter;
    float dm = length(rel);
    float effR = uBHRadius * annihilate;
    float effGlowInner = uBHGlowInner * annihilate;
    float effGlowHalo = uBHGlowHalo * annihilate;
    // 黑圆（事件视界）
    float core = 1.0 - smoothstep(effR * 0.9, max(effR, 1e-4), dm);
    // 辉光梯度：内白 → 外金（内沿锚定 effGlowInner，与黑核解耦，黑核缩小不影响辉光）
    float haloT = smoothstep(effGlowInner, max(effGlowHalo, 1e-4), dm);
    vec3 glowColor = mix(vec3(1.0), vec3(1.0, 0.78, 0.4), haloT);
    float haloWidth = max(effGlowHalo - effGlowInner, 1e-4);
    float gate = smoothstep(effGlowInner * 0.95, max(effGlowInner, 1e-4), dm);
    float fall = gate * exp(-pow(max(dm - effGlowInner, 0.0) / haloWidth, 2.0));

    col += glowColor * fall * uBHGlowStrength * active;

    // 黑核与辉光之间的“空洞”补一层白色辉光，让二者衔接不脱节
    float bridge = smoothstep(effR, max(effGlowInner, 1e-4), dm) *
                   (1.0 - smoothstep(effGlowInner - 0.002 * annihilate, effGlowInner + 0.006 * annihilate, dm));
    col += vec3(1.0) * bridge * uBHGlowStrength * active * 0.7;

    // 绘制顺序（由下到上）：金线高斯模糊(底层) → 纯白细线 → 黑核 → 1px白线(最上层)
    // 这样黑边/白线都不被金线的高斯模糊向内染色；1px白线置于最上层
    float lineW = 0.0024 * annihilate;                                  // 金线半宽（随黑洞缩小）
    float px = 1.0 / uResolution.y;                                    // 1 像素宽度（uv0 空间）

    // 金线：高斯模糊，位于最外层，先画（底层）；仅渲染在黑盘之外（~1像素 smoothstep 抗锯齿过渡），避免发光向内漏到黑洞上
    float goldR = effR * 1.04;
    float goldRing = exp(-pow(abs(dm - goldR) / max(lineW * 1.12, 1e-4), 2.0)) * annihilate * smoothstep(effR - px, effR, dm);
    col = mix(col, vec3(1.0, 0.78, 0.4), goldRing * active * 0.9);

    // 纯白细线：紧贴黑洞边缘（黑盘外侧），粗细约为金线 30%；同样用 ~1像素 smoothstep 抗锯齿裁剪在黑盘之外
    float whiteR = effR;
    float whiteW = lineW * 0.147;
    float whiteLine = smoothstep(whiteW, 0.0, abs(dm - whiteR)) * annihilate * smoothstep(effR - px, effR, dm);
    col = mix(col, vec3(1.0), whiteLine * active);

    // 黑核（事件视界）：保持黑边锐利
    col = mix(col, vec3(0.0), core * active);

    // 3px 白线：置于最上层（绘制顺序最后），紧贴黑盘外侧，~1像素 smoothstep 抗锯齿裁剪在黑盘之外
    float whiteR1 = effR * 1.012;
    float whiteLine1 = smoothstep(px * 1.5, 0.0, abs(dm - whiteR1)) * annihilate * smoothstep(effR - px, effR, dm);
    col = mix(col, vec3(1.0), whiteLine1 * active);

    // 细线外侧羽化：仅 dm>effR 一侧加软羽，同系金色，向外渐隐
    float feather = smoothstep(0.025 * annihilate, 0.0, dm - effR) * step(0.0, dm - effR);
    col += vec3(1.0, 0.78, 0.4) * feather * 0.3 * active;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.2, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

export default function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 0.15,
  repulsionRadius = 0.6,
  bhRadius = 0.048,
  bhGlowInner = 0.06,
  bhGlowHalo = 0.13,
  bhGlowStrength = 0.8,
  bhParticleStrength = 0.6,
  bhShakeStrength = 0.02,
  bhEnabled = true,
  annihilateCenterRef = null,
  seed = null,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  dissolving = false,
  onDissolved = null,
  ...rest
}) {
  const ctnDom = useRef(null);
  const dissolveRef = useRef(0);
  const dissolvingRef = useRef(false);
  const lastTimeRef = useRef(0);
  const dissolvedFiredRef = useRef(false);
  const targetMousePos = useRef({ x: 0.5, y: 0.5 });
  const targetMouseActive = useRef(0.0);
  const smoothMouseActive = useRef(0.0);
  const bhEnabledRef = useRef(bhEnabled);
  useEffect(() => { bhEnabledRef.current = bhEnabled; }, [bhEnabled]);

  // 星场随机种子：仅挂载时确定一次，刷新页面/重新挂载即换一套全新分布；
  // 传入固定 seed 可复现同一分布（用于截图/录屏对齐）。
  const seedRef = useRef(seed != null ? seed : Math.random());

  useEffect(() => {
    if (!ctnDom.current) return;
    const ctn = ctnDom.current;
    const renderer = new Renderer({
      alpha: transparent,
      premultipliedAlpha: false,
    });
    const gl = renderer.gl;

    if (transparent) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
    } else {
      gl.clearColor(0, 0, 0, 1);
    }

    let program;

    function resize() {
      const scale = 1;
      renderer.setSize(ctn.offsetWidth * scale, ctn.offsetHeight * scale);
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height
        );
      }
    }
    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([targetMousePos.current.x, targetMousePos.current.y]),
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uRepulsionRadius: { value: repulsionRadius },
        uBHRadius: { value: bhRadius },
        uBHGlowInner: { value: bhGlowInner },
        uBHGlowHalo: { value: bhGlowHalo },
        uBHGlowStrength: { value: bhGlowStrength },
        uBHParticleStrength: { value: bhParticleStrength },
        uBHShakeStrength: { value: bhShakeStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAnnihilateCenter: { value: new Float32Array([0.5, 0.5]) },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
        uDissolve: { value: 0 },
        uSeed: { value: new Float32Array([seedRef.current * 1000.0, seedRef.current * 618.0]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    let animateId;

    function update(t) {
      animateId = requestAnimationFrame(update);
      if (!disableAnimation) {
        program.uniforms.uTime.value = t * 0.001;
        program.uniforms.uStarSpeed.value = (t * 0.001 * starSpeed) / 10.0;
      }

      // 逐帧溶解：uDissolve 0→1 约 1.9s，星点按到中心距离从内向外逐颗消失
      const dt = lastTimeRef.current ? (t - lastTimeRef.current) / 1000 : 0;
      lastTimeRef.current = t;
      if (dissolvingRef.current && dissolveRef.current < 1) {
        dissolveRef.current = Math.min(1, dissolveRef.current + dt / 2.3);
        program.uniforms.uDissolve.value = dissolveRef.current;
        if (dissolveRef.current >= 1 && !dissolvedFiredRef.current) {
          dissolvedFiredRef.current = true;
          if (onDissolved) onDissolved();
        }
      }

      // 黑洞位置：即时跟随光标（无延迟），消除跟随拖尾/卡顿
      // 进入「问 AI」等区域时 bhEnabled=false，强制黑洞淡出（即使鼠标仍在移动）
      if (!bhEnabledRef.current) targetMouseActive.current = 0.0;
      program.uniforms.uMouse.value[0] = targetMousePos.current.x;
      program.uniforms.uMouse.value[1] = targetMousePos.current.y;

      // 堙灭/抖动参考中心：默认屏幕中心(0.5,0.5)；App 实时传入「问昕」按钮中心以对齐消除偏移
      if (annihilateCenterRef && annihilateCenterRef.current) {
        program.uniforms.uAnnihilateCenter.value[0] = annihilateCenterRef.current.x;
        program.uniforms.uAnnihilateCenter.value[1] = annihilateCenterRef.current.y;
      }

      // 渐隐因子：fps 无关的指数衰减，进入/离开时平滑淡入淡出
      const activeAlpha = 1.0 - Math.exp(-90.0 * dt);
      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * activeAlpha;
      program.uniforms.uMouseActiveFactor.value = smoothMouseActive.current;

      renderer.render({ scene: mesh });
    }
    animateId = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    function handleMouseMove(e) {
      const rect = ctn.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      targetMousePos.current = { x, y };
      targetMouseActive.current = bhEnabledRef.current ? 1.0 : 0.0;
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0;
    }

    if (mouseInteraction) {
      // 绑在 window 上：外层 wrapper 是 pointer-events-none，ctn 收不到事件；
      // 全局监听鼠标移动，既不影响「问AI」点击，又能驱动星空排斥/视差。
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      cancelAnimationFrame(animateId);
      window.removeEventListener('resize', resize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
      ctn.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    repulsionRadius,
    bhRadius,
    bhGlowHalo,
    bhGlowStrength,
    bhParticleStrength,
    bhShakeStrength,
    autoCenterRepulsion,
    transparent,
  ]);

  // 溶解触发：entered 变 true 时启动逐帧溶解，不重建 renderer
  useEffect(() => {
    dissolvingRef.current = dissolving;
  }, [dissolving]);

  return <div ref={ctnDom} className="galaxy-container" {...rest} />;
}
