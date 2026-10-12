import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProject, projects } from "@/data/projects";
import { ProjectSchemaPreview } from "@/components/projects/project-schema-preview";
import { ProjectLinks } from "@/components/projects/project-links";
import { StackList } from "@/components/projects/stack-list";
import { buttonVariants } from "@/components/ui/button";

// Project pages are fully static. Unknown slugs render completely before
// responding, so notFound() returns a real 404 instead of a streamed 200.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: project.title, description: project.summary, url: `/projects/${project.slug}` },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((item) => item.slug === project.slug);
  const next = projects[(index + 1) % projects.length];
  const hasLinks = Boolean(project.links.github || project.links.demo);

  return (
    <article className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        All projects
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="text-muted">{project.kind}</p>
        <h1 className="mt-2 text-title font-semibold text-balance">{project.title}</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">{project.summary}</p>
      </header>

      <ProjectSchemaPreview project={project} className="mt-12 rounded-xl border border-line" />

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="mt-4 max-w-[65ch] text-[17px] leading-[1.7]">{project.description}</p>

          <h2 className="mt-12 text-xl font-semibold">Scope</h2>
          <ul className="mt-4 space-y-2.5 text-[17px]">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3">
                <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
          <div>
            <h2 className="text-sm font-medium text-muted">Technologies</h2>
            <StackList stack={project.stack} className="mt-3 text-[15px] text-foreground" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted">Core entities</h2>
            <p className="mt-3 font-mono text-sm">{project.entities.join(", ")}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted">Links</h2>
            {hasLinks ? (
              <ProjectLinks project={project} className="mt-3" />
            ) : (
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                The repository and live demo aren&apos;t public yet.{" "}
                <Link href="/#contact" className="text-foreground underline underline-offset-4 hover:text-accent">
                  Ask about this project
                </Link>{" "}
                for a walkthrough.
              </p>
            )}
          </div>
        </aside>
      </div>

      {next && next.slug !== project.slug ? (
        <nav aria-label="Next project" className="mt-20 border-t border-line pt-8">
          <p className="text-sm text-muted">Next project</p>
          <Link
            href={`/projects/${next.slug}`}
            className="mt-2 inline-block text-2xl font-semibold transition-colors hover:text-accent"
          >
            {next.title}
          </Link>
        </nav>
      ) : null}

      <div className="mt-12">
        <Link href="/#contact" className={buttonVariants()}>
          Discuss a similar project
        </Link>
      </div>
    </article>
  );
}
