import { profile } from "@/data/profile";
import { experience, education } from "@/data/experience";
import { moments } from "@/data/moments";
import { Section } from "@/components/ui/section";
import PolaroidLineCarousel from "@/components/ui/polaroid-line-carousel";

export function About() {
  const current = experience.find((item) => item.end === null);
  const latestDegree = education[0];

  const facts = [
    { term: "Based in", detail: profile.location },
    current ? { term: "Currently", detail: `${current.role} at ${current.organization}` } : null,
    latestDegree ? { term: "Education", detail: `${latestDegree.degree}, ${latestDegree.field}` } : null,
  ].filter((fact) => fact !== null);

  return (
    <Section id="about" title="About" intro="Engineer, builder, and former teacher.">
      <div className="max-w-[65ch] space-y-5 text-[17px] leading-[1.7]">
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <dl className="mt-10 grid gap-x-8 gap-y-4 border-y border-line py-6 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.term}>
            <dt className="text-sm text-muted">{fact.term}</dt>
            <dd className="mt-1 text-[15px] font-medium leading-snug">{fact.detail}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-14 text-lg font-semibold">What I focus on</h3>
      <ul className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {profile.focusAreas.map((area) => (
          <li key={area.title} className="border-l-2 border-accent pl-5">
            <p className="font-medium">{area.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">{area.description}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-14 text-lg font-semibold">Along the way</h3>
      <PolaroidLineCarousel
        slides={moments}
        height="clamp(440px, 70vw, 600px)"
        autoplay={6000}
        ariaLabel="Moments from my path"
        className="mt-6 [&_.pl-string]:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      />
    </Section>
  );
}
