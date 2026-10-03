"use client";

import { useMemo, useState } from "react";
import {
  BreakdownTable,
  FieldGroup,
  NumberField,
  ResultRow,
  ResultStat,
  SelectField,
  foreignAmount,
  toNum,
} from "@/components/calculator/fields";
import { Callout } from "@/components/ui/Callout";
import { BASE_USD_IDR } from "@/data/commodities";
import {
  calculateImport,
  type ImportInput,
} from "@/lib/calculator";
import { formatIDR, formatNumber, formatPercent } from "@/lib/format";
import { CURRENCIES, type Currency } from "@/lib/types";

/* ============================================================
   Kalkulator biaya impor.

   Urutan perhitungan mengikuti alur kepabeanan Indonesia:
     CIF -> konversi ke rupiah (NDPBM) -> Bea Masuk -> Nilai Impor
     -> PPN & PPh 22 -> ditambah biaya lokal -> landed cost.
   ============================================================ */

interface FormState {
  foreignCurrency: Currency;
  quantity: string;
  unitLabel: string;
  unitPriceForeign: string;
  freightForeign: string;
  insuranceMode: "percent" | "amount";
  insurancePercent: string;
  insuranceAmountForeign: string;
  exchangeRate: string;
  dutyPercent: string;
  additionalDutyPercent: string;
  vatPercent: string;
  incomeTaxPercent: string;
  vatExempt: boolean;
  terminalHandling: string;
  customsBroker: string;
  inlandTransport: string;
  storage: string;
  other: string;
}

const INITIAL: FormState = {
  foreignCurrency: "USD",
  quantity: "1000",
  unitLabel: "kg",
  unitPriceForeign: "12",
  freightForeign: "1800",
  insuranceMode: "percent",
  insurancePercent: "0.3",
  insuranceAmountForeign: "0",
  exchangeRate: String(BASE_USD_IDR),
  dutyPercent: "5",
  additionalDutyPercent: "0",
  vatPercent: "11",
  incomeTaxPercent: "2.5",
  vatExempt: false,
  terminalHandling: "2500000",
  customsBroker: "1750000",
  inlandTransport: "3000000",
  storage: "500000",
  other: "0",
};

