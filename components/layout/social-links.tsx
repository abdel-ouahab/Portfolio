import { profile } from "@/data/profile";
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { cn } from "@/lib/utils";

const icons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
} as const;

/** Renders only the social profiles that have a configured URL. */
export function SocialLinks({ className }: { className?: string }) {
  const entries = (Object.keys(profile.socials) as (keyof typeof profile.socials)[])
    .map((key) => ({ key, ...profile.socials[key], Icon: icons[key] }))
    .filter((entry): entry is typeof entry & { url: string } => entry.url !== null);

  if (entries.length === 0) return null;

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {entries.map(({ key, label, url, Icon }) => (
        <li key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
          >
            <Icon className="size-[18px]" />
            <span className="sr-only">{label} (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
