// Adapted from React Bits TechText: https://reactbits.dev

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

const LABEL_FONT = "10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const FALLOFF_STEPS = 8;
const SPRING = 320;
const DAMPING = 22;
// Room around the text for the selection frame, its labels and specks
const BLEED = 48;

type RGB = [number, number, number];

export interface TechTextProps {
  /** The text to render. Wrapping, size and font come from the element's CSS. */
  text: string;
  /** Letters and their outlines. Any hex/rgb colour or a var(--token). */
  color?: string;
  /** Selection frame, connector and labels. Any hex/rgb colour or a var(--token). */
  accentColor?: string;
  /** Area fades letters into outlines around the pointer; letter outlines only the active letter. */
  reveal?: "area" | "letter" | "off";
  /** Radius of the area reveal, in px. */
  reach?: number;
  /** How gradually the fill hands over to the outlines. 0 is a hard edge. */
  softness?: number;
  dashLength?: number;
  dashGap?: number;
  lineStyle?: "dashed" | "solid";
  strokeWidth?: number;
  /** Blinking squares around the active letter. 0 turns them off. */
  specks?: number;
  /** Frame the letter under the pointer. */
  selection?: boolean;
  /** Label the frame with the letter and its size, or its offset while dragged. */
  labels?: boolean;
  /** Let letters be dragged; they spring back home on release. */
  draggable?: boolean;
  /** Sweep the reveal across the lines while the pointer is away. */
  sweep?: boolean;
  /** Random hops between letters, or an ordered pass along each line. */
  sweepPattern?: "random" | "lines";
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

type Settings = Required<Omit<TechTextProps, "className" | "style">>;

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Sprite {
  image: HTMLCanvasElement;
  left: number;
  top: number;
}

interface Glyph {
  char: string;
  x: number;
  baseline: number;
  box: Box;
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
  outline: number;
  fill: Sprite;
  dashes: Sprite;
}

const approach = (current: number, target: number, dt: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds));

