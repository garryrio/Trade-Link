/* ============================================================
   Tipe data inti TradeLink
   ============================================================ */

/**
 * Jenis postingan.
 * - "supply"  : eksportir menawarkan barang yang siap dijual.
 * - "demand"  : importir memasang permintaan (mirip lowongan) dan
 *               eksportir yang tertarik bisa mengajukan penawaran.
 */
export type ListingKind = "supply" | "demand";

export const LISTING_KIND_META: Record<
  ListingKind,
  { label: string; shortLabel: string; actor: string; description: string }
> = {
  supply: {
    label: "Penawaran Ekspor",
    shortLabel: "Penawaran",
    actor: "Eksportir",
    description: "Barang tersedia dan siap dikirim ke pembeli luar negeri.",
  },
  demand: {
    label: "Permintaan Pembelian",
    shortLabel: "Permintaan",
    actor: "Importir",
    description:
      "Importir sedang mencari pemasok. Eksportir bisa mengirim penawaran.",
  },
};

/** Incoterms 2020 - menentukan sampai mana tanggung jawab penjual. */
export type Incoterm =
  | "EXW"
  | "FCA"
  | "FAS"
  | "FOB"
  | "CFR"
  | "CIF"
  | "CPT"
  | "CIP"
  | "DAP"
  | "DPU"
  | "DDP";

export const INCOTERMS: { code: Incoterm; name: string; short: string }[] = [
  { code: "EXW", name: "Ex Works", short: "Pembeli ambil di gudang penjual" },
  { code: "FCA", name: "Free Carrier", short: "Diserahkan ke pengangkut" },
  { code: "FAS", name: "Free Alongside Ship", short: "Di sisi kapal" },
  { code: "FOB", name: "Free On Board", short: "Sampai di atas kapal" },
  { code: "CFR", name: "Cost and Freight", short: "Termasuk ongkos kapal" },
  { code: "CIF", name: "Cost, Insurance and Freight", short: "Ongkos + asuransi" },
  { code: "CPT", name: "Carriage Paid To", short: "Angkutan dibayar sampai" },
  { code: "CIP", name: "Carriage and Insurance Paid To", short: "Angkutan + asuransi" },
  { code: "DAP", name: "Delivered At Place", short: "Sampai tempat tujuan" },
  { code: "DPU", name: "Delivered at Place Unloaded", short: "Sampai & dibongkar" },
  { code: "DDP", name: "Delivered Duty Paid", short: "Sampai, pajak dibayar penjual" },
];

/** Satuan kuantitas. */
export type Unit =
  | "kg"
  | "mt"
  | "liter"
  | "pcs"
  | "carton"
  | "cbm"
  | "container20"
  | "container40";

export const UNIT_LABELS: Record<Unit, string> = {
  kg: "kg",
  mt: "ton (MT)",
  liter: "liter",
  pcs: "pcs",
  carton: "karton",
  cbm: "m³ (CBM)",
  container20: "kontainer 20ft",
  container40: "kontainer 40ft",
};

/** Label singkat untuk ditempel di belakang angka. */
export const UNIT_SUFFIX: Record<Unit, string> = {
  kg: "kg",
  mt: "MT",
  liter: "L",
  pcs: "pcs",
  carton: "ktn",
  cbm: "m³",
  container20: "x 20ft",
  container40: "x 40ft",
};

export type Currency = "USD" | "IDR" | "EUR" | "JPY" | "CNY";

export const CURRENCIES: Currency[] = ["USD", "IDR", "EUR", "JPY", "CNY"];

/** Kategori komoditas - dipakai untuk filter di marketplace & halaman harga. */
export type CommodityCategory =
  | "agri"
  | "seafood"
  | "plantation"
  | "mineral"
  | "manufacture"
  | "textile"
  | "furniture"
  | "food"
  | "chemical"
  | "energy";

export const CATEGORY_META: Record<
  CommodityCategory,
  { label: string; icon: string }
> = {
  agri: { label: "Pertanian & Rempah", icon: "🌾" },
  plantation: { label: "Perkebunan", icon: "🌴" },
  seafood: { label: "Perikanan", icon: "🦐" },
  mineral: { label: "Mineral & Logam", icon: "⛏️" },
  manufacture: { label: "Manufaktur & Mesin", icon: "⚙️" },
  textile: { label: "Tekstil & Garmen", icon: "🧵" },
  furniture: { label: "Furnitur & Kriya", icon: "🪑" },
  food: { label: "Makanan Olahan", icon: "🍲" },
  chemical: { label: "Kimia & Plastik", icon: "🧪" },
  energy: { label: "Energi & Biomassa", icon: "🔥" },
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_META) as CommodityCategory[];

/* ============================================================
   Dokumen pemeriksaan mutu (quality check)
   ============================================================ */

