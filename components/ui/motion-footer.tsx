"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

// Styles live in app/globals.css under "Cinematic section reveal".

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

// ScrollTrigger measures trigger positions once. Content above a panel can change
// height without a window resize (an opened <details>, a carousel settling), so
// one shared observer re-measures whenever the page height changes.
let layoutWatchers = 0;
let layoutObserver: ResizeObserver | null = null;

function watchLayout() {
  layoutWatchers += 1;
  if (!layoutObserver) {
    let frame = 0;
    layoutObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    layoutObserver.observe(document.body);
  }
  return () => {
    layoutWatchers -= 1;
    if (layoutWatchers === 0) {
      layoutObserver?.disconnect();
      layoutObserver = null;
    }
  };
}

// -------------------------------------------------------------------------
// Magnetic button: follows the pointer on fine-pointer devices, springs back on leave.
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: "a" | "button";
  };

export function MagneticButton({ className, children, as: Component = "button", ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const mm = gsap.matchMedia();
    mm.add(`(hover: hover) and (pointer: fine) and ${MOTION_OK}`, () => {
      const handleMove = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          transformPerspective: 600,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleLeave = () => {
        gsap.to(element, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1, 0.3)", duration: 1.2 });
      };

      element.addEventListener("pointermove", handleMove);
      element.addEventListener("pointerleave", handleLeave);
      return () => {
        element.removeEventListener("pointermove", handleMove);
        element.removeEventListener("pointerleave", handleLeave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Component
      ref={ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export const revealPillClass =
  "reveal-pill inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-sm font-medium text-foreground md:text-base";

// -------------------------------------------------------------------------
// Cinematic reveal: a full-screen panel fixed to the viewport and clipped to its
// wrapper, so scrolling past the previous section uncovers it like a curtain.
// -------------------------------------------------------------------------
interface CinematicRevealProps {
  /** Giant outlined word behind the content, usually the next section's name. */
  word: string;
  heading: React.ReactNode;
  marquee: readonly string[];
  /** Optional row of pills (use MagneticButton with revealPillClass). */
  children?: React.ReactNode;
  /**
   * Illustration layer between the backdrop and the heading. Elements opt into
   * scroll-scrubbed motion with data attributes (see animateScene).
   */
  scene?: React.ReactNode;
  className?: string;
}

/**
 * Scene elements animate toward their resting state as the panel is uncovered:
 * - `data-scene-item`: enters from `data-from-x` / `data-from-y` (fractions of the
 *   viewport), `data-from-rotate` (deg) and `data-from-scale`, fading in.
 * - `data-scene-draw`: an SVG path with pathLength=1 and strokeDasharray=1 draws itself.
 * - `data-scene-grow`: scales in horizontally from its left edge.
 * `data-order` delays an element's start so a scene builds up in sequence.
 * Without motion, everything simply sits in its resting state.
 */
function animateScene(scene: HTMLElement, trigger: HTMLElement) {
  const scrollTrigger = (el: HTMLElement) => ({
    trigger,
    start: `top ${Math.max(85 - Number(el.dataset.order ?? 0) * 6, 30)}%`,
    end: "bottom bottom",
    scrub: 1,
    invalidateOnRefresh: true,
  });

  scene.querySelectorAll<HTMLElement>("[data-scene-item]").forEach((el) => {
    const { fromX = "0", fromY = "0.15", fromRotate = "0", fromScale = "0.9" } = el.dataset;
    gsap.fromTo(
      el,
      {
        x: () => Number(fromX) * window.innerWidth,
        y: () => Number(fromY) * window.innerHeight,
        rotation: Number(fromRotate),
        scale: Number(fromScale),
        opacity: 0,
      },
      { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, ease: "power2.out", scrollTrigger: scrollTrigger(el) },
    );
  });

  scene.querySelectorAll<HTMLElement>("[data-scene-draw]").forEach((el) => {
    gsap.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: scrollTrigger(el) });
  });

  scene.querySelectorAll<HTMLElement>("[data-scene-grow]").forEach((el) => {
    gsap.fromTo(
      el,
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, ease: "power2.out", scrollTrigger: scrollTrigger(el) },
    );
  });
}

export function CinematicReveal({ word, heading, marquee, children, scene, className }: CinematicRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const stopWatching = watchLayout();
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      gsap.fromTo(
        wordRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: { trigger: wrapper, start: "top 80%", end: "bottom bottom", scrub: 1 },
        },
      );

      gsap.fromTo(
        [headingRef.current, actionsRef.current].filter(Boolean),
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { trigger: wrapper, start: "top 40%", end: "bottom bottom", scrub: 1 },
        },
      );

      if (sceneRef.current) animateScene(sceneRef.current, wrapper);
    });

    return () => {
      mm.revert();
      stopWatching();
    };
  }, []);

  // Repeat short lists so each half of the loop is wider than the viewport.
  const run = Array.from({ length: Math.ceil(12 / Math.max(marquee.length, 1)) }, () => marquee).flat();

  return (
    <div
      ref={wrapperRef}
      className={cn("relative h-screen w-full", className)}
      style={{ clipPath: "inset(0)" }}
      // A focused pill sits in a fixed layer that may be clipped out of view;
      // scroll the wrapper so the whole panel is uncovered.
      onFocusCapture={() => wrapperRef.current?.scrollIntoView({ block: "end" })}
    >
      <div className="reveal-panel fixed inset-x-0 bottom-0 flex h-screen flex-col overflow-hidden bg-background text-foreground">
        <div aria-hidden className="reveal-aurora pointer-events-none absolute left-[10vw] top-[20vh] h-[60vh] w-[80vw] rounded-[50%] blur-[80px]" />
        <div aria-hidden className="reveal-grid pointer-events-none absolute inset-0" />

        <div
          ref={wordRef}
          aria-hidden
          className="reveal-word pointer-events-none absolute inset-x-0 -bottom-[5vh] select-none whitespace-nowrap text-center"
          style={{ "--chars": word.length } as React.CSSProperties}
        >
          {word}
        </div>

        {scene ? (
          <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
            {scene}
          </div>
        ) : null}

        <div
          aria-hidden
          className="absolute left-0 top-24 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-line bg-background/60 py-4 shadow-2xl backdrop-blur-md"
        >
          <div className="reveal-marquee flex w-max text-xs font-semibold uppercase tracking-[0.3em] text-muted md:text-sm">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center">
                {run.map((item, index) => (
                  <span key={index} className="flex items-center gap-6 px-3">
                    <span>{item}</span>
                    <span className={index % 2 ? "text-status-open/70" : "text-accent/70"}>✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-24 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
          <p
            ref={headingRef}
            className="reveal-heading text-balance text-center text-4xl font-semibold tracking-tighter sm:text-6xl lg:text-7xl"
          >
            {heading}
          </p>
          {children ? (
            <div ref={actionsRef} className="mt-12 flex flex-wrap justify-center gap-4">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
