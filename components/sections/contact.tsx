import { Mail, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { FacebookIcon, GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/sections/contact-form";

export function Contact() {
  const { github, linkedin, instagram, facebook } = profile.socials;

  const details = [
    { label: "Email", value: profile.email, href: `mailto:${profile.email}`, Icon: Mail, external: false },
    { label: "Location", value: profile.location, href: null, Icon: MapPin, external: false },
    linkedin.url
      ? { label: "LinkedIn", value: "abdelouahab-bouheudjeur", href: linkedin.url, Icon: LinkedinIcon, external: true }
      : null,
    github.url
      ? { label: "GitHub", value: github.url.replace(/^https?:\/\/(www\.)?/, ""), href: github.url, Icon: GithubIcon, external: true }
      : null,
    instagram.url
      ? { label: "Instagram", value: "@__wahaab", href: instagram.url, Icon: InstagramIcon, external: true }
      : null,
    facebook.url
      ? { label: "Facebook", value: "abdelouahab.bouheudjeur", href: facebook.url, Icon: FacebookIcon, external: true }
      : null,
  ].filter((detail) => detail !== null);

  return (
    <Section
      id="contact"
     
      title="Contact"
      intro="Have a project, a role, or a question about a system you're building? Send a message and I'll get back to you."
    >
      <div className="space-y-12">
        <ul className="flex flex-wrap gap-x-12 gap-y-5">
          {details.map(({ label, value, href, Icon, external }) => (
            <li key={label} className="flex gap-3">
              <Icon className="mt-0.5 size-[18px] shrink-0 text-muted" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm text-muted">{label}</p>
                {href ? (
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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

        <ContactForm email={profile.email} />
      </div>
    </Section>
  );
}
