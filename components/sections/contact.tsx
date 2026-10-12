import { Mail, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { LogoLoop, type LogoItem } from "@/components/ui/logo-loop";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/sections/contact-form";

export function Contact() {
  const { github, linkedin, instagram, facebook } = profile.socials;

  const details = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}`, Icon: Mail },
    { label: "Location", value: profile.location, href: null, Icon: MapPin },
  ];

  const socials = [
    linkedin.url ? { label: "LinkedIn", handle: "abdelouahab-bouheudjeur", href: linkedin.url, Icon: LinkedinIcon } : null,
    github.url
      ? { label: "GitHub", handle: github.url.replace(/^https?:\/\/(www\.)?/, ""), href: github.url, Icon: GithubIcon }
      : null,
    instagram.url ? { label: "Instagram", handle: "@__wahaab", href: instagram.url, Icon: InstagramIcon } : null,
    facebook.url ? { label: "Facebook", handle: "abdelouahab.bouheudjeur", href: facebook.url, Icon: FacebookIcon } : null,
  ].filter((social) => social !== null);

  // Each profile as a chip in the loop; the loop wraps it in the link
  const socialLogos: LogoItem[] = socials.map(({ label, handle, href, Icon }) => ({
    href,
    ariaLabel: `${label}: ${handle} (opens in a new tab)`,
    node: (
      <span className="group flex items-center gap-3 rounded-full border border-line bg-surface py-2.5 pl-3.5 pr-5 transition-colors hover:border-accent">
        <Icon className="size-[18px] shrink-0 text-muted transition-colors group-hover:text-accent" />
        <span className="text-left">
          <span className="block text-xs text-muted">{label}</span>
          <span className="block text-[15px] font-medium text-foreground transition-colors group-hover:text-accent">
            {handle}
          </span>
        </span>
      </span>
    ),
  }));

  return (
    <Section
      id="contact"
      title="Contact"
      intro="Have a project, a role, or a question about a system you're building? Send a message and I'll get back to you."
    >
      <div className="space-y-12">
        <ul className="flex flex-wrap gap-x-12 gap-y-5">
          {details.map(({ label, value, href, Icon }) => (
            <li key={label} className="flex gap-3">
              <Icon className="mt-0.5 size-[18px] shrink-0 text-muted" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm text-muted">{label}</p>
                {href ? (
                  <a
                    href={href}
                    className="break-words text-[15px] font-medium underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                  >
                    {value}
                  </a>
                ) : (
                  <p className="text-[15px] font-medium">{value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {socialLogos.length > 0 ? (
          <LogoLoop
            logos={socialLogos}
            speed={40}
            hoverSpeed={0}
            gap={16}
            logoHeight={16}
            fadeOut
            ariaLabel="Social profiles"
          />
        ) : null}

        <ContactForm email={profile.email} />
      </div>
    </Section>
  );
}