/**
 * Satu baris persyaratan dokumen mutu pada sebuah postingan.
 *
 * Perlu dibedakan dari `certifications` pada Listing:
 *  - `certifications`     : kredensial yang DIPEGANG perusahaan atau produk
 *                           secara berkelanjutan (Organic EU, HACCP, BAP).
 *  - `qualityDocuments`   : dokumen yang diterbitkan PER PENGIRIMAN untuk
 *                           membuktikan mutu barang yang dikirim
 *                           (Certificate of Analysis, laporan uji lab,
 *                           sertifikat fumigasi, laporan surveyor).
 *
 * Pada postingan penawaran (supply) daftar ini berarti "dokumen yang bisa
 * saya sediakan". Pada permintaan (demand) berarti "dokumen yang saya
 * persyaratkan dari pemasok".
 */
export interface QualityDocRequirement {
  /** Id dari katalog, atau "custom:<slug>" untuk entri yang ditulis manual. */
  id: string;
  /** Nama dokumen sebagaimana ditampilkan ke pengguna. */
  name: string;
  /** true = wajib ada. false = opsional, sifatnya nilai tambah. */
  mandatory: boolean;
  /**
   * Catatan spesifik, mis. ambang batas yang harus dipenuhi atau
   * laboratorium yang diakui. null bila tidak ada.
   */
  note: string | null;
}

/** Status siklus hidup sebuah postingan. */
export type ListingStatus = "open" | "negotiating" | "closed";

export const STATUS_META: Record<ListingStatus, { label: string }> = {
  open: { label: "Terbuka" },
  negotiating: { label: "Sedang Negosiasi" },
  closed: { label: "Ditutup" },
};

/** Profil perusahaan yang memasang postingan. */
export interface Party {
  companyName: string;
  /** Nama negara dalam bahasa Indonesia, mis. "Indonesia", "Belanda". */
  country: string;
  city: string;
  /** Sudah lolos verifikasi dokumen (NIB/izin ekspor). */
  verified: boolean;
  memberSince: number;
  /** Rating 0-5 dari transaksi sebelumnya. */
  rating: number;
  completedDeals: number;
}

export interface Listing {
  id: string;
  kind: ListingKind;
  title: string;
  /** Nama komoditas yang ringkas, mis. "Kopi Arabika". */
  commodity: string;
  category: CommodityCategory;
  /** Kode HS 6-10 digit. */
  hsCode: string;
  description: string;
  quantity: number;
  unit: Unit;
  /**
   * supply : harga jual per satuan.
   * demand : perkiraan budget per satuan (boleh null kalau belum ditentukan).
   */
  price: number | null;
  currency: Currency;
  incoterm: Incoterm;
  /** Negara asal barang. */
  originCountry: string;
  /** Negara tujuan. Untuk supply bisa berupa "Terbuka (global)". */
  destinationCountry: string;
  /** Pelabuhan muat (supply) atau pelabuhan bongkar (demand). */
  port: string;
  certifications: string[];
  /**
   * Dokumen pemeriksaan mutu per pengiriman.
   * supply : dokumen yang bisa disediakan penjual.
   * demand : dokumen yang dipersyaratkan pembeli.
   */
  qualityDocuments: QualityDocRequirement[];
  /** Minimum order dalam satuan yang sama dengan `unit`. */
  minOrder: number | null;
  /** Catatan kapasitas produksi, mis. "40 MT per bulan". */
  capacityNote: string | null;
  paymentTerms: string;
  /** Batas akhir penerimaan penawaran (khusus demand). ISO date. */
  deadline: string | null;
  party: Party;
  /** ISO timestamp. */
  createdAt: string;
  status: ListingStatus;
  featured: boolean;
}

/** Payload form pembuatan postingan (sebelum diberi id & metadata server). */
export interface ListingDraft {
  kind: ListingKind;
  title: string;
  commodity: string;
  category: CommodityCategory;
  hsCode: string;
  description: string;
  quantity: number;
  unit: Unit;
  price: number | null;
  currency: Currency;
  incoterm: Incoterm;
  originCountry: string;
  destinationCountry: string;
  port: string;
  certifications: string[];
  qualityDocuments: QualityDocRequirement[];
  minOrder: number | null;
  capacityNote: string | null;
  paymentTerms: string;
  deadline: string | null;
  companyName: string;
  contactCity: string;
  contactCountry: string;
}

/* ============================================================
   Harga komoditas
   ============================================================ */

export interface CommodityPrice {
  id: string;
  name: string;
  category: CommodityCategory;
  /** Bursa / sumber acuan, mis. "ICE Futures", "Bursa Berjangka Jakarta". */
  market: string;
  hsCode: string;
  /** Harga terakhir. */
  price: number;
  currency: Currency;
  /** Satuan harga, mis. "USD/MT", ditampilkan apa adanya. */
  priceUnit: string;
  /** Perubahan absolut dibanding penutupan sebelumnya. */
  change: number;
  /** Perubahan dalam persen. */
  changePercent: number;
  /** Rentang 52 pekan. */
  low52w: number;
  high52w: number;
  /** 24 titik terakhir untuk sparkline (paling lama -> paling baru). */
  history: number[];
  updatedAt: string;
}

/* ============================================================
   Asisten AI
   ============================================================ */

export type ChatRole = "user" | "model";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}
