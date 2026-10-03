import {
  BANK_FEES,
  DEFAULT_AGENT_COMMISSION_PERCENT,
  DEFAULT_CARGO_INSURANCE_PERCENT,
  DEFAULT_USD_IDR,
  DOCUMENT_FEES,
  EMKL_FEES,
  FALLBACK_TRUCKING_IDR,
  INSURANCE_COVERAGE_MULTIPLIER,
  SHIPMENT_FEES,
  estimateFreight,
  findOriginCity,
  getExportPort,
  type ExportPort,
  type FreightEstimate,
} from "@/data/logisticsRates";
import { estimateTransit, type TransitEstimate } from "@/data/transitTimes";
import {
  CONTAINER_META,
  UNIT_SUFFIX,
  type ContainerType,
  type ShippingMode,
  type Unit,
} from "@/lib/types";

/* ============================================================
   Lembar biaya ekspor.

   Mengikuti bentuk lembar biaya yang dipakai pelaku ekspor dan EMKL di
   Indonesia: biaya dikelompokkan bernomor, setiap baris punya total per
   pengapalan dan biaya per satuan barang, lalu dijumlah bertingkat menjadi
   harga FOB, CFR, dan CIF.

   Alur penjumlahannya:
     Grup 1 sampai 7  ->  dasar biaya
     Grup 8           ->  komisi agen, persentase dari harga FOB
     = HARGA FOB
     Grup 9           ->  ongkos angkut
     = HARGA CFR
     Grup 10          ->  asuransi kargo
     = HARGA CIF

   Kenapa komisi agen dihitung dari FOB, bukan dari dasar biaya: agen
   menagih persentase dari nilai jual, bukan dari biaya. Jadi FOB harus
   dicari dengan membagi, bukan dengan menambah:

       FOB = dasar biaya / (1 - komisi%)

   Kalau komisi ditambahkan langsung ke dasar biaya, hasilnya lebih kecil
   dari yang sebenarnya ditagih agen, dan eksportir kehilangan selisihnya.

   BATASAN: seluruh angka awal adalah perkiraan. Lihat catatan di
   src/data/logisticsRates.ts. Semua baris wajib bisa diedit pengguna.
   ============================================================ */

export interface SheetRow {
  /** Kode urut di dalam grup, mis. "a" atau "f1". */
  code: string;
  label: string;
  /** Total rupiah untuk seluruh pengapalan. */
  total: number;
  /** Rupiah per satuan barang. */
  perUnit: number;
  /** Penjelasan singkat cara angkanya didapat. */
  formula?: string;
}

export interface SheetGroup {
  /** Nomor grup seperti di lembar biaya, mis. "4". */
  code: string;
  title: string;
  rows: SheetRow[];
  subtotal: number;
  subtotalPerUnit: number;
  note?: string;
}

export interface SheetMilestone {
  /** "HARGA FOB", "HARGA CFR", atau "HARGA CIF". */
  label: string;
  /** Keterangan sampai mana biaya ini menanggung. */
  description: string;
  total: number;
  perUnit: number;
  perUnitUsd: number;
  totalUsd: number;
}

export interface ContainerPlan {
  type: ContainerType;
  /** Jumlah kontainer yang dipakai dalam perhitungan. */
  count: number;
  /** Jumlah minimum menurut berat. */
  countByWeight: number;
  /** Jumlah minimum menurut volume. */
  countByVolume: number;
  /** Faktor yang menentukan: berat, volume, atau isian pengguna. */
  limitedBy: "berat" | "volume" | "isian pengguna";
  /** Pemakaian ruang dan berat pada jumlah kontainer yang dipakai, persen. */
  weightUtilizationPercent: number;
  volumeUtilizationPercent: number;
}

export interface ExportSheetInput {
  /* --- Barang --- */
  commodity: string;
  hsCode: string;
  /** Jumlah barang dalam satuan `unit`. Jadi pembagi kolom per satuan. */
  quantity: number;
  unit: Unit;
  /** Berat total kiriman, kg. Dipakai untuk muat kontainer dan tarif. */
  totalWeightKg: number;
  /** Volume total kiriman, m³. */
  totalVolumeCbm: number;

