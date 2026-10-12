export type AvailabilityStatus = "open" | "limited" | "unavailable";

export interface SocialLink {
  label: string;
  /** `null` hides the link everywhere until a real URL is configured. */
  url: string | null;
}

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  availability: {
    status: AvailabilityStatus;
    label: string;
  };
  cv: {
    href: string;
    /** Set to `true` once `public/documents/cv.pdf` exists. */
    available: boolean;
  };
  socials: {
    github: SocialLink;
    linkedin: SocialLink;
    instagram: SocialLink;
    facebook: SocialLink;
  };
  about: string[];
  focusAreas: { title: string; description: string }[];
}

export type SkillIcon =
  | "languages"
  | "frontend"
  | "backend"
  | "mobile"
  | "databases"
  | "devops"
  | "engineering";

export interface SkillGroup {
  category: string;
  /** Short name for tight spaces such as the skills orbit. */
  label: string;
  icon: SkillIcon;
  description: string;
  skills: string[];
  /** Other categories this area works with. */
  related: string[];
}

export interface Project {
  slug: string;
  title: string;
  /** Fits on a project folder's glass, where long titles are cut off. */
  shortTitle: string;
  kind: string;
  summary: string;
  description: string;
  highlights: string[];
  stack: string[];
  /** Core domain entities, drawn as the project's schema preview. */
  entities: string[];
  featured: boolean;
  /** Optional paths under /public. Leave undefined until real screenshots exist. */
  image?: { src: string; alt: string };
  links: {
    github?: string;
    demo?: string;
  };
}

export interface ExperienceItem {
  role: string;
  organization: string;
  start: string;
  end: string | null;
  points: string[];
}

export interface EducationItem {
  degree: string;
  field: string;
  institution: string;
  start: string;
  end: string;
}
