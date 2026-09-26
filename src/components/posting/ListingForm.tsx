"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { HsCodeField } from "@/components/posting/HsCodeField";
import { QualityDocsField } from "@/components/posting/QualityDocsField";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import {
  CATEGORY_KEYS,
  CATEGORY_META,
  CURRENCIES,
  INCOTERMS,
  LISTING_KIND_META,
  UNIT_LABELS,
  type CommodityCategory,
  type ListingKind,
  type QualityDocRequirement,
  type Unit,
} from "@/lib/types";
import {
  validateListingDraft,
  type FieldErrors,
} from "@/lib/validateListing";

/* ============================================================
   Form pembuatan postingan.

   Satu form dipakai untuk dua jenis postingan. Label, placeholder, dan
   beberapa aturan berubah mengikuti pilihan "Saya eksportir" atau
   "Saya importir", supaya pengguna tidak bingung istilah.
   ============================================================ */

interface FormState {
  kind: ListingKind;
  title: string;
  commodity: string;
  category: string;
  hsCode: string;
  description: string;
  quantity: string;
  unit: string;
  minOrder: string;
  price: string;
  currency: string;
  incoterm: string;
  originCountry: string;
  destinationCountry: string;
  port: string;
  certifications: string;
  qualityDocuments: QualityDocRequirement[];
  capacityNote: string;
  paymentTerms: string;
  deadline: string;
  companyName: string;
  contactCity: string;
  contactCountry: string;
}

function initialState(kind: ListingKind): FormState {
  const supply = kind === "supply";
  return {
    kind,
    title: "",
    commodity: "",
    category: "agri",
    hsCode: "",
    description: "",
    quantity: "",
    unit: "mt" satisfies Unit,
    minOrder: "",
    price: "",
    currency: "USD",
    incoterm: supply ? "FOB" : "CIF",
    originCountry: supply ? "Indonesia" : "",
    destinationCountry: supply ? "Terbuka (global)" : "Indonesia",
    port: "",
    certifications: "",
    qualityDocuments: [],
    capacityNote: "",
    paymentTerms: "",
    deadline: "",
    companyName: "",
    contactCity: "",
    contactCountry: "Indonesia",
  };
}

