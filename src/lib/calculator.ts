/* ============================================================
   Kalkulator biaya ekspor & impor.

   PENTING - batasan yang harus dipahami pengguna:
     - Hasilnya ESTIMASI untuk perencanaan harga, bukan penetapan resmi.
     - Tarif bea masuk, PPN, dan PPh 22 berubah dari waktu ke waktu dan
       berbeda per kode HS serta per negara asal. Angka default di aplikasi
       hanya titik awal; pengguna WAJIB memasukkan tarif yang berlaku untuk
       kode HS-nya, yang bisa dicek di Indonesia National Trade Repository.
     - Nilai tukar untuk menghitung bea masuk memakai NDPBM (kurs pajak),
       bukan kurs bank.
   ============================================================ */

/* ------------------------------------------------------------
   IMPOR
   ------------------------------------------------------------ */

export interface ImportCosts {
  /** Terminal Handling Charge & biaya pelabuhan (IDR). */
  terminalHandling: number;
  /** Jasa PPJK / customs clearance (IDR). */
  customsBroker: number;
  /** Trucking dari pelabuhan ke gudang (IDR). */
  inlandTransport: number;
  /** Penumpukan / storage (IDR). */
  storage: number;
  /** Biaya lain-lain (IDR). */
  other: number;
}

export interface ImportInput {
  quantity: number;
  /** Harga per satuan dalam mata uang asing (basis FOB). */
  unitPriceForeign: number;
  /** Ongkos angkut total dalam mata uang asing. */
  freightForeign: number;
  /**
   * Cara menentukan asuransi:
   *  - "percent": persentase dari (FOB + freight) x 110%, praktik umum.
   *  - "amount" : nominal langsung dalam mata uang asing.
   */
  insuranceMode: "percent" | "amount";
  insurancePercent: number;
  insuranceAmountForeign: number;
  /** Kurs NDPBM: 1 satuan mata uang asing = berapa rupiah. */
  exchangeRate: number;
  /** Tarif bea masuk (%) sesuai kode HS. */
  dutyPercent: number;
  /** Bea masuk tambahan: antidumping / tindakan pengamanan (%). */
  additionalDutyPercent: number;
  /** Tarif PPN impor (%). */
  vatPercent: number;
  /** Tarif PPh Pasal 22 Impor (%). */
  incomeTaxPercent: number;
  /** Centang bila barang mendapat fasilitas pembebasan PPN. */
  vatExempt: boolean;
  costs: ImportCosts;
}

export interface LineItem {
  label: string;
  /** Nilai dalam IDR. */
  amount: number;
  /** Keterangan singkat cara hitungnya. */
  formula?: string;
  /** true untuk baris subtotal/total yang perlu ditonjolkan. */
  emphasis?: boolean;
}

export interface ImportResult {
  // Nilai dalam mata uang asing
  fobForeign: number;
  freightForeign: number;
  insuranceForeign: number;
  cifForeign: number;

  // Nilai dalam rupiah
  cifIDR: number;
  dutyIDR: number;
  additionalDutyIDR: number;
  /** Nilai Impor = CIF rupiah + bea masuk + bea masuk tambahan. */
  importValueIDR: number;
  vatIDR: number;
  incomeTaxIDR: number;
  /** Bea masuk + bea tambahan + PPN + PPh 22. */
  totalLeviesIDR: number;
  localCostsIDR: number;
  /** Total biaya sampai barang berada di gudang importir. */
  landedCostIDR: number;
  costPerUnitIDR: number;

  /** PPN & PPh 22 yang umumnya bisa dikreditkan oleh wajib pajak berstatus PKP. */
  creditableTaxesIDR: number;
  /** Biaya efektif bila pajak kreditabel diperhitungkan. */
  netCostAfterCreditIDR: number;
  netCostPerUnitIDR: number;

  /** Total pungutan sebagai persentase dari nilai CIF. */
  effectiveLevyPercent: number;

