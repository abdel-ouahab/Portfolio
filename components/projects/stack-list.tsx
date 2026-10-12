import { cn } from "@/lib/utils";

export function StackList({ stack, className }: { stack: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted", className)} aria-label="Technologies">
      {stack.map((item) => (
        <li key={item} className="after:ml-3 after:text-line-strong after:content-['/'] last:after:content-none">
          {item}
        </li>
      ))}
    </ul>
  );
}
