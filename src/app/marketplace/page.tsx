import type { Metadata } from "next";
import { MarketplaceExplorer } from "@/components/marketplace/MarketplaceExplorer";
import { PageHeader } from "@/components/ui/SectionHeading";
import { collectCountries } from "@/lib/listingFilters";
import type { CategoryFilter, KindFilter } from "@/lib/listingFilters";
import { getAllListings } from "@/lib/store";
import { CATEGORY_KEYS, type CommodityCategory } from "@/lib/types";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Telusuri penawaran ekspor dan permintaan impor: komoditas, kode HS, kuantitas, Incoterm, sertifikasi, dan profil perusahaan.",
};

// Postingan baru harus langsung terlihat, jadi jangan di-cache.
export const dynamic = "force-dynamic";

function parseKind(value: string | undefined): KindFilter {
  return value === "supply" || value === "demand" ? value : "all";
}

function parseCategory(value: string | undefined): CategoryFilter {
  return value && CATEGORY_KEYS.includes(value as CommodityCategory)
    ? (value as CommodityCategory)
    : "all";
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; category?: string }>;
}) {
  const params = await searchParams;
  const listings = getAllListings();
  const countries = collectCountries(listings);

  return (
    <>
      <PageHeader
        eyebrow="Marketplace"
        title="Penawaran & Permintaan"
        description="Satu papan untuk dua arah perdagangan. Eksportir memasang barang yang siap dikirim, importir memasang apa yang sedang mereka cari. Pakai filter di bawah untuk mempersempit pencarian."
      />
      <MarketplaceExplorer
        listings={listings}
        countries={countries}
        initialKind={parseKind(params.kind)}
        initialCategory={parseCategory(params.category)}
      />
    </>
  );
}
