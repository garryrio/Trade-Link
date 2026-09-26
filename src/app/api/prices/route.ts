import { NextResponse } from "next/server";
import { getPriceSnapshot, summarizePrices } from "@/lib/priceEngine";

/* ============================================================
   /api/prices - snapshot harga komoditas.

   Saat ini angkanya dihasilkan mesin simulasi yang deterministik
   berdasarkan waktu (lihat src/lib/priceEngine.ts).

   Untuk beralih ke data nyata, ganti pemanggilan getPriceSnapshot()
   dengan pemanggilan API penyedia data. Simpan API key-nya di
   environment variable dan lakukan pemanggilan HANYA dari route ini,
   supaya key tidak pernah sampai ke browser.
   ============================================================ */

export const dynamic = "force-dynamic";

export async function GET() {
  const prices = getPriceSnapshot();
  const summary = summarizePrices(prices);

  return NextResponse.json(
    { prices, summary, simulated: true },
    {
      headers: {
        // Jangan di-cache: klien melakukan polling untuk mendapat angka terbaru.
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
