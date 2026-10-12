import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { projects } from "@/data/projects";
import { ProjectFolder } from "@/components/projects/project-folder";

export const metadata: Metadata = {
  title: "Projects",
  description: "Web platforms, e-commerce, e-learning, and cloud computing research by Abdelouahab Bouheudjeur.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <Link
        href="/#projects"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to home
      </Link>

      <header className="mt-8 max-w-2xl">
        <h1 className="text-title font-semibold">Projects</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Systems I&apos;ve designed and built, from retail and clinic management to cloud research. Open a
          folder to look inside, or pick a file to read the case study.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-line-strong p-10 text-center text-muted">
          No projects published yet. Add entries to data/projects.ts to list them here.
        </p>
      ) : (
        <div className="mt-16 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectFolder key={project.slug} project={project} index={index} headingLevel="h2" />
          ))}
        </div>
      )}
    </div>
  );
}
