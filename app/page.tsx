import { Suspense } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { skillCount, skillGroups } from "@/data/skills";
import { featuredProjects } from "@/data/projects";
import { experience } from "@/data/experience";
import { LinkedinIcon } from "@/components/ui/brand-icons";
import { CinematicReveal, MagneticButton, revealPillClass } from "@/components/ui/motion-footer";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Skills } from "@/components/sections/skills";
import { Projects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";
import {
  AboutScene,
  ContactScene,
  ExperienceScene,
  ProjectsScene,
  SkillsScene,
} from "@/components/sections/reveal-scenes";

export default function Home() {
  const linkedin = profile.socials.linkedin.url;

  return (
    <>
      <Hero />

      {/* Each boundary hydrates on its own, in small slices after the hero,
          instead of the whole page hydrating in one long task */}
      <Suspense>
        <CinematicReveal
          word="ABOUT"
          scene={<AboutScene />}
          heading="Engineer, builder, and former teacher."
          marquee={profile.focusAreas.map((area) => area.title)}
        />
        <About />
      </Suspense>

      <Suspense>
        <CinematicReveal
          word="SKILLS"
          scene={<SkillsScene />}
          heading={`${skillCount} tools across ${skillGroups.length} areas.`}
          marquee={skillGroups.flatMap((group) => group.skills)}
        />
        <Skills />
      </Suspense>

      <Suspense>
        <CinematicReveal
          word="PROJECTS"
          scene={<ProjectsScene />}
          heading="Business platforms, e-commerce, e-learning."
          marquee={featuredProjects.map((project) => project.title)}
        >
          <MagneticButton as="a" href="/projects" className={revealPillClass}>
            See all projects
            <ArrowUpRight className="size-[18px] text-muted" aria-hidden />
          </MagneticButton>
        </CinematicReveal>
        <Projects />
      </Suspense>

      <Suspense>
        <CinematicReveal
          word="EXPERIENCE"
          scene={<ExperienceScene />}
          heading="Building software, and teaching it."
          marquee={experience.map((item) => `${item.role} · ${item.organization}`)}
        />
        <Experience />
      </Suspense>

      <Suspense>
        <CinematicReveal
          word="CONTACT"
          scene={<ContactScene />}
          heading="Have a project in mind?"
          marquee={[profile.availability.label, profile.location, "Web", "Mobile", "APIs", "Databases"]}
        >
          <MagneticButton as="a" href={`mailto:${profile.email}`} className={revealPillClass}>
            <Mail className="size-[18px] text-muted" aria-hidden />
            Email me
          </MagneticButton>
          {linkedin ? (
            <MagneticButton as="a" href={linkedin} target="_blank" rel="noopener noreferrer" className={revealPillClass}>
              <LinkedinIcon className="size-[18px] text-muted" />
              LinkedIn
              <span className="sr-only">(opens in a new tab)</span>
            </MagneticButton>
          ) : null}
        </CinematicReveal>
        <Contact />
      </Suspense>
    </>
  );
}
