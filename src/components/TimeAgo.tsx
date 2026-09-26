"use client";

import { useEffect, useState } from "react";
import { formatDateShort, formatRelative } from "@/lib/format";

/**
 * Menampilkan waktu relatif ("3 hari lalu") tanpa memicu hydration mismatch.
 *
 * Caranya: render pertama (di server maupun di client) memakai tanggal absolut
 * yang deterministik. Setelah komponen ter-mount di browser, baru ditukar
 * menjadi bentuk relatif yang bergantung pada waktu sekarang.
 */
export function TimeAgo({
  iso,
  className,
  prefix,
}: {
  iso: string;
  className?: string;
  prefix?: string;
}) {
  const absolute = formatDateShort(iso);
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    setRelative(formatRelative(iso));

    // Perbarui tiap menit supaya label tetap akurat bila halaman dibuka lama.
    const timer = setInterval(() => setRelative(formatRelative(iso)), 60_000);
    return () => clearInterval(timer);
  }, [iso]);

  return (
    <time dateTime={iso} title={absolute} className={className}>
      {prefix}
      {relative ?? absolute}
    </time>
  );
}
