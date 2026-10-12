import type { AvailabilityStatus } from "@/types";
import { cn } from "@/lib/utils";

const dotColor: Record<AvailabilityStatus, string> = {
  open: "bg-status-open",
  limited: "bg-status-limited",
  unavailable: "bg-status-unavailable",
};

export function AvailabilityBadge({ status, label }: { status: AvailabilityStatus; label: string }) {
  return (
    <p className="inline-flex items-center gap-2 text-sm text-muted">
      <span aria-hidden className={cn("size-2 rounded-full", dotColor[status])} />
      {label}
    </p>
  );
}
