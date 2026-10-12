"use client";

import { useEffect, useEffectEvent, useId, useRef, useState, useSyncExternalStore } from "react";
import { ArrowRight, Link, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/*
 * Adapted from the 21st.dev radial orbital timeline:
 * - Colors use the project's theme tokens instead of hard-coded black/white.
 * - `status`, `energy`, and `date` are optional, and `tags` was added, so the
 *   component can show content without invented ratings.
 * - Nodes are buttons (keyboard and screen-reader reachable); Escape closes.
 * - The radius scales to the container, so it fits on phones.
 * - Rotation pauses while a node is hovered or focused, while the orbit is
 *   off-screen, and entirely when the visitor prefers reduced motion.
 */

export interface TimelineItem {
  id: number;
  title: string;
  /** Short name under the node. Falls back to `title`. */
  label?: string;
  /** Text at the top right of the card. */
  date?: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status?: "completed" | "in-progress" | "pending";
  /** 0–100. Draws a level bar when set. */
  energy?: number;
  /** Shown as badges in the card. */
  tags?: string[];
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  /** Largest orbit radius in px; smaller containers shrink it. @default 200 */
  radius?: number;
  /** Heading above the related-node links in a card. */
  relatedLabel?: string;
  /** Content in the centre of the orbit. */
  center?: React.ReactNode;
  /** Called with the opened node's id, or null when it closes. */
  onActiveChange?: (id: number | null) => void;
  /** Degrees turned every 50ms while rotating. @default 0.3 */
  speed?: number;
  /** Space kept between the orbit and the container edge for node labels. @default 64 */
  edgeMargin?: number;
  /**
   * Open a detail card under the selected node. Turn off when the selection is
   * shown elsewhere on the page (via `onActiveChange`). @default true
   */
  showCard?: boolean;
  className?: string;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

const statusLabel: Record<NonNullable<TimelineItem["status"]>, string> = {
  completed: "Complete",
  "in-progress": "In progress",
  pending: "Pending",
};

const statusVariant = {
  completed: "default",
  "in-progress": "outline",
  pending: "secondary",
} as const;

function nodePosition(index: number, total: number, rotation: number, radius: number) {
  const angle = ((index / total) * 360 + rotation) % 360;
  const radian = (angle * Math.PI) / 180;
  const x = radius * Math.cos(radian);
  const y = radius * Math.sin(radian);
  const zIndex = Math.round(100 + 50 * Math.cos(radian));
  const opacity = Math.max(0.75, Math.min(1, 0.75 + 0.25 * ((1 + Math.sin(radian)) / 2)));
  return { x, y, zIndex, opacity };
}

export default function RadialOrbitalTimeline({
  timelineData,
  radius: maxRadius = 200,
  relatedLabel = "Connected nodes",
  center,
  onActiveChange,
  speed = 0.3,
  edgeMargin = 64,
  showCard = true,
  className,
}: RadialOrbitalTimelineProps) {
  const [activeNodeId, setActiveNodeIdState] = useState<number | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [radius, setRadius] = useState(maxRadius);
  const [cardHeight, setCardHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  // The live angle. While the orbit turns, frames write node styles straight to
  // the DOM and React state only catches up when it stops, so the orbit doesn't
  // re-render on every frame.
  const angleRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();
  const baseId = useId();

  const setActiveNodeId = (id: number | null) => {
    setActiveNodeIdState(id);
    onActiveChange?.(id);
  };

  const rotating = autoRotate && !hovering && inView && !reducedMotion;
  const total = timelineData.length;

  useEffect(() => {
    if (!rotating) return;
    const orbit = orbitRef.current;
    // Turns off the nodes' transitions, which would otherwise restart every frame
    orbit?.setAttribute("data-rotating", "");
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      // `speed` is degrees per 50ms; the cap keeps a stalled frame from jumping
      // A frame's timestamp can predate the effect, so the first step is clamped at 0
      angleRef.current = (angleRef.current + (Math.min(Math.max(now - last, 0), 100) / 50) * speed) % 360;
      last = now;
      for (let index = 0; index < total; index++) {
        const node = nodeRefs.current[index];
        if (!node) continue;
        const { x, y, zIndex, opacity } = nodePosition(index, total, angleRef.current, radius);
        node.style.transform = `translate(${x}px, ${y}px)`;
        node.style.zIndex = String(zIndex);
        node.style.opacity = String(opacity);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      orbit?.removeAttribute("data-rotating");
      setRotationAngle(angleRef.current);
    };
  }, [rotating, speed, radius, total]);

  // Fit the orbit to the container and pause rotation while off-screen.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerHeight(height);
      // Synced in the same render as the radius, so a resize mid-turn re-renders
      // the nodes where they are instead of at the angle the state last held
      setRotationAngle(angleRef.current);
      setRadius(Math.max(80, Math.min(maxRadius, width / 2 - edgeMargin, height / 2 - edgeMargin)));
    });
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    resize.observe(el);
    visibility.observe(el);
    return () => {
      resize.disconnect();
      visibility.disconnect();
    };
  }, [maxRadius, edgeMargin]);

  // Track the open card's height so the space below can grow to fit it.
  useEffect(() => {
    if (activeNodeId === null) return;
    const card = document.getElementById(`${baseId}-card-${activeNodeId}`);
    if (!card) return;
    const observer = new ResizeObserver(() => setCardHeight(card.offsetHeight));
    observer.observe(card);
    return () => observer.disconnect();
  }, [activeNodeId, baseId]);

  const close = () => {
    setActiveNodeId(null);
    setAutoRotate(true);
    setCardHeight(0);
  };

  const closeOnEscape = useEffectEvent(close);

  useEffect(() => {
    if (activeNodeId === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOnEscape();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeNodeId]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) close();
  };

  const toggleItem = (id: number) => {
    if (activeNodeId === id) {
      close();
      return;
    }
    setActiveNodeId(id);
    setAutoRotate(false);
    // Bring the opened node to the top of the orbit, so its card hangs into the centre.
    const index = timelineData.findIndex((item) => item.id === id);
    angleRef.current = 270 - (index / timelineData.length) * 360;
    setRotationAngle(angleRef.current);
  };

  const activeItem = timelineData.find((item) => item.id === activeNodeId);
  const relatedToActive = new Set(activeItem?.relatedIds ?? []);

  // The open node sits at the top of the orbit with its card hanging 76px
  // below the orbit line. On narrow screens, where the radius is small, a long
  // card can run past the container; reserve that overflow as bottom margin so
  // the orbit stays put and the content below moves down instead of overlapping.
  const cardBottom = containerHeight / 2 - radius + 76 + cardHeight + 16;
  const overflow = activeItem && cardHeight ? Math.max(0, Math.ceil(cardBottom - containerHeight)) : 0;

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{ marginBottom: overflow }}
      className={cn("relative flex h-[34rem] w-full items-center justify-center", className)}
    >
      <div
        ref={orbitRef}
        className="group/orbit absolute flex h-full w-full items-center justify-center"
        style={{ perspective: "1000px" }}
      >
        {/* Centre: custom content as given, or the default pulsing disc */}
        {center ? (
          <div className="absolute z-10 flex items-center justify-center">{center}</div>
        ) : (
          <div className="absolute z-10 flex size-16 items-center justify-center rounded-full bg-accent text-accent-contrast">
            <div className="absolute size-20 rounded-full border border-accent/30 motion-safe:animate-ping opacity-70" />
            <div
              className="absolute size-24 rounded-full border border-accent/20 motion-safe:animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
            <div className="size-8 rounded-full bg-background/80" />
          </div>
        )}

        {/* Orbit path */}
        <div
          aria-hidden
          className="absolute rounded-full border border-dashed border-line-strong"
          style={{ width: radius * 2, height: radius * 2 }}
        />

        {/* Links from the open node to the nodes it relates to. They draw in once
            the orbit has turned the open node to the top. */}
        {activeItem ? (
          <svg aria-hidden className="pointer-events-none absolute size-px overflow-visible">
            {activeItem.relatedIds.map((relatedId) => {
              const from = nodePosition(
                timelineData.findIndex((item) => item.id === activeItem.id),
                total,
                rotationAngle,
                radius,
              );
              const toIndex = timelineData.findIndex((item) => item.id === relatedId);
              if (toIndex === -1) return null;
              const to = nodePosition(toIndex, total, rotationAngle, radius);
              return (
                <path
                  key={`${activeItem.id}-${relatedId}`}
                  // Bows toward the centre without passing behind it.
                  d={`M ${from.x} ${from.y} Q ${(from.x + to.x) * 0.3} ${(from.y + to.y) * 0.3} ${to.x} ${to.y}`}
                  pathLength={1}
                  className="orbit-link"
                  fill="none"
                />
              );
            })}
          </svg>
        ) : null}

        {timelineData.map((item, index) => {
          const position = nodePosition(index, total, rotationAngle, radius);
          const isExpanded = activeNodeId === item.id;
          const isRelated = relatedToActive.has(item.id);
          const Icon = item.icon;
          const cardId = `${baseId}-card-${item.id}`;

          return (
            <div
              key={item.id}
              ref={(node) => {
                nodeRefs.current[index] = node;
              }}
              className="absolute transition-all duration-700 group-data-[rotating]/orbit:transition-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isExpanded ? 200 : position.zIndex,
                opacity: isExpanded || isRelated ? 1 : position.opacity,
              }}
            >
              <button
                type="button"
                aria-expanded={showCard ? isExpanded : undefined}
                aria-pressed={showCard ? undefined : isExpanded}
                aria-controls={showCard && isExpanded ? cardId : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
                onPointerEnter={() => setHovering(true)}
                onPointerLeave={() => setHovering(false)}
                onFocus={() => setHovering(true)}
                onBlur={() => setHovering(false)}
                className="relative block size-10 cursor-pointer rounded-full"
              >
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-full border shadow-[0_4px_12px_-6px_color-mix(in_oklch,var(--foreground)_40%,transparent)] transition-[background-color,border-color,color,scale] duration-300",
                    isExpanded
                      ? "scale-125 border-foreground bg-foreground text-background"
                      : isRelated
                        ? "border-accent bg-surface text-accent ring-4 ring-accent-soft"
                        : "border-line-strong bg-surface text-foreground hover:border-accent hover:text-accent",
                  )}
                >
                  <Icon size={16} aria-hidden />
                </span>
                <span
                  className={cn(
                    "absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap rounded bg-background px-1 text-xs font-medium transition-[top,color] duration-300",
                    isExpanded ? "top-14 text-foreground" : isRelated ? "text-accent" : "text-muted",
                  )}
                >
                  {item.label ?? item.title}
                </span>
              </button>

              {showCard && isExpanded && (
                <Card
                  id={cardId}
                  className="absolute left-1/2 top-24 w-64 -translate-x-1/2 overflow-visible bg-surface/95 shadow-xl backdrop-blur-lg"
                >
                  <div aria-hidden className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-line-strong" />
                  <CardHeader className="p-4 pb-2">
                    {item.status || item.date ? (
                      <div className="flex items-center justify-between">
                        {item.status ? (
                          <Badge variant={statusVariant[item.status]} className="px-2">
                            {statusLabel[item.status]}
                          </Badge>
                        ) : (
                          <span />
                        )}
                        {item.date ? <span className="text-xs text-muted">{item.date}</span> : null}
                      </div>
                    ) : null}
                    <CardTitle className="mt-1 text-sm leading-snug">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs text-muted">
                    <p className="leading-relaxed">{item.content}</p>

                    {item.tags?.length ? (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <li key={tag}>
                            <Badge variant="outline" className="rounded-md px-2 font-normal">
                              {tag}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {item.energy !== undefined ? (
                      <div className="mt-4 border-t border-line pt-3">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="flex items-center">
                            <Zap size={10} className="mr-1" aria-hidden />
                            Energy level
                          </span>
                          <span>{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken">
                          <div className="h-full bg-accent" style={{ width: `${item.energy}%` }} />
                        </div>
                      </div>
                    ) : null}

                    {item.relatedIds.length > 0 && (
                      <div className="mt-4 border-t border-line pt-3">
                        <p className="mb-2 flex items-center font-medium text-foreground">
                          <Link size={10} className="mr-1 text-muted" aria-hidden />
                          {relatedLabel}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.relatedIds.map((relatedId) => {
                            const relatedItem = timelineData.find((i) => i.id === relatedId);
                            if (!relatedItem) return null;
                            return (
                              <Button
                                key={relatedId}
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 px-2.5 text-xs [&_svg]:size-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(relatedId);
                                }}
                              >
                                {relatedItem.label ?? relatedItem.title}
                                <ArrowRight className="text-muted" aria-hidden />
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
