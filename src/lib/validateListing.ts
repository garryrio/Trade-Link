import {
  CATEGORY_META,
  CURRENCIES,
  INCOTERMS,
  UNIT_LABELS,
  type CommodityCategory,
  type Currency,
  type Incoterm,
  type ListingDraft,
  type ListingKind,
  type QualityDocRequirement,
  type Unit,
} from "@/lib/types";

/* ============================================================
   Validasi data form postingan.

   Dipakai di DUA tempat:
     1. Di client, untuk menampilkan pesan error di bawah tiap field.
     2. Di Route Handler, karena data dari client tidak boleh dipercaya.

   Kuncinya adalah nama field, supaya mudah dipetakan ke input di form.
   ============================================================ */

export type FieldErrors = Partial<Record<keyof ListingDraft, string>>;

export type ValidationResult =
  | { ok: true; data: ListingDraft }
  | { ok: false; errors: FieldErrors };

const VALID_KINDS: ListingKind[] = ["supply", "demand"];
const VALID_UNITS = Object.keys(UNIT_LABELS) as Unit[];
const VALID_CATEGORIES = Object.keys(CATEGORY_META) as CommodityCategory[];
const VALID_INCOTERMS = INCOTERMS.map((i) => i.code);

/** Ambil string dari data mentah, sudah dipangkas spasinya. */
function str(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  return typeof v === "string" ? v.trim() : "";
}

