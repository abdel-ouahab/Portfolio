"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { SkillGroup } from "@/types";
import { skillIcons } from "@/lib/skill-icons";
import { SkillsOrbit } from "@/components/sections/skills-orbit";

export interface ShelfTool {
  name: string;
  logo: ReactNode;
  brand?: string;
}

/*
 * The orbit (in the section's side rail) and the tool shelf (in its body) share
 * one selection: opening an area on the orbit lights up its tools on the shelf
 * and the areas it works with.
 */
interface Selection {
  groups: SkillGroup[];
  active: number | null;
  setActive: (index: number | null) => void;
}

const SelectionContext = createContext<Selection | null>(null);

function useSelection() {
  const selection = useContext(SelectionContext);
  if (!selection) throw new Error("Skills components must be inside <SkillsSelection>.");
  return selection;
}

export function SkillsSelection({ groups, children }: { groups: SkillGroup[]; children: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  return <SelectionContext.Provider value={{ groups, active, setActive }}>{children}</SelectionContext.Provider>;
}

export function SkillsOrbitPanel({ total }: { total: number }) {
  const { groups, active, setActive } = useSelection();
  return (
    <SkillsOrbit
      groups={groups}
      total={total}
      active={active}
      onActiveChange={(id) => setActive(id === null ? null : id - 1)}
    />
  );
}

export function SkillsShelf({ tools }: { /** Tools per group, in group order. */ tools: ShelfTool[][] }) {
  const { groups, active } = useSelection();
  const shelfRef = useRef<HTMLDivElement>(null);
  // "idle" until hydrated (so tiles are visible without JS), "waiting" while
  // off-screen, "entering" for the one-time cascade, then "settled".
  const [entrance, setEntrance] = useState<"idle" | "waiting" | "entering" | "settled">("idle");

  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setEntrance("entering");
          timer = window.setTimeout(() => setEntrance("settled"), 1600);
        } else {
          setEntrance((state) => (state === "idle" ? "waiting" : state));
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(shelf);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  const activeGroup = active === null ? null : groups[active];

  const rowState = (group: SkillGroup) => {
    if (!activeGroup) return "rest";
    if (group === activeGroup) return "active";
    return activeGroup.related.includes(group.category) ? "related" : "dim";
  };

  let tileIndex = 0;

  return (
    <div ref={shelfRef} data-entrance={entrance} className="skill-shelf border-b border-line">
      <p aria-live="polite" className="pb-4 text-sm text-muted">
        {activeGroup
          ? `${activeGroup.category}: ${activeGroup.skills.length} tools. Highlighted areas work alongside it.`
          : "Every tool, grouped by area."}
      </p>

      {groups.map((group, groupIndex) => {
        const Icon = skillIcons[group.icon];
        return (
          <section
            key={group.category}
            aria-labelledby={`shelf-${group.icon}`}
            data-state={rowState(group)}
            className="shelf-row grid gap-3 border-t border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6"
          >
            <div>
              <h3 id={`shelf-${group.icon}`} className="shelf-heading flex items-center gap-2 font-medium">
                <Icon aria-hidden className="size-4 shrink-0" />
                {group.category}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{group.description}</p>
            </div>

            <ul className="flex flex-wrap content-start gap-2" aria-label={`${group.category} tools`}>
              {tools[groupIndex].map((tool) => (
                <li
                  key={tool.name}
                  className="tool-tile flex items-center gap-2.5 rounded-lg border border-line bg-surface py-1.5 pl-1.5 pr-3 text-sm"
                  style={{ "--i": tileIndex++, "--brand": tool.brand } as CSSProperties}
                >
                  <span className="tool-logo grid size-8 shrink-0 place-items-center rounded-md p-1.5">
                    {tool.logo}
                  </span>
                  {tool.name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
