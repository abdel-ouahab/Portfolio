import Image from "next/image";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

const VIEW_W = 360;
const VIEW_H = 200;
const BOX_W = 100;
const BOX_H = 34;
const ROW_GAP = 34;

/**
 * Visual preview for a project. Uses a real screenshot when `project.image` is
 * set; otherwise draws the project's core entities as a small schema.
 */
export function ProjectSchemaPreview({ project, className }: { project: Project; className?: string }) {
  if (project.image) {
    return (
      <div className={cn("relative aspect-[9/5] overflow-hidden bg-surface-sunken", className)}>
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1024px) 640px, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  const entities = project.entities.slice(0, 6);
  const cols = entities.length <= 4 ? 2 : 3;
  const rows = Math.ceil(entities.length / cols);
  const gapX = (VIEW_W - cols * BOX_W) / (cols + 1);
  const totalH = rows * BOX_H + (rows - 1) * ROW_GAP;
  const startY = (VIEW_H - totalH) / 2;

  const boxes = entities.map((name, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return { name, col, row, x: gapX + col * (BOX_W + gapX), y: startY + row * (BOX_H + ROW_GAP) };
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-sunken bg-[radial-gradient(var(--line-strong)_0.8px,transparent_1px)] bg-size-[12px_12px]",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`Core entities of ${project.title}: ${entities.join(", ")}`}
        className="mx-auto block h-auto w-full max-w-[640px] font-mono text-[11px]"
      >
        <g className="stroke-line-strong" strokeWidth={1}>
          {boxes.map((box) => {
            const right = boxes.find((other) => other.row === box.row && other.col === box.col + 1);
            const below = boxes.find((other) => other.col === box.col && other.row === box.row + 1);
            return (
              <g key={`links-${box.name}`}>
                {right ? (
                  <line x1={box.x + BOX_W} x2={right.x} y1={box.y + BOX_H / 2} y2={right.y + BOX_H / 2} />
                ) : null}
                {below && box.col === 0 ? (
                  <line x1={box.x + BOX_W / 2} x2={below.x + BOX_W / 2} y1={box.y + BOX_H} y2={below.y} />
                ) : null}
              </g>
            );
          })}
        </g>

        {boxes.map((box, i) => (
          <g key={box.name}>
            <rect
              x={box.x + 0.5}
              y={box.y + 0.5}
              width={BOX_W - 1}
              height={BOX_H - 1}
              rx={5}
              className={cn("fill-surface", i === 0 ? "stroke-accent" : "stroke-line-strong")}
            />
            <text
              x={box.x + BOX_W / 2}
              y={box.y + BOX_H / 2 + 4}
              textAnchor="middle"
              className={cn(i === 0 ? "fill-accent font-semibold" : "fill-foreground")}
            >
              {box.name.length > 13 ? `${box.name.slice(0, 12)}…` : box.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
