import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={cn("card", className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div className={cn("border-b border-slate-200 px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardProps) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "border-t border-slate-200 bg-slate-50/70 px-5 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({
  children,
  className,
  as: Tag = "h3",
}: CardTitleProps) {
  return (
    <Tag className={cn("text-base font-semibold text-navy-900", className)}>
      {children}
    </Tag>
  );
}