  /* --- Rute --- */
  originCity: string;
  originCountry: string;
  /** Id pelabuhan muat dari EXPORT_PORTS. */
  loadPortId: string;
  destinationCity: string;
  destinationCountry: string;

  /* --- Cara kirim --- */
  shippingMode: ShippingMode;
  containerType: ContainerType;
  /** 0 berarti hitung otomatis dari berat dan volume. */
  containerCount: number;

  /* --- Grup 1: harga pokok barang --- */
  goodsCostPerUnit: number;

  /* --- Grup 2: pengemasan dan penandaan --- */
  packagingPerUnit: number;
  markingIdr: number;

  /* --- Grup 3: persiapan di gudang --- */
  sortingIdr: number;
  stuffingIdr: number;

  /* --- Grup 4: transportasi dan penanganan (jasa EMKL) --- */
  truckingIdr: number;
  customClearanceIdr: number;
  stackingIdr: number;
  thcIdr: number;
  billOfLadingIdr: number;
  /** Id dokumen dari DOCUMENT_FEES yang dipilih. */
  documentFeeIds: string[];
  otherDocumentIdr: number;

  /* --- Grup 5: bea keluar --- */
  exportDutyIdr: number;

  /* --- Grup 6: biaya bank --- */
  bankLcAdvisingIdr: number;
  bankLcNegotiationIdr: number;
  bankCourierIdr: number;
  bankHandlingIdr: number;
  bankDiscrepancyIdr: number;

  /* --- Grup 7: biaya lain-lain --- */
  otherCostIdr: number;

  /* --- Grup 8: komisi agen --- */
  agentCommissionPercent: number;

  /* --- Grup 9: ongkos angkut --- */
  freightIdr: number;

  /* --- Grup 10: asuransi kargo --- */
  insurancePercent: number;

  /** Kurs untuk menampilkan hasil dalam dolar. */
  usdIdr: number;
}

export interface ExportSheet {
  quantity: number;
  unit: Unit;
  unitSuffix: string;
  groups: SheetGroup[];
  /** Jumlah grup 1 sampai 7, sebelum komisi agen. */
  baseCost: number;
  baseCostPerUnit: number;
  fob: SheetMilestone;
  cfr: SheetMilestone;
  cif: SheetMilestone;
  /** Rencana kontainer. null untuk curah dan udara. */
  containerPlan: ContainerPlan | null;
  /** Perkiraan waktu sampai. null bila tujuan tidak bisa ditafsirkan. */
  transit: TransitEstimate | null;
  loadPort: ExportPort | null;
  /** Hal yang perlu diperiksa pengguna sebelum memakai angka ini. */
  warnings: string[];
  /** true bila komisi agen >= 100%, sehingga harga tidak bisa dihitung. */
  invalid: boolean;
  invalidReason: string | null;
}

const safe = (n: number): number => (Number.isFinite(n) ? n : 0);
const nonNeg = (n: number): number => Math.max(safe(n), 0);

/**
 * Turunkan berat kiriman dari jumlah dan satuannya.
 *
 * Hanya satuan yang memang berat yang bisa diturunkan. Untuk pcs, karton,
 * dan kontainer, beratnya harus diisi pengguna karena tidak ada hubungan
 * tetap antara jumlah dan berat. Mengembalikan null untuk kasus itu,
 * bukan menebak, supaya tarif LCL dan udara tidak salah hitung.
 */
export function deriveWeightKg(quantity: number, unit: Unit): number | null {
  const q = nonNeg(quantity);
  switch (unit) {
    case "kg":
      return q;
    case "mt":
      return q * 1000;
    default:
      return null;
  }
}

/** Turunkan volume dari jumlah bila satuannya memang volume. */
export function deriveVolumeCbm(quantity: number, unit: Unit): number | null {
  const q = nonNeg(quantity);
  switch (unit) {
    case "cbm":
      return q;
    /* 1 liter = 0,001 m³. Ini konversi volume murni, bukan dugaan. */
    case "liter":
      return q / 1000;
    default:
      return null;
  }
}

