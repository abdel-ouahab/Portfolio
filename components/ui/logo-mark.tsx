import { cn } from "@/lib/utils";

/**
 * Monogram: an "A" drawn as a caret (Λ) whose crossbar is a text cursor.
 * The cursor blinks while the parent `.group` is hovered or focused.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      focusable="false"
      className={cn("size-9", className)}
    >
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="9"
        className="fill-surface stroke-line-strong transition-colors duration-200 group-hover:stroke-accent group-focus-visible:stroke-accent"
        strokeWidth="1.5"
      />
      <path
        d="M8.5 23 16 9l7.5 14"
        className="stroke-foreground"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 19.5h3"
        className="logo-cursor stroke-accent"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
