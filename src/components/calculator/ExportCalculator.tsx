"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CheckboxRow,
  FieldGroup,
  NumberField,
  ResultRow,
  ResultStat,
  SelectField,
  SheetTable,
  TextField,
  toNum,
  type SheetTableRow,
} from "@/components/calculator/fields";
import { Callout } from "@/components/ui/Callout";
import {
  DOCUMENT_FEES,
  EXPORT_DUTY_REFERENCE_URL,
  EXPORT_DUTY_WATCHLIST,
  EXPORT_PORTS,
  ORIGIN_CITY_NAMES,
} from "@/data/logisticsRates";
import {
  TRANSIT_COUNTRY_NAMES,
  formatTransitRange,
} from "@/data/transitTimes";
import {
  buildDefaultSheetInput,
  buildExportSheet,
  deriveVolumeCbm,
  deriveWeightKg,
  recalculateFreight,
  suggestRouteCosts,
  type ExportSheetInput,
} from "@/lib/exportSheet";
import {
  CONTAINER_META,
  CONTAINER_TYPES,
  SHIPPING_MODES,
  SHIPPING_MODE_META,
  UNIT_LABELS,
  type ContainerType,
  type ShippingMode,
  type Unit,
} from "@/lib/types";
import { formatIDR, formatMoney, formatNumber } from "@/lib/format";

/* ============================================================
   Kalkulator biaya ekspor berbasis rute.

   Pengguna mengisi barang, jumlah, alamat pengirim, dan alamat penerima.
   Dari situ aplikasi memperkirakan ongkos trucking ke pelabuhan terdekat,
   biaya penanganan di pelabuhan, ongkos angkut ke negara tujuan, dan
   waktu tempuhnya. Hasilnya disusun sebagai lembar biaya bernomor yang
   berakhir di harga FOB, CFR, dan CIF.

   DUA KEPUTUSAN PENTING SOAL PERILAKU
   -----------------------------------
   1. Angka yang diturunkan dari rute (trucking, THC, ongkos angkut) TIDAK
      ditimpa otomatis setiap kali pengguna mengubah rute. Kalau ditimpa,
      angka yang sudah disesuaikan pengguna dengan penawaran aslinya akan
      hilang tanpa peringatan. Jadi disediakan tombol terpisah untuk
      mengambil ulang perkiraan.

   2. Satuan kuantitas dan berat kiriman dipisah. Untuk kg dan MT beratnya
      bisa diturunkan, tapi untuk pcs dan karton tidak ada hubungan tetap
      antara jumlah dan berat. Menebaknya akan membuat tarif LCL dan udara
      salah, jadi pengguna yang mengisi.
   ============================================================ */

/** Semua nilai angka disimpan sebagai string agar field bisa dikosongkan. */
type NumericKey =
  | "quantity"
  | "totalWeightKg"
  | "totalVolumeCbm"
  | "containerCount"
  | "goodsCostPerUnit"
  | "packagingPerUnit"
  | "markingIdr"
  | "sortingIdr"
  | "stuffingIdr"
  | "truckingIdr"
  | "customClearanceIdr"
  | "stackingIdr"
  | "thcIdr"
  | "billOfLadingIdr"
  | "otherDocumentIdr"
  | "exportDutyIdr"
  | "bankLcAdvisingIdr"
  | "bankLcNegotiationIdr"
  | "bankCourierIdr"
  | "bankHandlingIdr"
  | "bankDiscrepancyIdr"
  | "otherCostIdr"
  | "agentCommissionPercent"
  | "freightIdr"
  | "insurancePercent"
  | "usdIdr";

type TextKey =
  | "commodity"
  | "hsCode"
  | "originCity"
  | "originCountry"
  | "loadPortId"
  | "destinationCity"
  | "destinationCountry";

type FormState = Record<NumericKey, string> &
  Record<TextKey, string> & {
    unit: Unit;
    shippingMode: ShippingMode;
    containerType: ContainerType;
    documentFeeIds: string[];
  };

