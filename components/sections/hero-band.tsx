"use client";

import { useSyncExternalStore } from "react";
import { TiltedGridHero, type TiltedGridImage } from "@/components/ui/tilted-grid-hero";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

/**
 * The curved image band under the hero text. Picks the tile set that matches
 * the active theme; the band stays hidden until it has measured itself, so
 * the swap after hydration is never visible.
 */
export function HeroBand({ light, dark }: { light: TiltedGridImage[]; dark: TiltedGridImage[] }) {
  const darkTheme = useSyncExternalStore(subscribe, isDark, () => false);

  return (
    <TiltedGridHero
      images={darkTheme ? dark : light}
      tileHeight={42}
      axis={50}
      curve={75}
      fade={14}
      speed={4.5}
      data-motion-managed=""
      className="h-[clamp(15rem,32vw,27rem)] w-full"
    />
  );
}
