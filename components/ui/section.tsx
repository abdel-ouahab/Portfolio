import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  title: string;
  intro?: React.ReactNode;
  /** Extra content in the title rail, under the intro (sticky with it on large screens). */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Two-column section: sticky title rail on large screens, stacked on small ones. */
export function Section({ id, title, intro, aside, children, className }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("border-t border-line py-20 sm:py-24 lg:py-28", className)}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <header className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 id={`${id}-title`} className="text-title font-semibold">
              {title}
            </h2>
            {intro ? <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">{intro}</p> : null}
            {aside}
          </div>
        </header>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
