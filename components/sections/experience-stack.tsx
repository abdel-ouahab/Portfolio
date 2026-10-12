"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import CardSwap, { Card, type CardSwapHandle } from "@/components/ui/card-swap";
import { cn, formatPeriod } from "@/lib/utils";
import type { ExperienceItem } from "@/types";

function ExperienceCardBody({ item, index, total }: { item: ExperienceItem; index: number; total: number }) {
  const current = item.end === null;
  return (
    <div className="flex h-full flex-col p-7">
      <div className="flex items-center justify-between gap-4 font-mono text-xs text-muted">
        <time dateTime={item.start}>{formatPeriod(item.start, item.end)}</time>
        {current ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-accent">
            <span className="size-1.5 rounded-full bg-status-open" aria-hidden />
            Current
          </span>
        ) : null}
      </div>
      <h3 className="mt-5 text-xl font-semibold leading-snug tracking-tight">{item.role}</h3>
      <p className="mt-1 text-[15px] font-medium text-accent">{item.organization}</p>
      <ul className="mt-4 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted marker:text-line-strong">
        {item.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <p className="mt-auto pt-4 font-mono text-xs text-muted" aria-hidden>
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </p>
    </div>
  );
}

const controlClass = cn(
  "grid size-10 place-items-center rounded-full border border-line bg-surface text-foreground",
  "transition-colors hover:border-line-strong hover:bg-surface-sunken",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
);

/** Experience as a swappable card stack; a plain list on phones, where the stack would scale too small to read. */
export function ExperienceStack({ items }: { items: ExperienceItem[] }) {
  const swapRef = useRef<CardSwapHandle>(null);
  const [front, setFront] = useState(0);

  return (
    <>
      <ol className="space-y-4 sm:hidden">
        {items.map((item, index) => (
          <li
            key={`${item.role}-${item.organization}`}
            className="rounded-2xl border border-line bg-surface shadow-sm"
          >
            <ExperienceCardBody item={item} index={index} total={items.length} />
          </li>
        ))}
      </ol>

      <div className="hidden sm:block">
        <CardSwap
          ref={swapRef}
          label="Experience"
          width={480}
          height={340}
          cardDistance={50}
          verticalDistance={50}
          skewAmount={4}
          delay={5000}
          cardRadius={24}
          onChange={setFront}
        >
          {items.map((item, index) => (
            <Card key={`${item.role}-${item.organization}`}>
              <ExperienceCardBody item={item} index={index} total={items.length} />
            </Card>
          ))}
        </CardSwap>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" className={controlClass} onClick={() => swapRef.current?.prev()}>
            <ChevronLeft className="size-[18px]" aria-hidden />
            <span className="sr-only">Previous role</span>
          </button>
          <button type="button" className={controlClass} onClick={() => swapRef.current?.next()}>
            <ChevronRight className="size-[18px]" aria-hidden />
            <span className="sr-only">Next role</span>
          </button>
          <p className="ml-2 min-w-0 truncate text-sm text-muted">
            <span className="font-medium text-foreground">{items[front]?.role}</span>
            {" · "}
            {items[front]?.organization}
          </p>
        </div>
      </div>
    </>
  );
}
