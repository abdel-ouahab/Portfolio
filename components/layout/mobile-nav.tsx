"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/components/layout/nav-links";
import { CvLink } from "@/components/ui/cv-link";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-sunken"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      {/* Always mounted so CSS can animate it both ways; closed, it is invisible and inert */}
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "absolute inset-x-0 top-16 border-b border-line bg-background px-5 pb-6 pt-2 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.25)] sm:px-8",
          "transition-[opacity,translate,visibility] duration-[180ms] ease-out motion-reduce:transition-none",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <nav aria-label="Mobile">
          <ul className="divide-y divide-line">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-lg font-medium transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <CvLink className="mt-5 w-full sm:hidden" />
      </div>
    </div>
  );
}
