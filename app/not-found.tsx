import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-3 text-title font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
        The link may be outdated, or the address may have a typo. Go back to the home page or browse the projects.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonVariants()}>
          Go to home page
        </Link>
        <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
          Browse projects
        </Link>
      </div>
    </div>
  );
}
