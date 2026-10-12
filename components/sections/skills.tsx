import { skillCount, skillGroups } from "@/data/skills";
import { toolLogo } from "@/lib/tool-logos";
import { Section } from "@/components/ui/section";
import { SkillsOrbitPanel, SkillsSelection, SkillsShelf } from "@/components/sections/skills-explorer";

export function Skills() {
  // Logos are resolved here, on the server, so the icon set stays out of the client bundle.
  const tools = skillGroups.map((group) => group.skills.map((name) => ({ name, ...toolLogo(name) })));

  return (
    <SkillsSelection groups={skillGroups}>
      <Section
        id="skills"
        title="Skills"
        intro={`${skillGroups.length} areas, ${skillCount} tools. Select an area on the orbit to highlight its tools and the areas it works with.`}
        aside={<SkillsOrbitPanel total={skillCount} />}
      >
        <SkillsShelf tools={tools} />
      </Section>
    </SkillsSelection>
  );
}