  breakdown: LineItem[];
}

export const DEFAULT_IMPORT_INPUT: ImportInput = {
  quantity: 1000,
  unitPriceForeign: 12,
  freightForeign: 1800,
  insuranceMode: "percent",
  insurancePercent: 0.3,
  insuranceAmountForeign: 0,
  exchangeRate: 16250,
  dutyPercent: 5,
  additionalDutyPercent: 0,
  vatPercent: 11,
  incomeTaxPercent: 2.5,
  vatExempt: false,
  costs: {
    terminalHandling: 2_500_000,
    customsBroker: 1_750_000,
    inlandTransport: 3_000_000,
    storage: 500_000,
    other: 0,
  },
};

export function calculateImport(input: ImportInput): ImportResult {
  const safe = (n: number) => (Number.isFinite(n) ? n : 0);

  const quantity = Math.max(safe(input.quantity), 0);
  const fobForeign = safe(input.unitPriceForeign) * quantity;
  const freightForeign = safe(input.freightForeign);

  // Asuransi: praktik umum memakai 110% dari nilai barang + ongkos angkut.
  const insurableBase = (fobForeign + freightForeign) * 1.1;
  const insuranceForeign =
    input.insuranceMode === "percent"
      ? insurableBase * (safe(input.insurancePercent) / 100)
      : safe(input.insuranceAmountForeign);

  const cifForeign = fobForeign + freightForeign + insuranceForeign;
  const rate = safe(input.exchangeRate);
  const cifIDR = cifForeign * rate;

  const dutyIDR = cifIDR * (safe(input.dutyPercent) / 100);
  const additionalDutyIDR = cifIDR * (safe(input.additionalDutyPercent) / 100);

  // Dasar pengenaan PPN & PPh 22 adalah Nilai Impor, bukan CIF saja.
  const importValueIDR = cifIDR + dutyIDR + additionalDutyIDR;

  const vatIDR = input.vatExempt
    ? 0
    : importValueIDR * (safe(input.vatPercent) / 100);
  const incomeTaxIDR = importValueIDR * (safe(input.incomeTaxPercent) / 100);

  const totalLeviesIDR = dutyIDR + additionalDutyIDR + vatIDR + incomeTaxIDR;

  const c = input.costs;
  const localCostsIDR =
    safe(c.terminalHandling) +
    safe(c.customsBroker) +
    safe(c.inlandTransport) +
    safe(c.storage) +
    safe(c.other);

  const landedCostIDR = cifIDR + totalLeviesIDR + localCostsIDR;
  const costPerUnitIDR = quantity > 0 ? landedCostIDR / quantity : 0;

  const creditableTaxesIDR = vatIDR + incomeTaxIDR;
  const netCostAfterCreditIDR = landedCostIDR - creditableTaxesIDR;
  const netCostPerUnitIDR = quantity > 0 ? netCostAfterCreditIDR / quantity : 0;

  const effectiveLevyPercent =
    cifIDR > 0 ? (totalLeviesIDR / cifIDR) * 100 : 0;

  const breakdown: LineItem[] = [
    {
      label: "Nilai barang (FOB)",
      amount: fobForeign * rate,
      formula: `${quantity} unit x harga satuan`,
    },
    {
      label: "Ongkos angkut (freight)",
      amount: freightForeign * rate,
    },
    {
      label: "Asuransi",
      amount: insuranceForeign * rate,
      formula:
        input.insuranceMode === "percent"
          ? `${input.insurancePercent}% x 110% x (FOB + freight)`
          : "Nominal yang diisi manual",
    },
    {
      label: "Nilai CIF",
      amount: cifIDR,
      formula: "FOB + freight + asuransi, dikonversi memakai NDPBM",
      emphasis: true,
    },
    {
      label: "Bea Masuk",
      amount: dutyIDR,
      formula: `${input.dutyPercent}% x nilai CIF`,
    },
  ];

  if (additionalDutyIDR > 0) {
    breakdown.push({
      label: "Bea Masuk Tambahan (BMAD / BMTP)",
      amount: additionalDutyIDR,
      formula: `${input.additionalDutyPercent}% x nilai CIF`,
    });
  }

  breakdown.push(
    {
      label: "Nilai Impor",
      amount: importValueIDR,
      formula: "Nilai CIF + Bea Masuk (+ bea tambahan)",
      emphasis: true,
    },
    {
      label: input.vatExempt ? "PPN Impor (dibebaskan)" : "PPN Impor",
      amount: vatIDR,
      formula: input.vatExempt
        ? "Mendapat fasilitas pembebasan"
        : `${input.vatPercent}% x Nilai Impor`,
    },
    {
      label: "PPh Pasal 22 Impor",
      amount: incomeTaxIDR,
      formula: `${input.incomeTaxPercent}% x Nilai Impor`,
    },
    {
      label: "Total pungutan negara",
      amount: totalLeviesIDR,
      formula: "Bea masuk + bea tambahan + PPN + PPh 22",
      emphasis: true,
    },
    { label: "Terminal handling & biaya pelabuhan", amount: safe(c.terminalHandling) },
    { label: "Jasa kepabeanan (PPJK)", amount: safe(c.customsBroker) },
    { label: "Trucking ke gudang", amount: safe(c.inlandTransport) },
    { label: "Penumpukan / storage", amount: safe(c.storage) },
  );

  if (safe(c.other) > 0) {
    breakdown.push({ label: "Biaya lain-lain", amount: safe(c.other) });
  }

  breakdown.push({
    label: "Total biaya sampai gudang (landed cost)",
    amount: landedCostIDR,
    formula: "Nilai CIF + seluruh pungutan + biaya lokal",
    emphasis: true,
  });

  return {
    fobForeign,
    freightForeign,
    insuranceForeign,
    cifForeign,
    cifIDR,
    dutyIDR,
    additionalDutyIDR,
    importValueIDR,
    vatIDR,
    incomeTaxIDR,
    totalLeviesIDR,
    localCostsIDR,
    landedCostIDR,
    costPerUnitIDR,
    creditableTaxesIDR,
    netCostAfterCreditIDR,
    netCostPerUnitIDR,
    effectiveLevyPercent,
    breakdown,
  };
}

