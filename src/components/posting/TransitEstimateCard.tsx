"use client";

import { useMemo } from "react";
import {
  estimateTransit,
  formatTransitRange,
  transitArrivalWindow,
} from "@/data/transitTimes";
import { formatDateShort } from "@/lib/format";
import { SHIPPING_MODE_META, type ShippingMode } from "@/lib/types";

/* ============================================================
   Perkiraan waktu kedatangan pesanan, ditampilkan langsung di form
   pembuatan postingan.

   Kenapa ditampilkan di form, bukan hanya di halaman detail: pertanyaan
   pertama hampir setiap pembeli adalah "berapa lama sampai". Menunjukkan
   perkiraannya saat pemosting masih mengisi form membuat dia bisa
   menyesuaikan metode pengiriman atau menuliskan ekspektasi yang wajar
   di deskripsi, bukan menerima pertanyaan itu berulang kali nanti.

   Angkanya PERKIRAAN. Komponen ini wajib menampilkan hal itu, termasuk
   rentang tanggalnya, bukan satu tanggal tunggal yang terkesan pasti.
   ============================================================ */

export function TransitEstimateCard({
  destinationCountry,
  shippingMode,
}: {
  destinationCountry: string;
  shippingMode: ShippingMode;
}) {
  const estimate = useMemo(
    () => estimateTransit(destinationCountry, shippingMode),
    [destinationCountry, shippingMode],
  );

  /* Rentang tanggal dihitung di render. Nilainya bergantung pada waktu
     sekarang, jadi bisa berbeda antara server dan browser. Komponen ini
     client-only, tapi tanggalnya tetap bisa bergeser satu hari saat
     tengah malam. Karena yang ditampilkan memang rentang perkiraan,
     pergeseran itu tidak mengubah makna. */
  const window = useMemo(
    () => (estimate ? transitArrivalWindow(estimate) : null),
    [estimate],
  );

  if (!destinationCountry.trim()) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3.5">
        <p className="text-sm text-slate-600">
          Isi negara tujuan untuk melihat perkiraan waktu kedatangan.
        </p>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3.5">
        <p className="text-sm text-slate-600">
          Tujuan masih terbuka, jadi waktu kedatangan belum bisa diperkirakan.
          Perkiraan muncul begitu Anda menuliskan satu negara tujuan tertentu.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-brand-200 bg-brand-50">
      <div className="border-b border-brand-200 px-4 py-3">
        <p className="text-xs font-semibold tracking-wide text-brand-700 uppercase">
          Perkiraan waktu kedatangan
        </p>
        <p className="mt-1 text-lg leading-tight font-bold text-navy-900 tabular-nums">
          {formatTransitRange(estimate.totalMinDays, estimate.totalMaxDays)}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          Dari gudang Anda sampai diterima pembeli di {estimate.country}, lewat{" "}
          {SHIPPING_MODE_META[estimate.mode].name}.
        </p>
      </div>

      <div className="divide-y divide-brand-200/70">
        {estimate.stages.map((stage) => (
          <div key={stage.label} className="px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-navy-900">{stage.label}</p>
              <p className="shrink-0 text-sm font-semibold text-brand-800 tabular-nums">
                {stage.minDays}-{stage.maxDays} hari
              </p>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              {stage.detail}
            </p>
          </div>
        ))}
      </div>

      {window && (
        <div className="border-t border-brand-200 px-4 py-2.5">
          <p className="text-xs text-slate-600">
            Bila dikirim mulai hari ini, barang diperkirakan tiba antara{" "}
            <strong className="font-semibold text-navy-900">
              {formatDateShort(window.earliest.toISOString())}
            </strong>{" "}
            dan{" "}
            <strong className="font-semibold text-navy-900">
              {formatDateShort(window.latest.toISOString())}
            </strong>
            .
          </p>
        </div>
      )}

      {estimate.commonPorts.length > 0 && (
        <div className="border-t border-brand-200 px-4 py-2.5">
          <p className="text-xs text-slate-600">
            Pelabuhan bongkar yang umum dipakai: {estimate.commonPorts.join(", ")}
            .
          </p>
        </div>
      )}

      <ul className="space-y-1.5 border-t border-brand-200 bg-white/60 px-4 py-3">
        {estimate.notes.map((note) => (
          <li key={note} className="flex gap-2 text-xs leading-relaxed text-slate-600">
            <span aria-hidden="true" className="text-brand-500">
              -
            </span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
