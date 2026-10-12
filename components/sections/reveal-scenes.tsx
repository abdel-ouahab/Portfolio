import Image from "next/image";
import type { CSSProperties } from "react";
import { moments } from "@/data/moments";
import { skillGroups } from "@/data/skills";
import { featuredProjects } from "@/data/projects";
import { education, experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { skillIcons } from "@/lib/skill-icons";
import { cn } from "@/lib/utils";
import { ProjectSchemaPreview } from "@/components/projects/project-schema-preview";
import { LocalTime } from "@/components/sections/local-time";

/*
 * Illustrations for the full-screen reveal panels between sections
 * (CinematicReveal's `scene` prop). Everything is drawn from the site's data,
 * and motion comes from the data-scene-* attributes the panel animates on scroll.
 * Placements keep the centre clear for the panel heading.
 */

// ---------------------------------------------------------------------------
// About: photos from data/moments.ts, laid out like prints on a table.
// ---------------------------------------------------------------------------
const printSpots = [
  { place: "left-[4%] top-[22%] max-md:left-[6%] max-md:top-[19%]", tilt: -7, fromX: -0.35 },
  { place: "left-[16%] top-[47%] max-md:hidden", tilt: 5, fromX: -0.4 },
  { place: "left-[5%] top-[66%] max-md:hidden", tilt: -3, fromX: -0.3 },
  { place: "right-[15%] top-[19%] max-md:hidden", tilt: 6, fromX: 0.35 },
  { place: "right-[3%] top-[41%] max-md:hidden", tilt: -5, fromX: 0.4 },
  { place: "right-[13%] top-[65%] max-md:right-[6%] max-md:top-auto max-md:bottom-[5%]", tilt: 4, fromX: 0.3 },
];

export function AboutScene() {
  const prints = moments.filter((moment) => moment.image).slice(0, printSpots.length);

  return (
    <>
      {prints.map((moment, index) => {
        const spot = printSpots[index];
        return (
          <figure
            key={moment.title}
            data-scene-item
            data-from-x={spot.fromX}
            data-from-y="0.2"
            data-from-rotate={spot.tilt * 3}
            data-order={index % 3}
            className={cn("absolute w-[clamp(112px,12.5vw,188px)]", spot.place)}
          >
            <div className="reveal-print bg-surface p-[6%] pb-0" style={{ rotate: `${spot.tilt}deg` }}>
              <div className="relative aspect-square overflow-hidden bg-surface-sunken">
                <Image src={moment.image!} alt="" fill sizes="188px" className="object-cover" />
              </div>
              <figcaption className="truncate py-2 text-center text-[11px] font-medium text-muted sm:text-xs">
                {moment.title}
              </figcaption>
            </div>
          </figure>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Skills: the skill areas as an architecture diagram, wired by `related`.
// Positions are percentages of the panel, in data order.
// ---------------------------------------------------------------------------
const nodeSpots: { desktop: [number, number]; mobile: [number, number] }[] = [
  { desktop: [11, 46], mobile: [24, 24] },
  { desktop: [24, 26], mobile: [74, 23] },
  { desktop: [76, 25], mobile: [50, 33] },
  { desktop: [22, 76], mobile: [22, 74] },
  { desktop: [89, 50], mobile: [77, 75] },
  { desktop: [77, 77], mobile: [30, 87] },
  { desktop: [50, 87], mobile: [71, 88] },
];

function curve([ax, ay]: [number, number], [bx, by]: [number, number]) {
  const mx = (ax + bx) / 2;
  return `M ${ax} ${ay} C ${mx} ${ay}, ${mx} ${by}, ${bx} ${by}`;
}

export function SkillsScene() {
  const groups = skillGroups.slice(0, nodeSpots.length);
  const indexOf = new Map(groups.map((group, index) => [group.category, index]));

  const edges: [number, number][] = [];
  groups.forEach((group, a) => {
    for (const name of group.related) {
      const b = indexOf.get(name);
      if (b !== undefined && a < b) edges.push([a, b]);
    }
  });

  return (
    <>
      {(["desktop", "mobile"] as const).map((layout) => (
        <svg
          key={layout}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className={cn(
            "reveal-wires absolute inset-0 size-full",
            layout === "desktop" ? "max-md:hidden" : "md:hidden",
          )}
        >
          {edges.map(([a, b], index) => (
            <path
              key={`${a}-${b}`}
              d={curve(nodeSpots[a][layout], nodeSpots[b][layout])}
              data-scene-draw
              data-order={index % 4}
              pathLength={1}
              strokeDasharray={1}
              fill="none"
            />
          ))}
        </svg>
      ))}

      {groups.map((group, index) => {
        const Icon = skillIcons[group.icon];
        const { desktop, mobile } = nodeSpots[index];
        return (
          <div
            key={group.category}
            className="absolute left-(--mx) top-(--my) -translate-x-1/2 -translate-y-1/2 md:left-(--x) md:top-(--y)"
            style={
              { "--x": `${desktop[0]}%`, "--y": `${desktop[1]}%`, "--mx": `${mobile[0]}%`, "--my": `${mobile[1]}%` } as CSSProperties
            }
          >
            <div
              data-scene-item
              data-from-y="0.06"
              data-from-scale="0.6"
              data-order={index % 4}
              className="reveal-node flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-surface py-1.5 pl-2 pr-3 text-xs font-medium sm:text-sm"
            >
              <span className="grid size-6 place-items-center rounded-full bg-accent-soft text-accent sm:size-7">
                <Icon className="size-3.5 sm:size-4" />
              </span>
              {group.label}
              <span className="tabular-nums text-muted">{group.skills.length}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Projects: app windows showing each project's schema, angled toward the centre.
// ---------------------------------------------------------------------------
const windowSpots = [
  { place: "left-[3%] top-[23%] max-md:-left-[18%] max-md:top-[17%]", side: -1, tilt: -3 },
  { place: "right-[3%] top-[21%] max-md:hidden", side: 1, tilt: 3 },
  { place: "left-[7%] top-[62%] max-md:hidden", side: -1, tilt: 2 },
  { place: "right-[6%] top-[60%] max-md:-right-[18%] max-md:top-auto max-md:bottom-[4%]", side: 1, tilt: -2 },
];

export function ProjectsScene() {
  const shown = featuredProjects.slice(0, windowSpots.length);

  return (
    <>
      {shown.map((project, index) => {
        const spot = windowSpots[index];
        return (
          <div
            key={project.slug}
            data-scene-item
            data-from-x={spot.side * 0.25}
            data-from-y="0.12"
            data-order={index % 2}
            className={cn("absolute w-[clamp(220px,22vw,320px)] perspective-[1200px]", spot.place)}
          >
            <div
              className="reveal-window overflow-hidden rounded-xl border border-line bg-surface"
              style={{ transform: `rotateY(${spot.side * -14}deg) rotate(${spot.tilt}deg)` }}
            >
              <div className="flex items-center gap-3 border-b border-line px-3 py-2">
                <span className="flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span key={dot} className="size-2 rounded-full bg-line-strong" />
                  ))}
                </span>
                <span className="truncate text-xs font-medium">{project.shortTitle}</span>
              </div>
              <ProjectSchemaPreview project={project} />
              <p className="border-t border-line px-3 py-2 text-[11px] text-muted">{project.kind}</p>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Experience: study and work on one time axis, packed into as few rows as fit.
// ---------------------------------------------------------------------------
interface Span {
  label: string;
  /** Used on small screens, where full names collide. */
  shortLabel: string;
  kind: "study" | "work";
  start: number;
  end: number;
  ongoing: boolean;
}

/**
 * "YYYY-MM" or "YYYY" as a month count, with exclusive ends. A bare year on a
 * degree is an academic year (September to June); on a job it starts in January.
 */
function toMonth(value: string, edge: "start" | "end", academic = false) {
  const [year, month] = value.split("-").map(Number);
  if (month) return year * 12 + month - (edge === "start" ? 1 : 0);
  if (!academic) return year * 12;
  return year * 12 + (edge === "start" ? 8 : 6);
}

/** Packs spans into rows greedily: each takes the first row free by its start. */
function packRows(spans: Span[], firstRow: number) {
  const rowEnds: number[] = [];
  const placed = spans.map((span) => {
    let row = rowEnds.findIndex((end) => end <= span.start);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = span.end;
    return { ...span, row: firstRow + row };
  });
  return { placed, rows: rowEnds.length };
}

export function ExperienceScene() {
  const study: Span[] = education.map((item) => ({
    label: item.degree.split(" ")[0],
    shortLabel: item.degree.split(" ")[0],
    kind: "study",
    start: toMonth(item.start, "start", true),
    end: toMonth(item.end, "end", true),
    ongoing: false,
  }));
  const work: Span[] = experience.map((item) => ({
    label: item.organization === "Self-employed" ? "Freelance" : item.organization,
    shortLabel: item.organization === "Self-employed" ? "Freelance" : item.organization.split(" ")[0],
    kind: "work",
    start: toMonth(item.start, "start"),
    end: item.end ? toMonth(item.end, "end") : Infinity,
    ongoing: item.end === null,
  }));
  const byStart = (a: Span, b: Span) => a.start - b.start;

  const studyRows = packRows(study.sort(byStart), 0);
  const workRows = packRows(work.sort(byStart), studyRows.rows);
  const placed = [...studyRows.placed, ...workRows.placed].sort(byStart);
  const rowCount = studyRows.rows + workRows.rows;
  if (placed.length === 0) return null;

  // The axis runs to the year after the latest dated event; ongoing spans
  // reach its end and fade out.
  const firstYear = Math.floor(placed[0].start / 12);
  const latest = Math.max(...placed.flatMap((span) => [span.start, Number.isFinite(span.end) ? span.end : 0]));
  const lastYear = Math.floor(latest / 12) + 1;
  const range = (lastYear - firstYear) * 12;
  const pct = (month: number) => Math.min(((month - firstYear * 12) / range) * 100, 100);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => firstYear + i);

  return (
    <div className="absolute inset-x-0 bottom-[6vh] mx-auto w-full max-w-5xl px-6">
      <div className="relative" style={{ height: rowCount * 30 }}>
        {placed.map((span, index) => {
          const left = pct(span.start);
          const width = Math.max(pct(span.end) - left, 1.5);
          const rightAligned = left > 70;
          return (
            <div
              key={`${span.label}-${span.start}`}
              className="absolute h-[30px]"
              style={{ top: span.row * 30, left: `${left}%`, width: `${width}%` }}
            >
              <span
                data-scene-item
                data-from-y="0.02"
                data-from-scale="1"
                data-order={index}
                className={cn(
                  "absolute top-0 whitespace-nowrap text-[11px] font-medium sm:text-xs",
                  rightAligned ? "right-0" : "left-0",
                  span.kind === "study" ? "text-muted" : "text-foreground",
                )}
              >
                <span className="sm:hidden">{span.shortLabel}</span>
                <span className="max-sm:hidden">{span.label}</span>
              </span>
              <span
                data-scene-grow
                data-order={index}
                className={cn(
                  "absolute inset-x-0 top-[18px] h-1.5 rounded-full",
                  span.kind === "study" ? "bg-line-strong" : "bg-accent",
                  span.ongoing && "mask-r-from-60%",
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="relative mt-2 h-5 border-t border-line text-[11px] tabular-nums text-muted">
        {years.map((year, index) => (
          <span
            key={year}
            className={cn(
              "absolute top-1.5",
              index > 0 && "-translate-x-1/2",
              index === years.length - 1 && "hidden",
              index % 2 === 1 && "max-sm:hidden",
            )}
            style={{ left: `${pct(year * 12)}%` }}
          >
            {year}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact: signal rings around the heading and the local time where I work.
// ---------------------------------------------------------------------------
const rings = [34, 56, 80, 106];

export function ContactScene() {
  return (
    <>
      <div className="absolute left-1/2 top-[calc(50%+3rem)]">
        <span className="reveal-ping absolute size-[34vmin] rounded-full border border-accent" />
        {rings.map((size, index) => (
          <span
            key={size}
            className="absolute -translate-1/2"
            style={{ width: `${size}vmin`, height: `${size}vmin`, opacity: 0.32 - index * 0.07 }}
          >
            <span
              data-scene-item
              data-from-y="0"
              data-from-scale="0.5"
              data-order={index}
              className="block size-full rounded-full border border-accent"
            />
          </span>
        ))}
      </div>

      <p
        data-scene-item
        data-from-y="0.05"
        data-order={2}
        className="absolute inset-x-0 bottom-[7vh] flex items-center justify-center gap-2 text-sm text-muted"
      >
        <span className="size-1.5 rounded-full bg-accent" />
        <LocalTime timeZone="Africa/Algiers" place={profile.location} />
      </p>
    </>
  );
}
