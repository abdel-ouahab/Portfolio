import type { ReactNode } from "react";
import * as simpleIcons from "simple-icons";
import {
  ArrowLeftRight,
  Binary,
  Boxes,
  Cloud,
  Database,
  KeyRound,
  Layers,
  Network,
  ServerCog,
  ShieldCheck,
  Shapes,
  UsersRound,
} from "lucide-react";

/*
 * Logos for the tools in data/skills.ts. Brand marks come from Simple Icons
 * (CC0); ideas without a brand get a Lucide icon. Imported only from Server
 * Components, so the icon set never reaches the client bundle. The brand marks
 * themselves live in one cached sprite (app/skill-icons.svg), so the page only
 * carries a short <use> reference per logo instead of every path, twice (in
 * the HTML and again in the payload React hydrates from).
 */

/** Skill name → Simple Icons slug. */
const brandSlugs: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  Java: "openjdk",
  Python: "python",
  C: "c",
  "C++": "cplusplus",
  PHP: "php",
  "React.js": "react",
  "Next.js": "nextdotjs",
  HTML: "html5",
  CSS: "css",
  "Tailwind CSS": "tailwindcss",
  "Node.js": "nodedotjs",
  "Express.js": "express",
  Laravel: "laravel",
  GraphQL: "graphql",
  Flutter: "flutter",
  Dart: "dart",
  PostgreSQL: "postgresql",
  MySQL: "mysql",
  MongoDB: "mongodb",
  "Prisma ORM": "prisma",
  Linux: "linux",
  Docker: "docker",
  "Docker Compose": "docker",
  Git: "git",
  GitHub: "github",
};

const genericIcons: Record<string, React.ElementType> = {
  SQL: Database,
  Oracle: Database,
  "REST APIs": ArrowLeftRight,
  "Cloud computing": Cloud,
  Virtualization: ServerCog,
  "System design": Network,
  "Software architecture": Layers,
  Authentication: KeyRound,
  Authorization: ShieldCheck,
  "Role-based access control": UsersRound,
  "Data structures": Boxes,
  Algorithms: Binary,
  "Object-oriented programming": Shapes,
};

type SimpleIcon = { slug: string; hex: string; path: string };

const iconsBySlug = new Map(
  Object.values(simpleIcons as unknown as Record<string, SimpleIcon>)
    .filter((icon) => typeof icon === "object" && icon !== null && "slug" in icon)
    .map((icon) => [icon.slug, icon]),
);

const usedIcons = [...new Set(Object.values(brandSlugs))]
  .map((slug) => iconsBySlug.get(slug))
  .filter((icon): icon is SimpleIcon => icon !== undefined);

/** Every brand mark the skills use, as <symbol>s keyed by slug. */
export const brandSprite =
  `<svg xmlns="http://www.w3.org/2000/svg">` +
  usedIcons.map((icon) => `<symbol id="${icon.slug}" viewBox="0 0 24 24"><path d="${icon.path}"/></symbol>`).join("") +
  `</svg>`;

// Changes whenever the sprite does, so a cached copy is never stale
let hash = 0;
for (let i = 0; i < brandSprite.length; i++) hash = (Math.imul(hash, 31) + brandSprite.charCodeAt(i)) | 0;
const spriteUrl = `/skill-icons.svg?v=${(hash >>> 0).toString(36)}`;

/** Relative luminance of a hex color, 0 (black) to 1 (white). */
function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export interface ToolLogo {
  logo: ReactNode;
  /** Brand color, or undefined for near-black marks that should follow the text color. */
  brand?: string;
}

export function toolLogo(name: string): ToolLogo {
  const icon = brandSlugs[name] ? iconsBySlug.get(brandSlugs[name]) : undefined;
  if (icon) {
    return {
      logo: (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-full">
          <use href={`${spriteUrl}#${icon.slug}`} />
        </svg>
      ),
      brand: luminance(icon.hex) > 0.05 ? `#${icon.hex}` : undefined,
    };
  }

  const Icon = genericIcons[name] ?? Shapes;
  return { logo: <Icon aria-hidden className="size-full" strokeWidth={1.75} /> };
}
