import type { SkillGroup } from "@/types";

/**
 * `label` is the short name shown on the orbit, `icon` picks the node's icon,
 * and `related` lists the categories each area works with (shown as links in
 * its card). Related entries must match another group's `category`.
 */
export const skillGroups: SkillGroup[] = [
  {
    category: "Languages",
    label: "Languages",
    icon: "languages",
    description: "Typed and untyped, systems to scripting.",
    skills: ["JavaScript", "TypeScript", "Java", "Python", "C", "C++", "PHP", "SQL"],
    related: ["Frontend", "Backend", "Mobile"],
  },
  {
    category: "Frontend",
    label: "Frontend",
    icon: "frontend",
    description: "Interfaces for dashboards, stores, and admin tools.",
    skills: ["React.js", "Next.js", "HTML", "CSS", "Tailwind CSS"],
    related: ["Languages", "Backend"],
  },
  {
    category: "Backend",
    label: "Backend",
    icon: "backend",
    description: "APIs and server logic.",
    skills: ["Node.js", "Express.js", "Laravel", "REST APIs", "GraphQL"],
    related: ["Frontend", "Databases", "DevOps and infrastructure"],
  },
  {
    category: "Mobile",
    label: "Mobile",
    icon: "mobile",
    description: "Cross-platform apps from one codebase.",
    skills: ["Flutter", "Dart"],
    related: ["Languages", "Backend"],
  },
  {
    category: "Databases",
    label: "Databases",
    icon: "databases",
    description: "Relational first, document stores where they fit.",
    skills: ["PostgreSQL", "MySQL", "Oracle", "MongoDB", "Prisma ORM"],
    related: ["Backend", "Software engineering"],
  },
  {
    category: "DevOps and infrastructure",
    label: "DevOps",
    icon: "devops",
    description: "From a local container to a running server.",
    skills: [
      "Linux",
      "Docker",
      "Docker Compose",
      "Git",
      "GitHub",
      "Cloud computing",
      "Virtualization",
    ],
    related: ["Backend", "Software engineering"],
  },
  {
    category: "Software engineering",
    label: "Engineering",
    icon: "engineering",
    description: "The fundamentals underneath every project.",
    skills: [
      "System design",
      "Software architecture",
      "Authentication",
      "Authorization",
      "Role-based access control",
      "Data structures",
      "Algorithms",
      "Object-oriented programming",
    ],
    related: ["Backend", "Databases", "DevOps and infrastructure"],
  },
];

export const skillCount = skillGroups.reduce((total, group) => total + group.skills.length, 0);