/* ------------------------------------------------------------
   EKSPOR
   ------------------------------------------------------------ */

export type ExportIncoterm = "FOB" | "CFR" | "CIF";

export interface ExportCosts {
  /** Transport dari pabrik/gudang ke pelabuhan (IDR). */
  inlandTransport: number;
  /** Terminal handling di pelabuhan muat (IDR). */
  terminalHandling: number;
  /** Pengurusan dokumen, PEB, SKA (IDR). */
  documentation: number;
  /** Jasa PPJK / freight forwarder (IDR). */
  customsBroker: number;
  /** Sertifikasi, inspeksi, uji laboratorium (IDR). */
  certification: number;
  /** Fumigasi & perlakuan karantina (IDR). */
  fumigation: number;
  /** Biaya lain-lain (IDR). */
  other: number;
}

export interface ExportInput {
  quantity: number;
  /** Harga pokok produksi per satuan (IDR). */
  productionCostPerUnit: number;
  /** Biaya kemasan ekspor per satuan (IDR). */
  packagingPerUnit: number;
  costs: ExportCosts;
  /** Tarif Bea Keluar (%) - hanya untuk komoditas tertentu, mis. CPO & mineral. */
  exportDutyPercent: number;
  /** Margin keuntungan yang diinginkan, dihitung dari harga jual FOB (%). */
  targetMarginPercent: number;
  /** Incoterm yang ditawarkan ke pembeli. */
  incoterm: ExportIncoterm;
  /** Ongkos kapal ke pelabuhan tujuan (IDR) - dipakai untuk CFR & CIF. */
  freightIDR: number;
  /** Tarif asuransi (%) dari 110% nilai (FOB + freight) - untuk CIF. */
  insurancePercent: number;
  /** Kurs untuk menampilkan hasil dalam USD. */
  exchangeRate: number;
}

