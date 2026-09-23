// Topographic contour lines drawn on a canvas: the brand's graphic motif.
import { useEffect, useRef } from 'react';

export type TopoCenter = { x: number; y: number; rings: number; spacing: number; seed: number };

type Props = {
  centers: TopoCenter[];
  color: string;
  lineWidth?: number;
  animate?: boolean;
  speed?: number;
  className?: string;
  /** Changing this value morphs the lines (used by the zone explorer). */
  phase?: number;
};

function draw(canvas: HTMLCanvasElement, centers: TopoCenter[], color: string, lw: number, t: number) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  const N = 150;
  for (const c of centers) {
    const cx = c.x * w, cy = c.y * h;
    const spacing = (c.spacing * Math.max(w, h)) / 1000;
    for (let k = 1; k <= c.rings; k++) {
      const r = k * spacing;
      ctx.globalAlpha = Math.max(0.22, 1 - k / (c.rings * 1.35));
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const th = (i / N) * Math.PI * 2;
        const rr = r * (1 + 0.13 * Math.sin(3 * th + c.seed + k * 0.22 + t) + 0.07 * Math.sin(5 * th - c.seed * 1.7 + k * 0.37 - t * 0.6) + 0.035 * Math.sin(9 * th + k * 0.5));
        const x = cx + rr * Math.cos(th) * 1.3;
        const y = cy + rr * Math.sin(th) * 0.82;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

export function Topo({ centers, color, lineWidth = 1, animate = false, speed = 1, className, phase = 0 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(phase);
  const target = useRef(phase);
  target.current = phase;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = 0, visible = true;
    const render = () => draw(canvas, centers, color, lineWidth, tRef.current);
    render();
    const ro = new ResizeObserver(render);
    ro.observe(canvas);
    const io = new IntersectionObserver(e => { visible = e[0]?.isIntersecting ?? true; });
    io.observe(canvas);
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || ts - last < 40) return;
      last = ts;
      const diff = target.current - tRef.current;
      if (animate && !reduce) tRef.current += 0.01 * speed;
      if (Math.abs(diff) > 0.001) tRef.current += reduce ? diff : diff * 0.08;
      else if (!animate) return;
      render();
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [centers, color, lineWidth, animate, speed]);

  return <canvas ref={ref} className={`topo ${className ?? ''}`} aria-hidden="true" />;
}
