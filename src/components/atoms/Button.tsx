import { cn } from "@/lib/cn";

type ButtonVariant = "ghost" | "outline" | "solid";
type ButtonSize = "sm" | "md";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  ghost: "hover:bg-[var(--color-rule)]/40",
  outline:
    "border border-[var(--color-rule)] hover:border-[var(--color-ink)]/40 hover:bg-[var(--color-rule)]/30",
  solid:
    "bg-[var(--color-ink)] text-[var(--color-background)] hover:opacity-90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  variant = "ghost",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
