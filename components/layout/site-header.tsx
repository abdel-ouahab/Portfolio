import Link from "next/link";
import { profile } from "@/data/profile";
import { CvLink } from "@/components/ui/cv-link";
import { LogoMark } from "@/components/ui/logo-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { navLinks } from "@/components/layout/nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/#top"
          aria-label={`${profile.name}, home`}
          className="group -m-1 grid size-11 cursor-pointer place-items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <LogoMark />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <CvLink size="sm" className="hidden sm:inline-flex" />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
