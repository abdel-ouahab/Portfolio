"use client";

import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/types";
import GlassFolder, { type ArtPreset, type FolderFile, type FolderMenuItem } from "@/components/ui/glass-folder-cards";
import { StackList } from "@/components/projects/stack-list";
import { cn } from "@/lib/utils";

const ART: ArtPreset[] = ["aurora", "ember", "dusk", "verdant", "glacier"];
const MAX_WIDTH = 340;

/** Follows the `.dark` class the theme toggle sets on <html>. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function useDarkTheme() {
  return useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

/** The folder is drawn at a fixed pixel width, so shrink it to fit narrow columns. */
function useFolderWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(MAX_WIDTH);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Steps of 10px keep the generated artwork from repainting on every resize frame.
    const measure = () => setWidth(Math.min(MAX_WIDTH, Math.floor(el.clientWidth / 10) * 10));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

interface ProjectFolderProps {
  project: Project;
  /** Position in the grid: picks the artwork and staggers the entrance. */
  index: number;
  headingLevel?: "h3" | "h2";
  className?: string;
}

export function ProjectFolder({ project, index, headingLevel: Heading = "h3", className }: ProjectFolderProps) {
  const router = useRouter();
  const dark = useDarkTheme();
  const [ref, width] = useFolderWidth();
  const href = `/projects/${project.slug}`;

  // Highlights sit behind; the case study is the front sheet, nearest the glass.
  const files: FolderFile[] = [
    ...project.highlights.slice(0, 3).map((highlight) => ({ name: highlight })),
    { name: "Case study", meta: `${project.stack.length} tools`, art: ART[(index + 2) % ART.length] },
  ];

  const menu: FolderMenuItem[] = [
    { label: "View case study", onSelect: () => router.push(href) },
    ...(project.links.github
      ? [{ label: "Source on GitHub", onSelect: () => window.open(project.links.github, "_blank", "noopener") }]
      : []),
    ...(project.links.demo
      ? [{ label: "Live demo", onSelect: () => window.open(project.links.demo, "_blank", "noopener") }]
      : []),
  ];

  return (
    <article className={cn("flex w-full flex-col items-center", className)}>
      <div ref={ref} className="flex w-full justify-center">
        <GlassFolder
          label={project.shortTitle}
          meta={project.kind}
          tone={dark ? "dark" : "light"}
          art={ART[index % ART.length]}
          seed={index * 7 + 3}
          files={files}
          action="more"
          menu={menu}
          onFileSelect={() => router.push(href)}
          width={width}
          appearDelay={(index % 2) * 140}
          style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}
        />
      </div>

      <div className="mt-5 w-full" style={{ maxWidth: width }}>
        <Heading className="font-semibold leading-snug">
          <Link href={href} className="transition-colors hover:text-accent">
            {project.title}
          </Link>
        </Heading>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{project.summary}</p>
        <StackList stack={project.stack} className="mt-3" />
      </div>
    </article>
  );
}