/** Hitung jumlah kontainer yang dibutuhkan dari berat dan volume. */
export function planContainers(
  containerType: ContainerType,
  totalWeightKg: number,
  totalVolumeCbm: number,
  requestedCount: number,
): ContainerPlan {
  const spec = CONTAINER_META[containerType];

  const countByWeight =
    nonNeg(totalWeightKg) > 0
      ? Math.ceil(nonNeg(totalWeightKg) / spec.practicalPayloadKg)
      : 0;
  const countByVolume =
    nonNeg(totalVolumeCbm) > 0
      ? Math.ceil(nonNeg(totalVolumeCbm) / spec.capacityCbm)
      : 0;

  const needed = Math.max(countByWeight, countByVolume, 1);
  const requested = Math.round(nonNeg(requestedCount));
  const count = requested > 0 ? requested : needed;

  const limitedBy: ContainerPlan["limitedBy"] =
    requested > 0
      ? "isian pengguna"
      : countByVolume > countByWeight
        ? "volume"
        : "berat";

  return {
    type: containerType,
    count,
    countByWeight,
    countByVolume,
    limitedBy,
    weightUtilizationPercent:
      count > 0
        ? (nonNeg(totalWeightKg) / (spec.practicalPayloadKg * count)) * 100
        : 0,
    volumeUtilizationPercent:
      count > 0 ? (nonNeg(totalVolumeCbm) / (spec.capacityCbm * count)) * 100 : 0,
  };
}

/** Komoditas yang biasanya terkena bea keluar, dikenali dari namanya. */
const EXPORT_DUTY_KEYWORDS =
  /\b(sawit|cpo|cpko|palm|kayu|log|rotan|kulit mentah|wet blue|kakao|cocoa|bijih|nikel|bauksit|tembaga|konsentrat)\b/i;

/**
 * Nilai awal lembar biaya, diisi dari data rute.
 *
 * Dipakai komponen kalkulator sebagai titik mulai. Semua angka yang
 * dihasilkan di sini masih bisa diubah pengguna.
 */
export function buildDefaultSheetInput(partial?: {
  originCity?: string;
  destinationCountry?: string;
  containerType?: ContainerType;
  shippingMode?: ShippingMode;
}): ExportSheetInput {
  const originCity = partial?.originCity ?? "Takengon";
  const containerType = partial?.containerType ?? "20ft";
  const shippingMode = partial?.shippingMode ?? "FCL";
  const destinationCountry = partial?.destinationCountry ?? "Australia";

  const origin = findOriginCity(originCity);
  const emkl = EMKL_FEES[containerType];
  const trucking =
    origin?.truckingIdr[containerType] ?? FALLBACK_TRUCKING_IDR[containerType];

  const quantity = 18_000;
  const totalWeightKg = 18_000;

  const freight = estimateFreight({
    destinationCountry,
    mode: shippingMode,
    containerType,
    containerCount: 1,
    weightKg: totalWeightKg,
    volumeCbm: 0,
    usdIdr: DEFAULT_USD_IDR,
  });

  const defaultDocs = DOCUMENT_FEES.filter((d) => d.defaultOn).map((d) => d.id);

  return {
    commodity: "Kopi Arabika Gayo",
    hsCode: "0901.11.10",
    quantity,
    unit: "kg",
    totalWeightKg,
    totalVolumeCbm: 0,

    originCity,
    originCountry: "Indonesia",
    loadPortId: origin?.portId ?? "priok",
    destinationCity: "Sydney",
    destinationCountry,

    shippingMode,
    containerType,
    containerCount: 0,

    goodsCostPerUnit: 95_000,

    packagingPerUnit: 1_200,
    markingIdr: 750_000,

    sortingIdr: 2_500_000,
    stuffingIdr: 1_800_000,

    truckingIdr: trucking,
    customClearanceIdr: SHIPMENT_FEES.customClearance,
    stackingIdr: emkl.liftOnOff + emkl.stackingPortCharges,
    thcIdr: emkl.thc,
    billOfLadingIdr: SHIPMENT_FEES.billOfLading,
    documentFeeIds: defaultDocs,
    otherDocumentIdr: 0,

    exportDutyIdr: 0,

    bankLcAdvisingIdr: BANK_FEES.lcAdvising,
    bankLcNegotiationIdr: BANK_FEES.lcNegotiationMinimum,
    bankCourierIdr: BANK_FEES.documentCourier,
    bankHandlingIdr: BANK_FEES.handling,
    bankDiscrepancyIdr: 0,

    otherCostIdr: 0,

    agentCommissionPercent: DEFAULT_AGENT_COMMISSION_PERCENT,

    freightIdr: Math.round(freight.idr),

    insurancePercent: DEFAULT_CARGO_INSURANCE_PERCENT,

    usdIdr: DEFAULT_USD_IDR,
  };
}

