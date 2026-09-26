import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/SectionHeading";
import {
  AUDIENCE_LABEL,
  EXPORT_DOCUMENTS,
  GLOSSARY,
  GUIDES,
  GUIDE_LEVEL_LABEL,
  IMPORT_DOCUMENTS,
  LINK_CATEGORY_META,
  REGULATION_LINKS,
  type DocumentItem,
  type GuideLevel,
  type LinkCategory,
} from "@/data/education";

export const metadata: Metadata = {
  title: "Edukasi & Regulasi",
  description:
    "Panduan ekspor impor untuk pemula, daftar dokumen wajib, kamus istilah perdagangan, dan tautan ke situs regulasi resmi Indonesia.",
};

const LEVEL_TONE: Record<GuideLevel, "green" | "amber" | "red"> = {
  pemula: "green",
  menengah: "amber",
  lanjutan: "red",
};

const SECTIONS = [
  { href: "#panduan", label: "Panduan" },
  { href: "#dokumen", label: "Dokumen Wajib" },
  { href: "#regulasi", label: "Situs Regulasi" },
  { href: "#istilah", label: "Kamus Istilah" },
];

const CATEGORY_ORDER: LinkCategory[] = [
  "perizinan",
  "kepabeanan",
  "tarif",
  "sertifikasi",
  "data",
  "pembiayaan",
  "internasional",
];

