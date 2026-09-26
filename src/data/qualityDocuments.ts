import type { CommodityCategory, QualityDocRequirement } from "@/lib/types";

/* ============================================================
   Katalog dokumen pemeriksaan mutu (quality check).

   Yang dimaksud di sini adalah dokumen yang diterbitkan PER PENGIRIMAN
   untuk membuktikan mutu barang, berbeda dari sertifikasi perusahaan yang
   berlaku terus-menerus.

   Pada postingan penawaran, daftar ini berarti "dokumen yang bisa saya
   sediakan". Pada permintaan, berarti "dokumen yang saya persyaratkan".

   Persyaratan sebenarnya berbeda menurut komoditas dan negara tujuan.
   Katalog ini titik awal, bukan daftar yang mengikat.
   ============================================================ */

export type QualityDocGroup =
  | "mutu"
  | "karantina"
  | "laboratorium"
  | "inspeksi"
  | "kepatuhan";

export const QUALITY_DOC_GROUP_META: Record<
  QualityDocGroup,
  { label: string; description: string; icon: string }
> = {
  mutu: {
    label: "Mutu & Spesifikasi",
    description: "Membuktikan barang sesuai spesifikasi yang disepakati.",
    icon: "📑",
  },
  karantina: {
    label: "Karantina & Kesehatan",
    description: "Diterbitkan otoritas karantina, wajib untuk produk hidup dan hasil alam.",
    icon: "🛡️",
  },
  laboratorium: {
    label: "Uji Laboratorium",
    description: "Hasil pengujian terukur dari laboratorium terakreditasi.",
    icon: "🔬",
  },
  inspeksi: {
    label: "Inspeksi & Survei",
    description: "Verifikasi pihak ketiga atas kuantitas dan kondisi barang.",
    icon: "🔍",
  },
  kepatuhan: {
    label: "Kepatuhan & Legalitas",
    description: "Dokumen yang diminta regulator negara tujuan.",
    icon: "⚖️",
  },
};

export const QUALITY_DOC_GROUPS = Object.keys(
  QUALITY_DOC_GROUP_META,
) as QualityDocGroup[];

export interface QualityDocDef {
  id: string;
  name: string;
  /** Singkatan yang lazim dipakai, mis. "CoA". */
  abbr: string | null;
  group: QualityDocGroup;
  /** Siapa yang biasanya menerbitkan. */
  issuedBy: string;
  description: string;
  /** Contoh isi atau parameter yang biasanya dicantumkan. */
  example: string | null;
  /** Kategori komoditas yang biasanya membutuhkan dokumen ini. */
  appliesTo: CommodityCategory[];
}

const ALL_CATEGORIES: CommodityCategory[] = [
  "agri", "plantation", "seafood", "mineral", "manufacture",
  "textile", "furniture", "food", "chemical", "energy",
];