export function buildExportSheet(input: ExportSheetInput): ExportSheet {
  const quantity = nonNeg(input.quantity);
  const perUnitOf = (total: number): number =>
    quantity > 0 ? total / quantity : 0;

  const usdIdr = nonNeg(input.usdIdr) || DEFAULT_USD_IDR;
  const warnings: string[] = [];

  const usesContainer = input.shippingMode === "FCL";
  const containerPlan = usesContainer
    ? planContainers(
        input.containerType,
        input.totalWeightKg,
        input.totalVolumeCbm,
        input.containerCount,
      )
    : null;
  const containerCount = containerPlan?.count ?? 1;

  /* ---------- Grup 1: harga pokok barang ---------- */
  const goodsTotal = nonNeg(input.goodsCostPerUnit) * quantity;

  const group1: SheetGroup = {
    code: "1",
    title: "Harga Pokok Barang",
    rows: [
      {
        code: "a",
        label: "Harga beli atau biaya produksi barang",
        total: goodsTotal,
        perUnit: perUnitOf(goodsTotal),
        formula: `${quantity.toLocaleString("id-ID")} ${UNIT_SUFFIX[input.unit]} x harga pokok per satuan`,
      },
    ],
    subtotal: goodsTotal,
    subtotalPerUnit: perUnitOf(goodsTotal),
  };

  /* ---------- Grup 2: pengemasan dan penandaan ---------- */
  const packagingTotal = nonNeg(input.packagingPerUnit) * quantity;
  const markingTotal = nonNeg(input.markingIdr);

  const group2: SheetGroup = {
    code: "2",
    title: "Pengemasan dan Penandaan",
    rows: [
      {
        code: "a",
        label: "Kemasan ekspor (karung, karton, palet, inner liner)",
        total: packagingTotal,
        perUnit: perUnitOf(packagingTotal),
        formula: `${quantity.toLocaleString("id-ID")} ${UNIT_SUFFIX[input.unit]} x biaya kemasan per satuan`,
      },
      {
        code: "b",
        label: "Penandaan dan pelabelan (shipping mark)",
        total: markingTotal,
        perUnit: perUnitOf(markingTotal),
      },
    ],
    subtotal: packagingTotal + markingTotal,
    subtotalPerUnit: perUnitOf(packagingTotal + markingTotal),
  };

  /* ---------- Grup 3: persiapan di gudang ---------- */
  const sorting = nonNeg(input.sortingIdr);
  const stuffing = nonNeg(input.stuffingIdr);

  const group3: SheetGroup = {
    code: "3",
    title: "Persiapan Barang di Gudang",
    rows: [
      {
        code: "a",
        label: "Sortasi, penimbangan, dan pemeriksaan mutu",
        total: sorting,
        perUnit: perUnitOf(sorting),
      },
      {
        code: "b",
        label: "Stuffing ke kontainer dan upah buruh",
        total: stuffing,
        perUnit: perUnitOf(stuffing),
      },
    ],
    subtotal: sorting + stuffing,
    subtotalPerUnit: perUnitOf(sorting + stuffing),
  };

  /* ---------- Grup 4: transportasi dan penanganan (jasa EMKL) ---------- */
  const trucking = nonNeg(input.truckingIdr) * (usesContainer ? containerCount : 1);
  const clearance = nonNeg(input.customClearanceIdr);
  const stacking = nonNeg(input.stackingIdr) * (usesContainer ? containerCount : 1);
  const thc = nonNeg(input.thcIdr) * (usesContainer ? containerCount : 1);
  const bl = nonNeg(input.billOfLadingIdr);

  const group4Rows: SheetRow[] = [
    {
      code: "a",
      label: "Trucking dari gudang atau pabrik ke pelabuhan ekspor, termasuk lift on",
      total: trucking,
      perUnit: perUnitOf(trucking),
      formula: usesContainer
        ? `${containerCount} kontainer x ongkos per kontainer`
        : undefined,
    },
    {
      code: "b",
      label: "Jasa pengurusan custom clearance (PEB oleh PPJK)",
      total: clearance,
      perUnit: perUnitOf(clearance),
    },
    {
      code: "c",
      label: "Penumpukan dan lift off (port charges)",
      total: stacking,
      perUnit: perUnitOf(stacking),
      formula: usesContainer ? `${containerCount} kontainer` : undefined,
    },
    {
      code: "d",
      label: "Terminal Handling Charge (THC)",
      total: thc,
      perUnit: perUnitOf(thc),
      formula: usesContainer ? `${containerCount} kontainer` : undefined,
    },
    {
      code: "e",
      label: "Administrasi dokumen pengapalan (B/L fee)",
      total: bl,
      perUnit: perUnitOf(bl),
    },
  ];

  /* Dokumen dirinci satu per satu supaya pengguna melihat apa yang dia
     bayar, bukan satu angka gabungan yang tidak bisa ditelusuri. */
  let docIndex = 0;
  let documentTotal = 0;

  for (const id of input.documentFeeIds) {
    const doc = DOCUMENT_FEES.find((d) => d.id === id);
    if (!doc) continue;

    docIndex += 1;
    const multiplier = doc.perContainer && usesContainer ? containerCount : 1;
    const total = doc.idr * multiplier;
    documentTotal += total;

    group4Rows.push({
      code: `f${docIndex}`,
      label: doc.label,
      total,
      perUnit: perUnitOf(total),
      formula: multiplier > 1 ? `${multiplier} kontainer x tarif` : undefined,
    });
  }

  const otherDoc = nonNeg(input.otherDocumentIdr);
  if (otherDoc > 0) {
    docIndex += 1;
    documentTotal += otherDoc;
    group4Rows.push({
      code: `f${docIndex}`,
      label: "Dokumen lain-lain",
      total: otherDoc,
      perUnit: perUnitOf(otherDoc),
    });
  }

  const group4Subtotal = trucking + clearance + stacking + thc + bl + documentTotal;

  const group4: SheetGroup = {
    code: "4",
    title: "Transportasi dan Penanganan Barang Ekspor (Jasa EMKL)",
    rows: group4Rows,
    subtotal: group4Subtotal,
    subtotalPerUnit: perUnitOf(group4Subtotal),
    note: "Biaya pelabuhan berbeda antar terminal dan antar penyedia jasa. Minta rincian tertulis dari EMKL sebelum sepakat.",
  };

  /* ---------- Grup 5: bea keluar ---------- */
  const exportDuty = nonNeg(input.exportDutyIdr);

  const group5: SheetGroup = {
    code: "5",
    title: "Bea Keluar",
    rows: [
      {
        code: "a",
        label: "Bea keluar",
        total: exportDuty,
        perUnit: perUnitOf(exportDuty),
        formula:
          exportDuty === 0
            ? "Nol untuk sebagian besar komoditas. Periksa sendiri untuk komoditas yang diatur."
            : undefined,
      },
    ],
    subtotal: exportDuty,
    subtotalPerUnit: perUnitOf(exportDuty),
    note: "Kami sengaja tidak mengisi tarif bea keluar secara otomatis. Tarifnya berjenjang, ditinjau berkala, dan berbeda per kode HS.",
  };

  /* ---------- Grup 6: biaya bank ---------- */
  const bankRows: { code: string; label: string; total: number }[] = [
    { code: "a", label: "L/C Advice", total: nonNeg(input.bankLcAdvisingIdr) },
    { code: "b", label: "L/C Negotiation", total: nonNeg(input.bankLcNegotiationIdr) },
    { code: "c", label: "Document Courier", total: nonNeg(input.bankCourierIdr) },
    { code: "d", label: "Bank Fee dan administrasi", total: nonNeg(input.bankHandlingIdr) },
    { code: "e", label: "Biaya diskrepansi", total: nonNeg(input.bankDiscrepancyIdr) },
  ];
  const group6Subtotal = bankRows.reduce((sum, r) => sum + r.total, 0);

  const group6: SheetGroup = {
    code: "6",
    title: "Biaya Bank",
    rows: bankRows.map((r) => ({
      code: r.code,
      label: r.label,
      total: r.total,
      perUnit: perUnitOf(r.total),
    })),
    subtotal: group6Subtotal,
    subtotalPerUnit: perUnitOf(group6Subtotal),
    note: "Biaya L/C hanya muncul bila pembayaran memakai Letter of Credit. Untuk T/T atau Open Account, kosongkan baris L/C dan sisakan biaya transfer saja.",
  };

  /* ---------- Grup 7: biaya lain-lain ---------- */
  const otherCost = nonNeg(input.otherCostIdr);

  const group7: SheetGroup = {
    code: "7",
    title: "Biaya Lain-Lain",
    rows: [
      {
        code: "a",
        label: "Biaya lain-lain",
        total: otherCost,
        perUnit: perUnitOf(otherCost),
      },
    ],
    subtotal: otherCost,
    subtotalPerUnit: perUnitOf(otherCost),
  };

  /* ---------- Harga FOB ---------- */
  const baseCost =
    group1.subtotal +
    group2.subtotal +
    group3.subtotal +
    group4.subtotal +
    group5.subtotal +
    group6.subtotal +
    group7.subtotal;

  const commissionPct = Math.max(safe(input.agentCommissionPercent), 0);
  const divisor = 1 - commissionPct / 100;
  const invalid = divisor <= 0.01;
  const invalidReason = invalid
    ? "Komisi agen mendekati atau melebihi 100% dari harga jual, jadi harga FOB tidak bisa dihitung. Turunkan persentasenya."
    : null;

  const fobTotal = invalid ? 0 : baseCost / divisor;
  const commissionTotal = invalid ? 0 : fobTotal - baseCost;

  const group8: SheetGroup = {
    code: "8",
    title: "Komisi Agen",
    rows: [
      {
        code: "a",
        label: `Komisi agen atau perantara (${commissionPct}%)`,
        total: commissionTotal,
        perUnit: perUnitOf(commissionTotal),
        formula: `${commissionPct}% dari harga FOB, jadi FOB = dasar biaya / (1 - ${commissionPct}%)`,
      },
    ],
    subtotal: commissionTotal,
    subtotalPerUnit: perUnitOf(commissionTotal),
    note: "Lazimnya 2-5%. Kosongkan bila Anda menjual langsung tanpa perantara.",
  };

  /* ---------- Grup 9: ongkos angkut, lalu CFR ---------- */
  const freightTotal = nonNeg(input.freightIdr);

  const group9: SheetGroup = {
    code: "9",
    title: "Ongkos Angkut (Freight)",
    rows: [
      {
        code: "a",
        label: `Ongkos angkut ke ${input.destinationCity.trim() || input.destinationCountry.trim() || "pelabuhan tujuan"}`,
        total: freightTotal,
        perUnit: perUnitOf(freightTotal),
      },
    ],
    subtotal: freightTotal,
    subtotalPerUnit: perUnitOf(freightTotal),
    note: "Ongkos angkut laut bisa berubah tajam antar pekan. Angka ini perkiraan, bukan kutipan pelayaran.",
  };

  const cfrTotal = fobTotal + freightTotal;

  /* ---------- Grup 10: asuransi kargo, lalu CIF ---------- */
  const insurancePct = Math.max(safe(input.insurancePercent), 0);
  const insurableValue = cfrTotal * INSURANCE_COVERAGE_MULTIPLIER;
  const insuranceTotal = insurableValue * (insurancePct / 100);

  const group10: SheetGroup = {
    code: "10",
    title: "Asuransi Kargo",
    rows: [
      {
        code: "a",
        label: "Premi asuransi kargo",
        total: insuranceTotal,
        perUnit: perUnitOf(insuranceTotal),
        formula: `${insurancePct}% x ${INSURANCE_COVERAGE_MULTIPLIER * 100}% x harga CFR`,
      },
    ],
    subtotal: insuranceTotal,
    subtotalPerUnit: perUnitOf(insuranceTotal),
    note: "Nilai pertanggungan 110% dari CFR adalah praktik yang diminta Incoterms untuk CIF dan CIP.",
  };

  const cifTotal = cfrTotal + insuranceTotal;

  /* ---------- Milestone harga ---------- */
  const milestone = (
    label: string,
    description: string,
    total: number,
  ): SheetMilestone => ({
    label,
    description,
    total,
    perUnit: perUnitOf(total),
    perUnitUsd: usdIdr > 0 ? perUnitOf(total) / usdIdr : 0,
    totalUsd: usdIdr > 0 ? total / usdIdr : 0,
  });

  const loadPort = getExportPort(input.loadPortId) ?? null;
  const portLabel = loadPort ? `${loadPort.name}, ${loadPort.city}` : "pelabuhan muat";

  const fob = milestone(
    "HARGA FOB",
    `Barang sudah berada di atas kapal di ${portLabel}. Risiko dan biaya selanjutnya ditanggung pembeli.`,
    fobTotal,
  );
  const cfr = milestone(
    "HARGA CFR",
    "FOB ditambah ongkos angkut sampai pelabuhan tujuan. Asuransi belum termasuk.",
    cfrTotal,
  );
  const cif = milestone(
    "HARGA CIF",
    "CFR ditambah asuransi kargo sampai pelabuhan tujuan.",
    cifTotal,
  );

  /* ---------- Peringatan ---------- */
  const transit = estimateTransit(input.destinationCountry, input.shippingMode);

  if (quantity <= 0) {
    warnings.push(
      "Jumlah barang masih nol, jadi kolom biaya per satuan belum bisa dihitung.",
    );
  }

  if (containerPlan) {
    const spec = CONTAINER_META[input.containerType];

    if (containerPlan.weightUtilizationPercent > 100) {
      warnings.push(
        `Berat kiriman ${nonNeg(input.totalWeightKg).toLocaleString("id-ID")} kg melebihi kapasitas ${containerPlan.count} kontainer ${spec.label} ` +
          `(sekitar ${(spec.practicalPayloadKg * containerPlan.count).toLocaleString("id-ID")} kg). Tambah jumlah kontainer atau kurangi muatan.`,
      );
    }
    if (containerPlan.volumeUtilizationPercent > 100) {
      warnings.push(
        `Volume kiriman ${nonNeg(input.totalVolumeCbm).toLocaleString("id-ID")} m³ melebihi ruang ${containerPlan.count} kontainer ${spec.label} ` +
          `(sekitar ${spec.capacityCbm * containerPlan.count} m³). Tambah jumlah kontainer.`,
      );
    }
    if (
      containerPlan.weightUtilizationPercent > 0 &&
      containerPlan.weightUtilizationPercent < 60 &&
      containerPlan.volumeUtilizationPercent < 60
    ) {
      warnings.push(
        "Kontainer terisi di bawah 60% baik dari sisi berat maupun volume. Bandingkan dengan LCL, karena membayar kontainer penuh untuk muatan sedikit biasanya lebih mahal.",
      );
    }
    if (input.containerType === "45ft") {
      warnings.push(
        "Kontainer 45ft tidak selalu tersedia di semua pelayaran dan pelabuhan, dan sebagian trailer tidak bisa mengangkutnya. Konfirmasi ketersediaannya lebih dulu.",
      );
    }
  }

  if (input.shippingMode !== "FCL" && nonNeg(input.totalWeightKg) === 0) {
    warnings.push(
      `Metode ${input.shippingMode} ditagih berdasarkan berat atau volume, tapi berat kiriman masih nol. Isi berat total agar ongkos angkut masuk akal.`,
    );
  }

  if (EXPORT_DUTY_KEYWORDS.test(input.commodity) && exportDuty === 0) {
    warnings.push(
      `"${input.commodity.trim()}" termasuk kelompok komoditas yang umumnya terkena Bea Keluar, tapi Grup 5 masih nol. Periksa tarif yang berlaku untuk kode HS Anda sebelum memakai angka ini.`,
    );
  }

  if (!findOriginCity(input.originCity)) {
    warnings.push(
      `Kota asal "${input.originCity.trim()}" belum ada di katalog kami, jadi ongkos trucking memakai angka umum. Sesuaikan sendiri dengan penawaran dari trucking lokal.`,
    );
  }

  if (transit && !transit.matched) {
    warnings.push(
      `Negara tujuan "${input.destinationCountry.trim()}" belum ada di katalog rute, jadi ongkos angkut dan waktu tempuh memakai angka umum yang rentangnya sangat lebar.`,
    );
  }

  return {
    quantity,
    unit: input.unit,
    unitSuffix: UNIT_SUFFIX[input.unit],
    groups: [
      group1,
      group2,
      group3,
      group4,
      group5,
      group6,
      group7,
      group8,
      group9,
      group10,
    ],
    baseCost,
    baseCostPerUnit: perUnitOf(baseCost),
    fob,
    cfr,
    cif,
    containerPlan,
    transit,
    loadPort,
    warnings,
    invalid,
    invalidReason,
  };
}

