import type { EducationItem, ExperienceItem } from "@/types";

/** Dates use "YYYY-MM" or "YYYY". `end: null` means present. Newest first. */
export const experience: ExperienceItem[] = [
  {
    role: "Full-Stack Developer",
    organization: "Omran Software",
    start: "2026-03",
    end: null,
    points: [
      "Development of web and mobile applications.",
      "React.js, Next.js, Flutter, Node.js, GraphQL, and Prisma.",
      "Software architecture, database modeling, performance optimization, and Docker.",
    ],
  },
  {
    role: "Independent Full-Stack Developer",
    organization: "Self-employed",
    start: "2021",
    end: null,
    points: [
      "End-to-end development of software projects.",
      "Requirements analysis, database design, implementation, and maintenance.",
    ],
  },
  {
    role: "Computer Science Teacher",
    organization: "Daradjat Academy",
    start: "2024-12",
    end: "2026-04",
    points: ["Programming, algorithms, web development, and databases."],
  },
  {
    role: "Part-Time Computer Science Teacher",
    organization: "Hassiba Benbouali University",
    start: "2024-10",
    end: "2025-07",
    points: [
      "Mathematical logic, algorithms, advanced data structures, and object-oriented programming.",
    ],
  },
];

export const education: EducationItem[] = [
  {
    degree: "Master's Degree in Computer Science",
    field: "Advanced Information Systems Engineering",
    institution: "Hassiba Benbouali University",
    start: "2022",
    end: "2024",
  },
  {
    degree: "Bachelor's Degree in Computer Science",
    field: "Computer Systems",
    institution: "Hassiba Benbouali University",
    start: "2019",
    end: "2022",
  },
];