export function ImportCalculator() {
  const [form, setForm] = useState<FormState>(INITIAL);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const input: ImportInput = useMemo(
    () => ({
      quantity: toNum(form.quantity),
      unitPriceForeign: toNum(form.unitPriceForeign),
      freightForeign: toNum(form.freightForeign),
      insuranceMode: form.insuranceMode,
      insurancePercent: toNum(form.insurancePercent),
      insuranceAmountForeign: toNum(form.insuranceAmountForeign),
      exchangeRate: toNum(form.exchangeRate),
      dutyPercent: toNum(form.dutyPercent),
      additionalDutyPercent: toNum(form.additionalDutyPercent),
      vatPercent: toNum(form.vatPercent),
      incomeTaxPercent: toNum(form.incomeTaxPercent),
      vatExempt: form.vatExempt,
      costs: {
        terminalHandling: toNum(form.terminalHandling),
        customsBroker: toNum(form.customsBroker),
        inlandTransport: toNum(form.inlandTransport),
        storage: toNum(form.storage),
        other: toNum(form.other),
      },
    }),
    [form],
  );

  const result = useMemo(() => calculateImport(input), [input]);

  const cur = form.foreignCurrency;
  const unit = form.unitLabel.trim() || "unit";

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ================= INPUT ================= */}
      <div className="space-y-5 lg:col-span-3">
        {/* Ringkasan yang menempel di atas, hanya untuk layar kecil.
            Di layar lebar hasil sudah terlihat di kolom kanan, tapi di ponsel
            hasil berada jauh di bawah seluruh input sehingga angkanya tidak
            terpantau saat nilai diubah. Nilai 4rem menyamai tinggi navbar. */}
        <div className="sticky top-16 z-20 rounded-xl bg-gradient-to-r from-brand-700 to-navy-900 px-4 py-3 shadow-lg lg:hidden">
          {/* Dua kolom setara, keduanya boleh membungkus. Sebelumnya nilai
              total dipotong dengan `truncate`, dan nilai uang yang terpotong
              di tengah lebih menyesatkan daripada tidak ditampilkan. */}
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
            <div className="min-w-0">
              <dt className="text-[10px] font-semibold tracking-wider text-brand-200 uppercase">
                Total sampai gudang
              </dt>
              <dd className="text-sm leading-tight font-bold break-words text-white tabular-nums">
                {formatIDR(result.landedCostIDR)}
              </dd>
            </div>
            <div className="min-w-0 text-right">
              <dt className="text-[10px] font-semibold tracking-wider text-brand-200 uppercase">
                Per {unit}
              </dt>
              <dd className="text-sm leading-tight font-bold break-words text-white tabular-nums">
                {formatIDR(result.costPerUnitIDR)}
              </dd>
            </div>
          </dl>
        </div>

        <FieldGroup
          title="Barang & nilai transaksi"
          description="Masukkan harga sesuai kesepakatan dengan pemasok. Kalau harga yang Anda dapat sudah CIF, isi ongkos angkut dan asuransi dengan 0."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="im-currency"
              label="Mata uang transaksi"
              value={cur}
              onChange={(v) => set("foreignCurrency", v)}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
            <NumberField
              id="im-rate"
              label="Kurs NDPBM"
              value={form.exchangeRate}
              onChange={(v) => set("exchangeRate", v)}
              prefix="Rp"
              hint={
                <>
                  Kurs pajak untuk hitung bea masuk, bukan kurs bank. Cek di{" "}
                  <a
                    href="https://fiskal.kemenkeu.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 underline underline-offset-2"
                  >
                    Badan Kebijakan Fiskal
                  </a>
                  .
                </>
              }
            />
            <NumberField
              id="im-qty"
              label="Kuantitas"
              value={form.quantity}
              onChange={(v) => set("quantity", v)}
            />
            <div>
              <label htmlFor="im-unit" className="field-label">
                Nama satuan
              </label>
              <input
                id="im-unit"
                type="text"
                value={form.unitLabel}
                onChange={(e) => set("unitLabel", e.target.value)}
                className="field-input"
                placeholder="kg"
              />
              <p className="field-hint">Hanya untuk label hasil, mis. kg / MT / pcs.</p>
            </div>
            <NumberField
              id="im-price"
              label="Harga per satuan (FOB)"
              value={form.unitPriceForeign}
              onChange={(v) => set("unitPriceForeign", v)}
              prefix={cur}
            />
            <NumberField
              id="im-freight"
              label="Ongkos angkut total"
              value={form.freightForeign}
              onChange={(v) => set("freightForeign", v)}
              prefix={cur}
              hint="Ongkos kapal atau udara sampai pelabuhan tujuan."
            />
          </div>
        </FieldGroup>

        <FieldGroup
          title="Asuransi"
          description="Praktik umum menghitung premi dari 110% nilai barang ditambah ongkos angkut."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="im-ins-mode"
              label="Cara menentukan"
              value={form.insuranceMode}
              onChange={(v) => set("insuranceMode", v)}
              options={[
                { value: "percent", label: "Persentase dari nilai" },
                { value: "amount", label: "Nominal langsung" },
              ]}
            />
            {form.insuranceMode === "percent" ? (
              <NumberField
                id="im-ins-pct"
                label="Tarif premi"
                value={form.insurancePercent}
                onChange={(v) => set("insurancePercent", v)}
                suffix="%"
                hint="Umumnya 0,2% - 0,5% tergantung komoditas dan rute."
              />
            ) : (
              <NumberField
                id="im-ins-amt"
                label="Nominal premi"
                value={form.insuranceAmountForeign}
                onChange={(v) => set("insuranceAmountForeign", v)}
                prefix={cur}
              />
            )}
          </div>
        </FieldGroup>

        <FieldGroup
          title="Tarif bea masuk & pajak"
          description={
            <>
              Tarif berbeda untuk setiap kode HS dan negara asal. Cek tarif yang
              berlaku untuk barang Anda di{" "}
              <a
                href="https://insw.go.id/intr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-700 underline underline-offset-2"
              >
                Indonesia National Trade Repository
              </a>
              , dan periksa apakah ada tarif preferensi FTA yang bisa dipakai.
            </>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="im-duty"
              label="Bea Masuk"
              value={form.dutyPercent}
              onChange={(v) => set("dutyPercent", v)}
              suffix="%"
              hint="Isi 0 bila barang bebas bea masuk atau memakai tarif preferensi 0%."
            />
            <NumberField
              id="im-duty-extra"
              label="Bea Masuk Tambahan"
              value={form.additionalDutyPercent}
              onChange={(v) => set("additionalDutyPercent", v)}
              suffix="%"
              hint="Antidumping (BMAD) atau tindakan pengamanan (BMTP), bila ada."
            />
            <NumberField
              id="im-vat"
              label="PPN Impor"
              value={form.vatPercent}
              onChange={(v) => set("vatPercent", v)}
              suffix="%"
              hint="Sesuaikan dengan ketentuan yang berlaku untuk barang Anda."
            />
            <NumberField
              id="im-pph"
              label="PPh Pasal 22 Impor"
              value={form.incomeTaxPercent}
              onChange={(v) => set("incomeTaxPercent", v)}
              suffix="%"
              hint="Tarifnya bergantung jenis barang dan status API importir."
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-sm">
            <input
              type="checkbox"
              checked={form.vatExempt}
              onChange={(e) => set("vatExempt", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
            />
            <span className="text-navy-800">
              Barang mendapat fasilitas pembebasan PPN
              <span className="mt-0.5 block text-xs text-slate-500">
                Centang hanya bila Anda punya dasar fasilitasnya. Bila dicentang,
                PPN dihitung nol.
              </span>
            </span>
          </label>
        </FieldGroup>

        <FieldGroup
          title="Biaya lokal di Indonesia"
          description="Pos-pos inilah yang paling sering terlupakan saat memperkirakan harga jual."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="im-thc"
              label="Terminal handling & pelabuhan"
              value={form.terminalHandling}
              onChange={(v) => set("terminalHandling", v)}
              prefix="Rp"
            />
            <NumberField
              id="im-broker"
              label="Jasa kepabeanan (PPJK)"
              value={form.customsBroker}
              onChange={(v) => set("customsBroker", v)}
              prefix="Rp"
            />
            <NumberField
              id="im-truck"
              label="Trucking ke gudang"
              value={form.inlandTransport}
              onChange={(v) => set("inlandTransport", v)}
              prefix="Rp"
            />
            <NumberField
              id="im-storage"
              label="Penumpukan / storage"
              value={form.storage}
              onChange={(v) => set("storage", v)}
              prefix="Rp"
              hint="Naik cepat bila dokumen belum siap saat kapal tiba."
            />
            <NumberField
              id="im-other"
              label="Biaya lain-lain"
              value={form.other}
              onChange={(v) => set("other", v)}
              prefix="Rp"
              className="sm:col-span-2"
            />
          </div>
        </FieldGroup>
      </div>

      {/* ================= HASIL ================= */}
      <div className="lg:col-span-2">
        <div className="space-y-5 lg:sticky lg:top-24">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-br from-brand-700 to-navy-900 px-5 py-5">
              <p className="text-xs font-semibold tracking-wider text-brand-200 uppercase">
                Total biaya sampai gudang
              </p>
              {/* Nilai landed cost bisa mencapai belasan karakter. Pada 30px
                  di layar 375px angka itu melewati lebar kartu, jadi ukurannya
                  naik bertahap dan diizinkan membungkus. */}
              <p className="mt-1.5 text-2xl font-bold break-words text-white tabular-nums sm:text-3xl">
                {formatIDR(result.landedCostIDR)}
              </p>
              <p className="mt-1 text-sm text-brand-100/85">
                Landed cost untuk {formatNumber(input.quantity)} {unit}
              </p>
            </div>

            {/* Satu kolom di ponsel: dua kolom menyisakan sekitar 145px per
                kartu, lebih sempit daripada angka rupiah yang ditampilkan. */}
            <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <ResultStat
                label={`Biaya per ${unit}`}
                value={formatIDR(result.costPerUnitIDR)}
                tone="brand"
              />
              <ResultStat
                label="Total pungutan"
                value={formatIDR(result.totalLeviesIDR)}
                sub={`${formatPercent(result.effectiveLevyPercent)} dari CIF`}
              />
            </div>

            <div className="border-t border-slate-200 px-5 py-4">
              <dl>
                <ResultRow
                  label={`Nilai FOB (${cur})`}
                  value={foreignAmount(result.fobForeign, cur)}
                />
                <ResultRow
                  label={`Ongkos angkut (${cur})`}
                  value={foreignAmount(result.freightForeign, cur)}
                />
                <ResultRow
                  label={`Asuransi (${cur})`}
                  value={foreignAmount(result.insuranceForeign, cur)}
                />
                <ResultRow
                  label={`Nilai CIF (${cur})`}
                  value={foreignAmount(result.cifForeign, cur)}
                  strong
                />
                <ResultRow label="Nilai CIF (Rp)" value={formatIDR(result.cifIDR)} />
                <ResultRow label="Bea Masuk" value={formatIDR(result.dutyIDR)} />
                {result.additionalDutyIDR > 0 && (
                  <ResultRow
                    label="Bea Masuk Tambahan"
                    value={formatIDR(result.additionalDutyIDR)}
                  />
                )}
                <ResultRow
                  label="Nilai Impor"
                  value={formatIDR(result.importValueIDR)}
                  strong
                />
                <ResultRow label="PPN Impor" value={formatIDR(result.vatIDR)} />
                <ResultRow
                  label="PPh Pasal 22"
                  value={formatIDR(result.incomeTaxIDR)}
                />
                <ResultRow
                  label="Biaya lokal"
                  value={formatIDR(result.localCostsIDR)}
                />
              </dl>
            </div>
          </div>

          {/* Pajak yang bisa dikreditkan */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-navy-900">
              Kalau Anda Pengusaha Kena Pajak
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              PPN Impor umumnya bisa dikreditkan sebagai Pajak Masukan, dan PPh
              Pasal 22 Impor bisa dikreditkan terhadap PPh badan tahunan. Jadi
              biaya ekonomis Anda biasanya lebih rendah dari landed cost di atas.
            </p>
            <dl className="mt-4">
              <ResultRow
                label="Pajak yang bisa dikreditkan"
                value={formatIDR(result.creditableTaxesIDR)}
              />
              <ResultRow
                label="Biaya efektif setelah kredit"
                value={formatIDR(result.netCostAfterCreditIDR)}
                strong
              />
              <ResultRow
                label={`Biaya efektif per ${unit}`}
                value={formatIDR(result.netCostPerUnitIDR)}
              />
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              Perlakuan pajak bergantung pada status dan kegiatan usaha Anda.
              Konfirmasikan ke konsultan pajak Anda.
            </p>
          </div>
        </div>
      </div>

      {/* ================= RINCIAN ================= */}
      <div className="lg:col-span-5">
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900">Rincian lengkap</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            Semua angka dalam rupiah. Baris yang disorot adalah subtotal penting.
          </p>
          <div className="mt-5">
            <BreakdownTable items={result.breakdown} />
          </div>
        </div>

        <Callout tone="warning" title="Ini estimasi, bukan penetapan resmi" className="mt-5">
          Nilai pabean bisa ditetapkan berbeda oleh Bea Cukai, dan masih ada
          kemungkinan biaya lain seperti demurrage, biaya karantina, atau
          pemeriksaan fisik jalur merah. Verifikasi tarif kode HS Anda dan
          pertimbangkan berkonsultasi dengan PPJK sebelum menutup harga.
        </Callout>
      </div>
    </div>
  );
}
