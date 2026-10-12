import type { Profile } from "@/types";

export const profile: Profile = {
  name: "Abdelouahab Bouheudjeur",
  shortName: "Abdelouahab",
  role: "Software Engineer | Full-Stack Developer",
  headline: "Building reliable digital products from idea to production.",
  summary:
    "I design and develop scalable web and mobile applications, robust APIs, and database-driven systems using modern technologies.",
  location: "Chlef, Algeria",
  email: "bouheudjeur.abdelouahab@gmail.com",
  availability: {
    // "open" | "limited" | "unavailable"
    status: "open",
    label: "Open to freelance projects",
  },
  cv: {
    href: "/documents/cv.pdf",
    // Flip to true after adding public/documents/cv.pdf.
    available: true,
  },
  socials: {
    github: { label: "GitHub", url: "https://github.com/abdel-ouahab" },
    linkedin: {
      label: "LinkedIn",
      url: "https://linkedin.com/in/abdelouahab-bouheudjeur",
    },
    instagram: { label: "Instagram", url: "https://www.instagram.com/__wahaab/" },
    facebook: {
      label: "Facebook",
      url: "https://www.facebook.com/abdelouahab.bouheudjeur",
    },
  },
  about: [
    "I'm a software engineer with a Master's degree in Advanced Information Systems Engineering. I build full-stack web platforms and mobile applications, usually starting from the data model and working outward to the API and the interface.",
    "Most of my projects are business systems: inventory, sales, e-commerce, clinic management. The work that matters there is rarely flashy. It's getting the schema right, keeping access rules strict, and making sure the system is still easy to change a year later.",
    "I've also taught computer science at university and academy level, covering algorithms, data structures, databases, and object-oriented programming. Explaining these ideas to students keeps my own fundamentals sharp.",
  ],
  focusAreas: [
    {
      title: "Architecture and clean code",
      description:
        "Clear module boundaries, typed interfaces, and code that the next developer can read without a guide.",
    },
    {
      title: "Problem solving",
      description:
        "Algorithmic thinking applied to real constraints: what to compute, what to store, and what to leave out.",
    },
    {
      title: "Data modeling and APIs",
      description:
        "Relational schemas, REST and GraphQL APIs, and ORMs like Prisma, designed together rather than one after the other.",
    },
    {
      title: "Performance, maintainability, security",
      description:
        "Authentication, role-based access control, query performance, and containerized deployments with Docker.",
    },
  ],
};
