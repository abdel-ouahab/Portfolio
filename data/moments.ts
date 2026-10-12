import type { Slide } from "@/components/ui/polaroid-line-carousel";

/**
 * Prints on the About section's polaroid line, oldest first.
 * Photos live in public/images/moments/ as 800px square WebP.
 * A slide without `image` shows a painted landscape (`palette` + `seed`).
 */
export const moments: Slide[] = [
  {
    title: "Chlef",
    caption: "Home base. Most of my work starts here.",
    image: "/images/moments/storefront.webp",
    alt: "An ivy-covered shopfront with a cream awning and potted plants",
  },
  {
    title: "Bachelor's",
    caption: "Computer Systems, Hassiba Benbouali University, 2019–2022.",
    image: "/images/moments/cap-toss.webp",
    alt: "A graduate in a gown tossing a cap into the air outside a university building",
  },
  {
    title: "Freelance",
    caption: "Building business systems end to end since 2021.",
    image: "/images/moments/desk.webp",
    alt: "A bright desk with a monitor, a laptop showing code, and a keyboard",
  },
  {
    title: "Master's",
    caption: "Advanced Information Systems Engineering, 2022–2024.",
    image: "/images/moments/graduation.webp",
    alt: "A hand raising a graduation cap in front of a university building",
  },
  {
    title: "Teaching",
    caption: "Algorithms, data structures and OOP, at university and academy level.",
    image: "/images/moments/classroom.webp",
    alt: "Students at their desks listening to a teacher at the front of a classroom",
  },
  {
    title: "Omran Software",
    caption: "Full-stack developer since March 2026.",
    image: "/images/moments/omran-logo.webp",
    alt: "Omran Software logo",
  },
];
