# Abdelouahab Bouheudjeur — Portfolio

Personal portfolio for a software engineer and full-stack developer. Built with Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS v4, Motion, and Lucide icons.

## Getting started

Requirements: Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the development server         |
| `npm run build`     | Create a production build            |
| `npm run start`     | Serve the production build           |
| `npm run lint`      | Run ESLint                           |
| `npx tsc --noEmit`  | Type-check (run after a build once, so route types exist) |

## Environment variables

| Variable                            | Required | Purpose |
| ----------------------------------- | -------- | ------- |
| `NEXT_PUBLIC_SITE_URL`              | Yes in production | Canonical URL used for metadata, Open Graph, `sitemap.xml`, and `robots.txt`. |
| `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` | No       | A form backend that accepts a JSON POST (for example Formspree). Without it, the contact form opens the visitor's email app with the message filled in. |

## Editing content

All content lives in `data/`, separate from the UI:

- `data/profile.ts`: name, headline, about text, email, location, availability status, social links, and CV settings.
- `data/skills.ts`: skill groups.
- `data/projects.ts`: projects, including the `entities` drawn as each project's schema preview.
- `data/experience.ts`: work history and education.

Things to fill in before launch:

1. **Social links**: set `socials.*.url` (GitHub, LinkedIn, Instagram, Facebook) in `data/profile.ts`. A link stays hidden while its URL is `null`.
2. **CV**: add `public/documents/cv.pdf`, then set `cv.available: true`. Until then, CV buttons read "Request CV" and open an email.
3. **Project links**: add `links.github` or `links.demo` per project. Projects without links show a note instead of dead buttons.
4. **Screenshots** (optional): add an image under `public/images/` and set `image: { src, alt }` on a project. It replaces the schema preview.
5. **Hero band**: the curved row under the hero (`components/ui/tilted-grid-hero.tsx`) shows tiles generated from your projects and skills in `lib/hero-tiles.ts`. To show real screenshots instead, pass an array of `{ src, alt }` images to `HeroBand` in `components/sections/hero.tsx`.
6. **Availability**: `availability.status` is `"open"`, `"limited"`, or `"unavailable"`, with a free-text `label`.

## Structure

```
app/                  Routes, metadata, sitemap, robots, icon, Open Graph image
  projects/           Project list and [slug] detail pages
components/
  layout/             Header, mobile nav, footer, social links
  sections/           Home page sections and the hero schema diagram
  projects/           Project card, schema preview, stack list, links
  theme/              No-flash theme script and theme toggle
  ui/                 Button, section shell, brand icons, CV link
data/                 Site content
lib/utils.ts          cn(), date formatting, site URL
types/index.ts        Shared types
```

Components are Server Components by default. Only the theme toggle, mobile navigation, and contact form run on the client.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new). The framework is detected automatically.
3. Add `NEXT_PUBLIC_SITE_URL` (and optionally `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`) under Project Settings → Environment Variables.
4. Deploy. Redeploy after changing environment variables, since `NEXT_PUBLIC_*` values are inlined at build time.