export interface ExportResult {
  /** Harga pokok barang saja. */
  goodsCostIDR: number;
  /** Total biaya lokal sampai on board. */
  localCostsIDR: number;
  /** Total biaya sampai on board, belum termasuk bea keluar & margin. */
  baseCostIDR: number;
  exportDutyIDR: number;
  /** Total biaya termasuk bea keluar. */
  totalCostIDR: number;
  /** Harga jual FOB yang disarankan. */
  fobPriceIDR: number;
  freightIDR: number;
  insuranceIDR: number;
  /** Harga jual sesuai Incoterm yang dipilih. */
  quotedPriceIDR: number;
  quotedPricePerUnitIDR: number;
  quotedPricePerUnitUSD: number;
  grossProfitIDR: number;
  grossProfitPercent: number;
  /** Harga FOB minimum agar tidak merugi (margin nol). */
  breakEvenFobIDR: number;
  breakEvenFobPerUnitIDR: number;
  /** true bila margin + bea keluar >= 100%, sehingga tidak bisa dihitung. */
  invalid: boolean;
  invalidReason: string | null;
  breakdown: LineItem[];
}

export const DEFAULT_EXPORT_INPUT: ExportInput = {
  quantity: 18000,
  productionCostPerUnit: 78_000,
  packagingPerUnit: 3_500,
  costs: {
    inlandTransport: 9_000_000,
    terminalHandling: 4_500_000,
    documentation: 2_500_000,
    customsBroker: 3_500_000,
    certification: 6_000_000,
    fumigation: 1_800_000,
    other: 0,
  },
  exportDutyPercent: 0,
  targetMarginPercent: 15,
  incoterm: "FOB",
  freightIDR: 32_000_000,
  insurancePercent: 0.3,
  exchangeRate: 16250,
};

