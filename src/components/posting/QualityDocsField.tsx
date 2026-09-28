"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { cn } from "@/lib/cn";
import {
  QUALITY_DOC_GROUPS,
  QUALITY_DOC_GROUP_META,
  QUALITY_DOCS,
  docsForCategory,
  getQualityDoc,
  suggestQualityDocs,
  type QualityDocDef,
} from "@/data/qualityDocuments";
import type {
  CommodityCategory,
  ListingKind,
  QualityDocRequirement,
} from "@/lib/types";

/* ============================================================
   Pemilih persyaratan dokumen quality check.

   Alur yang dituju:
     1. Pengguna memilih kategori komoditas di bagian sebelumnya.
     2. Di sini ia bisa menekan satu tombol untuk mengisi daftar dokumen
        yang lazim untuk kategori tersebut, lalu menyunting.
     3. Setiap dokumen bisa ditandai wajib atau opsional, dan diberi catatan
        ambang batas, mis. "Aflatoksin B1 maksimum 5 ppb".
     4. Dokumen di luar katalog bisa ditambahkan manual.

   Label berubah menurut jenis postingan: eksportir "bisa menyediakan",
   importir "mempersyaratkan".
   ============================================================ */

interface Props {
  kind: ListingKind;
  category: CommodityCategory;
  value: QualityDocRequirement[];
  onChange: (docs: QualityDocRequirement[]) => void;
  error?: string;
}

