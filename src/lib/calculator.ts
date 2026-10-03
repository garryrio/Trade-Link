/* ============================================================
   Kalkulator biaya impor.

   Sisi ekspor berada di src/lib/exportSheet.ts, karena bentuknya bukan
   satu rumus melainkan lembar biaya bernomor yang mengikuti kebiasaan
   pelaku ekspor dan EMKL di Indonesia.

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
