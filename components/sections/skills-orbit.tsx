"use client";

import type { SkillGroup } from "@/types";
import { skillIcons as icons } from "@/lib/skill-icons";
import RadialOrbitalTimeline, { type TimelineItem } from "@/components/ui/radial-orbital-timeline";

interface SkillsOrbitProps {
  groups: SkillGroup[];
  total: number;
  /** Index into `groups` of the opened area, or null. */
  active: number | null;
  /** Opened area as its index in `groups` plus one, or null when none is open. */
  onActiveChange?: (id: number | null) => void;
}

const RING_RADIUS = 40;
const RING_GAP = 3;

/**
 * Centre of the orbit: a ring split by how many tools each area holds. The
 * opened area's arc is drawn in the accent, the areas it works with at half
 * strength, and the count in the middle switches to that area.
 */
function ToolShareRing({ groups, total, active }: { groups: SkillGroup[]; total: number; active: number | null }) {
  const circumference = 2 * Math.PI * RING_RADIUS;
  const activeGroup = active === null ? null : groups[active];
  const lengths = groups.map((group) => (group.skills.length / total) * circumference);
  const starts = lengths.map((_, index) => lengths.slice(0, index).reduce((sum, length) => sum + length, 0));

  return (
    <div className="relative grid size-28 place-items-center rounded-full bg-surface shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_35%,transparent)] ring-1 ring-line">
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full -rotate-90">
        {groups.map((group, index) => {
          const dash = Math.max(lengths[index] - RING_GAP, 1);
          const state = !activeGroup
            ? "rest"
            : index === active
              ? "active"
              : activeGroup.related.includes(group.category)
                ? "related"
                : "dim";
          return (
            <circle
              key={group.category}
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              strokeWidth={state === "active" ? 7 : 5}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-starts[index]}
              className="orbit-share transition-[stroke,stroke-width,opacity] duration-300"
              data-state={state}
            />
          );
        })}
      </svg>
      <span className="relative flex flex-col items-center leading-none">
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {activeGroup ? activeGroup.skills.length : total}
        </span>
        <span className="mt-1 max-w-[4.5rem] truncate text-[11px] text-muted">
          {activeGroup ? activeGroup.label : "tools"}
        </span>
      </span>
    </div>
  );
}

export function SkillsOrbit({ groups, total, active, onActiveChange }: SkillsOrbitProps) {
  const items: TimelineItem[] = groups.map((group, index) => ({
    id: index + 1,
    title: group.category,
    label: group.label,
    date: `${group.skills.length} ${group.skills.length === 1 ? "tool" : "tools"}`,
    content: group.description,
    category: group.category,
    icon: icons[group.icon],
    tags: group.skills,
    relatedIds: group.related
      .map((name) => groups.findIndex((other) => other.category === name) + 1)
      .filter((id) => id > 0),
  }));

  const activeGroup = active === null ? null : groups[active];

  return (
    <figure className="mt-6">
      {/* The selected area's tools are listed on the shelf beside the orbit, so no card opens here. */}
      <RadialOrbitalTimeline
        timelineData={items}
        relatedLabel="Works with"
        onActiveChange={onActiveChange}
        showCard={false}
        speed={0.12}
        edgeMargin={46}
        className="h-[22rem] sm:h-[24rem]"
        center={<ToolShareRing groups={groups} total={total} active={active} />}
      />
      <figcaption className="mx-auto max-w-xs text-center text-[13px] leading-relaxed text-muted">
        {activeGroup
          ? `Lines link ${activeGroup.label} to the areas it works with. Select it again to clear.`
          : "The inner ring shows each area's share of the tools."}
      </figcaption>
    </figure>
  );
}
