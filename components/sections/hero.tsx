import Link from "next/link";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { buildHeroTiles } from "@/lib/hero-tiles";
import { buttonVariants } from "@/components/ui/button";
import { CvLink } from "@/components/ui/cv-link";
import DottedTrailCursor from "@/components/ui/dotted-trail-cursor";
import TechText from "@/components/ui/tech-text";
import { SocialLinks } from "@/components/layout/social-links";
import { AvailabilityBadge } from "@/components/sections/availability-badge";
import { HeroBand } from "@/components/sections/hero-band";

const lightTiles = buildHeroTiles(projects, skillGroups, "light");
const darkTiles = buildHeroTiles(projects, skillGroups, "dark");

export function Hero() {
  return (
    <section aria-labelledby="hero-title">
      {/* Interactive dotted grid behind the whole hero; trail colors are theme tokens in globals.css */}
      <DottedTrailCursor
        className="h-auto"
        transparent
        colorA="var(--trail-a)"
        colorB="var(--trail-b)"
        headRadius={70}
        glowRadius={260}
      >
        <div className="mx-auto max-w-6xl px-5 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
          <h1 id="hero-title" className="text-[15px] font-medium">
            {profile.name}
            <span className="block font-normal text-muted">{profile.role}</span>
          </h1>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            {/* Canvas wordmark over the real text; letter colors are theme tokens in globals.css */}
            <TechText
              text={profile.headline}
              color="var(--foreground)"
              accentColor="var(--accent)"
              reveal="letter"
              dashLength={4}
              dashGap={2}
              specks={15}
              speed={1.4}
              className="max-w-[16ch] text-display font-semibold text-balance lg:col-span-7"
            />

            <div className="lg:col-span-5 lg:pb-2">
              <p className="max-w-md text-lg leading-relaxed text-muted">{profile.summary}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/#projects" className={buttonVariants()}>
                  View my projects
                </Link>
                <Link href="/#contact" className={buttonVariants({ variant: "outline" })}>
                  Contact me
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3">
                <CvLink variant="ghost" size="sm" className="-ml-3" />
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-14">
          <HeroBand light={lightTiles} dark={darkTiles} />
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-8 sm:pb-20">
          <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <AvailabilityBadge {...profile.availability} />
            <p className="text-sm text-muted">
              The band shows my projects and skill areas, drawn from this site&apos;s data.
            </p>
          </div>
        </div>
      </DottedTrailCursor>
    </section>
  );
}
