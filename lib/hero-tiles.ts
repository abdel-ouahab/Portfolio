import type { Project, SkillGroup } from "@/types";
import type { TiltedGridImage } from "@/components/ui/tilted-grid-hero";

/**
 * Builds the hero band's tiles as inline SVG images, drawn from the site's own
 * data: each project as a card with its core entities, alternating with skill
 * groups. Images inside <img> can't read CSS variables, so each theme gets
 * its own palette.
 */

const W = 640;
const H = 360;
const SANS = "Segoe UI, system-ui, -apple-system, Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Consolas, Menlo, monospace";

interface Palette {
  bg: string;
  header: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  line: string;
  box: string;
}

const palettes: Record<"light" | "dark", Palette> = {
  light: {
    bg: "#ffffff",
    header: "#e9ebe6",
    border: "#d6d9d3",
    text: "#14171c",
    muted: "#545b64",
    accent: "#0c6478",
    line: "#b9beb6",
    box: "#f3f4f1",
  },
  dark: {
    bg: "#171c21",
    header: "#0c0f12",
    border: "#2a3138",
    text: "#e4e7e2",
    muted: "#98a1aa",
    accent: "#5db8cc",
    line: "#3d4650",
    box: "#101418",
  },
};

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function frame(p: Palette, label: string, title: string, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="${p.bg}"/>
<rect width="${W}" height="48" fill="${p.header}"/>
<line x1="0" x2="${W}" y1="48" y2="48" stroke="${p.border}"/>
<text x="28" y="30" font-family="${MONO}" font-size="15" fill="${p.muted}">${escapeXml(label)}</text>
<text x="28" y="94" font-family="${SANS}" font-size="27" font-weight="600" fill="${p.text}">${escapeXml(title)}</text>
${body}
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${p.border}"/>
</svg>`;
}

function projectTile(project: Project, p: Palette): TiltedGridImage {
  const entities = project.entities.slice(0, 6);
  const cols = entities.length <= 4 ? 2 : 3;
  const rows = Math.ceil(entities.length / cols);
  const boxW = 158;
  const boxH = 42;
  const rowGap = 30;
  const gapX = (W - cols * boxW) / (cols + 1);
  const top = 128;
  const area = 170;
  const startY = top + (area - (rows * boxH + (rows - 1) * rowGap)) / 2;

  const boxes = entities.map((name, i) => ({
    name,
    col: i % cols,
    row: Math.floor(i / cols),
    x: gapX + (i % cols) * (boxW + gapX),
    y: startY + Math.floor(i / cols) * (boxH + rowGap),
  }));

  const links = boxes
    .flatMap((box) => {
      const right = boxes.find((o) => o.row === box.row && o.col === box.col + 1);
      const below = boxes.find((o) => o.col === box.col && o.row === box.row + 1);
      const out: string[] = [];
      if (right)
        out.push(`<line x1="${box.x + boxW}" x2="${right.x}" y1="${box.y + boxH / 2}" y2="${right.y + boxH / 2}"/>`);
      if (below && box.col === 0)
        out.push(`<line x1="${box.x + boxW / 2}" x2="${below.x + boxW / 2}" y1="${box.y + boxH}" y2="${below.y}"/>`);
      return out;
    })
    .join("");

  const shapes = boxes
    .map(
      (box, i) =>
        `<rect x="${box.x}" y="${box.y}" width="${boxW}" height="${boxH}" rx="7" fill="${p.box}" stroke="${i === 0 ? p.accent : p.line}" stroke-width="${i === 0 ? 1.6 : 1}"/>` +
        `<text x="${box.x + boxW / 2}" y="${box.y + boxH / 2 + 5}" text-anchor="middle" font-family="${MONO}" font-size="15" ${i === 0 ? `font-weight="600" fill="${p.accent}"` : `fill="${p.text}"`}>${escapeXml(box.name)}</text>`,
    )
    .join("");

  const stack = `<text x="28" y="${H - 26}" font-family="${SANS}" font-size="16" fill="${p.muted}">${escapeXml(project.stack.join("  /  "))}</text>`;
  const body = `<g stroke="${p.line}" stroke-width="1.2">${links}</g>${shapes}${stack}`;

  return { src: toDataUri(frame(p, project.kind.toLowerCase(), project.title, body)), alt: project.title };
}

function skillTile(group: SkillGroup, p: Palette): TiltedGridImage {
  const charW = 9.1; // monospace advance at 15px
  const chipH = 36;
  const maxX = W - 28;
  let x = 28;
  let y = 128;
  const chips: string[] = [];

  for (const skill of group.skills) {
    const w = Math.round(skill.length * charW + 28);
    if (x + w > maxX) {
      x = 28;
      y += chipH + 12;
    }
    if (y + chipH > H - 52) break;
    chips.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${chipH}" rx="7" fill="${p.box}" stroke="${p.line}"/>` +
        `<text x="${x + 14}" y="${y + 23}" font-family="${MONO}" font-size="15" fill="${p.text}">${escapeXml(skill)}</text>`,
    );
    x += w + 10;
  }

  const note = `<text x="28" y="${H - 26}" font-family="${SANS}" font-size="16" fill="${p.muted}">${escapeXml(group.description)}</text>`;
  return { src: toDataUri(frame(p, "skills", group.category, chips.join("") + note)), alt: group.category };
}

/** Projects interleaved with skill groups, so neighbouring tiles differ. */
export function buildHeroTiles(projects: Project[], skills: SkillGroup[], theme: "light" | "dark"): TiltedGridImage[] {
  const p = palettes[theme];
  const tiles: TiltedGridImage[] = [];
  const length = Math.max(projects.length, skills.length);
  for (let i = 0; i < length; i++) {
    if (projects[i]) tiles.push(projectTile(projects[i], p));
    if (skills[i]) tiles.push(skillTile(skills[i], p));
  }
  return tiles;
}
