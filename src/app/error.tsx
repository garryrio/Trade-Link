"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Catat ke konsol browser untuk memudahkan penelusuran saat pengembangan.
    console.error("[TradeLink] Terjadi kesalahan saat render:", error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600"
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
          <path d="M10.3 4.3 2.6 17.6A1.6 1.6 0 0 0 4 20h16a1.6 1.6 0 0 0 1.4-2.4L13.7 4.3a1.6 1.6 0 0 0-2.8 0z" />
          <path d="M12 9v4M12 16.5h.01" />
        </svg>
      </span>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">
        Ada yang tidak berjalan semestinya
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        Kesalahan sudah dicatat. Coba muat ulang halaman ini. Kalau masih
        bermasalah, kembali ke beranda lalu ulangi dari awal.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-xs text-slate-400">
          Kode: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Coba lagi</Button>
        <ButtonLink href="/" variant="outline">
          Ke Beranda
        </ButtonLink>
      </div>
    </div>
  );
}
