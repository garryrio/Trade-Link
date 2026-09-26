"use client";

import { useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import {
  DEFAULT_QUERY,
  SORT_LABELS,
  filterListings,
  type CategoryFilter,
  type KindFilter,
  type ListingQuery,
  type SortOption,
} from "@/lib/listingFilters";
import {
  CATEGORY_KEYS,
  CATEGORY_META,
  LISTING_KIND_META,
  type Listing,
} from "@/lib/types";

const KIND_TABS: { value: KindFilter; label: string; hint: string }[] = [
  { value: "all", label: "Semua", hint: "Penawaran dan permintaan" },
  {
    value: "supply",
    label: LISTING_KIND_META.supply.label,
    hint: LISTING_KIND_META.supply.description,
  },
  {
    value: "demand",
    label: LISTING_KIND_META.demand.label,
    hint: LISTING_KIND_META.demand.description,
  },
];

interface Props {
  listings: Listing[];
  countries: string[];
  /** Filter awal dari query string URL, mis. /marketplace?kind=demand */
  initialKind: KindFilter;
  initialCategory: CategoryFilter;
}

export function MarketplaceExplorer({
  listings,
  countries,
  initialKind,
  initialCategory,
}: Props) {
  const [query, setQuery] = useState<ListingQuery>({
    ...DEFAULT_QUERY,
    kind: initialKind,
    category: initialCategory,
  });

  const results = useMemo(
    () => filterListings(listings, query),
    [listings, query],
  );

  const update = <K extends keyof ListingQuery>(
    key: K,
    value: ListingQuery[K],
  ) => setQuery((prev) => ({ ...prev, [key]: value }));

  const isFiltered =
    query.kind !== "all" ||
    query.category !== "all" ||
    query.country !== "all" ||
    query.search.trim() !== "" ||
    query.verifiedOnly;

  // Hitung jumlah per jenis agar angka di tab tetap informatif.
  const counts = useMemo(() => {
    const base = listings.filter((l) => {
      if (query.category !== "all" && l.category !== query.category) return false;
      if (query.country !== "all" && l.party.country !== query.country) return false;
      if (query.verifiedOnly && !l.party.verified) return false;
      return true;
    });
    return {
      all: base.length,
      supply: base.filter((l) => l.kind === "supply").length,
      demand: base.filter((l) => l.kind === "demand").length,
    };
  }, [listings, query.category, query.country, query.verifiedOnly]);

  return (
    <div className="container-page py-10">
      {/* ---------- Tab jenis postingan ---------- */}
      <div
        role="tablist"
        aria-label="Jenis postingan"
        className="flex flex-wrap gap-2"
      >
        {KIND_TABS.map((tab) => {
          const active = query.kind === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              title={tab.hint}
              onClick={() => update("kind", tab.value)}
              className={cn(
                "rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                  : "border-slate-300 bg-white text-navy-800 hover:border-brand-300 hover:bg-brand-50",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-xs font-bold",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600",
                )}
              >
                {counts[tab.value]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---------- Panel filter ---------- */}
      <div className="card mt-5 p-5">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label htmlFor="mp-search" className="field-label">
              Cari
            </label>
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.9-3.9" />
              </svg>
              <input
                id="mp-search"
                type="search"
                value={query.search}
                onChange={(e) => update("search", e.target.value)}
                placeholder="Komoditas, kode HS, perusahaan, pelabuhan..."
                className="field-input pl-9"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="mp-category" className="field-label">
              Kategori
            </label>
            <select
              id="mp-category"
              value={query.category}
              onChange={(e) =>
                update("category", e.target.value as CategoryFilter)
              }
              className="field-input"
            >
              <option value="all">Semua kategori</option>
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_META[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="mp-country" className="field-label">
              Negara mitra
            </label>
            <select
              id="mp-country"
              value={query.country}
              onChange={(e) => update("country", e.target.value)}
              className="field-input"
            >
              <option value="all">Semua negara</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="mp-sort" className="field-label">
              Urutkan
            </label>
            <select
              id="mp-sort"
              value={query.sort}
              onChange={(e) => update("sort", e.target.value as SortOption)}
              className="field-input"
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-navy-800">
            <input
              type="checkbox"
              checked={query.verifiedOnly}
              onChange={(e) => update("verifiedOnly", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
            />
            Hanya perusahaan terverifikasi
          </label>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery({ ...DEFAULT_QUERY })}
            >
              Reset semua filter
            </Button>
          )}
        </div>
      </div>

      {/* ---------- Hasil ---------- */}
      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="text-sm text-slate-600" aria-live="polite">
          Menampilkan{" "}
          <strong className="text-navy-900">{formatNumber(results.length)}</strong>{" "}
          dari {formatNumber(listings.length)} postingan
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Tidak ada postingan yang cocok"
            description="Coba longgarkan filter, ganti kata kunci, atau pasang permintaan Anda sendiri supaya pemasok yang menghubungi Anda."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setQuery({ ...DEFAULT_QUERY })}
                >
                  Reset filter
                </Button>
                <ButtonLink href="/posting">Buat postingan</ButtonLink>
              </div>
            }
          />
        </div>
      ) : (
        <ul className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {results.map((listing) => (
            <li key={listing.id} className="flex">
              <ListingCard listing={listing} className="w-full" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
