import type { CommodityCategory, Listing, ListingKind } from "@/lib/types";

/* ============================================================
   Logika penyaringan & pengurutan postingan.
   Ditulis sebagai fungsi murni supaya bisa dipakai di server (Route Handler)
   maupun di client (komponen penjelajah marketplace).
   ============================================================ */

export type KindFilter = ListingKind | "all";
export type CategoryFilter = CommodityCategory | "all";
export type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "quantity-desc"
  | "deadline";

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Terbaru",
  oldest: "Terlama",
  "price-asc": "Harga terendah",
  "price-desc": "Harga tertinggi",
  "quantity-desc": "Kuantitas terbesar",
  deadline: "Tenggat paling dekat",
};

export interface ListingQuery {
  kind: KindFilter;
  category: CategoryFilter;
  /** Negara mitra (negara pemosting). "all" untuk semua. */
  country: string;
  /** Kata kunci bebas: judul, komoditas, kode HS, deskripsi, perusahaan. */
  search: string;
  verifiedOnly: boolean;
  sort: SortOption;
}

export const DEFAULT_QUERY: ListingQuery = {
  kind: "all",
  category: "all",
  country: "all",
  search: "",
  verifiedOnly: false,
  sort: "newest",
};

/** Kumpulkan daftar negara yang ada di data, untuk isi dropdown. */
export function collectCountries(listings: Listing[]): string[] {
  const set = new Set<string>();
  for (const l of listings) set.add(l.party.country);
  return [...set].sort((a, b) => a.localeCompare(b, "id"));
}

function matchesSearch(listing: Listing, term: string): boolean {
  const haystack = [
    listing.title,
    listing.commodity,
    listing.hsCode,
    listing.description,
    listing.party.companyName,
    listing.party.country,
    listing.party.city,
    listing.port,
    listing.originCountry,
    listing.destinationCountry,
    ...listing.certifications,
  ]
    .join(" ")
    .toLowerCase();

  // Semua kata harus ada (AND), supaya pencarian makin spesifik.
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/**
 * Harga dinormalkan ke "per satuan dasar" supaya pengurutan harga
 * tidak menyesatkan saat satuannya berbeda-beda.
 * Postingan tanpa harga diletakkan di akhir.
 */
function priceForSort(listing: Listing): number | null {
  return listing.price;
}

export function filterListings(
  listings: Listing[],
  query: ListingQuery,
): Listing[] {
  const term = query.search.trim();

  const filtered = listings.filter((l) => {
    if (query.kind !== "all" && l.kind !== query.kind) return false;
    if (query.category !== "all" && l.category !== query.category) return false;
    if (query.country !== "all" && l.party.country !== query.country)
      return false;
    if (query.verifiedOnly && !l.party.verified) return false;
    if (term && !matchesSearch(l, term)) return false;
    return true;
  });

  return sortListings(filtered, query.sort);
}

export function sortListings(
  listings: Listing[],
  sort: SortOption,
): Listing[] {
  const out = [...listings];

  switch (sort) {
    case "newest":
      return out.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "oldest":
      return out.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    case "price-asc":
      return out.sort((a, b) => {
        const pa = priceForSort(a);
        const pb = priceForSort(b);
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pa - pb;
      });
    case "price-desc":
      return out.sort((a, b) => {
        const pa = priceForSort(a);
        const pb = priceForSort(b);
        if (pa === null) return 1;
        if (pb === null) return -1;
        return pb - pa;
      });
    case "quantity-desc":
      return out.sort((a, b) => b.quantity - a.quantity);
    case "deadline":
      return out.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
    default:
      return out;
  }
}
