import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard, VerifiedMark } from "@/components/ListingCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { TimeAgo } from "@/components/TimeAgo";
import {
  daysUntil,
  formatDate,
  formatMoney,
  formatNumber,
  formatQuantity,
} from "@/lib/format";
import { getQualityDoc } from "@/data/qualityDocuments";
import { getListingById, getRelatedListings } from "@/lib/store";
import {
  CATEGORY_META,
  INCOTERMS,
  LISTING_KIND_META,
  STATUS_META,
  UNIT_LABELS,
  UNIT_SUFFIX,
} from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    return { title: "Postingan tidak ditemukan" };
  }

  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) notFound();

  const isSupply = listing.kind === "supply";
  const kindMeta = LISTING_KIND_META[listing.kind];
  const category = CATEGORY_META[listing.category];
  const incotermInfo = INCOTERMS.find((i) => i.code === listing.incoterm);
  const related = getRelatedListings(listing);
  const remainingDays = listing.deadline ? daysUntil(listing.deadline) : null;

  // Pertanyaan siap-pakai untuk dikirim ke asisten AI.
  const assistantPrompt = isSupply
    ? `Saya importir yang tertarik pada penawaran "${listing.title}" (komoditas ${listing.commodity}, HS ${listing.hsCode}, ${listing.incoterm} ${listing.port}). Apa saja yang perlu saya periksa dari pemasok ini, dokumen apa yang harus saya minta, dan bagaimana perkiraan komponen biaya impornya ke Indonesia?`
    : `Saya eksportir yang ingin mengajukan penawaran untuk permintaan "${listing.title}" (komoditas ${listing.commodity}, HS ${listing.hsCode}, tujuan ${listing.destinationCountry}, ${listing.incoterm} ${listing.port}). Apa saja persyaratan dan dokumen yang harus saya siapkan, dan bagaimana sebaiknya saya menyusun penawaran harganya?`;

  return (
    <>
      {/* ---------- Header ---------- */}
      <header className="hero-grid border-b border-navy-800 bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900">
        <div className="container-page py-10">
          <nav aria-label="Navigasi bertingkat" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-brand-200/80">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Beranda
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href="/marketplace"
                  className="transition-colors hover:text-white"
                >
                  Marketplace
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/marketplace?kind=${listing.kind}`}
                  className="transition-colors hover:text-white"
                >
                  {kindMeta.shortLabel}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-mono text-white">{listing.id}</li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              tone={isSupply ? "brand" : "amber"}
              className={
                isSupply
                  ? "border-brand-400/40 bg-brand-500/20 text-brand-100"
                  : "border-amber-400/40 bg-amber-400/20 text-amber-100"
              }
              dot
            >
              {kindMeta.label}
            </Badge>
            <Badge className="border-white/20 bg-white/10 text-white">
              <span aria-hidden="true">{category.icon}</span>
              {category.label}
            </Badge>
            {listing.status !== "open" && (
              <Badge className="border-white/20 bg-white/10 text-white">
                {STATUS_META[listing.status].label}
              </Badge>
            )}
          </div>

          <h1 className="mt-4 max-w-4xl text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {listing.title}
          </h1>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-100/80">
            <span>{listing.commodity}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">HS {listing.hsCode}</span>
            <span aria-hidden="true">·</span>
            <TimeAgo iso={listing.createdAt} prefix="Diposting " />
          </p>
        </div>
      </header>

      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ---------- Kolom utama ---------- */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle as="h2">
                  {isSupply ? "Deskripsi produk" : "Rincian permintaan"}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-relaxed whitespace-pre-line text-slate-700">
                  {listing.description}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle as="h2">Spesifikasi & syarat dagang</CardTitle>
              </CardHeader>
              <CardBody className="p-0">
                <dl className="divide-y divide-slate-200">
                  <SpecRow
                    label={isSupply ? "Kuantitas tersedia" : "Kuantitas dibutuhkan"}
                    value={`${formatNumber(listing.quantity)} ${UNIT_LABELS[listing.unit]}`}
                  />
                  {listing.minOrder !== null && (
                    <SpecRow
                      label="Minimum order"
                      value={formatQuantity(listing.minOrder, listing.unit)}
                    />
                  )}
                  <SpecRow
                    label={isSupply ? "Harga" : "Perkiraan budget"}
                    value={
                      listing.price === null
                        ? "Terbuka untuk negosiasi"
                        : `${formatMoney(listing.price, listing.currency)} per ${UNIT_SUFFIX[listing.unit]}`
                    }
                  />
                  <SpecRow
                    label="Incoterm"
                    value={
                      <>
                        <span className="font-semibold">{listing.incoterm}</span>
                        {incotermInfo && (
                          <span className="text-slate-500">
                            {" "}
                            - {incotermInfo.name} ({incotermInfo.short})
                          </span>
                        )}
                      </>
                    }
                  />
                  <SpecRow label="Negara asal barang" value={listing.originCountry} />
                  <SpecRow label="Negara tujuan" value={listing.destinationCountry} />
                  <SpecRow
                    label={isSupply ? "Pelabuhan muat" : "Pelabuhan bongkar"}
                    value={listing.port}
                  />
                  <SpecRow label="Syarat pembayaran" value={listing.paymentTerms} />
                  {listing.capacityNote && (
                    <SpecRow label="Kapasitas" value={listing.capacityNote} />
                  )}
                  {listing.deadline && (
                    <SpecRow
                      label="Tenggat penawaran"
                      value={
                        <>
                          {formatDate(listing.deadline)}
                          {remainingDays !== null && (
                            <span
                              className={
                                remainingDays <= 7
                                  ? "font-semibold text-red-600"
                                  : "text-slate-500"
                              }
                            >
                              {" "}
                              (
                              {remainingDays > 0
                                ? `${remainingDays} hari lagi`
                                : "sudah lewat"}
                              )
                            </span>
                          )}
                        </>
                      }
                    />
                  )}
                </dl>
              </CardBody>
            </Card>

            {listing.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle as="h2">
                    {isSupply
                      ? "Sertifikasi yang dimiliki"
                      : "Sertifikasi yang dipersyaratkan"}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <ul className="flex flex-wrap gap-2">
                    {listing.certifications.map((cert) => (
                      <li
                        key={cert}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                        {cert}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            )}

            {/* Persyaratan dokumen quality check */}
            {listing.qualityDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle as="h2">
                    {isSupply
                      ? "Dokumen mutu yang disediakan"
                      : "Dokumen mutu yang dipersyaratkan"}
                  </CardTitle>
                  <p className="mt-1.5 text-sm text-slate-600">
                    {isSupply
                      ? "Dokumen berikut diterbitkan untuk setiap pengiriman, terpisah dari sertifikasi perusahaan di atas."
                      : "Pemasok wajib menyiapkan dokumen bertanda wajib untuk setiap pengiriman."}
                  </p>
                </CardHeader>
                <CardBody className="p-0">
                  <ul className="divide-y divide-slate-200">
                    {[...listing.qualityDocuments]
                      // Yang wajib ditampilkan lebih dulu.
                      .sort(
                        (a, b) =>
                          Number(b.mandatory) - Number(a.mandatory) ||
                          a.name.localeCompare(b.name, "id"),
                      )
                      .map((doc) => {
                        const def = getQualityDoc(doc.id);
                        return (
                          <li key={doc.id} className="px-5 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-2 font-medium text-navy-900">
                                  {doc.name}
                                  {def?.abbr && (
                                    <span className="font-mono text-xs text-slate-500">
                                      {def.abbr}
                                    </span>
                                  )}
                                </p>
                                {def && (
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    Diterbitkan: {def.issuedBy}
                                  </p>
                                )}
                              </div>
                              <Badge tone={doc.mandatory ? "red" : "slate"}>
                                {doc.mandatory ? "Wajib" : "Opsional"}
                              </Badge>
                            </div>

                            {doc.note && (
                              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-900">
                                {doc.note}
                              </p>
                            )}

                            {!doc.note && def?.description && (
                              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                                {def.description}
                              </p>
                            )}
                          </li>
                        );
                      })}
                  </ul>
                </CardBody>
              </Card>
            )}

            <Callout tone="warning" title="Verifikasi sendiri sebelum bertransaksi">
              Sertifikasi, kapasitas, dan profil yang tertera adalah klaim dari
              pihak yang memasang postingan. Selalu minta salinan sertifikat yang
              masih berlaku, lakukan panggilan video, dan untuk nilai besar
              pertimbangkan memakai surveyor independen. Baca{" "}
              <Link
                href="/edukasi#hindari-penipuan"
                className="font-semibold underline underline-offset-2"
              >
                panduan menghindari penipuan
              </Link>
              .
            </Callout>
          </div>

          {/* ---------- Sidebar ---------- */}
          <aside className="space-y-6">
            {/* Ringkasan harga */}
            <Card className="overflow-hidden">
              <div
                className={`px-5 py-5 ${isSupply ? "bg-brand-600" : "bg-amber-500"}`}
              >
                <p className="text-xs font-semibold tracking-wider text-white/80 uppercase">
                  {isSupply ? "Harga penawaran" : "Perkiraan budget"}
                </p>
                <p className="mt-1.5 text-3xl font-bold text-white">
                  {listing.price === null ? (
                    <span className="text-xl">Negosiasi</span>
                  ) : (
                    formatMoney(listing.price, listing.currency)
                  )}
                </p>
                <p className="mt-1 text-sm text-white/85">
                  {listing.price !== null && `per ${UNIT_SUFFIX[listing.unit]} · `}
                  {listing.incoterm} {listing.port}
                </p>
              </div>
              <CardBody>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">
                      {isSupply ? "Tersedia" : "Dibutuhkan"}
                    </dt>
                    <dd className="text-right font-semibold text-navy-900">
                      {formatQuantity(listing.quantity, listing.unit)}
                    </dd>
                  </div>
                  {listing.minOrder !== null && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500">Minimum order</dt>
                      <dd className="text-right font-semibold text-navy-900">
                        {formatQuantity(listing.minOrder, listing.unit)}
                      </dd>
                    </div>
                  )}
                  {listing.price !== null && (
                    <div className="flex justify-between gap-3 border-t border-slate-200 pt-3">
                      <dt className="text-slate-500">Estimasi nilai total</dt>
                      <dd className="text-right font-semibold text-navy-900">
                        {formatMoney(
                          listing.price * listing.quantity,
                          listing.currency,
                          { maximumFractionDigits: 0 },
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardBody>
            </Card>

            {/* Profil perusahaan */}
            <Card>
              <CardHeader>
                <CardTitle as="h2">
                  {isSupply ? "Eksportir" : "Importir"}
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="flex items-center gap-2 font-semibold text-navy-900">
                  {listing.party.companyName}
                  {listing.party.verified && <VerifiedMark />}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {listing.party.city}, {listing.party.country}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Bergabung</dt>
                    <dd className="font-semibold text-navy-900">
                      {listing.party.memberSince}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Transaksi selesai</dt>
                    <dd className="font-semibold text-navy-900">
                      {formatNumber(listing.party.completedDeals)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Rating</dt>
                    <dd className="font-semibold text-navy-900">
                      {listing.party.completedDeals > 0
                        ? `★ ${listing.party.rating.toFixed(1)} / 5`
                        : "Belum ada"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Status</dt>
                    <dd
                      className={`font-semibold ${
                        listing.party.verified
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {listing.party.verified ? "Terverifikasi" : "Belum diverifikasi"}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>

            {/* Langkah lanjut */}
            <Card>
              <CardHeader>
                <CardTitle as="h2">Tertarik dengan postingan ini?</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-sm leading-relaxed text-slate-600">
                  Fitur perpesanan langsung antar pengguna belum tersedia di
                  prototipe ini. Sementara itu, Anda bisa memakai dua hal
                  berikut untuk mempersiapkan diri.
                </p>

                <div className="space-y-2.5">
                  <ButtonLink
                    href={`/asisten?q=${encodeURIComponent(assistantPrompt)}`}
                    className="w-full"
                  >
                    Tanya asisten soal postingan ini
                  </ButtonLink>
                  <ButtonLink
                    href={isSupply ? "/kalkulator?mode=impor" : "/kalkulator?mode=ekspor"}
                    variant="outline"
                    className="w-full"
                  >
                    {isSupply
                      ? "Hitung biaya impornya"
                      : "Susun harga penawaran Anda"}
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          </aside>
        </div>

        {/* ---------- Postingan terkait ---------- */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold tracking-tight text-navy-900">
              Postingan terkait
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Komoditas atau kategori yang mirip. Penawaran dan permintaan yang
              berpasangan ditampilkan lebih dulu.
            </p>
            <ul className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <li key={item.id} className="flex">
                  <ListingCard listing={item} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

function SpecRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-sm text-navy-900 sm:col-span-2">{value}</dd>
    </div>
  );
}