export const QUALITY_DOCS: QualityDocDef[] = [
  /* ---------- Mutu & spesifikasi ---------- */
  {
    id: "coa",
    name: "Certificate of Analysis",
    abbr: "CoA",
    group: "mutu",
    issuedBy: "Produsen atau laboratorium terakreditasi",
    description:
      "Rincian hasil pengukuran mutu untuk lot yang dikirim, dibandingkan dengan spesifikasi kontrak. Dokumen mutu yang paling sering diminta.",
    example: "Kadar air, kadar kotoran, kadar minyak esensial, ukuran butir",
    appliesTo: ["agri", "plantation", "seafood", "food", "chemical", "mineral", "energy"],
  },
  {
    id: "spec-sheet",
    name: "Technical Data Sheet",
    abbr: "TDS",
    group: "mutu",
    issuedBy: "Produsen",
    description:
      "Lembar spesifikasi teknis produk: sifat fisik, kimia, dan rentang toleransi yang dijamin.",
    example: "MFI, densitas, titik leleh untuk resin plastik",
    appliesTo: ["chemical", "manufacture", "energy", "mineral"],
  },
  {
    id: "quality-spec-agreement",
    name: "Kesepakatan Spesifikasi Mutu",
    abbr: null,
    group: "mutu",
    issuedBy: "Kedua pihak",
    description:
      "Spesifikasi tertulis yang ditandatangani kedua pihak sebelum produksi. Menjadi rujukan bila terjadi sengketa mutu.",
    example: "Grading, toleransi defect, standar pengemasan",
    appliesTo: ALL_CATEGORIES,
  },
  {
    id: "sample-approval",
    name: "Persetujuan Sampel Pre-Shipment",
    abbr: null,
    group: "mutu",
    issuedBy: "Pembeli",
    description:
      "Konfirmasi tertulis pembeli bahwa sampel dari lot produksi sudah sesuai, sebelum barang dimuat.",
    example: "Hasil cupping untuk kopi, cut test untuk kakao",
    appliesTo: ["agri", "plantation", "food", "textile", "furniture"],
  },
  {
    id: "packing-declaration",
    name: "Packing Declaration",
    abbr: null,
    group: "mutu",
    issuedBy: "Eksportir",
    description:
      "Pernyataan mengenai bahan kemasan yang dipakai, terutama ada atau tidaknya kemasan kayu.",
    example: "Pernyataan bebas kayu, atau kayu sudah diperlakukan ISPM 15",
    appliesTo: ALL_CATEGORIES,
  },

  /* ---------- Karantina & kesehatan ---------- */
  {
    id: "phytosanitary",
    name: "Phytosanitary Certificate",
    abbr: null,
    group: "karantina",
    issuedBy: "Badan Karantina Indonesia",
    description:
      "Sertifikat kesehatan tumbuhan: menyatakan produk bebas hama dan penyakit tanaman. Wajib untuk hampir semua ekspor produk tumbuhan.",
    example: "Wajib untuk kopi, kakao, rempah, biji-bijian, kayu",
    appliesTo: ["agri", "plantation", "food", "furniture", "energy"],
  },
  {
    id: "health-certificate",
    name: "Health Certificate",
    abbr: "HC",
    group: "karantina",
    issuedBy: "Otoritas kompeten perikanan atau peternakan",
    description:
      "Menyatakan produk hewan atau perikanan layak dikonsumsi dan berasal dari unit pengolahan yang diawasi.",
    example: "Wajib untuk ekspor perikanan ke Uni Eropa dan banyak negara lain",
    appliesTo: ["seafood", "food"],
  },
  {
    id: "fumigation",
    name: "Fumigation Certificate",
    abbr: null,
    group: "karantina",
    issuedBy: "Penyedia jasa fumigasi berizin",
    description:
      "Bukti barang atau kemasannya telah difumigasi, termasuk jenis bahan, dosis, dan lama perlakuan.",
    example: "Metil bromida atau fosfin untuk komoditas pertanian",
    appliesTo: ["agri", "plantation", "food", "furniture", "textile", "energy"],
  },
  {
    id: "ispm15",
    name: "Perlakuan Kemasan Kayu ISPM 15",
    abbr: "ISPM 15",
    group: "karantina",
    issuedBy: "Penyedia perlakuan bersertifikat",
    description:
      "Tanda dan sertifikat perlakuan panas atau fumigasi untuk palet dan peti kayu. Banyak negara menolak kemasan kayu tanpa tanda ini.",
    example: "Stempel IPPC pada palet kayu",
    appliesTo: ALL_CATEGORIES,
  },
  {
    id: "catch-certificate",
    name: "Catch Certificate",
    abbr: null,
    group: "karantina",
    issuedBy: "Otoritas perikanan",
    description:
      "Membuktikan hasil tangkapan berasal dari penangkapan yang sah, bukan dari kegiatan ilegal. Syarat masuk pasar Uni Eropa.",
    example: "Wajib untuk produk perikanan tangkap ke Uni Eropa",
    appliesTo: ["seafood"],
  },

  /* ---------- Uji laboratorium ---------- */
  {
    id: "lab-microbiology",
    name: "Uji Mikrobiologi",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Pengujian cemaran mikroba pada produk pangan.",
    example: "Salmonella, E. coli, Total Plate Count, Listeria",
    appliesTo: ["food", "seafood", "agri"],
  },
  {
    id: "lab-aflatoxin",
    name: "Uji Aflatoksin & Mikotoksin",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Wajib untuk banyak pasar pada komoditas yang rentan jamur. Batas ambangnya ketat, terutama di Uni Eropa.",
    example: "Aflatoksin B1 dan total, okratoksin A",
    appliesTo: ["agri", "food"],
  },
  {
    id: "lab-pesticide",
    name: "Uji Residu Pestisida",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Memastikan residu pestisida di bawah batas maksimum yang diizinkan negara tujuan.",
    example: "Analisis multi-residu berdasarkan MRL Uni Eropa atau Jepang",
    appliesTo: ["agri", "plantation", "food"],
  },
  {
    id: "lab-heavy-metal",
    name: "Uji Logam Berat",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Pengujian cemaran logam berat pada pangan, produk laut, dan bahan kimia.",
    example: "Timbal, kadmium, merkuri, arsen",
    appliesTo: ["food", "seafood", "agri", "chemical"],
  },
  {
    id: "lab-antibiotic",
    name: "Uji Residu Antibiotik",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Kritis untuk produk akuakultur. Pasar Jepang, Uni Eropa, dan Amerika Serikat menolak lot yang positif.",
    example: "Kloramfenikol, nitrofuran, tetrasiklin",
    appliesTo: ["seafood"],
  },
  {
    id: "lab-gcms",
    name: "Laporan GC-MS / Kromatografi",
    abbr: "GC-MS",
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Profil komposisi kimia, standar untuk minyak atsiri dan bahan aroma.",
    example: "Kadar patchoulol untuk minyak nilam, eugenol untuk minyak cengkeh",
    appliesTo: ["chemical", "agri"],
  },
  {
    id: "lab-proximate",
    name: "Analisis Proksimat",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium terakreditasi",
    description:
      "Komposisi gizi dasar, sering diminta untuk pelabelan pangan dan pakan.",
    example: "Kadar air, protein, lemak, abu, serat",
    appliesTo: ["food", "agri", "seafood"],
  },
  {
    id: "lab-calorific",
    name: "Analisis Nilai Kalor & Proksimat Bahan Bakar",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium atau surveyor independen",
    description:
      "Menentukan nilai energi dan kandungan pengotor bahan bakar padat. Menjadi dasar penyesuaian harga.",
    example: "GCV, kadar air, kadar abu, sulfur untuk batu bara dan biomassa",
    appliesTo: ["energy", "mineral"],
  },
  {
    id: "lab-radiation",
    name: "Sertifikat Bebas Radiasi",
    abbr: null,
    group: "laboratorium",
    issuedBy: "Laboratorium atau otoritas berwenang",
    description:
      "Diminta sebagian negara untuk produk pangan tertentu.",
    example: "Pengujian cesium-134 dan cesium-137",
    appliesTo: ["food", "seafood", "agri"],
  },

  /* ---------- Inspeksi & survei ---------- */
  {
    id: "preshipment-inspection",
    name: "Pre-Shipment Inspection Report",
    abbr: "PSI",
    group: "inspeksi",
    issuedBy: "Surveyor independen",
    description:
      "Pemeriksaan pihak ketiga atas mutu, kuantitas, dan pengemasan sebelum barang dimuat. Melindungi kedua pihak.",
    example: "SGS, Intertek, Bureau Veritas, Cotecna",
    appliesTo: ALL_CATEGORIES,
  },
  {
    id: "weight-quality-survey",
    name: "Certificate of Weight & Quality",
    abbr: null,
    group: "inspeksi",
    issuedBy: "Surveyor independen",
    description:
      "Verifikasi berat dan mutu pada saat pemuatan. Standar untuk komoditas curah.",
    example: "Draft survey untuk kapal bulk, timbangan jembatan",
    appliesTo: ["plantation", "mineral", "energy", "agri"],
  },
  {
    id: "loading-supervision",
    name: "Laporan Pengawasan Pemuatan",
    abbr: null,
    group: "inspeksi",
    issuedBy: "Surveyor independen",
    description:
      "Dokumentasi proses stuffing kontainer atau pemuatan kapal, termasuk foto dan nomor segel.",
    example: "Foto kontainer kosong, proses stuffing, nomor segel",
    appliesTo: ALL_CATEGORIES,
  },
  {
    id: "container-cleanliness",
    name: "Sertifikat Kebersihan Kontainer",
    abbr: null,
    group: "inspeksi",
    issuedBy: "Surveyor atau eksportir",
    description:
      "Menyatakan kontainer bersih, kering, dan bebas bau sebelum dimuat. Penting untuk produk pangan.",
    example: "Pemeriksaan bebas bau, bebas kebocoran, bebas hama",
    appliesTo: ["food", "agri", "seafood", "plantation"],
  },
  {
    id: "temperature-log",
    name: "Rekaman Suhu Rantai Pendingin",
    abbr: null,
    group: "inspeksi",
    issuedBy: "Eksportir atau pelayaran",
    description:
      "Data perekam suhu selama penyimpanan dan pengangkutan produk beku atau dingin.",
    example: "Grafik data logger reefer, suhu minimum -18 derajat Celsius",
    appliesTo: ["seafood", "food"],
  },

  /* ---------- Kepatuhan & legalitas ---------- */
  {
    id: "coo",
    name: "Certificate of Origin",
    abbr: "SKA / COO",
    group: "kepatuhan",
    issuedBy: "Kementerian Perdagangan melalui e-SKA",
    description:
      "Menyatakan negara asal barang. Versi preferensinya menurunkan bea masuk di negara tujuan berdasarkan perjanjian dagang.",
    example: "Form D untuk ASEAN, Form E untuk Tiongkok, formulir RCEP",
    appliesTo: ALL_CATEGORIES,
  },
  {
    id: "halal",
    name: "Sertifikat Halal",
    abbr: null,
    group: "kepatuhan",
    issuedBy: "BPJPH",
    description:
      "Makin sering diminta pembeli di negara berpenduduk muslim, dan menjadi syarat wajib untuk sebagian produk.",
    example: "Pangan olahan, kosmetik, bahan tambahan pangan",
    appliesTo: ["food", "agri", "seafood", "chemical"],
  },
  {
    id: "organic",
    name: "Sertifikat Organik",
    abbr: null,
    group: "kepatuhan",
    issuedBy: "Lembaga sertifikasi terakreditasi",
    description:
      "Membuktikan produk memenuhi standar organik pasar tujuan. Perlu ketertelusuran sampai tingkat lahan.",
    example: "EU Organic, USDA NOP, JAS Organic",
    appliesTo: ["agri", "plantation", "food"],
  },
  {
    id: "timber-legality",
    name: "Dokumen Legalitas Kayu",
    abbr: "SVLK / V-Legal",
    group: "kepatuhan",
    issuedBy: "Lembaga verifikasi terakreditasi",
    description:
      "Membuktikan kayu berasal dari sumber yang sah. Syarat masuk Uni Eropa, Amerika Serikat, dan Australia.",
    example: "Dokumen V-Legal untuk produk kayu dan furnitur",
    appliesTo: ["furniture", "energy"],
  },
  {
    id: "msds",
    name: "Material Safety Data Sheet",
    abbr: "MSDS / SDS",
    group: "kepatuhan",
    issuedBy: "Produsen",
    description:
      "Informasi bahaya dan penanganan bahan. Wajib untuk pengangkutan bahan kimia dan sebagian barang lain.",
    example: "Klasifikasi bahaya, penanganan, pertolongan pertama",
    appliesTo: ["chemical", "manufacture", "energy"],
  },
  {
    id: "food-grade-declaration",
    name: "Deklarasi Food Grade",
    abbr: null,
    group: "kepatuhan",
    issuedBy: "Produsen",
    description:
      "Pernyataan bahan kemasan atau produk aman untuk kontak dengan pangan.",
    example: "Kesesuaian dengan regulasi kontak pangan Uni Eropa atau FDA",
    appliesTo: ["food", "chemical", "manufacture"],
  },
  {
    id: "non-gmo",
    name: "Pernyataan Non-GMO",
    abbr: null,
    group: "kepatuhan",
    issuedBy: "Produsen atau lembaga sertifikasi",
    description:
      "Menyatakan produk bukan berasal dari organisme hasil rekayasa genetika.",
    example: "Sering diminta pembeli Uni Eropa dan Jepang",
    appliesTo: ["agri", "food"],
  },
  {
    id: "eudr-due-diligence",
    name: "Pernyataan Uji Tuntas Deforestasi",
    abbr: "EUDR",
    group: "kepatuhan",
    issuedBy: "Eksportir",
    description:
      "Bukti komoditas tidak berasal dari lahan hasil deforestasi, lengkap dengan data geolokasi. Relevan untuk pasar Uni Eropa.",
    example: "Titik koordinat lahan, bukti ketertelusuran rantai pasok",
    appliesTo: ["plantation", "agri", "furniture"],
  },
  {
    id: "cites",
    name: "Izin CITES",
    abbr: "CITES",
    group: "kepatuhan",
    issuedBy: "Otoritas pengelola CITES",
    description:
      "Diperlukan untuk spesies yang perdagangannya dibatasi konvensi internasional.",
    example: "Jenis kayu, satwa, dan tumbuhan tertentu",
    appliesTo: ["furniture", "agri", "seafood"],
  },
];

