"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Sparkline } from "@/components/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { COMMODITY_DEFS } from "@/data/commodities";
import { formatNumber, formatPercent, formatTime } from "@/lib/format";
import type { PriceSummary } from "@/lib/priceEngine";
import {
  CATEGORY_META,
  type CommodityCategory,
  type CommodityPrice,
} from "@/lib/types";

/** Jeda polling ke server, sedikit lebih rapat dari panjang slot harga. */
const POLL_MS = 15_000;

/** Peta id komoditas -> tautan sumber resminya. */
const SOURCE_BY_ID = new Map(
  COMMODITY_DEFS.map((d) => [d.id, { url: d.sourceUrl, label: d.sourceLabel }]),
);

interface Props {
  initialPrices: CommodityPrice[];
  initialSummary: PriceSummary;
}

export function PriceTable({ initialPrices, initialSummary }: Props) {
  const [prices, setPrices] = useState(initialPrices);
  const [summary, setSummary] = useState(initialSummary);
  const [live, setLive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CommodityCategory | "all">("all");

  // Simpan harga sebelumnya untuk memicu animasi kilau saat angka berubah.
  const previous = useRef<Map<string, number>>(
    new Map(initialPrices.map((p) => [p.id, p.price])),
  );
  const [flashes, setFlashes] = useState<Map<string, "up" | "down">>(new Map());

  useEffect(() => {
    if (!live) return;

    let cancelled = false;
    const controller = new AbortController();

    async function poll() {
      try {
        const response = await fetch("/api/prices", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as {
          prices: CommodityPrice[];
          summary: PriceSummary;
        };
        if (cancelled) return;

        // Tandai baris yang harganya berubah.
        const nextFlashes = new Map<string, "up" | "down">();
        for (const item of data.prices) {
          const before = previous.current.get(item.id);
          if (before !== undefined && before !== item.price) {
            nextFlashes.set(item.id, item.price > before ? "up" : "down");
          }
          previous.current.set(item.id, item.price);
        }

        setPrices(data.prices);
        setSummary(data.summary);
        setFlashes(nextFlashes);
        setError(null);

        // Bersihkan penanda setelah animasinya selesai.
        window.setTimeout(() => {
          if (!cancelled) setFlashes(new Map());
        }, 1100);
      } catch (err) {
        if (cancelled || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        setError("Gagal memuat harga terbaru. Mencoba lagi otomatis.");
      }
    }

    const timer = window.setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [live]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return prices.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!term) return true;
      return (
        item.name.toLowerCase().includes(term) ||
        item.market.toLowerCase().includes(term) ||
        item.hsCode.includes(term)
      );
    });
  }, [prices, search, category]);

  // Hanya tampilkan kategori yang benar-benar ada datanya.
  const availableCategories = useMemo(() => {
    const set = new Set(prices.map((p) => p.category));
    return [...set];
  }, [prices]);

  return (
    <div className="space-y-6">
      {/* ---------- Ringkasan ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Komoditas dipantau"
          value={formatNumber(summary.total)}
        />
        <SummaryCard
          label="Naik"
          value={formatNumber(summary.gainers)}
          tone="up"
        />
        <SummaryCard
          label="Turun"
          value={formatNumber(summary.losers)}
          tone="down"
        />
        <SummaryCard
          label="Pembaruan terakhir"
          value={formatTime(summary.updatedAt)}
          suffix="WIB"
        />
      </div>

      {/* ---------- Kontrol ---------- */}
      <div className="card p-5">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label htmlFor="price-search" className="field-label">
              Cari komoditas
            </label>
            <input
              id="price-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="field-input"
              placeholder="Nama komoditas, bursa, atau kode HS..."
            />
          </div>

          <div className="lg:col-span-4">
            <label htmlFor="price-category" className="field-label">
              Kategori
            </label>
            <select
              id="price-category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as CommodityCategory | "all")
              }
              className="field-input"
            >
              <option value="all">Semua kategori</option>
              {availableCategories.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_META[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end lg:col-span-2">
            <Button
              variant={live ? "secondary" : "outline"}
              onClick={() => setLive((v) => !v)}
              className="w-full"
              aria-pressed={live}
            >
              {live ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                  />
                  Live
                </>
              ) : (
                "Dijeda"
              )}
            </Button>
          </div>
        </div>

        {error && (
          <p role="status" className="mt-4 text-sm text-amber-700">
            {error}
          </p>
        )}
      </div>

      {/* ---------- Tabel ---------- */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada komoditas yang cocok"
          description="Coba kata kunci lain atau pilih kategori yang berbeda."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("all");
              }}
            >
              Reset filter
            </Button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="scrollbar-slim overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <caption className="sr-only">
                Harga komoditas simulasi, diperbarui setiap 15 detik
              </caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <Th className="pl-5">Komoditas</Th>
                  <Th align="right">Harga</Th>
                  <Th align="right">Perubahan</Th>
                  <Th align="center">Tren (6 menit)</Th>
                  <Th>Rentang 52 pekan</Th>
                  <Th className="pr-5">Sumber resmi</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((item) => {
                  const up = item.changePercent >= 0;
                  const flash = flashes.get(item.id);
                  const source = SOURCE_BY_ID.get(item.id);

                  // Posisi harga saat ini di dalam rentang 52 pekan (0-100%).
                  const span = item.high52w - item.low52w || 1;
                  const position = Math.min(
                    100,
                    Math.max(0, ((item.price - item.low52w) / span) * 100),
                  );

                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "transition-colors hover:bg-slate-50",
                        flash === "up" && "flash-up",
                        flash === "down" && "flash-down",
                      )}
                    >
                      {/* Komoditas */}
                      <td className="py-3.5 pr-4 pl-5">
                        <p className="font-medium text-navy-900">{item.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.market}
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono">HS {item.hsCode}</span>
                        </p>
                      </td>

                      {/* Harga */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <p className="font-semibold text-navy-900">
                          {formatNumber(item.price, item.price < 10 ? 3 : 2)}
                        </p>
                        <p className="text-xs text-slate-500">{item.priceUnit}</p>
                      </td>

                      {/* Perubahan */}
                      <td
                        className={cn(
                          "px-4 py-3.5 text-right whitespace-nowrap font-semibold",
                          up
                            ? "text-[var(--color-up)]"
                            : "text-[var(--color-down)]",
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          <svg
                            viewBox="0 0 24 24"
                            className={cn("h-3.5 w-3.5", !up && "rotate-180")}
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M12 5l7 9h-14z" />
                          </svg>
                          {formatPercent(item.changePercent)}
                        </span>
                        <p className="text-xs font-normal opacity-80">
                          {item.change > 0 ? "+" : ""}
                          {formatNumber(item.change, item.price < 10 ? 3 : 2)}
                        </p>
                        <span className="sr-only">
                          {up ? "naik" : "turun"} dibanding penutupan sebelumnya
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="px-4 py-3.5">
                        <div className="flex justify-center">
                          <Sparkline
                            data={item.history}
                            positive={up}
                            label={`Tren harga ${item.name}`}
                          />
                        </div>
                      </td>

                      {/* Rentang 52 pekan */}
                      <td className="px-4 py-3.5">
                        <div className="min-w-[150px]">
                          <div className="relative h-1.5 rounded-full bg-slate-200">
                            <span
                              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 shadow-sm"
                              style={{ left: `${position}%` }}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                            <span>{formatNumber(item.low52w, item.price < 10 ? 2 : 0)}</span>
                            <span>{formatNumber(item.high52w, item.price < 10 ? 2 : 0)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Sumber */}
                      <td className="py-3.5 pr-5 pl-4">
                        {source && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                          >
                            {source.label}
                            <svg
                              viewBox="0 0 24 24"
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M7 17 17 7M9 7h8v8" />
                            </svg>
                            <span className="sr-only">(buka di tab baru)</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3">
            <p className="text-xs text-slate-500">
              Menampilkan {formatNumber(filtered.length)} dari{" "}
              {formatNumber(prices.length)} komoditas
            </p>
            <Badge tone="amber">Angka simulasi, bukan kutipan pasar</Badge>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Komponen bantu ---------------- */

function SummaryCard({
  label,
  value,
  tone,
  suffix,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
  suffix?: string;
}) {
  return (
    <div className="card px-5 py-4">
      <p className="text-xs tracking-wide text-slate-500 uppercase">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold",
          tone === "up"
            ? "text-[var(--color-up)]"
            : tone === "down"
              ? "text-[var(--color-down)]"
              : "text-navy-900",
        )}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-normal text-slate-500">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

function Th({
  children,
  align = "left",
  className,
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-xs font-semibold tracking-wide text-slate-600 uppercase",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      {children}
    </th>
  );
}
