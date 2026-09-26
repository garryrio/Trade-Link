import { NextResponse } from "next/server";
import {
  DEFAULT_QUERY,
  filterListings,
  type CategoryFilter,
  type KindFilter,
  type SortOption,
} from "@/lib/listingFilters";
import { createListing, getAllListings } from "@/lib/store";
import { CATEGORY_KEYS, type CommodityCategory } from "@/lib/types";
import { validateListingDraft } from "@/lib/validateListing";

/* ============================================================
   /api/listings

   GET  - ambil daftar postingan, mendukung filter via query string.
   POST - buat postingan baru.

   Catatan keamanan: belum ada autentikasi di prototipe ini, sehingga
   siapa pun yang bisa mengakses server juga bisa membuat postingan.
   Sebelum dipakai sungguhan, endpoint POST WAJIB dilindungi
   autentikasi, otorisasi, dan pembatasan laju (rate limiting).
   ============================================================ */

export const dynamic = "force-dynamic";

/** Batas panjang body agar tidak mudah dibanjiri payload besar. */
const MAX_BODY_BYTES = 64 * 1024;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const kindParam = searchParams.get("kind");
  const kind: KindFilter =
    kindParam === "supply" || kindParam === "demand" ? kindParam : "all";

  const categoryParam = searchParams.get("category");
  const category: CategoryFilter =
    categoryParam && CATEGORY_KEYS.includes(categoryParam as CommodityCategory)
      ? (categoryParam as CommodityCategory)
      : "all";

  const sortParam = searchParams.get("sort");
  const allowedSorts: SortOption[] = [
    "newest",
    "oldest",
    "price-asc",
    "price-desc",
    "quantity-desc",
    "deadline",
  ];
  const sort: SortOption = allowedSorts.includes(sortParam as SortOption)
    ? (sortParam as SortOption)
    : "newest";

  const listings = filterListings(getAllListings(), {
    ...DEFAULT_QUERY,
    kind,
    category,
    country: searchParams.get("country") ?? "all",
    search: searchParams.get("q") ?? "",
    verifiedOnly: searchParams.get("verified") === "true",
    sort,
  });

  return NextResponse.json({ count: listings.length, listings });
}

export async function POST(request: Request) {
  // Tolak lebih awal bila Content-Length menandakan payload kebesaran.
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Data yang dikirim terlalu besar." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  // Validasi ulang di server - data dari client tidak boleh dipercaya.
  const result = validateListingDraft(body);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: "Beberapa field belum benar.",
        fieldErrors: result.errors,
      },
      { status: 422 },
    );
  }

  const listing = createListing(result.data);

  return NextResponse.json({ listing }, { status: 201 });
}
