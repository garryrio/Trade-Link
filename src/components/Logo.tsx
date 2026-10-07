import Image from "next/image";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  /** "light" untuk dipakai di atas background gelap. */
  variant?: "dark" | "light";
  showWordmark?: boolean;
}

/* Warna resmi logo, diambil dari file desain maskot. */
const NAVY = "#1b3370";
const BLUE = "#5b87e8";

/**
 * Logo TradeLink: maskot tunas pembawa koper yang menyeberangi jembatan.
 *
 * Gambar yang dipakai adalah `public/brand/tradelink-mark.png`, yaitu maskot
 * dan jembatannya saja, berlatar transparan. Tulisan "TradeLink" tidak
 * diambil dari gambar melainkan dirender sebagai teks. Alasannya: di
 * navbar setinggi 64px, tulisan di dalam gambar hanya akan setinggi sekitar
 * 12px dan kabur. Teks HTML tetap tajam dan bisa dibaca pembaca layar.
 *
 * Versi lengkap dengan tulisan ada di `public/brand/tradelink-logo.png`,
 * untuk dipakai di dokumen, presentasi, atau media sosial.
 */
export function Logo({
  className,
  variant = "dark",
  showWordmark = true,
}: LogoProps) {
  const light = variant === "light";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* Di latar gelap maskot diberi alas putih. Badan maskot berwarna
          navy, jadi tanpa alas ia menyatu dengan latar footer dan hilang. */}
      <span
        className={cn(
          "inline-grid shrink-0 place-items-center",
          light && "rounded-lg bg-white p-1",
        )}
      >
        <Image
          src="/brand/tradelink-mark.png"
          alt={showWordmark ? "" : "TradeLink"}
          width={683}
          height={558}
          priority
          className="h-10 w-auto"
        />
      </span>
      {showWordmark && (
        <span
          className="text-xl font-extrabold tracking-tight"
          style={{ color: light ? "#ffffff" : NAVY }}
        >
          Trade
          <span style={{ color: light ? "#93b4f5" : BLUE }}>Link</span>
        </span>
      )}
    </span>
  );
}