function makeInitialState(): FormState {
  const d = buildDefaultSheetInput();

  return {
    commodity: d.commodity,
    hsCode: d.hsCode,
    originCity: d.originCity,
    originCountry: d.originCountry,
    loadPortId: d.loadPortId,
    destinationCity: d.destinationCity,
    destinationCountry: d.destinationCountry,

    unit: d.unit,
    shippingMode: d.shippingMode,
    containerType: d.containerType,
    documentFeeIds: d.documentFeeIds,

    quantity: String(d.quantity),
    totalWeightKg: String(d.totalWeightKg),
    totalVolumeCbm: String(d.totalVolumeCbm),
    containerCount: String(d.containerCount),
    goodsCostPerUnit: String(d.goodsCostPerUnit),
    packagingPerUnit: String(d.packagingPerUnit),
    markingIdr: String(d.markingIdr),
    sortingIdr: String(d.sortingIdr),
    stuffingIdr: String(d.stuffingIdr),
    truckingIdr: String(d.truckingIdr),
    customClearanceIdr: String(d.customClearanceIdr),
    stackingIdr: String(d.stackingIdr),
    thcIdr: String(d.thcIdr),
    billOfLadingIdr: String(d.billOfLadingIdr),
    otherDocumentIdr: String(d.otherDocumentIdr),
    exportDutyIdr: String(d.exportDutyIdr),
    bankLcAdvisingIdr: String(d.bankLcAdvisingIdr),
    bankLcNegotiationIdr: String(d.bankLcNegotiationIdr),
    bankCourierIdr: String(d.bankCourierIdr),
    bankHandlingIdr: String(d.bankHandlingIdr),
    bankDiscrepancyIdr: String(d.bankDiscrepancyIdr),
    otherCostIdr: String(d.otherCostIdr),
    agentCommissionPercent: String(d.agentCommissionPercent),
    freightIdr: String(d.freightIdr),
    insurancePercent: String(d.insurancePercent),
    usdIdr: String(d.usdIdr),
  };
}

const UNIT_OPTIONS = (Object.keys(UNIT_LABELS) as Unit[]).map((u) => ({
  value: u,
  label: UNIT_LABELS[u],
}));

const PORT_OPTIONS = EXPORT_PORTS.map((p) => ({
  value: p.id,
  label: `${p.name} - ${p.city}`,
}));

/* Memakai nama resminya, bukan deskripsi singkat, supaya sama dengan
   pilihan di form posting. Penjelasan panjangnya sudah muncul sebagai
   keterangan di bawah kelompok field. */
const MODE_OPTIONS = SHIPPING_MODES.map((m) => ({
  value: m,
  label: `${SHIPPING_MODE_META[m].label} - ${SHIPPING_MODE_META[m].name}`,
}));

const CONTAINER_OPTIONS = CONTAINER_TYPES.map((c) => ({
  value: c,
  label: `${CONTAINER_META[c].label} (${CONTAINER_META[c].isoName})`,
}));

