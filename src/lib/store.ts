import { SEED_LISTINGS } from "@/data/listings";
import type { Listing, ListingDraft } from "@/lib/types";

/* ============================================================
   Penyimpanan postingan - SEMENTARA, di memori proses server.

   Batasan yang perlu diketahui:
     - Data hilang setiap kali server dimatikan atau di-restart.
     - Tidak cocok untuk produksi atau untuk deployment serverless
       yang menjalankan beberapa instance.

   Langkah berikutnya nanti: ganti isi fungsi-fungsi di file ini dengan
   query ke database sungguhan (Postgres/Supabase/Prisma). Seluruh aplikasi
   hanya memanggil fungsi di file ini, jadi tidak ada kode lain yang perlu
   diubah saat migrasi.

   Modul ini HANYA boleh dipakai dari Server Component atau Route Handler.

   PERINGATAN KHUSUS DEPLOYMENT SERVERLESS (mis. Vercel)
   -----------------------------------------------------
   Di lingkungan serverless, setiap permintaan bisa ditangani instance yang
   berbeda, dan instance dimatikan setelah menganggur. Akibatnya postingan
   yang baru dibuat sering TIDAK terlihat pada permintaan berikutnya, bukan
   hanya hilang setelah restart. Perilakunya akan tampak acak dan
   membingungkan pengguna.

   Karena itu halaman Buat Postingan menampilkan peringatan tambahan saat
   berjalan di Vercel. Lihat `isEphemeralStore` di bawah.
   ============================================================ */

interface GlobalWithStore {
  __tradelinkListings?: Listing[];
  __tradelinkCounter?: number;
}

// Disimpan di globalThis supaya tidak ter-reset oleh hot reload saat dev.
const g = globalThis as unknown as GlobalWithStore;

if (!g.__tradelinkListings) {
  g.__tradelinkListings = [...SEED_LISTINGS];
}
if (typeof g.__tradelinkCounter !== "number") {
  g.__tradelinkCounter = 0;
}

function db(): Listing[] {
  return g.__tradelinkListings as Listing[];
}

/**
 * Rapikan bentuk data sebelum dipakai komponen.
 *
 * Kenapa ini perlu: penyimpanan di `globalThis` sengaja bertahan melewati
 * hot reload, sehingga setelah sebuah field baru ditambahkan ke tipe
 * Listing, data yang sudah ada di memori masih berbentuk lama dan
 * field barunya undefined. Hal serupa akan terjadi saat migrasi ke
 * database, ketika baris lama belum punya kolom baru.
 *
 * Menormalkan di satu titik ini membuat seluruh aplikasi tidak perlu
 * menulis pemeriksaan defensif di tiap tempat pemakaian.
 */
function normalize(listing: Listing): Listing {
  if (
    Array.isArray(listing.qualityDocuments) &&
    Array.isArray(listing.certifications)
  ) {
    return listing;
  }

  return {
    ...listing,
    certifications: Array.isArray(listing.certifications)
      ? listing.certifications
      : [],
    qualityDocuments: Array.isArray(listing.qualityDocuments)
      ? listing.qualityDocuments
      : [],
  };
}

function nextId(kind: Listing["kind"]): string {
  g.__tradelinkCounter = (g.__tradelinkCounter ?? 0) + 1;
  const prefix = kind === "supply" ? "SUP" : "DEM";
  // Angka acak pendek supaya id tidak bertabrakan setelah restart.
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${prefix}-${9000 + g.__tradelinkCounter}${rand}`;
}

/** Semua postingan, terbaru lebih dulu. */
export function getAllListings(): Listing[] {
  return db()
    .map(normalize)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getListingById(id: string): Listing | undefined {
  const found = db().find((l) => l.id === id);
  return found ? normalize(found) : undefined;
}

/** Postingan lain yang komoditas atau kategorinya mirip. */
export function getRelatedListings(listing: Listing, limit = 4): Listing[] {
  return db()
    .filter((l) => l.id !== listing.id)
    .map((l) => {
      let score = 0;
      if (l.commodity === listing.commodity) score += 5;
      if (l.category === listing.category) score += 3;
      if (l.hsCode.slice(0, 4) === listing.hsCode.slice(0, 4)) score += 2;
      // Pasangan yang saling melengkapi (penawaran <-> permintaan) lebih relevan.
      if (l.kind !== listing.kind) score += 2;
      return { listing: l, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => normalize(x.listing));
}

/** Tambahkan postingan baru dari data form. */
export function createListing(draft: ListingDraft): Listing {
  const listing: Listing = {
    id: nextId(draft.kind),
    kind: draft.kind,
    title: draft.title,
    commodity: draft.commodity,
    category: draft.category,
    hsCode: draft.hsCode,
    description: draft.description,
    quantity: draft.quantity,
    unit: draft.unit,
    price: draft.price,
    currency: draft.currency,
    incoterm: draft.incoterm,
    originCountry: draft.originCountry,
    destinationCountry: draft.destinationCountry,
    port: draft.port,
    certifications: draft.certifications,
    qualityDocuments: draft.qualityDocuments,
    minOrder: draft.minOrder,
    capacityNote: draft.capacityNote,
    paymentTerms: draft.paymentTerms,
    deadline: draft.deadline,
    party: {
      companyName: draft.companyName,
      country: draft.contactCountry,
      city: draft.contactCity,
      // Postingan baru belum terverifikasi - ini disengaja dan ditampilkan
      // apa adanya di kartu, supaya pengguna lain tahu.
      verified: false,
      memberSince: new Date().getFullYear(),
      rating: 0,
      completedDeals: 0,
    },
    createdAt: new Date().toISOString(),
    status: "open",
    featured: false,
  };

  db().unshift(listing);
  return listing;
}

/**
 * true bila penyimpanan hampir pasti tidak konsisten antar permintaan.
 *
 * Dipakai untuk memperingatkan pengguna secara jujur, bukan membiarkan
 * mereka menyangka postingannya tersimpan padahal tidak. Variabel VERCEL
 * diset otomatis oleh platform pada setiap deployment.
 */
export function isEphemeralStore(): boolean {
  return process.env.VERCEL === "1";
}

/** Angka ringkasan untuk halaman beranda dan marketplace. */
export interface ListingStats {
  total: number;
  supply: number;
  demand: number;
  countries: number;
  commodities: number;
  verified: number;
}

export function getListingStats(): ListingStats {
  const all = db();
  const countries = new Set<string>();
  const commodities = new Set<string>();

  for (const l of all) {
    countries.add(l.party.country);
    if (l.destinationCountry && !l.destinationCountry.startsWith("Terbuka")) {
      countries.add(l.destinationCountry);
    }
    commodities.add(l.commodity);
  }

  return {
    total: all.length,
    supply: all.filter((l) => l.kind === "supply").length,
    demand: all.filter((l) => l.kind === "demand").length,
    countries: countries.size,
    commodities: commodities.size,
    verified: all.filter((l) => l.party.verified).length,
  };
}