const parseColor = (value: string): RGB => {
  const v = value.trim();
  if (v.startsWith("#")) {
    let h = v.slice(1);
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    const n = parseInt(h.slice(0, 6), 16);
    if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const parts = v.startsWith("rgb") ? v.match(/[\d.]+/g) : null;
  if (parts && parts.length >= 3) return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
  return [255, 255, 255];
};

const rgba = ([r, g, b]: RGB, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const noise = (...values: number[]) => {
  let h = 2166136261;
  for (const value of values) {
    h = Math.imul(h ^ (value | 0), 16777619);
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
  }
  return (h >>> 0) / 4294967296;
};

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : "0");

export default function TechText({
  text,
  color = "var(--foreground)",
  accentColor = "var(--accent)",
  reveal = "letter",
  reach = 200,
  softness = 0.7,
  dashLength = 4,
  dashGap = 2,
  lineStyle = "dashed",
  strokeWidth = 1.5,
  specks = 15,
  selection = true,
  labels = true,
  draggable = true,
  sweep = true,
  sweepPattern = "random",
  speed = 1,
  className,
  style,
}: TechTextProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<Settings | null>(null);
  const invalidateRef = useRef(() => {});
  // The DOM text stays visible until the canvas can draw it with the real font
  const [ready, setReady] = useState(false);

  useEffect(() => {
    settingsRef.current = {
      text,
      color,
      accentColor,
      reveal,
      reach,
      softness,
      dashLength,
      dashGap,
      lineStyle,
      strokeWidth,
      specks,
      selection,
      labels,
      draggable,
      sweep,
      sweepPattern,
      speed,
    };
    invalidateRef.current();
  });

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const scratch = document.createElement("canvas");
    const scratchCtx = scratch.getContext("2d");
    if (!container || !textEl || !canvas || !ctx || !scratchCtx) return;

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let dpr = 1;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let alive = true;
    let fontsReady = false;
    let dirty = true;
    let font = "";
    let ink = "#ffffff";
    let accent: RGB = [255, 255, 255];
    let glyphs: Glyph[] = [];
    let lines: Box[] = [];
    let presence = 0;
    let clock = 0;
    let hopTarget = -1;
    let hopTimer = 0;
    let pulse = 0;
    let placed = false;
    let dragging = -1;
    const pointer = { x: 0, y: 0, inside: false };
    const grab = { x: 0, y: 0 };
    const lens = { x: 0, y: 0 };
    const frame = { x1: 0, y1: 0, x2: 0, y2: 0, alpha: 0, index: -1 };

    const resolveColor = (value: string, styles: CSSStyleDeclaration) => {
      const token = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
      return token ? styles.getPropertyValue(token[1]).trim() || "#ffffff" : value;
    };

    const sprite = (s: Settings, glyph: Pick<Glyph, "char" | "x" | "baseline" | "box">, stroke: boolean): Sprite => {
      const pad = Math.ceil(s.strokeWidth * 2 + 4);
      const left = glyph.box.x1 - pad;
      const top = glyph.box.y1 - pad;
      const image = document.createElement("canvas");
      image.width = Math.max(1, Math.ceil((glyph.box.x2 - glyph.box.x1 + pad * 2) * dpr));
      image.height = Math.max(1, Math.ceil((glyph.box.y2 - glyph.box.y1 + pad * 2) * dpr));
      const c = image.getContext("2d");
      if (!c) return { image, left, top };
      c.setTransform(dpr, 0, 0, dpr, -left * dpr, -top * dpr);
      c.font = font;
      c.textAlign = "left";
      c.textBaseline = "alphabetic";
      if (stroke) {
        c.lineJoin = "round";
        c.lineWidth = s.strokeWidth * 2;
        c.lineCap = "butt";
        c.strokeStyle = ink;
        if (s.lineStyle !== "solid") c.setLineDash([Math.max(1, s.dashLength), Math.max(1, s.dashGap)]);
        c.strokeText(glyph.char, glyph.x, glyph.baseline);
        c.setLineDash([]);
        // Keep only the outer half of the stroke so the outline traces the silhouette
        c.globalCompositeOperation = "destination-out";
        c.fillStyle = "#000000";
        c.fillText(glyph.char, glyph.x, glyph.baseline);
        c.globalCompositeOperation = "source-over";
      } else {
        c.fillStyle = ink;
        c.fillText(glyph.char, glyph.x, glyph.baseline);
      }
      return { image, left, top };
    };

    // Glyph positions are read from the browser's own layout of the text
    const layout = (s: Settings) => {
      if (!dirty) return;
      dirty = false;
      const styles = getComputedStyle(container);
      font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
      ink = resolveColor(s.color, styles);
      accent = parseColor(resolveColor(s.accentColor, styles));
      scratchCtx.font = font;
      const metrics = scratchCtx.measureText("Hg");
      const origin = container.getBoundingClientRect();
      const ox = origin.left - BLEED;
      const oy = origin.top - BLEED;

      const node = textEl.firstChild;
      const previous = glyphs;
      glyphs = [];
      lines = [];
      if (!(node instanceof Text)) return;
      const range = document.createRange();
      let index = 0;
      let lineTop = NaN;
      for (const char of Array.from(node.data)) {
        const start = index;
        index += char.length;
        if (!char.trim()) continue;
        range.setStart(node, start);
        range.setEnd(node, index);
        const rect = range.getClientRects()[0];
        if (!rect) continue;
        const ascent = metrics.fontBoundingBoxAscent ?? rect.height * 0.8;
        const x = rect.left - ox;
        const baseline = rect.top - oy + ascent;
        const own = scratchCtx.measureText(char);
        const box = {
          x1: x - own.actualBoundingBoxLeft,
          y1: baseline - own.actualBoundingBoxAscent,
          x2: x + own.actualBoundingBoxRight,
          y2: baseline + own.actualBoundingBoxDescent,
        };
        if (lines.length === 0 || Math.abs(rect.top - lineTop) > 1) {
          lineTop = rect.top;
          lines.push({ ...box });
        } else {
          const line = lines[lines.length - 1];
          line.x1 = Math.min(line.x1, box.x1);
          line.y1 = Math.min(line.y1, box.y1);
          line.x2 = Math.max(line.x2, box.x2);
          line.y2 = Math.max(line.y2, box.y2);
        }
        const base = { char, x, baseline, box };
        const kept = previous[glyphs.length];
        glyphs.push({
          ...base,
          offset: kept?.char === char ? kept.offset : { x: 0, y: 0 },
          velocity: { x: 0, y: 0 },
          outline: 0,
          fill: sprite(s, base, false),
          dashes: sprite(s, base, true),
        });
      }
      range.detach();
      dragging = -1;
      frame.index = -1;
    };

    const glyphAt = (x: number, y: number) => {
      let best = -1;
      let bestDistance = Infinity;
      glyphs.forEach((glyph, i) => {
        const x1 = glyph.box.x1 + glyph.offset.x;
        const x2 = glyph.box.x2 + glyph.offset.x;
        const y1 = glyph.box.y1 + glyph.offset.y;
        const y2 = glyph.box.y2 + glyph.offset.y;
        const dx = x < x1 ? x1 - x : x > x2 ? x - x2 : 0;
        const dy = y < y1 ? y1 - y : y > y2 ? y - y2 : 0;
        const d = Math.hypot(dx, dy);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      return bestDistance < 28 ? best : -1;
    };

    const falloff = (
      target: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      radius: number,
      strength: number,
      soft: number
    ) => {
      const inner = Math.min(1, Math.max(0, 1 - soft));
      const gradient = target.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, `rgba(0, 0, 0, ${strength})`);
      if (inner > 0.995) {
        gradient.addColorStop(0.995, `rgba(0, 0, 0, ${strength})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        return gradient;
      }
      for (let i = 0; i <= FALLOFF_STEPS; i++) {
        const t = i / FALLOFF_STEPS;
        const eased = t * t * (3 - 2 * t);
        gradient.addColorStop(inner + (1 - inner) * t, `rgba(0, 0, 0, ${strength * (1 - eased)})`);
      }
      return gradient;
    };

    const blit = (
      target: CanvasRenderingContext2D,
      art: Sprite,
      dx: number,
      dy: number,
      originX: number,
      originY: number
    ) => {
      target.drawImage(
        art.image,
        Math.round((art.left + dx) * dpr - originX),
        Math.round((art.top + dy) * dpr - originY)
      );
    };

    const drawReveal = (s: Settings) => {
      const radius = s.reach * dpr;
      const cx = lens.x * dpr;
      const cy = lens.y * dpr;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = falloff(ctx, cx, cy, radius, presence, s.softness);
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      ctx.globalCompositeOperation = "source-over";

      const x0 = Math.max(0, Math.floor(cx - radius));
      const y0 = Math.max(0, Math.floor(cy - radius));
      const x1 = Math.min(canvas.width, Math.ceil(cx + radius));
      const y1 = Math.min(canvas.height, Math.ceil(cy + radius));
      if (x1 <= x0 || y1 <= y0) return;
      const w = x1 - x0;
      const h = y1 - y0;
      if (scratch.width < w || scratch.height < h) {
        scratch.width = Math.max(scratch.width, w);
        scratch.height = Math.max(scratch.height, h);
      }
      scratchCtx.setTransform(1, 0, 0, 1, 0, 0);
      scratchCtx.globalCompositeOperation = "source-over";
      scratchCtx.clearRect(0, 0, w, h);
      for (const glyph of glyphs) blit(scratchCtx, glyph.dashes, glyph.offset.x, glyph.offset.y, x0, y0);
      scratchCtx.globalCompositeOperation = "destination-in";
      scratchCtx.fillStyle = falloff(scratchCtx, cx - x0, cy - y0, radius, 1, s.softness);
      scratchCtx.fillRect(0, 0, w, h);
      scratchCtx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = presence;
      ctx.drawImage(scratch, 0, 0, w, h, x0, y0, w, h);
      ctx.globalAlpha = 1;
    };

    const crisp = (value: number) => (Math.round(value * dpr) + 0.5) / dpr;

    const perimeterPoint = (distance: number, w: number, h: number): [number, number, number, number] => {
      let d = ((distance % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
      if (d < w) return [frame.x1 + d, frame.y1, 0, -1];
      d -= w;
      if (d < h) return [frame.x2, frame.y1 + d, 1, 0];
      d -= h;
      if (d < w) return [frame.x2 - d, frame.y2, 0, 1];
      d -= w;
      return [frame.x1, frame.y2 - d, -1, 0];
    };

    const drawSpecks = (s: Settings, a: number) => {
      const w = frame.x2 - frame.x1;
      const h = frame.y2 - frame.y1;
      if (w < 2 || h < 2) return;
      const perimeter = 2 * (w + h);
      const seed = frame.index + 1;
      const grid = 3;

      for (let k = 0; k < s.specks; k++) {
        const period = 0.5 + noise(seed, k, 11) * 1.2;
        const t = pulse / period + noise(seed, k, 17);
        const cycle = Math.floor(t);
        const life = t - cycle;
        if (life > 0.7) continue;
        const [px, py, nx, ny] = perimeterPoint(noise(seed, k, cycle) * perimeter, w, h);
        const pick = noise(seed, k, cycle, 2);
        const size = pick < 0.46 ? 2 : pick < 0.7 ? 3 : pick < 0.84 ? 5 : pick < 0.94 ? 8 : 11;
        const large = size >= 8;
        const out = (large ? 9 : 4) + Math.floor(noise(seed, k, cycle, 1) * 5) * grid;
        const x = frame.x1 + Math.round((px + nx * out - frame.x1) / grid) * grid;
        const y = frame.y1 + Math.round((py + ny * out - frame.y1) / grid) * grid;
        const tone = noise(seed, k, cycle, 3);
        const blink = life < 0.06 || (life > 0.32 && life < 0.36) ? 0.35 : 1;
        const alpha = a * (large ? 0.3 + 0.4 * tone : 0.3 + 0.6 * tone) * blink;
        const left = Math.round(x - size / 2);
        const top = Math.round(y - size / 2);
        if (tone < 0.26 || (large && tone < 0.78)) {
          ctx.strokeStyle = rgba(accent, alpha);
          ctx.strokeRect(left + 0.5, top + 0.5, size, size);
          if (large && tone > 0.5) {
            ctx.fillStyle = rgba(accent, alpha);
            ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
          }
        } else {
          ctx.fillStyle = rgba(accent, alpha);
          ctx.fillRect(left, top, size, size);
        }
      }

      for (let j = 0; j < 2; j++) {
        const head = (pulse * 0.42 * s.speed + j * 0.5) * perimeter;
        for (let i = 0; i < 4; i++) {
          const [x, y] = perimeterPoint(head - i * 6, w, h);
          const size = i === 0 ? 3 : 2;
          ctx.fillStyle = rgba(accent, a * [0.95, 0.55, 0.32, 0.16][i]);
          ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
        }
      }
    };

    const drawFrame = (s: Settings) => {
      const glyph = glyphs[frame.index];
      if (!glyph || frame.alpha < 0.01) return;
      const a = frame.alpha;
      const x1 = crisp(frame.x1);
      const y1 = crisp(frame.y1);
      const x2 = crisp(frame.x2);
      const y2 = crisp(frame.y2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
      if (moved > 1) {
        const hx = (glyph.box.x1 + glyph.box.x2) / 2;
        const hy = (glyph.box.y1 + glyph.box.y2) / 2;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx + glyph.offset.x, hy + glyph.offset.y);
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = rgba(accent, 0.45 * a);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.rect(Math.round(hx) - 2, Math.round(hy) - 2, 4, 4);
        ctx.fillStyle = rgba(accent, 0.7 * a);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.rect(x1, y1, x2 - x1, y2 - y1);
      ctx.lineWidth = 1;
      ctx.strokeStyle = rgba(accent, 0.5 * a);
      ctx.stroke();

      ctx.beginPath();
      for (const [cx, cy] of [
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
      ]) {
        ctx.rect(Math.round(cx) - 2, Math.round(cy) - 2, 5, 5);
      }
      ctx.fillStyle = rgba(accent, 0.95 * a);
      ctx.fill();

      if (s.specks > 0) {
        ctx.lineWidth = 1;
        drawSpecks(s, a);
      }

      if (!s.labels) return;
      ctx.font = LABEL_FONT;
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = rgba(accent, 0.62 * a);
      const label =
        moved > 1
          ? `${signed(Math.round(glyph.offset.x))}, ${signed(Math.round(-glyph.offset.y))}`
          : `${glyph.char}  ${Math.round(glyph.box.x2 - glyph.box.x1)} × ${Math.round(glyph.box.y2 - glyph.box.y1)}`;
      ctx.fillText(label, Math.round(frame.x1), Math.round(frame.y1) - 7);
    };

    const tick = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s || !fontsReady) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      layout(s);

      const sweeping = s.sweep && !reducedMotion && !pointer.inside && dragging < 0 && lines.length > 0;
      if (sweeping) clock += dt * s.speed;
      pulse += dt;
      let targetX = pointer.x;
      let targetY = pointer.y;
      if (sweeping && s.sweepPattern === "random") {
        // Hop to a different random letter, linger, then hop again
        hopTimer -= dt * s.speed;
        if (hopTimer <= 0 || !glyphs[hopTarget]) {
          let next = Math.floor(Math.random() * glyphs.length);
          if (glyphs.length > 1 && next === hopTarget) next = (next + 1) % glyphs.length;
          hopTarget = next;
          hopTimer = 0.7 + Math.random() * 0.9;
        }
        const glyph = glyphs[hopTarget];
        targetX = (glyph.box.x1 + glyph.box.x2) / 2;
        targetY = (glyph.box.y1 + glyph.box.y2) / 2;
      } else if (sweeping) {
        // Snake through the lines: left to right on one, right to left on the next
        const phase = clock * 0.45;
        const line = lines[Math.floor(phase / Math.PI) % lines.length];
        targetX = line.x1 + (line.x2 - line.x1) * (0.5 - 0.5 * Math.cos(phase));
        targetY = line.y1 + (line.y2 - line.y1) * (0.45 + 0.1 * Math.sin(clock * 0.8));
      }
      const active = pointer.inside || sweeping || dragging >= 0;
      if (active && !placed) {
        lens.x = targetX;
        lens.y = targetY;
      }
      if (active) {
        const lag = pointer.inside ? 0.05 : 0.22;
        lens.x = approach(lens.x, targetX, dt, lag);
        lens.y = approach(lens.y, targetY, dt, lag);
      }
      placed = active;
      presence = approach(presence, s.reveal === "area" && active && dragging < 0 ? 1 : 0, dt, 0.16);

      let moving = false;
      glyphs.forEach((glyph, i) => {
        if (i === dragging) {
          glyph.offset.x = approach(glyph.offset.x, pointer.x - grab.x, dt, 0.03);
          glyph.offset.y = approach(glyph.offset.y, pointer.y - grab.y, dt, 0.03);
          glyph.velocity.x = 0;
          glyph.velocity.y = 0;
          moving = true;
          return;
        }
        const { offset, velocity } = glyph;
        if (Math.abs(offset.x) < 0.05 && Math.abs(offset.y) < 0.05 && Math.hypot(velocity.x, velocity.y) < 0.5) {
          offset.x = 0;
          offset.y = 0;
          velocity.x = 0;
          velocity.y = 0;
          return;
        }
        velocity.x += (-SPRING * offset.x - DAMPING * velocity.x) * dt;
        velocity.y += (-SPRING * offset.y - DAMPING * velocity.y) * dt;
        offset.x += velocity.x * dt;
        offset.y += velocity.y * dt;
        moving = true;
      });

      const focus = dragging >= 0 ? dragging : active ? glyphAt(lens.x, lens.y) : -1;
      if (focus >= 0 && s.selection) {
        const glyph = glyphs[focus];
        const bx1 = glyph.box.x1 + glyph.offset.x - 6;
        const by1 = glyph.box.y1 + glyph.offset.y - 6;
        const bx2 = glyph.box.x2 + glyph.offset.x + 6;
        const by2 = glyph.box.y2 + glyph.offset.y + 6;
        if (frame.index < 0 || frame.alpha < 0.02) {
          frame.x1 = bx1;
          frame.y1 = by1;
          frame.x2 = bx2;
          frame.y2 = by2;
        }
        const glide = focus === dragging ? 0.02 : 0.08;
        frame.x1 = approach(frame.x1, bx1, dt, glide);
        frame.y1 = approach(frame.y1, by1, dt, glide);
        frame.x2 = approach(frame.x2, bx2, dt, glide);
        frame.y2 = approach(frame.y2, by2, dt, glide);
        frame.index = focus;
      }
      frame.alpha = approach(frame.alpha, focus >= 0 && s.selection ? 1 : 0, dt, 0.1);

      glyphs.forEach((glyph, i) => {
        const target = s.reveal === "letter" && i === focus && i !== dragging ? 1 : 0;
        glyph.outline = approach(glyph.outline, target, dt, 0.09);
        if (Math.abs(glyph.outline - target) > 0.002) moving = true;
        else glyph.outline = target;
      });

      if (s.draggable) container.style.cursor = dragging >= 0 ? "grabbing" : focus >= 0 && pointer.inside ? "grab" : "";

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Ghost outline left at home while a letter is pulled away
      for (const glyph of glyphs) {
        const moved = Math.hypot(glyph.offset.x, glyph.offset.y);
        if (moved > 1) {
          ctx.globalAlpha = Math.min(1, moved / 24) * 0.55;
          blit(ctx, glyph.dashes, 0, 0, 0, 0);
          ctx.globalAlpha = 1;
        }
      }
      for (const glyph of glyphs) {
        if (glyph.outline < 0.999) {
          ctx.globalAlpha = 1 - glyph.outline;
          blit(ctx, glyph.fill, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        if (glyph.outline > 0.001) {
          ctx.globalAlpha = glyph.outline;
          blit(ctx, glyph.dashes, glyph.offset.x, glyph.offset.y, 0, 0);
        }
        ctx.globalAlpha = 1;
      }
      if (presence > 0.001) drawReveal(s);
      drawFrame(s);

      const settling =
        moving ||
        Math.abs(presence - (s.reveal === "area" && active && dragging < 0 ? 1 : 0)) > 0.002 ||
        (frame.alpha > 0.01 && frame.alpha < 0.99);
      if ((active || settling) && visible && alive) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const invalidate = () => {
      dirty = true;
      wake();
    };
    invalidateRef.current = invalidate;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round((rect.width + BLEED * 2) * dpr);
      canvas.height = Math.round((rect.height + BLEED * 2) * dpr);
      invalidate();
    };

    const locate = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left + BLEED;
      pointer.y = e.clientY - rect.top + BLEED;
    };
    const onMove = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      if (dragging >= 0) return;
      pointer.inside = false;
      wake();
    };
    const onDown = (e: PointerEvent) => {
      locate(e);
      pointer.inside = true;
      if (settingsRef.current?.draggable && (e.pointerType !== "mouse" || e.button === 0)) {
        const index = glyphAt(pointer.x, pointer.y);
        if (index >= 0) {
          dragging = index;
          grab.x = pointer.x - glyphs[index].offset.x;
          grab.y = pointer.y - glyphs[index].offset.y;
          container.setPointerCapture?.(e.pointerId);
        }
      }
      wake();
    };
    const onUp = (e: PointerEvent) => {
      if (dragging >= 0) {
        dragging = -1;
        container.releasePointerCapture?.(e.pointerId);
        const rect = container.getBoundingClientRect();
        pointer.inside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      }
      wake();
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerenter", onMove, { passive: true });
    container.addEventListener("pointerdown", onDown, { passive: true });
    container.addEventListener("pointerup", onUp, { passive: true });
    container.addEventListener("pointercancel", onUp, { passive: true });
    container.addEventListener("pointerleave", onLeave, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      wake();
    });
    intersectionObserver.observe(container);

    // Follow light/dark switches on the page
    const themeObserver = new MutationObserver(invalidate);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    const onFontsReady = () => {
      if (!alive) return;
      fontsReady = true;
      setReady(true);
      invalidate();
    };
    if (document.fonts) {
      document.fonts.ready.then(onFontsReady, onFontsReady);
      document.fonts.addEventListener?.("loadingdone", invalidate);
    } else {
      onFontsReady();
    }

    resize();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      invalidateRef.current = () => {};
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", invalidate);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerenter", onMove);
      container.removeEventListener("pointerdown", onDown);
      container.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointercancel", onUp);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <p
      ref={containerRef}
      className={cn("relative touch-pan-y", className, ready && "select-none text-transparent")}
      style={style}
    >
      {/* Real text: sets the layout and stays readable to assistive tech and search engines */}
      <span ref={textRef}>{text}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{ inset: -BLEED, width: `calc(100% + ${BLEED * 2}px)`, height: `calc(100% + ${BLEED * 2}px)` }}
      />
    </p>
  );
}
