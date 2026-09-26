import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  /** "light" untuk dipakai di atas background gelap. */
  variant?: "dark" | "light";
  showWordmark?: boolean;
}

/**
 * Logo TradeLink: dua node yang terhubung, melambangkan eksportir & importir
 * yang saling tersambung.
 */
export function Logo({
  className,
  variant = "dark",
  showWordmark = true,
}: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-navy-900";
  const accentColor = variant === "light" ? "text-brand-300" : "text-brand-600";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-sm"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-white"
          strokeWidth="2.1"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="6" cy="6" r="2.6" />
          <circle cx="18" cy="18" r="2.6" />
          <path d="M8.3 7.6 15.7 16.4" />
          <path d="M18 5.5h-5.2" />
          <path d="M16.2 3.6 18 5.5l-1.8 1.9" />
          <path d="M6 18.5h5.2" />
          <path d="M7.8 20.4 6 18.5l1.8-1.9" />
        </svg>
      </span>
      {showWordmark && (
        <span className={cn("text-lg font-bold tracking-tight", textColor)}>
          Trade<span className={accentColor}>Link</span>
        </span>
      )}
    </span>
  );
}
