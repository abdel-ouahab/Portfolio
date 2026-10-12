import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom font sizes from globals.css; without this, text-display reads as a colour
// and gets dropped when merged with a text colour such as text-transparent
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ["display", "title"] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const monthFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats "YYYY-MM" as "Mar 2026" and "YYYY" as "2026". */
export function formatPeriodDate(value: string): string {
  const [year, month] = value.split("-");
  if (!month) return year;
  return monthFormatter.format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
}

export function formatPeriod(start: string, end: string | null): string {
  return `${formatPeriodDate(start)} – ${end ? formatPeriodDate(end) : "Present"}`;
}

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