export function ExportCalculator() {
  const [form, setForm] = useState<FormState>(makeInitialState);
  const [routeSynced, setRouteSynced] = useState(true);

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  /** Perubahan rute hanya menandai bahwa perkiraan sudah kedaluwarsa. */
  const setRouteField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setRouteSynced(false);
    },
    [],
  );

  const input: ExportSheetInput = useMemo(
    () => ({
      commodity: form.commodity,
      hsCode: form.hsCode,
      quantity: toNum(form.quantity),
      unit: form.unit,
      totalWeightKg: toNum(form.totalWeightKg),
      totalVolumeCbm: toNum(form.totalVolumeCbm),

      originCity: form.originCity,
      originCountry: form.originCountry,
      loadPortId: form.loadPortId,
      destinationCity: form.destinationCity,
      destinationCountry: form.destinationCountry,

      shippingMode: form.shippingMode,
      containerType: form.containerType,
      containerCount: toNum(form.containerCount),

      goodsCostPerUnit: toNum(form.goodsCostPerUnit),
      packagingPerUnit: toNum(form.packagingPerUnit),
      markingIdr: toNum(form.markingIdr),
      sortingIdr: toNum(form.sortingIdr),
      stuffingIdr: toNum(form.stuffingIdr),

      truckingIdr: toNum(form.truckingIdr),
      customClearanceIdr: toNum(form.customClearanceIdr),
      stackingIdr: toNum(form.stackingIdr),
      thcIdr: toNum(form.thcIdr),
      billOfLadingIdr: toNum(form.billOfLadingIdr),
      documentFeeIds: form.documentFeeIds,
      otherDocumentIdr: toNum(form.otherDocumentIdr),

      exportDutyIdr: toNum(form.exportDutyIdr),

      bankLcAdvisingIdr: toNum(form.bankLcAdvisingIdr),
      bankLcNegotiationIdr: toNum(form.bankLcNegotiationIdr),
      bankCourierIdr: toNum(form.bankCourierIdr),
      bankHandlingIdr: toNum(form.bankHandlingIdr),
      bankDiscrepancyIdr: toNum(form.bankDiscrepancyIdr),

      otherCostIdr: toNum(form.otherCostIdr),
      agentCommissionPercent: toNum(form.agentCommissionPercent),
      freightIdr: toNum(form.freightIdr),
      insurancePercent: toNum(form.insurancePercent),
      usdIdr: toNum(form.usdIdr),
    }),
    [form],
  );

  const sheet = useMemo(() => buildExportSheet(input), [input]);

  /** Ambil ulang perkiraan trucking, biaya pelabuhan, dan ongkos angkut. */
  const refreshRouteEstimates = useCallback(() => {
    const route = suggestRouteCosts(input.originCity, input.containerType);
    const freight = recalculateFreight(input);

    setForm((prev) => ({
      ...prev,
      loadPortId: route.loadPortId,
      truckingIdr: String(route.truckingIdr),
      stackingIdr: String(route.stackingIdr),
      thcIdr: String(route.thcIdr),
      freightIdr: String(Math.round(freight.idr)),
    }));
    setRouteSynced(true);
  }, [input]);

  /** Isi berat dan volume dari jumlah, bila satuannya memungkinkan. */
  const fillFromQuantity = useCallback(() => {
    const qty = toNum(form.quantity);
    const weight = deriveWeightKg(qty, form.unit);
    const volume = deriveVolumeCbm(qty, form.unit);

    setForm((prev) => ({
      ...prev,
      totalWeightKg: weight !== null ? String(weight) : prev.totalWeightKg,
      totalVolumeCbm: volume !== null ? String(volume) : prev.totalVolumeCbm,
    }));
    setRouteSynced(false);
  }, [form.quantity, form.unit]);

  const canFillFromQuantity =
    deriveWeightKg(1, form.unit) !== null ||
    deriveVolumeCbm(1, form.unit) !== null;

  const toggleDoc = useCallback((id: string, on: boolean) => {
    setForm((prev) => ({
      ...prev,
      documentFeeIds: on
        ? [...prev.documentFeeIds, id]
        : prev.documentFeeIds.filter((x) => x !== id),
    }));
  }, []);

  const usesContainer = form.shippingMode === "FCL";
  const rate = toNum(form.usdIdr);

  /* Susun baris tabel: tiap grup diikuti subtotalnya, lalu harga
     FOB, CFR, dan CIF disisipkan di posisi yang benar. */
  const sheetRows: SheetTableRow[] = useMemo(() => {
    const rows: SheetTableRow[] = [];

    for (const group of sheet.groups) {
      for (const row of group.rows) {
        rows.push({
          code: `${group.code}${row.code}`,
          label: row.label,
          total: row.total,
          perUnit: row.perUnit,
          formula: row.formula,
        });
      }

      rows.push({
        code: "",
        label: `Jumlah grup ${group.code} - ${group.title}`,
        total: group.subtotal,
        perUnit: group.subtotalPerUnit,
        kind: "group",
      });

      if (group.code === "8") {
        rows.push({
          code: "",
          label: `${sheet.fob.label} - ${sheet.loadPort ? `${sheet.loadPort.name}, ${sheet.loadPort.city}` : "pelabuhan muat"}`,
          total: sheet.fob.total,
          perUnit: sheet.fob.perUnit,
          kind: "milestone",
        });
      }
      if (group.code === "9") {
        rows.push({
          code: "",
          label: sheet.cfr.label,
          total: sheet.cfr.total,
          perUnit: sheet.cfr.perUnit,
          kind: "milestone",
        });
      }
      if (group.code === "10") {
        rows.push({
          code: "",
          label: sheet.cif.label,
          total: sheet.cif.total,
          perUnit: sheet.cif.perUnit,
          kind: "milestone",
        });
      }
    }

    return rows;
  }, [sheet]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ================= INPUT ================= */}
      <div className="space-y-5 lg:col-span-3">
        {/* Ringkasan menempel di atas, hanya untuk layar kecil: di ponsel
            panel hasil berada jauh di bawah seluruh input, sehingga angkanya
            tidak terpantau saat nilai diubah. 4rem menyamai tinggi navbar. */}
        <div className="sticky top-16 z-20 rounded-xl bg-gradient-to-r from-brand-700 to-navy-900 px-3 py-2.5 shadow-lg lg:hidden">
          {sheet.invalid ? (
            <p className="text-xs leading-relaxed text-amber-200">
              Komisi agen terlalu besar, harga belum bisa dihitung.
            </p>
          ) : (
            <dl className="flex items-stretch justify-between gap-2">
              {[sheet.fob, sheet.cfr, sheet.cif].map((m) => (
                <div key={m.label} className="min-w-0 flex-1">
                  <dt className="truncate text-[10px] font-semibold tracking-wider text-brand-200 uppercase">
                    {m.label.replace("HARGA ", "")} / {sheet.unitSuffix}
                  </dt>
                  <dd className="truncate text-sm font-bold text-white tabular-nums">
                    {formatIDR(m.perUnit)}
                  </dd>
                  <dd className="truncate text-[10px] text-brand-100/80 tabular-nums">
                    {rate > 0 ? formatMoney(m.perUnitUsd, "USD") : "-"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* ---------- Barang ---------- */}
        <FieldGroup
          title="Barang yang dikirim"
          description="Jumlah di sini menjadi pembagi kolom biaya per satuan, sama seperti lembar biaya ekspor pada umumnya."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="ex-commodity"
              label="Jenis barang"
              value={form.commodity}
              onChange={(v) => set("commodity", v)}
              placeholder="Kopi Arabika Gayo"
              className="sm:col-span-2"
            />
            <TextField
              id="ex-hs"
              label="Kode HS"
              value={form.hsCode}
              onChange={(v) => set("hsCode", v)}
              placeholder="0901.11.10"
              hint="Dipakai sebagai catatan pada lembar biaya."
            />
            <SelectField
              id="ex-unit"
              label="Satuan"
              value={form.unit}
              onChange={(v) => set("unit", v)}
              options={UNIT_OPTIONS}
            />
            <NumberField
              id="ex-qty"
              label="Jumlah"
              value={form.quantity}
              onChange={(v) => set("quantity", v)}
              suffix={sheet.unitSuffix}
            />
            <NumberField
              id="ex-weight"
              label="Berat total kiriman"
              value={form.totalWeightKg}
              onChange={(v) => setRouteField("totalWeightKg", v)}
              suffix="kg"
              hint="Menentukan jumlah kontainer dan tarif LCL, curah, serta udara."
            />
            <NumberField
              id="ex-volume"
              label="Volume total kiriman"
              value={form.totalVolumeCbm}
              onChange={(v) => setRouteField("totalVolumeCbm", v)}
              suffix="m³"
              hint="Isi bila barang ringan tapi bervolume besar. Boleh 0 bila tidak tahu."
              className="sm:col-span-2"
            />
          </div>

          {canFillFromQuantity && (
            <button
              type="button"
              onClick={fillFromQuantity}
              className="mt-4 rounded-lg border border-brand-300 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-100"
            >
              Isi berat dan volume dari jumlah
            </button>
          )}
        </FieldGroup>

        {/* ---------- Rute ---------- */}
        <FieldGroup
          title="Alamat pengirim dan penerima"
          description="Kota asal menentukan pelabuhan muat dan perkiraan ongkos trucking. Negara tujuan menentukan ongkos angkut dan perkiraan waktu tempuh."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="ex-origin-city"
              label="Kota eksportir"
              value={form.originCity}
              onChange={(v) => setRouteField("originCity", v)}
              suggestions={ORIGIN_CITY_NAMES}
              placeholder="Takengon"
              hint="Pilih dari daftar atau tulis sendiri."
            />
            <TextField
              id="ex-origin-country"
              label="Negara eksportir"
              value={form.originCountry}
              onChange={(v) => setRouteField("originCountry", v)}
              placeholder="Indonesia"
            />
            <SelectField
              id="ex-port"
              label="Pelabuhan muat"
              value={form.loadPortId}
              onChange={(v) => setRouteField("loadPortId", v)}
              options={PORT_OPTIONS}
              className="sm:col-span-2"
            />
            <TextField
              id="ex-dest-city"
              label="Kota importir"
              value={form.destinationCity}
              onChange={(v) => setRouteField("destinationCity", v)}
              placeholder="Sydney"
            />
            <TextField
              id="ex-dest-country"
              label="Negara importir"
              value={form.destinationCountry}
              onChange={(v) => setRouteField("destinationCountry", v)}
              suggestions={TRANSIT_COUNTRY_NAMES}
              placeholder="Australia"
            />
          </div>
        </FieldGroup>

        {/* ---------- Cara kirim ---------- */}
        <FieldGroup
          title="Metode pengiriman"
          description={SHIPPING_MODE_META[form.shippingMode].description}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="ex-mode"
              label="Metode"
              value={form.shippingMode}
              onChange={(v) => setRouteField("shippingMode", v)}
              options={MODE_OPTIONS}
              className="sm:col-span-2"
            />
            {usesContainer && (
              <>
                <SelectField
                  id="ex-container"
                  label="Tipe kontainer"
                  value={form.containerType}
                  onChange={(v) => setRouteField("containerType", v)}
                  options={CONTAINER_OPTIONS}
                  hint={CONTAINER_META[form.containerType].description}
                />
                <NumberField
                  id="ex-container-count"
                  label="Jumlah kontainer"
                  value={form.containerCount}
                  onChange={(v) => setRouteField("containerCount", v)}
                  step="1"
                  hint="Isi 0 agar dihitung otomatis dari berat dan volume."
                />
              </>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refreshRouteEstimates}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Ambil perkiraan biaya rute
            </button>
            {!routeSynced && (
              <span className="text-xs font-medium text-amber-700">
                Rute berubah. Tekan tombol di samping untuk memperbarui ongkos
                trucking, biaya pelabuhan, dan ongkos angkut.
              </span>
            )}
          </div>
        </FieldGroup>

        {/* ---------- Grup 1-3 ---------- */}
        <FieldGroup
          title="Grup 1 sampai 3: barang, kemasan, dan persiapan"
          description="Biaya sebelum barang keluar dari gudang Anda."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-goods"
              label={`Harga pokok barang per ${sheet.unitSuffix}`}
              value={form.goodsCostPerUnit}
              onChange={(v) => set("goodsCostPerUnit", v)}
              prefix="Rp"
              hint="Harga beli dari petani atau pemasok, atau biaya produksi sendiri."
            />
            <NumberField
              id="ex-pack"
              label={`Kemasan ekspor per ${sheet.unitSuffix}`}
              value={form.packagingPerUnit}
              onChange={(v) => set("packagingPerUnit", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-marking"
              label="Penandaan dan pelabelan"
              value={form.markingIdr}
              onChange={(v) => set("markingIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-sorting"
              label="Sortasi, penimbangan, pemeriksaan mutu"
              value={form.sortingIdr}
              onChange={(v) => set("sortingIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-stuffing"
              label="Stuffing dan upah buruh"
              value={form.stuffingIdr}
              onChange={(v) => set("stuffingIdr", v)}
              prefix="Rp"
              className="sm:col-span-2"
            />
          </div>
        </FieldGroup>

        {/* ---------- Grup 4 ---------- */}
        <FieldGroup
          title="Grup 4: transportasi dan penanganan (jasa EMKL)"
          description={
            usesContainer
              ? `Ongkos trucking, penumpukan, dan THC diisi per kontainer, lalu dikali ${sheet.containerPlan?.count ?? 1} kontainer.`
              : "Untuk LCL, curah, dan udara, biaya ini dihitung satu kali per pengapalan."
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-trucking"
              label={
                usesContainer
                  ? "Trucking ke pelabuhan + lift on (per kontainer)"
                  : "Trucking ke pelabuhan + lift on"
              }
              value={form.truckingIdr}
              onChange={(v) => set("truckingIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-clearance"
              label="Jasa custom clearance (PEB)"
              value={form.customClearanceIdr}
              onChange={(v) => set("customClearanceIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-stacking"
              label={
                usesContainer
                  ? "Penumpukan + lift off (per kontainer)"
                  : "Penumpukan + lift off"
              }
              value={form.stackingIdr}
              onChange={(v) => set("stackingIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-thc"
              label={
                usesContainer
                  ? "Terminal Handling Charge (per kontainer)"
                  : "Terminal Handling Charge"
              }
              value={form.thcIdr}
              onChange={(v) => set("thcIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-bl"
              label="Administrasi dokumen pengapalan (B/L fee)"
              value={form.billOfLadingIdr}
              onChange={(v) => set("billOfLadingIdr", v)}
              prefix="Rp"
              className="sm:col-span-2"
            />
          </div>

          <fieldset className="mt-6">
            <legend className="field-label">Dokumen yang perlu diurus</legend>
            <p className="field-hint mb-3">
              Centang yang diminta pembeli atau diwajibkan negara tujuan.
              Biayanya langsung masuk ke baris 4f pada lembar biaya.
            </p>
            <div className="space-y-2.5">
              {DOCUMENT_FEES.map((doc) => (
                <CheckboxRow
                  key={doc.id}
                  id={`ex-doc-${doc.id}`}
                  label={doc.label}
                  checked={form.documentFeeIds.includes(doc.id)}
                  onChange={(on) => toggleDoc(doc.id, on)}
                  hint={doc.when}
                  amount={`${formatIDR(doc.idr)}${doc.perContainer ? " / kontainer" : ""}`}
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-5">
            <NumberField
              id="ex-otherdoc"
              label="Dokumen lain-lain"
              value={form.otherDocumentIdr}
              onChange={(v) => set("otherDocumentIdr", v)}
              prefix="Rp"
            />
          </div>
        </FieldGroup>

        {/* ---------- Grup 5 ---------- */}
        <FieldGroup
          title="Grup 5: bea keluar"
          description="Sebagian besar komoditas tidak terkena bea keluar. Kami tidak mengisinya otomatis karena tarifnya berjenjang dan ditinjau berkala."
        >
          <NumberField
            id="ex-duty"
            label="Bea keluar"
            value={form.exportDutyIdr}
            onChange={(v) => set("exportDutyIdr", v)}
            prefix="Rp"
            hint={
              <>
                Periksa tarif yang berlaku untuk kode HS Anda di{" "}
                <a
                  href={EXPORT_DUTY_REFERENCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-700 hover:underline"
                >
                  Indonesia National Trade Repository
                </a>
                .
              </>
            }
          />

          <details className="mt-4 rounded-lg border border-slate-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-900">
              Komoditas yang umumnya terkena bea keluar
            </summary>
            <ul className="mt-2.5 space-y-1 text-sm text-slate-600">
              {EXPORT_DUTY_WATCHLIST.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-slate-400">
                    -
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </details>
        </FieldGroup>

        {/* ---------- Grup 6 ---------- */}
        <FieldGroup
          title="Grup 6: biaya bank"
          description="Biaya L/C hanya muncul bila pembayaran memakai Letter of Credit. Untuk T/T atau Open Account, kosongkan baris L/C dan sisakan biaya transfer saja."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-lc-advice"
              label="L/C Advice"
              value={form.bankLcAdvisingIdr}
              onChange={(v) => set("bankLcAdvisingIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-lc-nego"
              label="L/C Negotiation"
              value={form.bankLcNegotiationIdr}
              onChange={(v) => set("bankLcNegotiationIdr", v)}
              prefix="Rp"
              hint="Umumnya persentase dari nilai tagihan dengan batas minimum."
            />
            <NumberField
              id="ex-courier"
              label="Document Courier"
              value={form.bankCourierIdr}
              onChange={(v) => set("bankCourierIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-bankfee"
              label="Bank Fee dan administrasi"
              value={form.bankHandlingIdr}
              onChange={(v) => set("bankHandlingIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-discrepancy"
              label="Biaya diskrepansi"
              value={form.bankDiscrepancyIdr}
              onChange={(v) => set("bankDiscrepancyIdr", v)}
              prefix="Rp"
              hint="Dikenakan bila dokumen tidak sesuai syarat L/C. Sering terjadi pada ekspor pertama, jadi tidak salah bila dianggarkan."
              className="sm:col-span-2"
            />
          </div>
        </FieldGroup>

        {/* ---------- Grup 7-10 ---------- */}
        <FieldGroup
          title="Grup 7 sampai 10: lain-lain, komisi, angkut, asuransi"
          description="Komisi agen dihitung dari harga FOB, bukan dari biaya, sesuai cara agen menagih."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <NumberField
              id="ex-other"
              label="Biaya lain-lain"
              value={form.otherCostIdr}
              onChange={(v) => set("otherCostIdr", v)}
              prefix="Rp"
            />
            <NumberField
              id="ex-commission"
              label="Komisi agen"
              value={form.agentCommissionPercent}
              onChange={(v) => set("agentCommissionPercent", v)}
              suffix="%"
              hint="Lazimnya 2-5%. Isi 0 bila menjual langsung."
            />
            <NumberField
              id="ex-freight"
              label="Ongkos angkut ke tujuan"
              value={form.freightIdr}
              onChange={(v) => set("freightIdr", v)}
              prefix="Rp"
              hint="Diisi dari perkiraan rute. Ganti dengan angka penawaran pelayaran bila sudah ada."
            />
            <NumberField
              id="ex-insurance"
              label="Tarif asuransi kargo"
              value={form.insurancePercent}
              onChange={(v) => set("insurancePercent", v)}
              suffix="%"
              hint="Dihitung dari 110% nilai CFR, sesuai syarat Incoterms untuk CIF."
            />
            <NumberField
              id="ex-rate"
              label="Kurs untuk konversi"
              value={form.usdIdr}
              onChange={(v) => set("usdIdr", v)}
              prefix="Rp"
              hint="Dipakai hanya untuk menampilkan hasil dalam dolar."
              className="sm:col-span-2"
            />
          </div>
        </FieldGroup>
      </div>

      {/* ================= HASIL ================= */}
      <div className="lg:col-span-2">
        <div className="space-y-5 lg:sticky lg:top-24">
          {sheet.invalid ? (
            <Callout tone="danger" title="Angka belum bisa dihitung">
              {sheet.invalidReason}
            </Callout>
          ) : (
            <>
              <div className="card overflow-hidden">
                <div className="bg-gradient-to-br from-brand-700 to-navy-900 px-5 py-5">
                  <p className="text-xs font-semibold tracking-wider text-brand-200 uppercase">
                    Harga CIF per {sheet.unitSuffix}
                  </p>
                  <p className="mt-1.5 text-2xl font-bold break-words text-white tabular-nums sm:text-3xl">
                    {formatIDR(sheet.cif.perUnit)}
                  </p>
                  <p className="mt-1 text-sm text-brand-100/85">
                    {rate > 0
                      ? `${formatMoney(sheet.cif.perUnitUsd, "USD")} per ${sheet.unitSuffix}`
                      : "Isi kurs untuk melihat nilai dolar"}
                  </p>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <ResultStat
                    label={`FOB per ${sheet.unitSuffix}`}
                    value={formatIDR(sheet.fob.perUnit)}
                    sub={rate > 0 ? formatMoney(sheet.fob.perUnitUsd, "USD") : undefined}
                    tone="brand"
                  />
                  <ResultStat
                    label={`CFR per ${sheet.unitSuffix}`}
                    value={formatIDR(sheet.cfr.perUnit)}
                    sub={rate > 0 ? formatMoney(sheet.cfr.perUnitUsd, "USD") : undefined}
                  />
                </div>

                <div className="border-t border-slate-200 px-5 py-4">
                  <dl>
                    {sheet.groups.map((group) => (
                      <ResultRow
                        key={group.code}
                        label={`${group.code}. ${group.title}`}
                        value={formatIDR(group.subtotal)}
                      />
                    ))}
                    <ResultRow
                      label="Nilai kontrak CIF"
                      value={formatIDR(sheet.cif.total)}
                      strong
                    />
                    {rate > 0 && (
                      <ResultRow
                        label="Nilai kontrak CIF (USD)"
                        value={formatMoney(sheet.cif.totalUsd, "USD")}
                      />
                    )}
                  </dl>
                </div>
              </div>

              {/* Rencana kontainer */}
              {sheet.containerPlan && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-navy-900">
                    Rencana kontainer
                  </h3>
                  <dl className="mt-3">
                    <ResultRow
                      label="Jumlah kontainer"
                      value={`${sheet.containerPlan.count} x ${CONTAINER_META[sheet.containerPlan.type].label}`}
                      strong
                    />
                    <ResultRow
                      label="Penentu jumlah"
                      value={sheet.containerPlan.limitedBy}
                    />
                    <ResultRow
                      label="Terpakai dari batas berat"
                      value={`${formatNumber(sheet.containerPlan.weightUtilizationPercent, 0)}%`}
                    />
                    <ResultRow
                      label="Terpakai dari ruang volume"
                      value={`${formatNumber(sheet.containerPlan.volumeUtilizationPercent, 0)}%`}
                    />
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Batas berat yang dipakai {formatNumber(CONTAINER_META[sheet.containerPlan.type].practicalPayloadKg, 0)} kg
                    per kontainer, lebih rendah dari batas katalog karena aturan
                    tonase jalan di Indonesia.
                  </p>
                </div>
              )}

              {/* Perkiraan waktu sampai */}
              {sheet.transit && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-navy-900">
                    Perkiraan waktu sampai
                  </h3>
                  <p className="mt-1.5 text-lg font-bold text-brand-700 tabular-nums">
                    {formatTransitRange(
                      sheet.transit.totalMinDays,
                      sheet.transit.totalMaxDays,
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    dari gudang Anda sampai diterima pembeli di{" "}
                    {sheet.transit.country}
                  </p>
                  <dl className="mt-3">
                    {sheet.transit.stages.map((stage) => (
                      <ResultRow
                        key={stage.label}
                        label={stage.label}
                        value={`${stage.minDays}-${stage.maxDays} hari`}
                      />
                    ))}
                  </dl>
                  {sheet.transit.commonPorts.length > 0 && (
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                      Pelabuhan bongkar yang umum dipakai:{" "}
                      {sheet.transit.commonPorts.join(", ")}.
                    </p>
                  )}
                </div>
              )}

              <Callout tone="warning" title="Angka ini perkiraan">
                Ongkos angkut laut dan biaya pelabuhan bisa berubah tajam antar
                pekan. Pakai lembar ini untuk menyusun struktur harga, lalu
                ganti setiap baris dengan penawaran tertulis dari EMKL,
                forwarder, dan pelayaran sebelum menyepakati harga.
              </Callout>
            </>
          )}
        </div>
      </div>

      {/* ================= LEMBAR BIAYA ================= */}
      <div className="space-y-5 lg:col-span-5">
        {sheet.warnings.length > 0 && (
          <Callout tone="warning" title="Perlu diperiksa">
            <ul className="space-y-1.5">
              {sheet.warnings.map((w) => (
                <li key={w} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Callout>
        )}

        <div className="card p-4 sm:p-6">
          <h3 className="font-semibold text-navy-900">Lembar biaya ekspor</h3>
          <p className="mt-1.5 text-sm text-slate-600">
            {form.commodity.trim() || "Barang"} sebanyak{" "}
            {formatNumber(sheet.quantity)} {sheet.unitSuffix} dari{" "}
            {form.originCity.trim() || "kota asal"} ke{" "}
            {form.destinationCity.trim() || form.destinationCountry.trim() || "tujuan"}
            {form.hsCode.trim() && `, HS ${form.hsCode.trim()}`}. Semua angka
            dalam rupiah.
          </p>
          <div className="mt-5">
            <SheetTable rows={sheetRows} unitSuffix={sheet.unitSuffix} />
          </div>
        </div>

        <Callout tone="info" title="Pos yang sering terlewat">
          Selisih kurs antara tanggal kontrak dan tanggal pembayaran, ongkos
          pengiriman sampel, biaya perpanjangan sertifikasi, denda keterlambatan
          pengapalan, serta biaya penumpukan tambahan bila kontainer tertahan di
          pelabuhan. Untuk ekspor pertama, menambahkan cadangan 2% sampai 3% di
          atas hasil hitungan ini adalah kebiasaan yang sehat.
        </Callout>
      </div>
    </div>
  );
}
