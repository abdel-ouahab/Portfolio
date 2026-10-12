import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { heroThemes, heroTileCount, heroTileSvg } from "@/lib/hero-tiles";

// The hero band's tile images, prerendered at build time.
export function generateStaticParams() {
  const count = heroTileCount(projects, skillGroups);
  return heroThemes.flatMap((theme) =>
    Array.from({ length: count }, (_, index) => ({ theme, index: String(index) })),
  );
}

export async function GET(_request: Request, { params }: RouteContext<"/hero-tiles/[theme]/[index]">) {
  const { theme, index } = await params;
  const svg =
    theme === "light" || theme === "dark" ? heroTileSvg(projects, skillGroups, theme, Number(index)) : undefined;
  if (!svg) return new Response("Not found", { status: 404 });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
