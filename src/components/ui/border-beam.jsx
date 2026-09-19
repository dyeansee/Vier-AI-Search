// ============================================================
// BorderBeam — 流光边框（magicui border-beam 的 re-export）
// 保持 ui/ 组件惯例：第三方组件统一在 components/ui 下再导出。
// 常用 props：
//   size: 'sm' | 'md'(默认) | 'line' | 'pulse-outside' | 'pulse-inner'
//   colorVariant: 'colorful'(默认) | 'mono' | 'ocean' | 'sunset'
//   theme: 'dark'(默认) | 'light' | 'auto'
//   active: 是否激活动画（默认 true）
//   borderRadius: 显式圆角（不传则自动检测首个子元素圆角）
// ============================================================
import { BorderBeam } from 'border-beam';

export { BorderBeam };
export default BorderBeam;