/** Ambil angka; menerima number maupun string berisi angka. */
function num(raw: Record<string, unknown>, key: string): number | null {
  const v = raw[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    // Terima format Indonesia (koma sebagai desimal) maupun titik.
    const normalized = v.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function validateListingDraft(input: unknown): ValidationResult {
  const errors: FieldErrors = {};

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: { title: "Data yang dikirim tidak valid." } };
  }

  const raw = input as Record<string, unknown>;

  // --- Jenis postingan ---
  const kindRaw = str(raw, "kind");
  const kind = VALID_KINDS.includes(kindRaw as ListingKind)
    ? (kindRaw as ListingKind)
    : null;
  if (!kind) errors.kind = "Pilih jenis postingan.";

  // --- Teks wajib ---
  const title = str(raw, "title");
  if (title.length < 10) {
    errors.title = "Judul minimal 10 karakter agar jelas bagi pembaca.";
  } else if (title.length > 140) {
    errors.title = "Judul maksimal 140 karakter.";
  }

  const commodity = str(raw, "commodity");
  if (commodity.length < 3) {
    errors.commodity = "Tulis nama komoditas, minimal 3 karakter.";
  }

  const description = str(raw, "description");
  if (description.length < 40) {
    errors.description =
      "Deskripsi minimal 40 karakter. Sebutkan spesifikasi, mutu, dan pengemasan.";
  } else if (description.length > 4000) {
    errors.description = "Deskripsi maksimal 4000 karakter.";
  }

  // --- Kode HS ---
  const hsCode = str(raw, "hsCode");
  // Terima format 4-10 digit, boleh dipisah titik: 0901, 0901.11, 0901.11.10
  if (!hsCode) {
    errors.hsCode = "Kode HS wajib diisi.";
  } else if (!/^\d{4}(\.\d{2}){0,3}$/.test(hsCode)) {
    errors.hsCode =
      "Format kode HS belum benar. Contoh: 0901 atau 0901.11.10";
  }

  // --- Kategori ---
  const categoryRaw = str(raw, "category");
  const category = VALID_CATEGORIES.includes(categoryRaw as CommodityCategory)
    ? (categoryRaw as CommodityCategory)
    : null;
  if (!category) errors.category = "Pilih kategori komoditas.";

  // --- Kuantitas & satuan ---
  const quantity = num(raw, "quantity");
  if (quantity === null) {
    errors.quantity = "Kuantitas wajib diisi.";
  } else if (quantity <= 0) {
    errors.quantity = "Kuantitas harus lebih besar dari 0.";
  }

  const unitRaw = str(raw, "unit");
  const unit = VALID_UNITS.includes(unitRaw as Unit) ? (unitRaw as Unit) : null;
  if (!unit) errors.unit = "Pilih satuan.";

  // --- Harga (opsional untuk permintaan) ---
  const priceRaw = raw["price"];
  let price: number | null = null;
  const priceEmpty =
    priceRaw === null ||
    priceRaw === undefined ||
    (typeof priceRaw === "string" && priceRaw.trim() === "");

  if (!priceEmpty) {
    const parsed = num(raw, "price");
    if (parsed === null) {
      errors.price = "Harga harus berupa angka.";
    } else if (parsed <= 0) {
      errors.price = "Harga harus lebih besar dari 0.";
    } else {
      price = parsed;
    }
  } else if (kind === "supply") {
    // Penawaran tanpa harga tidak berguna bagi calon pembeli.
    errors.price = "Penawaran ekspor wajib mencantumkan harga.";
  }

  const currencyRaw = str(raw, "currency");
  const currency = CURRENCIES.includes(currencyRaw as Currency)
    ? (currencyRaw as Currency)
    : null;
  if (!currency) errors.currency = "Pilih mata uang.";

  // --- Incoterm ---
  const incotermRaw = str(raw, "incoterm");
  const incoterm = VALID_INCOTERMS.includes(incotermRaw as Incoterm)
    ? (incotermRaw as Incoterm)
    : null;
  if (!incoterm) errors.incoterm = "Pilih Incoterm.";

  // --- Lokasi ---
  const originCountry = str(raw, "originCountry");
  if (!originCountry) errors.originCountry = "Negara asal wajib diisi.";

  const destinationCountry = str(raw, "destinationCountry");
  if (!destinationCountry) {
    errors.destinationCountry = "Negara tujuan wajib diisi.";
  }

  const port = str(raw, "port");
  if (!port) errors.port = "Pelabuhan wajib diisi.";

  // --- Minimum order (opsional) ---
  let minOrder: number | null = null;
  const minOrderRaw = raw["minOrder"];
  const minOrderEmpty =
    minOrderRaw === null ||
    minOrderRaw === undefined ||
    (typeof minOrderRaw === "string" && minOrderRaw.trim() === "");
  if (!minOrderEmpty) {
    const parsed = num(raw, "minOrder");
    if (parsed === null || parsed <= 0) {
      errors.minOrder = "Minimum order harus berupa angka lebih dari 0.";
    } else if (quantity !== null && parsed > quantity) {
      errors.minOrder = "Minimum order tidak boleh melebihi kuantitas.";
    } else {
      minOrder = parsed;
    }
  }

  // --- Dokumen quality check ---
  // Diterima sebagai array objek. Setiap baris dibersihkan satu per satu, dan
  // baris yang tidak masuk akal dibuang daripada menggagalkan seluruh form.
  const qualityDocuments: QualityDocRequirement[] = [];
  const docsRaw = raw["qualityDocuments"];

  if (Array.isArray(docsRaw)) {
    const seen = new Set<string>();

    for (const item of docsRaw) {
      if (typeof item !== "object" || item === null) continue;

      const doc = item as Record<string, unknown>;
      const docId = typeof doc.id === "string" ? doc.id.trim() : "";
      const docName = typeof doc.name === "string" ? doc.name.trim() : "";

      if (!docId || !docName) continue;
      if (docId.length > 80 || docName.length > 140) continue;
      if (seen.has(docId)) continue;
      seen.add(docId);

      const noteRaw = typeof doc.note === "string" ? doc.note.trim() : "";

      qualityDocuments.push({
        id: docId,
        name: docName,
        mandatory: doc.mandatory !== false,
        note: noteRaw ? noteRaw.slice(0, 200) : null,
      });

      if (qualityDocuments.length >= 30) break;
    }
  } else if (docsRaw !== undefined && docsRaw !== null) {
    errors.qualityDocuments = "Format daftar dokumen mutu tidak valid.";
  }

  // Permintaan tanpa persyaratan dokumen apa pun membuat eksportir menebak-nebak.
  if (kind === "demand" && qualityDocuments.length === 0) {
    errors.qualityDocuments =
      "Pilih minimal satu dokumen mutu yang Anda persyaratkan. Pakai tombol isi otomatis bila belum yakin.";
  }

  // --- Sertifikasi: boleh array, boleh teks dipisah koma ---
  let certifications: string[] = [];
  const certRaw = raw["certifications"];
  if (Array.isArray(certRaw)) {
    certifications = certRaw
      .filter((c): c is string => typeof c === "string")
      .map((c) => c.trim())
      .filter(Boolean);
  } else if (typeof certRaw === "string") {
    certifications = certRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  if (certifications.length > 12) {
    certifications = certifications.slice(0, 12);
  }

  // --- Tenggat: wajib untuk permintaan, harus di masa depan ---
  let deadline: string | null = null;
  const deadlineRaw = str(raw, "deadline");
  if (deadlineRaw) {
    const d = new Date(deadlineRaw);
    if (Number.isNaN(d.getTime())) {
      errors.deadline = "Tanggal tenggat tidak valid.";
    } else if (d.getTime() < Date.now() - 86_400_000) {
      errors.deadline = "Tenggat tidak boleh di masa lalu.";
    } else {
      deadline = d.toISOString();
    }
  } else if (kind === "demand") {
    errors.deadline =
      "Permintaan wajib punya tenggat, supaya eksportir tahu batas waktunya.";
  }

  // --- Identitas pemosting ---
  const companyName = str(raw, "companyName");
  if (companyName.length < 3) {
    errors.companyName = "Nama perusahaan minimal 3 karakter.";
  }

  const contactCity = str(raw, "contactCity");
  if (!contactCity) errors.contactCity = "Kota wajib diisi.";

  const contactCountry = str(raw, "contactCountry");
  if (!contactCountry) errors.contactCountry = "Negara wajib diisi.";

  const paymentTerms = str(raw, "paymentTerms");
  if (paymentTerms.length < 5) {
    errors.paymentTerms =
      "Jelaskan syarat pembayaran, mis. \"T/T 30% di muka, 70% terhadap dokumen\".";
  }

  const capacityNoteRaw = str(raw, "capacityNote");

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Semua pemeriksaan lolos, jadi nilai-nilai berikut pasti tidak null.
  return {
    ok: true,
    data: {
      kind: kind as ListingKind,
      title,
      commodity,
      category: category as CommodityCategory,
      hsCode,
      description,
      quantity: quantity as number,
      unit: unit as Unit,
      price,
      currency: currency as Currency,
      incoterm: incoterm as Incoterm,
      originCountry,
      destinationCountry,
      port,
      certifications,
      qualityDocuments,
      minOrder,
      capacityNote: capacityNoteRaw || null,
      paymentTerms,
      deadline,
      companyName,
      contactCity,
      contactCountry,
    },
  };
}
