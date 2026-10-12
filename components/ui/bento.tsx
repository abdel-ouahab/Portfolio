import { cn } from "@/lib/utils";

// Adapted from the 21st.dev "FUI Bento Grid Dark" card: a graphic on top with a
// frosted text panel sliding over it. Colours map to this project's tokens so the
// card works in both themes; hover state is plain CSS on the card's `group`,
// which children (like BentoPattern) pick up with group-hover.

export function BentoGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", className)} {...props} />
  );
}

export function BentoCard({
  dark = false,
  className,
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <article
      data-dark={dark ? "true" : undefined}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg transform-gpu",
        "bg-surface shadow-sm ring-1 ring-line",
        "dark:bg-surface-sunken dark:shadow-[0_-20px_80px_-20px_var(--accent-soft)_inset]",
        "data-dark:bg-foreground data-dark:text-background data-dark:ring-line-strong",
        className,
      )}
    >
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-52">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-linear-to-b from-surface to-50% opacity-25 dark:from-surface-sunken" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-linear-to-t from-surface to-50% opacity-25 dark:from-surface-sunken" />
        )}
      </div>
      <div className="relative isolate z-20 -mt-16 flex-1 border-t border-line/60 bg-surface/70 p-6 backdrop-blur-xl sm:p-8 dark:bg-surface-sunken/70">
        <div className="text-sm text-muted">{eyebrow}</div>
        <h3 className="mt-1 text-xl/7 font-semibold tracking-tight sm:text-2xl/8">{title}</h3>
        <div className="mt-2 max-w-[600px] text-sm/6 text-muted">{description}</div>
      </div>
    </article>
  );
}

/**
 * Generated card art: a dot grid, an accent glow that drifts on hover, and a large
 * outlined label (a year, a monogram). Stands in for the original's bitmap images.
 */
export function BentoPattern({ label, live = false }: { label: string; live?: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 bg-surface-sunken dark:bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] bg-[size:18px_18px] opacity-70" />
      <div
        className={cn(
          "absolute -right-16 -top-20 size-72 rounded-full bg-accent/25 blur-3xl dark:bg-accent/20",
          "transition-[translate,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "group-hover:-translate-x-10 group-hover:translate-y-5 group-hover:scale-115",
        )}
      />
      <span
        className={cn(
          "absolute right-6 top-4 font-mono text-7xl font-semibold tracking-tighter text-transparent opacity-90 [-webkit-text-stroke:1px_var(--line-strong)] sm:text-8xl",
          "transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          "group-hover:-translate-y-1.5 group-hover:opacity-100",
        )}
      >
        {label}
      </span>
      {live && (
        <span className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-open opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-status-open" />
          </span>
          Current
        </span>
      )}
    </div>
  );
}
