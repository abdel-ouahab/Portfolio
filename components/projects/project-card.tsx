import Link from "next/link";
import type { Project } from "@/types";
import { ProjectSchemaPreview } from "@/components/projects/project-schema-preview";
import { ProjectLinks } from "@/components/projects/project-links";
import { StackList } from "@/components/projects/stack-list";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  /** "feature" lays the preview beside the text on wide screens. */
  layout?: "feature" | "default";
  headingLevel?: "h3" | "h2";
}

export function ProjectCard({ project, layout = "default", headingLevel: Heading = "h3" }: ProjectCardProps) {
  const feature = layout === "feature";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-colors hover:border-line-strong",
        feature && "md:grid md:grid-cols-12",
      )}
    >
      <ProjectSchemaPreview
        project={project}
        className={cn("border-b border-line", feature && "md:col-span-7 md:border-b-0 md:border-r md:flex md:items-center")}
      />

      <div className={cn("flex flex-1 flex-col p-6", feature && "md:col-span-5 md:p-8")}>
        <p className="text-sm text-muted">{project.kind}</p>
        <Heading className={cn("mt-1.5 font-semibold leading-snug", feature ? "text-2xl" : "text-lg")}>
          <Link
            href={`/projects/${project.slug}`}
            className="transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-accent"
          >
            {project.title}
          </Link>
        </Heading>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{project.summary}</p>

        {feature ? (
          <ul className="mt-5 space-y-1.5 text-[15px]">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2.5">
                <span aria-hidden className="mt-[0.6em] h-px w-2.5 shrink-0 bg-accent" />
                {highlight}
              </li>
            ))}
          </ul>
        ) : null}

        <StackList stack={project.stack} className="mt-auto pt-6" />
        <ProjectLinks project={project} className="mt-4" />
      </div>
    </article>
  );
}
