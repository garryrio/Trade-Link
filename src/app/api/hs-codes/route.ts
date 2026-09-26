import { NextResponse } from "next/server";
import { HS_CODE_COUNT, HS_VERIFY_URL } from "@/data/hsCodes";
import { findHsByCode, searchHsCodes } from "@/lib/hsSearch";

/* ============================================================
   /api/hs-codes - bantuan pencarian kode HS.

   Pencarian dijalankan di server, bukan di browser, dengan dua alasan:
     1. Katalog tidak perlu ikut dikirim ke bundle client.
     2. Nanti bisa diganti ke sumber data BTKI yang sungguhan tanpa
        mengubah satu baris pun di sisi komponen.

   GET /api/hs-codes?q=kopi          cari berdasarkan kata
   GET /api/hs-codes?q=0901          cari berdasarkan awalan kode
   GET /api/hs-codes?code=0901.11    ambil satu entri persis
   ============================================================ */

export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 120;
const MAX_LIMIT = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // --- Mode ambil satu entri berdasarkan kode ---
  const code = searchParams.get("code");
  if (code) {
    const entry = findHsByCode(code.slice(0, 20));
    return NextResponse.json({
      entry: entry ?? null,
      verifyUrl: HS_VERIFY_URL,
    });
  }

  // --- Mode pencarian ---
  const query = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);

  const limitParam = Number(searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.trunc(limitParam), 1), MAX_LIMIT)
    : 8;

  const results = searchHsCodes(query, { limit });

  return NextResponse.json(
    {
      query,
      count: results.length,
      results,
      catalogSize: HS_CODE_COUNT,
      verifyUrl: HS_VERIFY_URL,
      // Ditegaskan di payload supaya klien mana pun tidak salah paham.
      disclaimer:
        "Katalog ringkas, bukan BTKI resmi. Kode umumnya 6 digit internasional; Indonesia memakai 8 digit. Verifikasi di INSW sebelum dipakai untuk PEB/PIB.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
