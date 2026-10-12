import { cacheLife } from "next/cache";
import { ArrowUp } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/layout/social-links";

async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const year = await getCurrentYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="font-medium">{profile.name}</p>
          <p className="mt-1 text-sm text-muted">
            © {year} {profile.name}. Built with Next.js.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SocialLinks />
          <a
            href="#top"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
          >
            <ArrowUp className="size-4" aria-hidden />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
