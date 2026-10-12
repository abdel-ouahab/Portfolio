import { Download, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { buttonVariants, type ButtonVariantProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Downloads the CV when `profile.cv.available` is true. Until the PDF is added,
 * it falls back to an email request so the button never points at a 404.
 */
export function CvLink({ className, variant = "outline", size }: ButtonVariantProps & { className?: string }) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (profile.cv.available) {
    return (
      <a href={profile.cv.href} download className={classes}>
        <Download aria-hidden />
        Download CV
      </a>
    );
  }

  return (
    <a
      href={`mailto:${profile.email}?subject=${encodeURIComponent("CV request")}`}
      className={classes}
      title="The CV file isn't published yet. This opens an email request instead."
    >
      <Mail aria-hidden />
      Request CV
    </a>
  );
}
