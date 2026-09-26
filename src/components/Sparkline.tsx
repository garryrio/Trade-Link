import { cn } from "@/lib/cn";

interface SparklineProps {
  data: number[];
  /** true bila tren naik (warna hijau), false untuk turun (merah). */
  positive: boolean;
  className?: string;
  width?: number;
  height?: number;
  /** Deskripsi untuk pembaca layar. */
  label?: string;
}

/**
 * Grafik garis mini tanpa dependency chart apa pun - cukup SVG polyline.
 * Dirender di server, jadi tidak menambah beban JavaScript di browser.
 */
export function Sparkline({
  data,
  positive,
  className,
  width = 120,
  height = 36,
  label,
}: SparklineProps) {
  if (data.length < 2) {
    return <div className={cn("h-9 w-[120px]", className)} aria-hidden="true" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const padding = 3;
  const usableHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    // SVG menghitung y dari atas, jadi nilainya dibalik.
    const y = padding + (1 - (value - min) / span) * usableHeight;
    return { x, y };
  });

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;

  const stroke = positive ? "var(--color-up)" : "var(--color-down)";
  const gradientId = `spark-${positive ? "up" : "down"}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label={label ?? `Tren harga ${positive ? "naik" : "turun"}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
