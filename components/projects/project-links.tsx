import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types";
import { GithubIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

/** External links for a project. Renders nothing when none are configured. */
export function ProjectLinks({ project, className }: { project: Project; className?: string }) {
  const { github, demo } = project.links;
  if (!github && !demo) return null;

  const linkClass =
    "relative z-10 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

  return (
    <div className={cn("flex flex-wrap gap-5", className)}>
      {github ? (
        <a href={github} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <GithubIcon className="size-4" />
          Source code
        </a>
      ) : null}
      {demo ? (
        <a href={demo} target="_blank" rel="noopener noreferrer" className={linkClass}>
          <ArrowUpRight className="size-4" aria-hidden />
          Live demo
        </a>
      ) : null}
    </div>
  );
}
