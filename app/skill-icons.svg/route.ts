import { brandSprite } from "@/lib/tool-logos";

// The skills section's brand logos as one SVG sprite, prerendered at build time.
// Pages reference it with a versioned URL, so it can be cached for a long time.
export function GET() {
  return new Response(brandSprite, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
