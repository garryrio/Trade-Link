import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-500"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.9-3.9" />
        </svg>
      </span>
      <h3 className="mt-4 text-base font-semibold text-navy-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