/**
 * Hitung ulang ongkos angkut dari rute yang sedang dipilih.
 *
 * Dipisah dari buildExportSheet supaya pengguna bisa mengedit angka
 * ongkos angkut tanpa langsung ditimpa setiap kali dia mengubah input
 * lain. Komponen memanggil ini hanya saat pengguna menekan tombol
 * "hitung ulang" atau saat rutenya benar-benar berubah.
 */
export function recalculateFreight(input: ExportSheetInput): FreightEstimate {
  const plan =
    input.shippingMode === "FCL"
      ? planContainers(
          input.containerType,
          input.totalWeightKg,
          input.totalVolumeCbm,
          input.containerCount,
        )
      : null;

  return estimateFreight({
    destinationCountry: input.destinationCountry,
    mode: input.shippingMode,
    containerType: input.containerType,
    containerCount: plan?.count ?? 1,
    weightKg: nonNeg(input.totalWeightKg),
    volumeCbm: nonNeg(input.totalVolumeCbm),
    usdIdr: nonNeg(input.usdIdr) || DEFAULT_USD_IDR,
  });
}

/** Perkiraan biaya EMKL dan trucking untuk rute yang baru dipilih. */
export function suggestRouteCosts(
  originCity: string,
  containerType: ContainerType,
): {
  loadPortId: string;
  truckingIdr: number;
  stackingIdr: number;
  thcIdr: number;
  known: boolean;
} {
  const origin = findOriginCity(originCity);
  const emkl = EMKL_FEES[containerType];

  return {
    loadPortId: origin?.portId ?? "priok",
    truckingIdr:
      origin?.truckingIdr[containerType] ?? FALLBACK_TRUCKING_IDR[containerType],
    stackingIdr: emkl.liftOnOff + emkl.stackingPortCharges,
    thcIdr: emkl.thc,
    known: Boolean(origin),
  };
}
