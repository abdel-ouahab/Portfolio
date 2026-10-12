"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.add("theme-switching");
    root.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable (private mode); the switch still applies.
    }
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-sunken hover:text-foreground",
        className,
      )}
    >
      {/* Both icons render; CSS picks one, so server and client markup match. */}
      <Sun className="size-[18px] dark:hidden" aria-hidden />
      <Moon className="hidden size-[18px] dark:block" aria-hidden />
      <span className="sr-only">Switch between light and dark theme</span>
    </button>
  );
}
