import { experience, education } from "@/data/experience";
import { Section } from "@/components/ui/section";
import { BentoCard, BentoGrid, BentoPattern } from "@/components/ui/bento";
import { ExperienceStack } from "@/components/sections/experience-stack";
import { cn, formatPeriod } from "@/lib/utils";

/** Rounds the outer corners of a two-column bento; a lone last card spans both columns. */
function bentoCorners(index: number, count: number) {
  const last = index === count - 1;
  const oddTail = count % 2 === 1 && last;
  return cn(
    index === 0 && "max-sm:rounded-t-4xl sm:rounded-tl-4xl",
    index === 1 && "sm:rounded-tr-4xl",
    last && "max-sm:rounded-b-4xl",
    oddTail && "sm:col-span-2 sm:rounded-b-4xl",
    !oddTail && count - index === 2 && "sm:rounded-bl-4xl",
    !oddTail && last && index > 0 && "sm:rounded-br-4xl",
  );
}

export function Experience() {
  return (
    <Section
      id="experience"
      title="Experience"
      intro="Professional development work alongside teaching computer science."
    >
      {experience.length === 0 ? (
        <p className="text-muted">Experience entries will appear here once added to data/experience.ts.</p>
      ) : (
        <ExperienceStack items={experience} />
      )}

      <h3 id="education" className="mt-20 scroll-mt-28 text-xl font-semibold">
        Education
      </h3>
      <BentoGrid className="mt-6 sm:grid-cols-2">
        {education.map((item, index) => (
          <BentoCard
            key={item.degree}
            className={bentoCorners(index, education.length)}
            graphic={<BentoPattern label={item.end.slice(0, 4)} />}
            eyebrow={<time dateTime={item.start}>{formatPeriod(item.start, item.end)}</time>}
            title={item.degree}
            description={
              <div>
                <p className="font-medium text-foreground">{item.institution}</p>
                <p className="mt-2">{item.field}</p>
              </div>
            }
          />
        ))}
      </BentoGrid>
    </Section>
  );
}
