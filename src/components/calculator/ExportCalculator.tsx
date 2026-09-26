"use client";

import { useMemo, useState } from "react";
import {
  BreakdownTable,
  FieldGroup,
  NumberField,
  ResultRow,
  ResultStat,
  SelectField,
  toNum,
} from "@/components/calculator/fields";
import { Callout } from "@/components/ui/Callout";
import { BASE_USD_IDR } from "@/data/commodities";
import {
  calculateExport,
  type ExportIncoterm,
  type ExportInput,
} from "@/lib/calculator";
import { formatIDR, formatMoney, formatNumber, formatPercent } from "@/lib/format";

/* ============================================================
   Kalkulator harga jual ekspor.

   Logika inti: margin dan Bea Keluar keduanya dihitung sebagai
   persentase DARI HARGA JUAL, bukan dari biaya. Jadi:

     Harga FOB = Total biaya / (1 - margin% - bea keluar%)

   Cara ini sesuai dengan bagaimana pelaku usaha biasanya menyebut
   margin ("margin 15%" artinya 15% dari harga jual).
   ============================================================ */

interface FormState {
  quantity: string;
  unitLabel: string;
  productionCostPerUnit: string;
  packagingPerUnit: string;
  inlandTransport: string;
  terminalHandling: string;
  documentation: string;
  customsBroker: string;
  certification: string;
  fumigation: string;
  other: string;
  exportDutyPercent: string;
  targetMarginPercent: string;
  incoterm: ExportIncoterm;
  freightIDR: string;
  insurancePercent: string;
  exchangeRate: string;
}

const INITIAL: FormState = {
  quantity: "18000",
  unitLabel: "kg",
  productionCostPerUnit: "78000",
  packagingPerUnit: "3500",
  inlandTransport: "9000000",
  terminalHandling: "4500000",
  documentation: "2500000",
  customsBroker: "3500000",
  certification: "6000000",
  fumigation: "1800000",
  other: "0",
  exportDutyPercent: "0",
  targetMarginPercent: "15",
  incoterm: "FOB",
  freightIDR: "32000000",
  insurancePercent: "0.3",
  exchangeRate: String(BASE_USD_IDR),
};

