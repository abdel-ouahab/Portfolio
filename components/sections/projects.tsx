import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { ProjectFolder } from "@/components/projects/project-folder";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

export function Projects() {
  return (
    <Section
      id="projects"
     
      title="Projects"
      intro="Business platforms, e-commerce, e-learning, and my Master's research. Open a folder to look inside, or pick a file to read the case study."
    >
      {featuredProjects.length === 0 ? (
        <p className="text-muted">No featured projects yet. Mark a project as featured in data/projects.ts.</p>
      ) : (
        <>
          <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
            {featuredProjects.map((project, index) => (
              <ProjectFolder key={project.slug} project={project} index={index} />
            ))}
          </div>
          <Link href="/projects" className={buttonVariants({ variant: "outline", className: "mt-14" })}>
            See all projects
          </Link>
        </>
      )}
    </Section>
  );
}