export function ListingForm({ initialKind }: { initialKind: ListingKind }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(initialKind));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isSupply = form.kind === "supply";

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Hapus error field begitu pengguna mulai memperbaikinya.
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof FieldErrors];
      return next;
    });
  };

  /** Ganti jenis postingan: reset form agar default-nya ikut menyesuaikan. */
  const switchKind = (kind: ListingKind) => {
    if (kind === form.kind) return;
    setForm(initialState(kind));
    setErrors({});
    setServerError(null);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    // Validasi di client dulu supaya umpan baliknya instan.
    const local = validateListingDraft(form);
    if (!local.ok) {
      setErrors(local.errors);
      // Arahkan fokus ke field pertama yang bermasalah.
      const firstKey = Object.keys(local.errors)[0];
      if (firstKey) {
        document.getElementById(`f-${firstKey}`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        document.getElementById(`f-${firstKey}`)?.focus({ preventScroll: true });
      }
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(local.data),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const data = payload as
          | { error?: string; fieldErrors?: FieldErrors }
          | null;
        if (data?.fieldErrors) setErrors(data.fieldErrors);
        setServerError(
          data?.error ?? "Gagal menyimpan postingan. Coba lagi sebentar.",
        );
        return;
      }

      const data = payload as { listing?: { id?: string } } | null;
      const id = data?.listing?.id;

      // Muat ulang data server agar postingan baru muncul di marketplace.
      router.refresh();
      router.push(id ? `/marketplace/${id}` : "/marketplace");
    } catch {
      setServerError(
        "Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ============ Pilih jenis postingan ============ */}
      <fieldset>
        <legend className="text-sm font-semibold text-navy-900">
          Anda memasang apa?
        </legend>
        <p className="mt-1 text-sm text-slate-600">
          Pilihan ini menentukan cara postingan Anda ditampilkan dan siapa yang
          akan melihatnya.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["supply", "demand"] as ListingKind[]).map((kind) => {
            const meta = LISTING_KIND_META[kind];
            const active = form.kind === kind;
            const isSup = kind === "supply";

            return (
              <label
                key={kind}
                className={cn(
                  "relative flex cursor-pointer flex-col rounded-xl border-2 p-5 transition-all",
                  active
                    ? isSup
                      ? "border-brand-600 bg-brand-50/60 shadow-sm"
                      : "border-amber-500 bg-amber-50/60 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  name="kind"
                  value={kind}
                  checked={active}
                  onChange={() => switchKind(kind)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "text-xs font-bold tracking-wider uppercase",
                      active
                        ? isSup
                          ? "text-brand-700"
                          : "text-amber-700"
                        : "text-slate-500",
                    )}
                  >
                    Saya {meta.actor}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full border-2",
                      active
                        ? isSup
                          ? "border-brand-600 bg-brand-600"
                          : "border-amber-500 bg-amber-500"
                        : "border-slate-300",
                    )}
                  >
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                </span>
                <span className="mt-2 font-semibold text-navy-900">
                  {meta.label}
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {meta.description}
                </span>
              </label>
            );
          })}
        </div>
        {errors.kind && <FieldError id="f-kind">{errors.kind}</FieldError>}
      </fieldset>

      {/* ============ Tentang barang ============ */}
      <Card>
        <CardHeader>
          <CardTitle as="h2">
            {isSupply ? "Tentang produk Anda" : "Barang yang Anda cari"}
          </CardTitle>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field
            className="sm:col-span-2"
            id="f-title"
            label="Judul postingan"
            error={errors.title}
            hint={
              isSupply
                ? "Sebutkan komoditas, grade, dan keunggulannya. Contoh: Kopi Arabika Gayo Grade 1, Fully Washed, Screen 16+"
                : "Awali dengan \"Dicari:\" lalu sebutkan spesifikasi kuncinya."
            }
            required
          >
            <input
              id="f-title"
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={140}
              className="field-input"
              placeholder={
                isSupply
                  ? "Kopi Arabika Gayo Grade 1 - Fully Washed, Screen 16+"
                  : "Dicari: Kopi Arabika Specialty Score 84+ untuk roastery"
              }
            />
          </Field>

          <Field
            id="f-commodity"
            label="Nama komoditas"
            error={errors.commodity}
            hint="Nama umum yang singkat, dipakai untuk pencarian."
            required
          >
            <input
              id="f-commodity"
              type="text"
              value={form.commodity}
              onChange={(e) => set("commodity", e.target.value)}
              className="field-input"
              placeholder="Kopi Arabika"
            />
          </Field>

          <Field
            id="f-category"
            label="Kategori"
            error={errors.category}
            required
          >
            <select
              id="f-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="field-input"
            >
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_META[key].label}
                </option>
              ))}
            </select>
          </Field>

          {/* Kode HS dengan pencarian otomatis dari nama komoditas. */}
          <HsCodeField
            value={form.hsCode}
            onChange={(code) => set("hsCode", code)}
            onPickCategory={(category) => set("category", category)}
            commodity={form.commodity}
            error={errors.hsCode}
          />

          <Field
            id="f-capacityNote"
            label="Catatan kapasitas"
            error={errors.capacityNote}
            hint="Opsional. Mis. 25 MT per bulan saat musim panen."
          >
            <input
              id="f-capacityNote"
              type="text"
              value={form.capacityNote}
              onChange={(e) => set("capacityNote", e.target.value)}
              className="field-input"
              placeholder="25 MT per bulan"
            />
          </Field>

          <Field
            className="sm:col-span-2"
            id="f-description"
            label="Deskripsi lengkap"
            error={errors.description}
            hint={
              isSupply
                ? "Tulis spesifikasi teknis, mutu, pengemasan, asal daerah, dan ketersediaan sampel. Semakin rinci, semakin sedikit bolak-balik tanya jawab."
                : "Tulis spesifikasi yang wajib dipenuhi, volume per periode, sertifikasi yang dipersyaratkan, dan proses seleksi pemasok Anda."
            }
            required
          >
            <textarea
              id="f-description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={7}
              maxLength={4000}
              className="field-input resize-y leading-relaxed"
              placeholder={
                isSupply
                  ? "Kadar air 11-12%, defect maksimum 5 per 300 gram, cupping score 84-86. Dikemas goni 60 kg dengan inner GrainPro..."
                  : "Cupping score minimum 84, wajib bisa menyediakan sampel pre-shipment, bersedia diaudit ketertelusuran sampai kelompok tani..."
              }
            />
            <p className="mt-1.5 text-right text-xs text-slate-400">
              {form.description.length} / 4000
            </p>
          </Field>
        </CardBody>
      </Card>

      {/* ============ Kuantitas & harga ============ */}
      <Card>
        <CardHeader>
          <CardTitle as="h2">Kuantitas & harga</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="f-quantity"
            label={isSupply ? "Kuantitas tersedia" : "Kuantitas dibutuhkan"}
            error={errors.quantity}
            required
          >
            <input
              id="f-quantity"
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              className="field-input"
              placeholder="18"
            />
          </Field>

          <Field id="f-unit" label="Satuan" error={errors.unit} required>
            <select
              id="f-unit"
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
              className="field-input"
            >
              {(Object.keys(UNIT_LABELS) as Unit[]).map((unit) => (
                <option key={unit} value={unit}>
                  {UNIT_LABELS[unit]}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="f-minOrder"
            label="Minimum order"
            error={errors.minOrder}
            hint="Opsional, satuan sama seperti di atas."
          >
            <input
              id="f-minOrder"
              type="number"
              min="0"
              step="any"
              value={form.minOrder}
              onChange={(e) => set("minOrder", e.target.value)}
              className="field-input"
              placeholder="1"
            />
          </Field>

          <Field id="f-currency" label="Mata uang" error={errors.currency} required>
            <select
              id="f-currency"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              className="field-input"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </Field>

          <Field
            className="sm:col-span-2"
            id="f-price"
            label={
              isSupply
                ? "Harga jual per satuan"
                : "Perkiraan budget per satuan"
            }
            error={errors.price}
            hint={
              isSupply
                ? "Wajib diisi. Penawaran tanpa harga jarang ditanggapi pembeli."
                : "Opsional. Kosongkan bila ingin terbuka untuk negosiasi."
            }
            required={isSupply}
          >
            <input
              id="f-price"
              type="number"
              min="0"
              step="any"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              className="field-input"
              placeholder="6.85"
            />
          </Field>

          <Field
            className="sm:col-span-2"
            id="f-paymentTerms"
            label="Syarat pembayaran"
            error={errors.paymentTerms}
            hint="Mis. T/T 30% di muka, 70% terhadap dokumen. Atau L/C at sight."
            required
          >
            <input
              id="f-paymentTerms"
              type="text"
              value={form.paymentTerms}
              onChange={(e) => set("paymentTerms", e.target.value)}
              className="field-input"
              placeholder="T/T 30% di muka, 70% terhadap dokumen"
            />
          </Field>
        </CardBody>
      </Card>

      {/* ============ Logistik ============ */}
      <Card>
        <CardHeader>
          <CardTitle as="h2">Logistik & syarat penyerahan</CardTitle>
        </CardHeader>
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field
            id="f-incoterm"
            label="Incoterm"
            error={errors.incoterm}
            hint={
              <>
                Menentukan sampai mana tanggung jawab penjual.{" "}
                <a
                  href="/edukasi#incoterms"
                  className="font-medium text-brand-700 underline underline-offset-2"
                >
                  Baca penjelasannya
                </a>
                .
              </>
            }
            required
          >
            <select
              id="f-incoterm"
              value={form.incoterm}
              onChange={(e) => set("incoterm", e.target.value)}
              className="field-input"
            >
              {INCOTERMS.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code} - {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="f-port"
            label={isSupply ? "Pelabuhan muat" : "Pelabuhan tujuan"}
            error={errors.port}
            required
          >
            <input
              id="f-port"
              type="text"
              value={form.port}
              onChange={(e) => set("port", e.target.value)}
              className="field-input"
              placeholder={isSupply ? "Belawan, Medan" : "Rotterdam"}
            />
          </Field>

          <Field
            id="f-originCountry"
            label="Negara asal barang"
            error={errors.originCountry}
            hint={
              isSupply
                ? undefined
                : "Boleh ditulis terbuka, mis. Terbuka (ASEAN) bila Anda tidak membatasi asal."
            }
            required
          >
            <input
              id="f-originCountry"
              type="text"
              value={form.originCountry}
              onChange={(e) => set("originCountry", e.target.value)}
              className="field-input"
              placeholder="Indonesia"
            />
          </Field>

          <Field
            id="f-destinationCountry"
            label="Negara tujuan"
            error={errors.destinationCountry}
            hint={
              isSupply
                ? "Tulis Terbuka (global) bila Anda melayani semua pasar."
                : undefined
            }
            required
          >
            <input
              id="f-destinationCountry"
              type="text"
              value={form.destinationCountry}
              onChange={(e) => set("destinationCountry", e.target.value)}
              className="field-input"
              placeholder={isSupply ? "Terbuka (global)" : "Belanda"}
            />
          </Field>

          <Field
            className="sm:col-span-2"
            id="f-certifications"
            label={
              isSupply
                ? "Sertifikasi yang Anda miliki"
                : "Sertifikasi yang dipersyaratkan"
            }
            error={errors.certifications}
            hint="Pisahkan dengan koma. Maksimal 12. Mis. Organic EU, HACCP, Fair Trade"
          >
            <input
              id="f-certifications"
              type="text"
              value={form.certifications}
              onChange={(e) => set("certifications", e.target.value)}
              className="field-input"
              placeholder="Organic EU, HACCP, Fair Trade"
            />
          </Field>

          <Field
            id="f-deadline"
            label="Tenggat penawaran"
            error={errors.deadline}
            hint={
              isSupply
                ? "Opsional. Isi bila penawaran ini hanya berlaku sampai tanggal tertentu."
                : "Wajib. Batas akhir Anda menerima penawaran dari eksportir."
            }
            required={!isSupply}
          >
            <input
              id="f-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => set("deadline", e.target.value)}
              className="field-input"
            />
          </Field>
        </CardBody>
      </Card>

      {/* ============ Dokumen quality check ============ */}
      <Card>
        <CardHeader>
          <CardTitle as="h2">
            {isSupply
              ? "Dokumen mutu yang bisa Anda sediakan"
              : "Dokumen mutu yang Anda persyaratkan"}
          </CardTitle>
        </CardHeader>
        <CardBody>
          <QualityDocsField
            kind={form.kind}
            category={asCategory(form.category)}
            value={form.qualityDocuments}
            onChange={(docs) => set("qualityDocuments", docs)}
            error={errors.qualityDocuments}
          />
        </CardBody>
      </Card>

      {/* ============ Identitas ============ */}
      <Card>
        <CardHeader>
          <CardTitle as="h2">Identitas Anda</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <Callout tone="info">
            Prototipe ini belum punya sistem akun, jadi identitas diisi manual
            dan postingan baru otomatis berstatus{" "}
            <strong>belum diverifikasi</strong>. Jangan menuliskan nomor telepon,
            email, atau data pribadi lain di form ini.
          </Callout>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              id="f-companyName"
              label="Nama perusahaan"
              error={errors.companyName}
              required
            >
              <input
                id="f-companyName"
                type="text"
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className="field-input"
                placeholder="PT Gayo Highland Coffee"
              />
            </Field>

            <Field
              id="f-contactCity"
              label="Kota"
              error={errors.contactCity}
              required
            >
              <input
                id="f-contactCity"
                type="text"
                value={form.contactCity}
                onChange={(e) => set("contactCity", e.target.value)}
                className="field-input"
                placeholder="Takengon, Aceh"
              />
            </Field>

            <Field
              id="f-contactCountry"
              label="Negara"
              error={errors.contactCountry}
              required
            >
              <input
                id="f-contactCountry"
                type="text"
                value={form.contactCountry}
                onChange={(e) => set("contactCountry", e.target.value)}
                className="field-input"
                placeholder="Indonesia"
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      {/* ============ Kirim ============ */}
      {serverError && (
        <Callout tone="danger" title="Gagal menyimpan">
          {serverError}
        </Callout>
      )}

      {Object.keys(errors).length > 0 && (
        <Callout tone="danger" title="Masih ada yang perlu diperbaiki">
          Ada {Object.keys(errors).length} field yang belum benar. Pesannya
          ditampilkan tepat di bawah masing-masing field.
        </Callout>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner />
              Menyimpan...
            </>
          ) : isSupply ? (
            "Pasang Penawaran"
          ) : (
            "Pasang Permintaan"
          )}
        </Button>
        <p className="text-sm text-slate-500">
          Postingan langsung tampil di marketplace setelah disimpan.
        </p>
      </div>
    </form>
  );
}

/* ---------------- Komponen bantu ---------------- */

/**
 * Sempitkan nilai kategori dari state (bertipe string) menjadi
 * CommodityCategory. Nilai di luar daftar seharusnya tidak mungkin terjadi
 * karena hanya berasal dari <select>, tapi fallback tetap disiapkan agar
 * komponen anak tidak pernah menerima nilai tak dikenal.
 */
function asCategory(value: string): CommodityCategory {
  return CATEGORY_KEYS.includes(value as CommodityCategory)
    ? (value as CommodityCategory)
    : "agri";
}

function Field({
  id,
  label,
  children,
  error,
  hint,
  required,
  className,
}: {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <FieldError id={id}>{error}</FieldError>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
}

function FieldError({ children }: { id: string; children: ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs text-red-600">
      <svg
        viewBox="0 0 24 24"
        className="mt-px h-3.5 w-3.5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4.5M12 16h.01" />
      </svg>
      {children}
    </p>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeOpacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
