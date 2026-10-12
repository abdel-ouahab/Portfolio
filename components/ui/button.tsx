import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-accent hover:text-accent-contrast",
        outline:
          "border border-line-strong bg-transparent text-foreground hover:border-foreground hover:bg-surface",
        ghost: "text-muted hover:bg-surface-sunken hover:text-foreground",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & ButtonVariantProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