export function calculateExport(input: ExportInput): ExportResult {
  const safe = (n: number) => (Number.isFinite(n) ? n : 0);

  const quantity = Math.max(safe(input.quantity), 0);
  const goodsCostIDR =
    (safe(input.productionCostPerUnit) + safe(input.packagingPerUnit)) *
    quantity;

  const c = input.costs;
  const localCostsIDR =
    safe(c.inlandTransport) +
    safe(c.terminalHandling) +
    safe(c.documentation) +
    safe(c.customsBroker) +
    safe(c.certification) +
    safe(c.fumigation) +
    safe(c.other);

  const baseCostIDR = goodsCostIDR + localCostsIDR;

  const marginPct = safe(input.targetMarginPercent);
  const dutyPct = safe(input.exportDutyPercent);

  // Margin dan bea keluar keduanya dihitung SEBAGAI PERSENTASE DARI HARGA FOB.
  // Jadi: FOB = baseCost + FOB*(duty%) + FOB*(margin%)
  //   =>  FOB = baseCost / (1 - duty% - margin%)
  const divisor = 1 - dutyPct / 100 - marginPct / 100;

  const invalid = divisor <= 0.01;
  const invalidReason = invalid
    ? "Margin + Bea Keluar terlalu besar (mendekati atau melebihi 100% dari harga jual). Turunkan target margin."
    : null;

  const fobPriceIDR = invalid ? 0 : baseCostIDR / divisor;
  const exportDutyIDR = fobPriceIDR * (dutyPct / 100);
  const totalCostIDR = baseCostIDR + exportDutyIDR;

  const freightIDR =
    input.incoterm === "FOB" ? 0 : Math.max(safe(input.freightIDR), 0);

  const insuranceIDR =
    input.incoterm === "CIF"
      ? (fobPriceIDR + freightIDR) * 1.1 * (safe(input.insurancePercent) / 100)
      : 0;

  const quotedPriceIDR = fobPriceIDR + freightIDR + insuranceIDR;
  const quotedPricePerUnitIDR = quantity > 0 ? quotedPriceIDR / quantity : 0;
  const rate = safe(input.exchangeRate);
  const quotedPricePerUnitUSD =
    rate > 0 ? quotedPricePerUnitIDR / rate : 0;

  const grossProfitIDR = fobPriceIDR - totalCostIDR;
  const grossProfitPercent =
    fobPriceIDR > 0 ? (grossProfitIDR / fobPriceIDR) * 100 : 0;

  // Titik impas: margin nol, bea keluar tetap diperhitungkan.
  const beDivisor = 1 - dutyPct / 100;
  const breakEvenFobIDR = beDivisor > 0.01 ? baseCostIDR / beDivisor : 0;
  const breakEvenFobPerUnitIDR =
    quantity > 0 ? breakEvenFobIDR / quantity : 0;

  const breakdown: LineItem[] = [
    {
      label: "Harga pokok produksi",
      amount: safe(input.productionCostPerUnit) * quantity,
      formula: `${quantity} unit x harga pokok per unit`,
    },
    {
      label: "Kemasan ekspor",
      amount: safe(input.packagingPerUnit) * quantity,
      formula: `${quantity} unit x biaya kemasan per unit`,
    },
    { label: "Transport ke pelabuhan", amount: safe(c.inlandTransport) },
    { label: "Terminal handling (THC)", amount: safe(c.terminalHandling) },
    { label: "Dokumen, PEB & SKA", amount: safe(c.documentation) },
    { label: "Jasa PPJK / forwarder", amount: safe(c.customsBroker) },
    { label: "Sertifikasi & inspeksi", amount: safe(c.certification) },
    { label: "Fumigasi & karantina", amount: safe(c.fumigation) },
  ];

  if (safe(c.other) > 0) {
    breakdown.push({ label: "Biaya lain-lain", amount: safe(c.other) });
  }

  breakdown.push({
    label: "Total biaya sampai on board",
    amount: baseCostIDR,
    formula: "Harga pokok + kemasan + seluruh biaya lokal",
    emphasis: true,
  });

  if (dutyPct > 0) {
    breakdown.push({
      label: "Bea Keluar",
      amount: exportDutyIDR,
      formula: `${dutyPct}% x harga jual FOB`,
    });
  }

  breakdown.push(
    {
      label: `Margin keuntungan (${marginPct}%)`,
      amount: grossProfitIDR,
      formula: `${marginPct}% dari harga jual FOB`,
    },
    {
      label: "Harga jual FOB",
      amount: fobPriceIDR,
      formula: "Total biaya / (1 - margin% - bea keluar%)",
      emphasis: true,
    },
  );

  if (input.incoterm !== "FOB") {
    breakdown.push({ label: "Ongkos kapal (freight)", amount: freightIDR });
  }
  if (input.incoterm === "CIF") {
    breakdown.push({
      label: "Asuransi",
      amount: insuranceIDR,
      formula: `${input.insurancePercent}% x 110% x (FOB + freight)`,
    });
  }

  if (input.incoterm !== "FOB") {
    breakdown.push({
      label: `Harga jual ${input.incoterm}`,
      amount: quotedPriceIDR,
      formula:
        input.incoterm === "CFR"
          ? "FOB + ongkos kapal"
          : "FOB + ongkos kapal + asuransi",
      emphasis: true,
    });
  }

  return {
    goodsCostIDR,
    localCostsIDR,
    baseCostIDR,
    exportDutyIDR,
    totalCostIDR,
    fobPriceIDR,
    freightIDR,
    insuranceIDR,
    quotedPriceIDR,
    quotedPricePerUnitIDR,
    quotedPricePerUnitUSD,
    grossProfitIDR,
    grossProfitPercent,
    breakEvenFobIDR,
    breakEvenFobPerUnitIDR,
    invalid,
    invalidReason,
    breakdown,
  };
}
