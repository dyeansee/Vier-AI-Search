import { flushSync } from 'react-dom';

/**
 * 主题切换的「圆形波前」过渡。
 *
 * - `to-light`（黑 → 白）：新主题从中心点向外扩散至全局
 * - `to-dark` （白 → 黑）：旧主题从边缘收缩到中心点，露出新主题
 *
 * 首选 View Transitions API：浏览器会截取切换前后的两张整页快照，
 * 用 clip-path 圆形波前揭示新快照 —— 波前扫过之处，背景与**文字颜色**
 * 一起整块切换（而非半透明混合），这是纯 CSS 覆盖层做不到的。
 *
 * 不支持该 API 时退化为纯色圆形遮罩，保留同样的方向语义。
 */

/** 波前动画时长（ms）—— 需与 index.css 的 --theme-transition-duration 保持一致 */
export const THEME_TRANSITION_MS = 780;

const THEME_EVENT = 'gravlens:theme';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function supportsViewTransitions() {
  return typeof document !== 'undefined' && typeof document.startViewTransition === 'function';
}

/** 广播主题方向，供 App 等组件同步（如白天模式下隐藏星空） */
function announce(direction) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { direction } }));
}

/** 订阅主题方向变化，返回取消订阅函数 */
export function onThemeChange(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => handler(e.detail?.direction);
  window.addEventListener(THEME_EVENT, listener);
  return () => window.removeEventListener(THEME_EVENT, listener);
}

/**
 * 降级方案：纯色圆形遮罩（无 View Transitions 时，如 Firefox）。
 * 遮罩本身无法让文字跟着变色，但完整保留了「中心扩散 / 边缘收缩」的方向语义。
 */
function fallbackCircularTransition(direction, update) {
  const overlay = document.createElement('div');
  const maxR = Math.hypot(window.innerWidth, window.innerHeight) * 0.75;
  overlay.setAttribute('aria-hidden', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
    background: '#f5f5f7',
    willChange: 'clip-path',
  });

  const timing = {
    duration: THEME_TRANSITION_MS,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
  };
  const full = `circle(${maxR}px at 50% 50%)`;
  const zero = 'circle(0px at 50% 50%)';

  if (direction === 'to-light') {
    // 白色从中心扩散铺满 → 铺满瞬间切主题 → 撤掉遮罩（页面已变白，无缝衔接）
    overlay.style.clipPath = zero;
    document.body.appendChild(overlay);
    overlay
      .animate([{ clipPath: zero }, { clipPath: full }], timing)
      .finished.then(() => {
        update();
        overlay.remove();
      })
      .catch(() => overlay.remove());
  } else {
    // 先切主题（页面转黑）→ 白色遮罩从边缘收缩到中心 → 露出黑色页面
    update();
    overlay.style.clipPath = full;
    document.body.appendChild(overlay);
    overlay
      .animate([{ clipPath: full }, { clipPath: zero }], timing)
      .finished.then(() => overlay.remove())
      .catch(() => overlay.remove());
  }
}

/**
 * 执行主题切换过渡。
 *
 * @param {'to-light' | 'to-dark'} direction 波前方向
 * @param {() => void} update 同步 DOM 更新（内部用 flushSync 强制 React 同步提交）
 */
export function runThemeTransition(direction, update) {
  if (typeof document === 'undefined') {
    update();
    return;
  }

  const canAnimate = !prefersReducedMotion();

  if (!supportsViewTransitions() || !canAnimate) {
    if (canAnimate && typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function') {
      fallbackCircularTransition(direction, update);
    } else {
      update();
    }
    announce(direction);
    return;
  }

  const root = document.documentElement;
  root.dataset.themeTransition = direction;

  const cleanup = () => {
    if (root.dataset.themeTransition === direction) delete root.dataset.themeTransition;
  };

  let transition;
  try {
    transition = document.startViewTransition(() => {
      // 必须同步提交：回调返回后浏览器立刻截 new 快照，
      // React 的异步 setState 若未落地，截到的仍是旧主题。
      flushSync(() => {
        update();
      });
    });
  } catch (err) {
    cleanup();
    update();
    announce(direction);
    return;
  }

  announce(direction);
  transition.ready.catch(cleanup);
  transition.finished.then(cleanup).catch(cleanup);
}
