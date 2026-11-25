import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";

type Variant = "primary" | "brand" | "secondary" | "ghost" | "danger" | "success" | "gold";
type Size = "sm" | "md" | "lg" | "icon";

// Game-style button: solid fill, rounded, bold caps and a solid lip that collapses on press.
const base =
  "btn-3d relative inline-flex items-center justify-center gap-2 rounded-2xl font-extrabold uppercase tracking-[0.04em] select-none disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-violet text-white [--lip:var(--color-violet-dark)]",
  brand: "bg-violet text-white [--lip:var(--color-violet-dark)]",
  secondary: "bg-ink-2 text-fg border-2 border-line [--lip:var(--color-line)] hover:bg-ink-3",
  ghost: "!shadow-none !mb-0 text-violet-2 hover:bg-violet-soft",
  danger: "bg-red text-white [--lip:var(--color-red-dark)]",
  success: "bg-green text-white [--lip:var(--color-green-dark)]",
  gold: "bg-gold text-[#3b2a00] [--lip:var(--color-gold-dark)]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[12px]",
  md: "h-12 px-5 text-[14px]",
  lg: "h-14 px-6 text-[15px]",
  icon: "h-11 w-11",
};

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = "primary", size = "md", loading, icon, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
