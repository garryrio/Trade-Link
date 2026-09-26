import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
  align?: "left" | "center";
  /** Elemen di sisi kanan, misalnya tombol aksi. */
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "left",
  action,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold tracking-widest text-brand-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

/** Header biru gelap yang dipakai di bagian atas setiap halaman fitur. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <header className="hero-grid border-b border-navy-800 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold tracking-widest text-brand-300 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-100/90 sm:text-base">
            {description}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}
