import { COMMODITY_DEFS, type CommodityDef } from "@/data/commodities";
import type { CommodityPrice } from "@/lib/types";

/* ============================================================
   Mesin simulasi harga komoditas.

   Pendekatan: harga dihitung sebagai FUNGSI DETERMINISTIK dari waktu.
   Tidak ada state yang disimpan, sehingga:
     - hasilnya sama untuk semua request pada slot waktu yang sama,
     - tidak ada masalah saat server restart atau ada beberapa instance,
     - render server dan client tidak bentrok (no hydration mismatch).

   Untuk mengganti ke DATA NYATA: ganti isi `getPriceSnapshot()` dengan
   pemanggilan API penyedia data (mis. Trading Economics, Commodities-API,
   Nasdaq Data Link), lalu petakan hasilnya ke bentuk `CommodityPrice`.
   ============================================================ */

/** Harga "berubah" setiap 15 detik. */
export const SLOT_MS = 15_000;

/** Jumlah titik yang disimpan untuk grafik sparkline. */
const HISTORY_POINTS = 24;

/** Hash 32-bit -> bilangan pecahan di rentang [0, 1). */
function hash01(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  x ^= x >>> 16;
  return (x >>> 0) / 4_294_967_296;
}

/** Ubah id komoditas menjadi angka seed yang stabil. */
function seedFromId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Faktor pergerakan harga pada slot tertentu, rentang kira-kira [-1, 1].
 * Gabungan beberapa gelombang dengan periode berbeda + derau kecil,
 * sehingga grafiknya terlihat wajar (ada tren, ada fluktuasi).
 */
function movementFactor(seed: number, slot: number): number {
  const phase = (seed % 1000) / 1000 * Math.PI * 2;

  const slow = Math.sin(slot / 2400 + phase) * 0.5;
  const medium = Math.sin(slot / 380 + phase * 1.7) * 0.3;
  const fast = Math.sin(slot / 61 + phase * 2.9) * 0.12;
  const noise = (hash01(seed ^ (slot * 2654435761)) - 0.5) * 0.16;

  return slow + medium + fast + noise;
}

/** Harga sebuah komoditas pada slot waktu tertentu. */
function priceAtSlot(def: CommodityDef, slot: number): number {
  const seed = seedFromId(def.id);
  // Amplitudo total dibatasi sekitar 3x volatilitas harian.
  const amplitude = def.volatility * 3;
  const raw = def.basePrice * (1 + movementFactor(seed, slot) * amplitude);

  // Bulatkan sesuai besaran harga supaya tampilannya rapi.
  return roundForMagnitude(raw);
}

function roundForMagnitude(value: number): number {
  if (value >= 1000) return Math.round(value);
  if (value >= 100) return Math.round(value * 10) / 10;
  if (value >= 10) return Math.round(value * 100) / 100;
  return Math.round(value * 1000) / 1000;
}

/** Slot pertama pada hari kalender (UTC) dari timestamp tertentu. */
function firstSlotOfDay(nowMs: number): number {
  const startOfDay = Math.floor(nowMs / 86_400_000) * 86_400_000;
  return Math.floor(startOfDay / SLOT_MS);
}

/**
 * Ambil snapshot harga seluruh komoditas.
 * @param nowMs timestamp acuan (default: sekarang). Berguna untuk pengujian.
 */
export function getPriceSnapshot(nowMs: number = Date.now()): CommodityPrice[] {
  const slot = Math.floor(nowMs / SLOT_MS);
  const refSlot = firstSlotOfDay(nowMs);
  // Timestamp yang dipaku ke awal slot, supaya stabil dalam satu slot.
  const updatedAt = new Date(slot * SLOT_MS).toISOString();

  return COMMODITY_DEFS.map((def) => {
    const price = priceAtSlot(def, slot);
    const prevClose = priceAtSlot(def, refSlot);
    const change = roundForMagnitude(price - prevClose);
    const changePercent =
      prevClose === 0 ? 0 : Math.round((change / prevClose) * 10000) / 100;

    const history: number[] = [];
    for (let i = HISTORY_POINTS - 1; i >= 0; i--) {
      history.push(priceAtSlot(def, slot - i));
    }

    return {
      id: def.id,
      name: def.name,
      category: def.category,
      market: def.market,
      hsCode: def.hsCode,
      price,
      currency: def.currency,
      priceUnit: def.priceUnit,
      change,
      changePercent,
      low52w: roundForMagnitude(def.basePrice * (1 - def.volatility * 18)),
      high52w: roundForMagnitude(def.basePrice * (1 + def.volatility * 22)),
      history,
      updatedAt,
    };
  });
}

/** Ringkasan untuk kartu statistik di halaman harga. */
export interface PriceSummary {
  total: number;
  gainers: number;
  losers: number;
  flat: number;
  topGainer: CommodityPrice | null;
  topLoser: CommodityPrice | null;
  updatedAt: string;
}

export function summarizePrices(prices: CommodityPrice[]): PriceSummary {
  const sorted = [...prices].sort((a, b) => b.changePercent - a.changePercent);

  return {
    total: prices.length,
    gainers: prices.filter((p) => p.changePercent > 0).length,
    losers: prices.filter((p) => p.changePercent < 0).length,
    flat: prices.filter((p) => p.changePercent === 0).length,
    topGainer: sorted[0] ?? null,
    topLoser: sorted[sorted.length - 1] ?? null,
    updatedAt: prices[0]?.updatedAt ?? new Date().toISOString(),
  };
}
