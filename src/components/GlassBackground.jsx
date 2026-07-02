import { useEffect, useRef } from 'react';

/**
 * GlassBackground — Dynamic dark background with subtle gradient orbs,
 * dot grid overlay, and soft radial glows. Pure black theme.
 */
export default function GlassBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const orbs = [
      { x: 0.2, y: 0.3, r: 0.35, color: [99, 102, 241], speed: 0.0003, phase: 0 },
      { x: 0.75, y: 0.6, r: 0.3, color: [20, 184, 166], speed: 0.00025, phase: 2 },
      { x: 0.5, y: 0.8, r: 0.25, color: [251, 191, 36], speed: 0.0002, phase: 4 },
    ];

    function draw() {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        const cx = (orb.x + Math.sin(t * orb.speed + orb.phase) * 0.08) * canvas.width;
        const cy = (orb.y + Math.cos(t * orb.speed * 0.7 + orb.phase) * 0.06) * canvas.height;
        const radius = orb.r * Math.min(canvas.width, canvas.height);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${orb.color.join(',')}, 0.05)`);
        grad.addColorStop(0.5, `rgba(${orb.color.join(',')}, 0.02)`);
        grad.addColorStop(1, `rgba(${orb.color.join(',')}, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      raf = requestAnimationFrame(draw);
    }

    draw();

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
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
        aria-hidden="true"
      />
    </>
  );
}