export const QUALITY_DOC_COUNT = QUALITY_DOCS.length;

export function getQualityDoc(id: string): QualityDocDef | undefined {
  return QUALITY_DOCS.find((doc) => doc.id === id);
}

/** Dokumen yang relevan untuk sebuah kategori komoditas. */
export function docsForCategory(category: CommodityCategory): QualityDocDef[] {
  return QUALITY_DOCS.filter((doc) => doc.appliesTo.includes(category));
}

/* ------------------------------------------------------------
   Preset: dokumen yang paling lazim diminta per kategori.
   Dipakai untuk tombol "isi otomatis" di form dan untuk melengkapi
   data contoh, sehingga pengguna tidak mulai dari daftar kosong.
   ------------------------------------------------------------ */

interface Preset {
  mandatory: string[];
  optional: string[];
}

const PRESETS: Record<CommodityCategory, Preset> = {
  agri: {
    mandatory: ["coa", "phytosanitary", "fumigation", "coo"],
    optional: ["lab-aflatoxin", "lab-pesticide", "preshipment-inspection", "sample-approval"],
  },
  plantation: {
    mandatory: ["coa", "weight-quality-survey", "coo"],
    optional: ["phytosanitary", "preshipment-inspection", "eudr-due-diligence"],
  },
  seafood: {
    mandatory: ["health-certificate", "coa", "lab-antibiotic", "coo"],
    optional: ["lab-microbiology", "temperature-log", "catch-certificate", "container-cleanliness"],
  },
  food: {
    mandatory: ["coa", "lab-microbiology", "coo"],
    optional: ["halal", "lab-heavy-metal", "food-grade-declaration", "container-cleanliness"],
  },
  mineral: {
    mandatory: ["coa", "weight-quality-survey"],
    optional: ["preshipment-inspection", "spec-sheet", "msds"],
  },
  energy: {
    mandatory: ["lab-calorific", "weight-quality-survey"],
    optional: ["coa", "preshipment-inspection", "msds", "timber-legality"],
  },
  chemical: {
    mandatory: ["coa", "msds", "spec-sheet"],
    optional: ["lab-gcms", "lab-heavy-metal", "preshipment-inspection"],
  },
  manufacture: {
    mandatory: ["spec-sheet", "preshipment-inspection", "packing-declaration"],
    optional: ["ispm15", "msds", "loading-supervision"],
  },
  textile: {
    mandatory: ["quality-spec-agreement", "sample-approval", "coo"],
    optional: ["preshipment-inspection", "packing-declaration", "loading-supervision"],
  },
  furniture: {
    mandatory: ["timber-legality", "sample-approval", "ispm15", "coo"],
    optional: ["fumigation", "preshipment-inspection", "quality-spec-agreement"],
  },
};

/**
 * Bangun daftar persyaratan dokumen yang disarankan untuk sebuah kategori.
 * Hasilnya bisa langsung dipakai sebagai nilai awal di form, lalu disunting.
 */
export function suggestQualityDocs(
  category: CommodityCategory,
): QualityDocRequirement[] {
  const preset = PRESETS[category];
  if (!preset) return [];

  const build = (id: string, mandatory: boolean): QualityDocRequirement | null => {
    const def = getQualityDoc(id);
    if (!def) return null;
    return { id: def.id, name: def.name, mandatory, note: null };
  };

  return [
    ...preset.mandatory.map((id) => build(id, true)),
    ...preset.optional.map((id) => build(id, false)),
  ].filter((item): item is QualityDocRequirement => item !== null);
}

/** Versi ringkas: hanya yang wajib. Dipakai untuk melengkapi data contoh. */
export function defaultQualityDocs(
  category: CommodityCategory,
): QualityDocRequirement[] {
  return suggestQualityDocs(category).filter((doc) => doc.mandatory);
}
