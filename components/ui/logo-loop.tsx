// Adapted from React Bits LogoLoop: https://reactbits.dev
//
// Changes from the original:
// - TypeScript, and the fade colour follows the theme's --background token.
// - The loop pauses while off-screen and never runs under reduced motion.
// - It sleeps once a hover/focus pause has eased to a stop.
// - Repeated copies are inert, so their links aren't tabbed through again.
// - Focus pauses the loop like hover does, so a focused link holds still.

"use client";

import { memo, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./logo-loop.css";

const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
const COPY_HEADROOM = 2;

type LogoBase = { title?: string; href?: string; ariaLabel?: string };

export type LogoItem =
  | (LogoBase & { node: ReactNode })
  | (LogoBase & { src: string; alt?: string; srcSet?: string; sizes?: string; width?: number; height?: number });

export interface LogoLoopProps {
  logos: LogoItem[];
  /** Pixels per second. Negative reverses the direction. */
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  /** Speed while hovered or focused; 0 pauses. */
  hoverSpeed?: number;
  fadeOut?: boolean;
  /** Defaults to the theme's background token. */
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const toCssLength = (value: number | string | undefined) => (typeof value === "number" ? `${value}px` : value);

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = "left",
  width = "100%",
  logoHeight = 28,
  gap = 32,
  hoverSpeed = 0,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = "Partner logos",
  className,
  style,
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  const [seqSize, setSeqSize] = useState(0);
  const [copyCount, setCopyCount] = useState(MIN_COPIES);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(false);

  const isVertical = direction === "up" || direction === "down";
  const forward = isVertical ? direction === "up" : direction === "left";
  const targetVelocity = Math.abs(speed) * (forward ? 1 : -1) * (speed < 0 ? -1 : 1);

  const updateDimensions = useCallback(() => {
    const container = containerRef.current;
    const seq = seqRef.current;
    if (!container || !seq) return;
    const rect = seq.getBoundingClientRect();
    if (isVertical) {
      const parentHeight = container.parentElement?.clientHeight ?? 0;
      if (parentHeight > 0) container.style.height = `${Math.ceil(parentHeight)}px`;
      if (rect.height > 0) {
        setSeqSize(Math.ceil(rect.height));
        setCopyCount(Math.max(MIN_COPIES, Math.ceil(container.clientHeight / rect.height) + COPY_HEADROOM));
      }
    } else if (rect.width > 0) {
      setSeqSize(Math.ceil(rect.width));
      setCopyCount(Math.max(MIN_COPIES, Math.ceil(container.clientWidth / rect.width) + COPY_HEADROOM));
    }
  }, [isVertical]);

  // Re-measures on resize, and once each image in the first copy has loaded
  useEffect(() => {
    const container = containerRef.current;
    const seq = seqRef.current;
    if (!container || !seq) return;
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(container);
    observer.observe(seq);
    const images = Array.from(seq.querySelectorAll("img")).filter((img) => !img.complete);
    images.forEach((img) => {
      img.addEventListener("load", updateDimensions, { once: true });
      img.addEventListener("error", updateDimensions, { once: true });
    });
    updateDimensions();
    return () => {
      observer.disconnect();
      images.forEach((img) => {
        img.removeEventListener("load", updateDimensions);
        img.removeEventListener("error", updateDimensions);
      });
    };
  }, [updateDimensions, logos, gap, logoHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || seqSize <= 0) return;

    const place = () => {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    };
    place();

    if (!inView || window.matchMedia(REDUCED_MOTION).matches) return;

    const target = held ? hoverSpeed : targetVelocity;
    let raf = 0;
    let last: number | null = null;
    const animate = (now: number) => {
      const dt = last === null ? 0 : Math.max(0, now - last) / 1000;
      last = now;
      velocityRef.current += (target - velocityRef.current) * (1 - Math.exp(-dt / SMOOTH_TAU));
      offsetRef.current += velocityRef.current * dt;
      place();
      // A pause that has eased to a stop needs no more frames
      if (target === 0 && Math.abs(velocityRef.current) < 0.5) {
        velocityRef.current = 0;
        return;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [seqSize, isVertical, inView, held, hoverSpeed, targetVelocity]);

  const renderLogoItem = (item: LogoItem, key: string) => {
    if (renderItem) {
      return (
        <li className="logoloop__item" key={key}>
          {renderItem(item, key)}
        </li>
      );
    }
    const isNode = "node" in item;
    const content = isNode ? (
      <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>
        {item.node}
      </span>
    ) : (
      // Logos are small and already sized; next/image adds nothing here
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.src}
        srcSet={item.srcSet}
        sizes={item.sizes}
        width={item.width}
        height={item.height}
        alt={item.alt ?? ""}
        title={item.title}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    );
    const label = isNode ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);
    return (
      <li className="logoloop__item" key={key}>
        {item.href ? (
          <a
            className="logoloop__link"
            href={item.href}
            aria-label={label || "logo link"}
            target="_blank"
            rel="noreferrer noopener"
          >
            {content}
          </a>
        ) : (
          content
        )}
      </li>
    );
  };

  const containerStyle = {
    width: isVertical ? (toCssLength(width) === "100%" ? undefined : toCssLength(width)) : (toCssLength(width) ?? "100%"),
    "--logoloop-gap": `${gap}px`,
    "--logoloop-logoHeight": `${logoHeight}px`,
    ...(fadeOutColor ? { "--logoloop-fadeColor": fadeOutColor } : {}),
    ...style,
  } as CSSProperties;

  const hold = () => setHeld(true);
  const release = () => setHeld(false);

  return (
    <div
      ref={containerRef}
      className={cn(
        "logoloop",
        isVertical ? "logoloop--vertical" : "logoloop--horizontal",
        fadeOut && "logoloop--fade",
        scaleOnHover && "logoloop--scale-hover",
        className,
      )}
      style={containerStyle}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        ref={trackRef}
        className="logoloop__track"
        onMouseEnter={hold}
        onMouseLeave={release}
        onFocus={hold}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) release();
        }}
      >
        {Array.from({ length: copyCount }, (_, copy) => (
          <ul
            className="logoloop__list"
            key={copy}
            role="list"
            ref={copy === 0 ? seqRef : undefined}
            // Copies only fill the loop: hidden from assistive tech and the tab order
            aria-hidden={copy > 0 || undefined}
            inert={copy > 0}
          >
            {logos.map((item, index) => renderLogoItem(item, `${copy}-${index}`))}
          </ul>
        ))}
      </div>
    </div>
  );
});

export default LogoLoop;