export function QualityDocsField({
  kind,
  category,
  value,
  onChange,
  error,
}: Props) {
  const isSupply = kind === "supply";
  const [showAll, setShowAll] = useState(false);
  const [customName, setCustomName] = useState("");

  const selectedIds = useMemo(
    () => new Set(value.map((doc) => doc.id)),
    [value],
  );

  /** Dokumen yang relevan dengan kategori, atau seluruh katalog. */
  const visibleDocs = useMemo(() => {
    const relevant = docsForCategory(category);
    return showAll ? QUALITY_DOCS : relevant;
  }, [category, showAll]);

  /** Kelompokkan agar daftar panjang tetap terbaca. */
  const grouped = useMemo(() => {
    return QUALITY_DOC_GROUPS.map((group) => ({
      group,
      docs: visibleDocs.filter((doc) => doc.group === group),
    })).filter((entry) => entry.docs.length > 0);
  }, [visibleDocs]);

  function toggle(def: QualityDocDef) {
    if (selectedIds.has(def.id)) {
      onChange(value.filter((doc) => doc.id !== def.id));
    } else {
      onChange([
        ...value,
        { id: def.id, name: def.name, mandatory: true, note: null },
      ]);
    }
  }

  function setMandatory(id: string, mandatory: boolean) {
    onChange(value.map((doc) => (doc.id === id ? { ...doc, mandatory } : doc)));
  }

  function setNote(id: string, note: string) {
    onChange(
      value.map((doc) =>
        doc.id === id ? { ...doc, note: note.trim() ? note : null } : doc,
      ),
    );
  }

  function remove(id: string) {
    onChange(value.filter((doc) => doc.id !== id));
  }

  function applyPreset() {
    const suggested = suggestQualityDocs(category);
    // Gabungkan dengan pilihan yang sudah ada, jangan menimpa.
    const existing = new Set(value.map((d) => d.id));
    const merged = [
      ...value,
      ...suggested.filter((doc) => !existing.has(doc.id)),
    ];
    onChange(merged);
  }

  function addCustom() {
    const name = customName.trim();
    if (name.length < 3) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40);
    const id = `custom:${slug || Date.now()}`;

    if (selectedIds.has(id)) {
      setCustomName("");
      return;
    }

    onChange([...value, { id, name, mandatory: true, note: null }]);
    setCustomName("");
  }

  const mandatoryCount = value.filter((d) => d.mandatory).length;

  return (
    <div className="space-y-5">
      <Callout tone="info">
        {isSupply ? (
          <>
            Daftar ini menyatakan dokumen mutu yang <strong>bisa Anda
            sediakan per pengiriman</strong>. Berbeda dari sertifikasi
            perusahaan di bagian sebelumnya, yang berlaku terus-menerus.
            Pembeli serius hampir selalu menanyakan hal ini, jadi mengisinya
            dengan jujur akan menghemat banyak tanya jawab.
          </>
        ) : (
          <>
            Daftar ini menyatakan dokumen mutu yang{" "}
            <strong>Anda persyaratkan dari pemasok</strong> untuk setiap
            pengiriman. Semakin jelas di awal, semakin kecil kemungkinan
            sengketa mutu setelah barang tiba.
          </>
        )}
      </Callout>

      {/* ---------- Aksi cepat ---------- */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={applyPreset}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3.5 13.6 8l4.4 1.6L13.6 11 12 15.5 10.4 11 6 9.6 10.4 8 12 3.5z" />
          </svg>
          Isi otomatis untuk {CATEGORY_LABEL(category)}
        </button>

        {value.length > 0 && (
          <>
            <span className="text-sm text-slate-600">
              {value.length} dipilih
              {mandatoryCount > 0 && (
                <span className="text-slate-500">
                  {" "}
                  ({mandatoryCount} wajib)
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-sm font-medium text-slate-500 hover:text-red-600 hover:underline"
            >
              Kosongkan
            </button>
          </>
        )}
      </div>

      {/* ---------- Dokumen terpilih, bisa disunting ---------- */}
      {value.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <h4 className="text-sm font-semibold text-navy-900">
            Dokumen yang dipilih
          </h4>
          <ul className="mt-3 space-y-3">
            {value.map((doc) => {
              const def = getQualityDoc(doc.id);
              const isCustom = doc.id.startsWith("custom:");

              return (
                <li
                  key={doc.id}
                  className="rounded-lg border border-slate-200 bg-white p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 font-medium text-navy-900">
                        {doc.name}
                        {def?.abbr && (
                          <span className="font-mono text-xs text-slate-500">
                            {def.abbr}
                          </span>
                        )}
                        {isCustom && <Badge tone="violet">Kustom</Badge>}
                      </p>
                      {def && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          Diterbitkan: {def.issuedBy}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Pilihan wajib atau opsional */}
                      <div
                        className="inline-flex overflow-hidden rounded-lg border border-slate-300"
                        role="group"
                        aria-label={`Status ${doc.name}`}
                      >
                        <button
                          type="button"
                          aria-pressed={doc.mandatory}
                          onClick={() => setMandatory(doc.id, true)}
                          className={cn(
                            "px-3 py-2 text-xs font-semibold transition-colors sm:px-2.5 sm:py-1",
                            doc.mandatory
                              ? "bg-brand-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          Wajib
                        </button>
                        <button
                          type="button"
                          aria-pressed={!doc.mandatory}
                          onClick={() => setMandatory(doc.id, false)}
                          className={cn(
                            "border-l border-slate-300 px-3 py-2 text-xs font-semibold transition-colors sm:px-2.5 sm:py-1",
                            !doc.mandatory
                              ? "bg-slate-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          Opsional
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(doc.id)}
                        aria-label={`Hapus ${doc.name}`}
                        className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 sm:h-7 sm:w-7"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={doc.note ?? ""}
                    onChange={(e) => setNote(doc.id, e.target.value)}
                    maxLength={200}
                    placeholder={
                      def?.example
                        ? `Catatan, mis. ${def.example}`
                        : "Catatan atau ambang batas yang harus dipenuhi"
                    }
                    className="field-input mt-3 text-sm"
                    aria-label={`Catatan untuk ${doc.name}`}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ---------- Katalog untuk dipilih ---------- */}
      <div>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-navy-900">
            {showAll
              ? "Seluruh katalog dokumen"
              : `Lazim untuk ${CATEGORY_LABEL(category)}`}
          </h4>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            {showAll
              ? "Tampilkan yang relevan saja"
              : "Tampilkan seluruh katalog"}
          </button>
        </div>

        <div className="space-y-4">
          {grouped.map(({ group, docs }) => {
            const meta = QUALITY_DOC_GROUP_META[group];
            return (
              <fieldset key={group}>
                <legend className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
                  <span aria-hidden="true">{meta.icon}</span>
                  {meta.label}
                </legend>

                <ul className="grid gap-2 sm:grid-cols-2">
                  {docs.map((def) => {
                    const checked = selectedIds.has(def.id);
                    return (
                      <li key={def.id}>
                        <label
                          className={cn(
                            "flex h-full cursor-pointer gap-2.5 rounded-lg border p-3 transition-colors",
                            checked
                              ? "border-brand-400 bg-brand-50/60"
                              : "border-slate-200 bg-white hover:border-slate-300",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(def)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-500/30"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-navy-900">
                              {def.name}
                              {def.abbr && (
                                <span className="ml-1.5 font-mono text-xs text-slate-500">
                                  {def.abbr}
                                </span>
                              )}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                              {def.description}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            );
          })}
        </div>
      </div>

      {/* ---------- Tambah dokumen kustom ---------- */}
      <div className="rounded-xl border border-dashed border-slate-300 p-4">
        <label
          htmlFor="qc-custom"
          className="text-sm font-semibold text-navy-900"
        >
          Dokumen lain yang tidak ada di katalog
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="qc-custom"
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            maxLength={120}
            placeholder="Mis. Sertifikat Kesesuaian Standar Pembeli"
            className="field-input flex-1 sm:min-w-64"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={customName.trim().length < 3}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tambah
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* Label kategori dalam huruf kecil, agar menyatu di dalam kalimat. */
function CATEGORY_LABEL(category: CommodityCategory): string {
  const labels: Record<CommodityCategory, string> = {
    agri: "pertanian & rempah",
    plantation: "perkebunan",
    seafood: "perikanan",
    mineral: "mineral & logam",
    manufacture: "manufaktur & mesin",
    textile: "tekstil & garmen",
    furniture: "furnitur & kriya",
    food: "makanan olahan",
    chemical: "kimia & plastik",
    energy: "energi & biomassa",
  };
  return labels[category];
}
