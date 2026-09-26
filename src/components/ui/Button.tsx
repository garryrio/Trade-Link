import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus-visible:outline-brand-600 shadow-sm",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200 focus-visible:outline-brand-600 border border-brand-200",
  outline:
    "border border-slate-300 bg-white text-navy-800 hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-brand-600",
  ghost:
    "text-brand-700 hover:bg-brand-50 active:bg-brand-100 focus-visible:outline-brand-600",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600 shadow-sm",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
): string {
  return cn(base, variants[variant], sizes[size], extra);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  /** Set true untuk link keluar aplikasi (buka tab baru). */
  external?: boolean;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external = false,
}: ButtonLinkProps) {
  const classes = buttonClass(variant, size, className);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