export default function EducationPage() {
  const essentialCount = REGULATION_LINKS.filter((l) => l.essential).length;

  return (
    <>
      <PageHeader
        eyebrow="Edukasi"
        title="Pahami dulu, baru bertransaksi"
        description="Sebagian besar kerugian dalam ekspor impor bukan karena harga yang salah, tapi karena ada aturan atau dokumen yang terlewat. Halaman ini mengumpulkan yang perlu Anda ketahui beserta tautan langsung ke sumber resminya."
      >
        <nav aria-label="Bagian di halaman ini">
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="inline-block rounded-lg border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <div className="container-page py-10">
        {/* ============ PANDUAN ============ */}
        <section id="panduan" className="scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            Panduan langkah demi langkah
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Klik judul untuk membuka rinciannya. Kalau benar-benar baru,
            mulailah dari panduan bertanda &ldquo;Pemula&rdquo; secara berurutan.
          </p>

          <div className="mt-6 space-y-3">
            {GUIDES.map((guide) => (
              <details
                key={guide.id}
                id={guide.id}
                className="card group scroll-mt-24 overflow-hidden [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50">
                  <span
                    aria-hidden="true"
                    className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 transition-transform group-open:rotate-90"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 6 6 6-6 6" />
                    </svg>
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy-900">
                      {guide.title}
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">
                      {guide.summary}
                    </span>
                    <span className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge tone={LEVEL_TONE[guide.level]}>
                        {GUIDE_LEVEL_LABEL[guide.level]}
                      </Badge>
                      <Badge tone="slate">{AUDIENCE_LABEL[guide.audience]}</Badge>
                      <span className="text-xs text-slate-500">
                        {guide.readingMinutes} menit baca ·{" "}
                        {guide.steps.length} bagian
                      </span>
                    </span>
                  </span>
                </summary>

                <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-5 sm:pl-16">
                  <ol className="space-y-5">
                    {guide.steps.map((step) => (
                      <li key={step.title}>
                        <h3 className="font-semibold text-navy-900">
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                          {step.detail}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ============ DOKUMEN ============ */}
        <section id="dokumen" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            Daftar dokumen wajib
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Dokumen bertanda <strong>Wajib</strong> hampir selalu diperlukan.
            Yang bertanda <strong>Kondisional</strong> bergantung pada komoditas,
            negara tujuan, atau fasilitas yang Anda pakai.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DocumentList
              title="Untuk Ekspor"
              items={EXPORT_DOCUMENTS}
              tone="brand"
            />
            <DocumentList
              title="Untuk Impor"
              items={IMPORT_DOCUMENTS}
              tone="amber"
            />
          </div>

          <Callout tone="info" className="mt-6">
            Kiat praktis: buat satu lembar &ldquo;data induk&rdquo; berisi nama
            dan alamat pembeli, uraian barang, kode HS, kuantitas, berat bersih,
            berat kotor, dan nomor kontrak. Salin seluruh dokumen dari lembar itu.
            Sebagian besar penundaan di pelabuhan terjadi karena satu angka
            berbeda antar dokumen.
          </Callout>
        </section>

        {/* ============ REGULASI ============ */}
        <section id="regulasi" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            Situs regulasi & sumber resmi
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            {REGULATION_LINKS.length} tautan yang dikelompokkan menurut
            kebutuhan, {essentialCount} di antaranya ditandai sebagai yang paling
            sering dipakai. Semua tautan terbuka di tab baru.
          </p>

          <div className="mt-6 space-y-8">
            {CATEGORY_ORDER.map((category) => {
              const links = REGULATION_LINKS.filter(
                (l) => l.category === category,
              );
              if (links.length === 0) return null;

              const meta = LINK_CATEGORY_META[category];

              return (
                <div key={category}>
                  <div className="flex items-start gap-3">
                    <span aria-hidden="true" className="text-2xl">
                      {meta.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-navy-900">{meta.label}</h3>
                      <p className="text-sm text-slate-600">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 grid gap-4 md:grid-cols-2">
                    {links.map((link) => (
                      <li key={link.id}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-navy-900 group-hover:text-brand-700">
                              {link.name}
                            </span>
                            <svg
                              viewBox="0 0 24 24"
                              className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-600"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M7 17 17 7M9 7h8v8" />
                            </svg>
                          </span>
                          <span className="mt-1 text-xs text-slate-500">
                            {link.org}
                          </span>
                          <span className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                            {link.description}
                          </span>
                          {link.essential && (
                            <span className="mt-3">
                              <Badge tone="brand">Paling sering dipakai</Badge>
                            </span>
                          )}
                          <span className="sr-only">(buka di tab baru)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Callout tone="warning" className="mt-8">
            Aturan perdagangan berubah cukup sering. Tarif, daftar barang yang
            dibatasi, dan persyaratan izin bisa diperbarui kapan saja. Selalu
            baca ketentuan terbaru langsung di situs resmi di atas, jangan
            mengandalkan ringkasan di tempat lain, termasuk di aplikasi ini.
          </Callout>
        </section>

        {/* ============ ISTILAH ============ */}
        <section id="istilah" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-bold tracking-tight text-navy-900">
            Kamus istilah
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Istilah yang paling sering muncul dalam korespondensi, kontrak, dan
            dokumen pabean.
          </p>

          <dl className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {GLOSSARY.map((entry) => (
              <div key={entry.term} className="card p-5">
                <dt>
                  <span className="font-bold text-navy-900">{entry.term}</span>
                  {entry.full && (
                    <span className="mt-0.5 block text-xs text-brand-700">
                      {entry.full}
                    </span>
                  )}
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {entry.definition}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}

/* ---------------- Komponen bantu ---------------- */

function DocumentList({
  title,
  items,
  tone,
}: {
  title: string;
  items: DocumentItem[];
  tone: "brand" | "amber";
}) {
  return (
    <Card className="overflow-hidden">
      <div
        className={`h-1 ${tone === "brand" ? "bg-brand-500" : "bg-amber-400"}`}
        aria-hidden="true"
      />
      <CardHeader>
        <CardTitle as="h3">{title}</CardTitle>
      </CardHeader>
      <CardBody className="p-0">
        <ul className="divide-y divide-slate-200">
          {items.map((item) => (
            <li key={item.name} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-navy-900">{item.name}</p>
                <Badge tone={item.always ? "green" : "slate"}>
                  {item.always ? "Wajib" : "Kondisional"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Diterbitkan oleh: {item.issuedBy}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.note}
              </p>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
