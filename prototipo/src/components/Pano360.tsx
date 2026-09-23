// Lightweight 360° viewer: one WebGL fragment shader samples an equirectangular panorama.
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { useLang } from '../lib/i18n';
import { mediaUrl } from '../lib/media';
import { IconCube } from './Icons';

const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p; gl_Position = vec4(p, 0.0, 1.0); }`;
const FS = `precision highp float;
varying vec2 uv;
uniform sampler2D tex;
uniform float yaw; uniform float pitch; uniform float fov; uniform float aspect;
void main(){
  float t = tan(fov * 0.5);
  vec3 d = normalize(vec3(uv.x * t * aspect, uv.y * t, -1.0));
  float cp = cos(pitch), sp = sin(pitch);
  d = vec3(d.x, d.y * cp - d.z * sp, d.y * sp + d.z * cp);
  float cy = cos(yaw), sy = sin(yaw);
  d = vec3(d.x * cy + d.z * sy, d.y, -d.x * sy + d.z * cy);
  float lon = atan(d.x, -d.z);
  float lat = asin(clamp(d.y, -1.0, 1.0));
  gl_FragColor = texture2D(tex, vec2(lon / 6.2831853 + 0.5, 0.5 - lat / 3.1415927));
}`;

export type PanoRoom = { name: string; media: string; yaw?: number };

export function Pano360({ rooms }: { rooms: PanoRoom[] }) {
  const { tx } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [room, setRoom] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading');
  const [interacted, setInteracted] = useState(false);
  const view = useRef({ yaw: 0, pitch: 0, fov: 1.35, vy: 0, dragging: false, auto: true });
  const glRef = useRef<{ gl: WebGLRenderingContext; tex: WebGLTexture; u: Record<string, WebGLUniformLocation | null> } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
    if (!gl) { setStatus('unsupported'); return; }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture()!;
    const u = Object.fromEntries(['yaw', 'pitch', 'fov', 'aspect'].map(n => [n, gl.getUniformLocation(prog, n)]));
    glRef.current = { gl, tex, u };

    let raf = 0;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const v = view.current;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      }
      if (!v.dragging) { v.yaw += v.vy; v.vy *= 0.94; if (v.auto && !reduce) v.yaw += 0.0012; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(u.yaw, v.yaw); gl.uniform1f(u.pitch, v.pitch); gl.uniform1f(u.fov, v.fov); gl.uniform1f(u.aspect, w / Math.max(h, 1));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const g = glRef.current;
    if (!g) return;
    setStatus('loading');
    const img = new Image();
    img.onload = () => {
      const { gl, tex } = g;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      view.current.yaw = rooms[room].yaw ?? 0;
      view.current.pitch = 0;
      setStatus('ready');
    };
    img.src = mediaUrl(rooms[room].media);
  }, [room, rooms]);

  const onDown = (e: RPointerEvent) => {
    const v = view.current;
    v.dragging = true; v.auto = false; setInteracted(true);
    (e.target as Element).setPointerCapture(e.pointerId);
    let lx = e.clientX, ly = e.clientY;
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - lx, dy = ev.clientY - ly; lx = ev.clientX; ly = ev.clientY;
      const k = v.fov / (canvasRef.current?.clientHeight || 500);
      v.yaw -= dx * k; v.vy = -dx * k;
      v.pitch = Math.max(-1.3, Math.min(1.3, v.pitch + dy * k));
    };
    const up = () => { v.dragging = false; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const zoom = (d: number) => { const v = view.current; v.fov = Math.max(0.6, Math.min(1.7, v.fov + d)); v.auto = false; };
  const onKey = (e: KeyboardEvent) => {
    const v = view.current;
    const step = 0.12;
    if (e.key === 'ArrowLeft') { v.yaw += step; v.auto = false; }
    else if (e.key === 'ArrowRight') { v.yaw -= step; v.auto = false; }
    else if (e.key === 'ArrowUp') v.pitch = Math.max(-1.3, v.pitch - step);
    else if (e.key === 'ArrowDown') v.pitch = Math.min(1.3, v.pitch + step);
    else if (e.key === '+' || e.key === '=') zoom(-0.1);
    else if (e.key === '-') zoom(0.1);
    else return;
    e.preventDefault();
  };

  return (
    <div className="pano">
      <div className="pano-stage" data-cursor={tx('Drag', 'Arrastre')}>
        <canvas
          ref={canvasRef}
          className="pano-canvas"
          onPointerDown={onDown}
          onKeyDown={onKey}
          tabIndex={0}
          role="img"
          aria-label={tx(
            `360° view: ${rooms[room].name}. Drag or use the arrow keys to look around.`,
            `Vista 360°: ${rooms[room].name}. Arrastre o use las flechas del teclado para mirar alrededor.`,
          )}
        />
        {status === 'loading' && <div className="pano-status">{tx('Loading 360° view…', 'Cargando vista 360°…')}</div>}
        {status === 'unsupported' && <div className="pano-status">{tx('This browser can’t show the 360° tour.', 'Este navegador no puede mostrar el recorrido 360°.')}</div>}
        {!interacted && status === 'ready' && <div className="pano-hint"><IconCube size={18} /> {tx('Drag to look around', 'Arrastre para mirar alrededor')}</div>}
        <div className="pano-zoom">
          <button type="button" onClick={() => zoom(-0.15)} aria-label={tx('Zoom in', 'Acercar')}>+</button>
          <button type="button" onClick={() => zoom(0.15)} aria-label={tx('Zoom out', 'Alejar')}>−</button>
        </div>
      </div>
      <div className="pano-rooms" role="group" aria-label={tx('Rooms', 'Espacios')}>
        {rooms.map((r, i) => (
          <button key={r.name} type="button" aria-pressed={room === i} onClick={() => setRoom(i)}>{r.name}</button>
        ))}
      </div>
    </div>
  );
}
