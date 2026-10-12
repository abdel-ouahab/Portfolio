"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Kinetic Grid: a line grid drawn behind its children that bends away from
 * the pointer and ripples where you click.
 *
 * The canvas is scoped to this box rather than the viewport, so several grids
 * can share a page. The highlight colour is the `--accent` custom property in
 * scope (or `color`), and the base ink follows the inherited `color-scheme`,
 * so the grid matches the section and theme it sits in. It only keeps a
 * canvas while near the viewport, and only animates while something moves.
 */

interface Point {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Palette {
  ink: RGB;
  accent: RGB;
  line: number;
  node: number;
  dot: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CELL_SIZE = 55;
const INFLUENCE_RADIUS = 260;
const MAX_WARP = 24;
const DOT_SPACING = 28;
const LERP_SPEED = 0.08;
const NODE_BASE_RADIUS = 1.8;
const NODE_ACTIVE_RADIUS = 3.2;
const WAVE_WIDTH = 55;
const FALLBACK_ACCENT: RGB = { r: 74, g: 158, b: 255 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

function rgba(c: RGB, a: number) {
  return `rgba(${c.r},${c.g},${c.b},${a.toFixed(3)})`;
}

function mixColor(base: RGB, baseAlpha: number, active: RGB, activeAlpha: number, t: number) {
  return rgba(
    {
      r: Math.round(lerpN(base.r, active.r, t)),
      g: Math.round(lerpN(base.g, active.g, t)),
      b: Math.round(lerpN(base.b, active.b, t)),
    },
    lerpN(baseAlpha, activeAlpha, t),
  );
}

/** Any CSS colour the canvas understands, as RGB. */
function toRgb(ctx: CanvasRenderingContext2D, value: string): RGB | null {
  const color = value.trim();
  if (!color) return null;
  ctx.fillStyle = "#000";
  ctx.fillStyle = color;
  const out = String(ctx.fillStyle);
  if (out.startsWith("#")) {
    const n = parseInt(out.slice(1, 7), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const parts = out.match(/[\d.]+/g);
  return parts && parts.length >= 3 ? { r: +parts[0], g: +parts[1], b: +parts[2] } : null;
}

function readPalette(el: HTMLElement, ctx: CanvasRenderingContext2D, color?: string): Palette {
  const style = getComputedStyle(el);
  const dark = style.colorScheme.includes("dark");
  return {
    ink: dark ? { r: 255, g: 255, b: 255 } : { r: 20, g: 23, b: 28 },
    accent: toRgb(ctx, color ?? style.getPropertyValue("--accent")) ?? FALLBACK_ACCENT,
    line: dark ? 0.13 : 0.1,
    node: dark ? 0.2 : 0.17,
    dot: dark ? 0.05 : 0.08,
  };
}

/** Where a grid point is drawn, and how strongly it is lit, given the pointer and ripples. */
function warp(
  gx: number,
  gy: number,
  col: number,
  row: number,
  cols: number,
  rows: number,
  mouse: Point,
  presence: number,
  ripples: Ripple[],
): { x: number; y: number; proximity: number } {
  // Edge pin: smoothly locks the boundary rows and columns in place
  const edgeMargin = 1.5;
  const colPin = Math.min(col / edgeMargin, (cols - 1 - col) / edgeMargin, 1);
  const rowPin = Math.min(row / edgeMargin, (rows - 1 - row) / edgeMargin, 1);
  const pinFactor = colPin * colPin * rowPin * rowPin;

  const dx = gx - mouse.x;
  const dy = gy - mouse.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const proximity = Math.max(0, 1 - dist / INFLUENCE_RADIUS) * pinFactor * presence;

  let rx = 0;
  let ry = 0;
  for (const r of ripples) {
    const rdx = gx - r.x;
    const rdy = gy - r.y;
    const diff = Math.sqrt(rdx * rdx + rdy * rdy) - r.radius;
    if (Math.abs(diff) < WAVE_WIDTH) {
      const strength = (1 - Math.abs(diff) / WAVE_WIDTH) * r.opacity * 18 * pinFactor;
      const angle = Math.atan2(rdy, rdx);
      const sign = diff < 0 ? 1 : -1;
      rx += Math.cos(angle) * strength * sign;
      ry += Math.sin(angle) * strength * sign;
    }
  }

  // Cursor warp with a bell falloff
  if (presence > 0 && dist < INFLUENCE_RADIUS && dist > 0 && pinFactor > 0) {
    const t = dist / INFLUENCE_RADIUS;
    const eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
    const amount = eased * MAX_WARP * pinFactor * presence;
    const angle = Math.atan2(dy, dx);
    return { x: gx - Math.cos(angle) * amount + rx, y: gy - Math.sin(angle) * amount + ry, proximity };
  }

  return { x: gx + rx, y: gy + ry, proximity };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function KineticGrid({
  children,
  className,
  color,
}: {
  children?: ReactNode;
  className?: string;
  /** Highlight colour. Defaults to the `--accent` custom property in scope. */
  color?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!root || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let near = false;
    let presence = 0;
    let pointer: Point | null = null;
    const mouse: Point = { x: 0, y: 0 };
    const ripples: Ripple[] = [];
    let palette = readPalette(root, ctx, color);
    let dots: CanvasPattern | null = null;

    const makeDots = () => {
      const tile = document.createElement("canvas");
      tile.width = tile.height = Math.round(DOT_SPACING * dpr);
      const t = tile.getContext("2d");
      if (!t) return null;
      t.fillStyle = rgba(palette.ink, palette.dot);
      t.beginPath();
      t.arc(tile.width / 2, tile.height / 2, 0.7 * dpr, 0, Math.PI * 2);
      t.fill();
      const pattern = ctx.createPattern(tile, "repeat");
      pattern?.setTransform(new DOMMatrix().scaleSelf(1 / dpr));
      return pattern;
    };

    const draw = (now: number) => {
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (dots) {
        ctx.fillStyle = dots;
        ctx.fillRect(0, 0, w, h);
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = (now - r.born) / 1000;
        r.radius = Math.max(0, age * 400);
        r.opacity = Math.min(1, Math.max(0, 1 - age * 1.2));
        if (r.opacity <= 0) ripples.splice(i, 1);
      }

      // ── Warped grid ─────────────────────────────────────────────────────
      const cols = Math.max(2, Math.ceil(w / CELL_SIZE)) + 1;
      const rows = Math.max(2, Math.ceil(h / CELL_SIZE)) + 1;
      const cellW = w / (cols - 1);
      const cellH = h / (rows - 1);
      const xs = new Float32Array(cols * rows);
      const ys = new Float32Array(cols * rows);
      const ps = new Float32Array(cols * rows);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const p = warp(col * cellW, row * cellH, col, row, cols, rows, mouse, presence, ripples);
          const i = row * cols + col;
          xs[i] = p.x;
          ys[i] = p.y;
          ps[i] = p.proximity;
        }
      }

      // ── Lines: resting segments in one stroke, lit ones one by one ────────
      const lit: number[] = [];
      ctx.beginPath();
      const segment = (a: number, b: number) => {
        if (smoothstep((ps[a] + ps[b]) / 2) < 0.01) {
          ctx.moveTo(xs[a], ys[a]);
          ctx.lineTo(xs[b], ys[b]);
        } else lit.push(a, b);
      };
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols - 1; col++) segment(row * cols + col, row * cols + col + 1);
      for (let col = 0; col < cols; col++)
        for (let row = 0; row < rows - 1; row++) segment(row * cols + col, (row + 1) * cols + col);
      ctx.lineCap = "butt";
      ctx.strokeStyle = rgba(palette.ink, palette.line);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      for (let i = 0; i < lit.length; i += 2) {
        const a = lit[i];
        const b = lit[i + 1];
        const t = smoothstep((ps[a] + ps[b]) / 2);
        ctx.beginPath();
        ctx.moveTo(xs[a], ys[a]);
        ctx.lineTo(xs[b], ys[b]);
        ctx.strokeStyle = mixColor(palette.ink, palette.line, palette.accent, 0.9, t);
        ctx.lineWidth = lerpN(0.8, 1.5, t);
        ctx.stroke();
      }

      // ── Intersection nodes ────────────────────────────────────────────────
      const litNodes: number[] = [];
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        if (smoothstep(ps[i]) < 0.01) {
          ctx.moveTo(xs[i] + NODE_BASE_RADIUS, ys[i]);
          ctx.arc(xs[i], ys[i], NODE_BASE_RADIUS, 0, Math.PI * 2);
        } else litNodes.push(i);
      }
      ctx.fillStyle = rgba(palette.ink, palette.node);
      ctx.fill();

      const glow = palette.accent;
      for (const i of litNodes) {
        const t = smoothstep(ps[i]);
        const r = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);
        if (t > 0.3) {
          const glowR = r + lerpN(0, 6, (t - 0.3) / 0.7);
          const grd = ctx.createRadialGradient(xs[i], ys[i], r * 0.5, xs[i], ys[i], glowR);
          grd.addColorStop(0, rgba(glow, t * 0.3));
          grd.addColorStop(1, rgba(glow, 0));
          ctx.beginPath();
          ctx.arc(xs[i], ys[i], glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(xs[i], ys[i], r, 0, Math.PI * 2);
        ctx.fillStyle = mixColor(palette.ink, palette.node, palette.accent, 1, t);
        ctx.fill();
      }

      // ── Ripple rings ──────────────────────────────────────────────────────
      for (const r of ripples) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(palette.accent, r.opacity * 0.28);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    // ── Animation: runs only while the pointer, its glow or a ripple moves ──
    const frame = (now: number) => {
      raf = 0;
      if (!near) return;
      let target = 0;
      let moving = false;
      if (pointer) {
        const rect = canvas.getBoundingClientRect();
        const x = pointer.x - rect.left;
        const y = pointer.y - rect.top;
        if (x >= 0 && y >= 0 && x <= w && y <= h) {
          target = 1;
          // arriving from outside: start under the pointer instead of sweeping in
          if (presence < 0.01) {
            mouse.x = x;
            mouse.y = y;
          }
          mouse.x = lerpN(mouse.x, x, LERP_SPEED);
          mouse.y = lerpN(mouse.y, y, LERP_SPEED);
          moving = Math.abs(x - mouse.x) + Math.abs(y - mouse.y) > 0.2;
        }
      }
      presence = lerpN(presence, target, LERP_SPEED);
      if (Math.abs(presence - target) < 0.002) presence = target;
      draw(now);
      if (moving || presence !== target || ripples.length) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && near) raf = requestAnimationFrame(frame);
    };

    // ── Canvas: allocated near the viewport, released when far away ─────────
    const resize = () => {
      w = root.clientWidth;
      h = root.clientHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = near ? Math.round(w * dpr) : 0;
      canvas.height = near ? Math.round(h * dpr) : 0;
      dots = near ? makeDots() : null;
      if (near) draw(performance.now());
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        resize();
        kick();
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(root);

    const ro = new ResizeObserver(() => {
      if (near) resize();
    });
    ro.observe(root);

    // Theme switches change the inherited colour scheme and --accent.
    const mo = new MutationObserver(() => {
      palette = readPalette(root, ctx, color);
      if (!near) return;
      dots = makeDots();
      if (!raf) draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer = { x: e.clientX, y: e.clientY };
      kick();
    };
    const onPointerLeave = () => {
      pointer = null;
      kick();
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      ripples.push({ x, y, radius: 0, opacity: 1, born: performance.now() });
      kick();
    };

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", kick, { passive: true });
      window.addEventListener("click", onClick);
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("click", onClick);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, [color]);

  return (
    <div ref={rootRef} className={cn("relative isolate w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />
      <div className="relative">{children}</div>
    </div>
  );
}
