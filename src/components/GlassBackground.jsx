import { useEffect, useRef } from 'react';

/**
 * GlassBackground — Pure dark background: dot grid overlay + central vignette.
 * （3 个彩色 orbs 已移除）
 */
export default function GlassBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // 清空一次确保视口变化时不留残影
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // 仅维持 RAF 心跳（保持与未来扩展兼容），不再绘制任何彩色内容
    function tick() {
      if (!reducedMotion) raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      />
      <div
        className="glass-vignette fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}