export function ExportCalculator() {
  const [form, setForm] = useState<FormState>(INITIAL);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const input: ExportInput = useMemo(
    () => ({
      quantity: toNum(form.quantity),
      productionCostPerUnit: toNum(form.productionCostPerUnit),
      packagingPerUnit: toNum(form.packagingPerUnit),
      costs: {
        inlandTransport: toNum(form.inlandTransport),
        terminalHandling: toNum(form.terminalHandling),
        documentation: toNum(form.documentation),
        customsBroker: toNum(form.customsBroker),
        certification: toNum(form.certification),
        fumigation: toNum(form.fumigation),
        other: toNum(form.other),
      },
      exportDutyPercent: toNum(form.exportDutyPercent),
      targetMarginPercent: toNum(form.targetMarginPercent),
      incoterm: form.incoterm,
      freightIDR: toNum(form.freightIDR),
      insurancePercent: toNum(form.insurancePercent),
      exchangeRate: toNum(form.exchangeRate),
    }),
    [form],
  );

  const result = useMemo(() => calculateExport(input), [input]);

  const unit = form.unitLabel.trim() || "unit";
  const rate = toNum(form.exchangeRate);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ================= INPUT ================= */}
      <div className="space-y-5 lg:col-span-3">
        <FieldGroup
          title="Barang & harga pokok"
          description="Hitung dari biaya sebenarnya, bukan dari harga jual lokal. Ekspor punya pos biaya yang tidak ada di penjualan domestik."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-qty"
              label="Kuantitas"
              value={form.quantity}
              onChange={(v) => set("quantity", v)}
            />
            <div>
              <label htmlFor="ex-unit" className="field-label">
                Nama satuan
              </label>
              <input
                id="ex-unit"
                type="text"
                value={form.unitLabel}
                onChange={(e) => set("unitLabel", e.target.value)}
                className="field-input"
                placeholder="kg"
              />
              <p className="field-hint">Hanya untuk label hasil.</p>
            </div>
            <NumberField
              id="ex-hpp"
              label={`Harga pokok per ${unit}`}
              value={form.productionCostPerUnit}
              onChange={(v) => set("productionCostPerUnit", v)}
              prefix="Rp"
              hint="Termasuk bahan baku, tenaga kerja, dan overhead produksi."
            />
            <NumberField
              id="ex-pack"
              label={`Kemasan ekspor per ${unit}`}
              value={form.packagingPerUnit}
              onChange={(v) => set("packagingPerUnit", v)}
              prefix="Rp"
              hint="Kemasan ekspor biasanya lebih mahal dari kemasan lokal."
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Biaya sampai on board"
          description="Seluruh pengeluaran sejak barang keluar gudang sampai berada di atas kapal."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-inland"
              label="Transport ke pelabuhan"
              value={form.inlandTransport}
              onChange={(v) => set("inlandTransport", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-thc"
              label="Terminal handling (THC)"
              value={form.terminalHandling}
              onChange={(v) => set("terminalHandling", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-docs"
              label="Dokumen, PEB & SKA"
              value={form.documentation}
              onChange={(v) => set("documentation", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-broker"
              label="Jasa PPJK / forwarder"
              value={form.customsBroker}
              onChange={(v) => set("customsBroker", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-cert"
              label="Sertifikasi & inspeksi"
              value={form.certification}
              onChange={(v) => set("certification", v)}
              prefix="Rp"
              hint="Fitosanitari, uji laboratorium, surveyor."
            />
            <NumberField
              id="ex-fumi"
              label="Fumigasi & karantina"
              value={form.fumigation}
              onChange={(v) => set("fumigation", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-other"
              label="Biaya lain-lain"
              value={form.other}
              onChange={(v) => set("other", v)}
              prefix="Rp"
              className="sm:col-span-2"
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Margin & Bea Keluar"
          description="Bea Keluar hanya berlaku untuk komoditas tertentu, misalnya produk sawit dan sebagian hasil mineral. Untuk komoditas lain isi 0."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-margin"
              label="Target margin"
              value={form.targetMarginPercent}
              onChange={(v) => set("targetMarginPercent", v)}
              suffix="%"
              hint="Dihitung sebagai persentase dari harga jual FOB."
            />
            <NumberField
              id="ex-duty"
              label="Bea Keluar"
              value={form.exportDutyPercent}
              onChange={(v) => set("exportDutyPercent", v)}
              suffix="%"
              hint="Cek tarif yang berlaku untuk kode HS Anda di Bea Cukai."
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Syarat penyerahan yang ditawarkan"
          description="FOB paling sederhana untuk eksportir pemula. CFR dan CIF berarti Anda juga mengatur pengapalan."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="ex-incoterm"
              label="Incoterm"
              value={form.incoterm}
              onChange={(v) => set("incoterm", v)}
              options={[
                { value: "FOB", label: "FOB - sampai di atas kapal" },
                { value: "CFR", label: "CFR - termasuk ongkos kapal" },
                { value: "CIF", label: "CIF - ongkos kapal + asuransi" },
              ]}
            />
            <NumberField
              id="ex-rate"
              label="Kurs untuk konversi"
              value={form.exchangeRate}
              onChange={(v) => set("exchangeRate", v)}
              prefix="Rp"
              hint="Dipakai hanya untuk menampilkan hasil dalam USD."
            />
            {form.incoterm !== "FOB" && (
              <NumberField
                id="ex-freight"
                label="Ongkos kapal ke tujuan"
                value={form.freightIDR}
                onChange={(v) => set("freightIDR", v)}
                prefix="Rp"
              />
            )}
            {form.incoterm === "CIF" && (
              <NumberField
                id="ex-ins"
                label="Tarif asuransi"
                value={form.insurancePercent}
                onChange={(v) => set("insurancePercent", v)}
                suffix="%"
                hint="Dari 110% nilai (FOB + ongkos kapal)."
              />
            )}
          </div>
        </FieldGroup>
      </div>

      {/* ================= HASIL ================= */}
      <div className="lg:col-span-2">
        <div className="space-y-5 lg:sticky lg:top-24">
          {result.invalid ? (
            <Callout tone="danger" title="Angka belum bisa dihitung">
              {result.invalidReason}
            </Callout>
          ) : (
            <>
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-br from-brand-700 to-navy-900 px-5 py-5">
                  <p className="text-xs font-semibold tracking-wider text-brand-200 uppercase">
                    Harga jual {form.incoterm} per {unit}
                  </p>
                  <p className="mt-1.5 text-3xl font-bold text-white tabular-nums">
                    {rate > 0
                      ? formatMoney(result.quotedPricePerUnitUSD, "USD")
                      : "-"}
                  </p>
                  <p className="mt-1 text-sm text-brand-100/85">
                    {formatIDR(result.quotedPricePerUnitIDR)} per {unit}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5">
                  <ResultStat
                    label={`Nilai kontrak ${form.incoterm}`}
                    value={formatIDR(result.quotedPriceIDR)}
                    tone="brand"
                  />
                  <ResultStat
                    label="Laba kotor"
                    value={formatIDR(result.grossProfitIDR)}
                    sub={formatPercent(result.grossProfitPercent)}
                    tone={result.grossProfitIDR >= 0 ? "up" : "down"}
                  />
                </div>

                <div className="border-t border-slate-200 px-5 py-4">
                  <dl>
                    <ResultRow
                      label="Harga pokok + kemasan"
                      value={formatIDR(result.goodsCostIDR)}
                    />
                    <ResultRow
                      label="Biaya lokal sampai on board"
                      value={formatIDR(result.localCostsIDR)}
                    />
                    <ResultRow
                      label="Total biaya"
                      value={formatIDR(result.baseCostIDR)}
                      strong
                    />
                    {result.exportDutyIDR > 0 && (
                      <ResultRow
                        label="Bea Keluar"
                        value={formatIDR(result.exportDutyIDR)}
                      />
                    )}
                    <ResultRow
                      label="Harga jual FOB"
                      value={formatIDR(result.fobPriceIDR)}
                      strong
                    />
                    {result.freightIDR > 0 && (
                      <ResultRow
                        label="Ongkos kapal"
                        value={formatIDR(result.freightIDR)}
                      />
                    )}
                    {result.insuranceIDR > 0 && (
                      <ResultRow
                        label="Asuransi"
                        value={formatIDR(result.insuranceIDR)}
                      />
                    )}
                    <ResultRow
                      label={`Harga jual ${form.incoterm}`}
                      value={formatIDR(result.quotedPriceIDR)}
                      strong
                    />
                  </dl>
                </div>
              </div>

              {/* Titik impas */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-navy-900">
                  Batas bawah harga Anda
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Di bawah angka ini Anda mulai merugi. Simpan sebagai batas
                  ketika pembeli menawar.
                </p>
                <dl className="mt-4">
                  <ResultRow
                    label="Titik impas FOB (total)"
                    value={formatIDR(result.breakEvenFobIDR)}
                  />
                  <ResultRow
                    label={`Titik impas per ${unit}`}
                    value={formatIDR(result.breakEvenFobPerUnitIDR)}
                    strong
                  />
                  {rate > 0 && (
                    <ResultRow
                      label={`Titik impas per ${unit} (USD)`}
                      value={formatMoney(
                        result.breakEvenFobPerUnitIDR / rate,
                        "USD",
                      )}
                    />
                  )}
                </dl>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-navy-900">
                  Bandingkan dengan harga pasar
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Harga hasil hitungan ini hanya menarik bila masih bersaing.
                  Cek kisaran harga komoditas Anda, lalu sesuaikan margin atau
                  tekan biaya bila hasilnya terlalu tinggi.
                </p>
                <p className="mt-3 text-sm">
                  <a
                    href="/harga"
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    Buka halaman harga komoditas
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================= RINCIAN ================= */}
      <div className="lg:col-span-5">
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900">Rincian lengkap</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            Untuk {formatNumber(input.quantity)} {unit}. Semua angka dalam rupiah.
          </p>
          <div className="mt-5">
            <BreakdownTable items={result.breakdown} />
          </div>
        </div>

        <Callout tone="info" title="Pos yang sering terlewat" className="mt-5">
          Selisih kurs antara tanggal kontrak dan tanggal pembayaran, biaya bank
          untuk L/C atau transfer masuk, ongkos pengiriman sampel, biaya
          perpanjangan sertifikasi, serta risiko klaim mutu dari pembeli. Untuk
          ekspor pertama, menambahkan cadangan 2% sampai 3% di atas hasil
          hitungan ini adalah kebiasaan yang sehat.
        </Callout>
      </div>
    </div>
  );
}
