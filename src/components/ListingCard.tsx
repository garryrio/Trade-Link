import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { TimeAgo } from "@/components/TimeAgo";
import { cn } from "@/lib/cn";
import { formatMoney, formatQuantity, daysUntil } from "@/lib/format";
import {
  CATEGORY_META,
  CONTAINER_META,
  LISTING_KIND_META,
  SHIPPING_MODE_META,
  STATUS_META,
  UNIT_SUFFIX,
  type Listing,
} from "@/lib/types";

/* ============================================================
   Kartu postingan untuk daftar di marketplace & beranda.
   Komponen ini murni presentasi, jadi bisa dipakai baik dari
   Server Component maupun dari Client Component.
   ============================================================ */

export function ListingCard({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  const isSupply = listing.kind === "supply";
  const kindMeta = LISTING_KIND_META[listing.kind];
  const category = CATEGORY_META[listing.category];

  const remainingDays = listing.deadline ? daysUntil(listing.deadline) : null;
  const mandatoryDocCount = listing.qualityDocuments.filter(
    (doc) => doc.mandatory,
  ).length;

  return (
    <article
      className={cn(
        "card group flex flex-col transition-shadow hover:shadow-[var(--shadow-card-hover)]",
        // Garis aksen di sisi kiri membedakan penawaran dari permintaan.
        "relative overflow-hidden",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          isSupply ? "bg-brand-500" : "bg-amber-400",
        )}
      />

      <div className="flex flex-1 flex-col p-5 pl-6">
        {/* Baris label */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge tone={isSupply ? "brand" : "amber"} dot>
            {kindMeta.shortLabel}
          </Badge>
          <Badge tone="slate">
            <span aria-hidden="true">{category.icon}</span>
            {category.label}
          </Badge>
          {listing.status !== "open" && (
            <Badge tone={listing.status === "closed" ? "red" : "violet"}>
              {STATUS_META[listing.status].label}
            </Badge>
          )}
          {listing.featured && <Badge tone="green">Unggulan</Badge>}
        </div>

        {/* Judul */}
        <h3 className="text-base leading-snug font-semibold text-navy-900">
          <Link
            href={`/marketplace/${listing.id}`}
            className="transition-colors hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {listing.title}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs text-slate-500">
          {listing.commodity}
          <span aria-hidden="true"> · </span>
          <span className="font-mono">HS {listing.hsCode}</span>
        </p>

        {/* Fakta kunci */}
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">
              {isSupply ? "Tersedia" : "Dibutuhkan"}
            </dt>
            <dd className="font-semibold text-navy-900">
              {formatQuantity(listing.quantity, listing.unit)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">
              {isSupply ? "Harga" : "Perkiraan budget"}
            </dt>
            <dd className="font-semibold text-navy-900">
              {listing.price === null ? (
                <span className="text-slate-500">Terbuka negosiasi</span>
              ) : (
                <>
                  {formatMoney(listing.price, listing.currency)}
                  <span className="text-xs font-normal text-slate-500">
                    {" "}
                    / {UNIT_SUFFIX[listing.unit]}
                  </span>
                </>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Incoterm &amp; metode</dt>
            <dd className="font-semibold text-navy-900">
              {listing.incoterm}
              <span className="font-normal text-slate-500">
                {" / "}
                {SHIPPING_MODE_META[listing.shippingMode].label}
                {listing.containerType &&
                  ` ${CONTAINER_META[listing.containerType].label}`}
              </span>
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">
              {isSupply ? "Pelabuhan muat" : "Pelabuhan tujuan"}
            </dt>
            <dd className="truncate font-semibold text-navy-900" title={listing.port}>
              {listing.port}
            </dd>
          </div>
        </dl>

        {/* Sertifikasi */}
        {listing.certifications.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {listing.certifications.slice(0, 3).map((cert) => (
              <li
                key={cert}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
              >
                {cert}
              </li>
            ))}
            {listing.certifications.length > 3 && (
              <li className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500">
                +{listing.certifications.length - 3} lagi
              </li>
            )}
          </ul>
        )}

        {/* Jumlah dokumen mutu yang wajib */}
        {mandatoryDocCount > 0 && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-600">
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-brand-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 3.5h5.5L19 9v11.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" />
              <path d="M13.5 3.5V9H19" />
              <path d="m9.8 14.2 1.6 1.6 3.2-3.4" />
            </svg>
            {mandatoryDocCount} dokumen mutu{" "}
            {isSupply ? "disediakan" : "dipersyaratkan"}
          </p>
        )}

        {/* Tenggat untuk permintaan */}
        {remainingDays !== null && (
          <p
            className={cn(
              "mt-4 inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1 text-xs font-medium",
              remainingDays <= 7
                ? "bg-red-50 text-red-700"
                : remainingDays <= 21
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V12l3 2" />
            </svg>
            {remainingDays > 0
              ? `Tenggat ${remainingDays} hari lagi`
              : "Tenggat sudah lewat"}
          </p>
        )}
      </div>

      {/* Footer: identitas pemosting */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3 pl-6">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-medium text-navy-900">
            <span className="truncate">{listing.party.companyName}</span>
            {listing.party.verified && <VerifiedMark />}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {listing.party.city}
            <span aria-hidden="true"> · </span>
            {listing.party.country}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {listing.party.completedDeals > 0 ? (
            <p className="text-xs font-medium text-navy-800">
              <span aria-hidden="true">★</span> {listing.party.rating.toFixed(1)}
              <span className="font-normal text-slate-500">
                {" "}
                ({listing.party.completedDeals})
              </span>
            </p>
          ) : (
            <p className="text-xs text-slate-500">Anggota baru</p>
          )}
          <TimeAgo iso={listing.createdAt} className="text-xs text-slate-500" />
        </div>
      </div>
    </article>
  );
}

/** Tanda centang kecil untuk perusahaan yang sudah terverifikasi. */
export function VerifiedMark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 text-brand-600", className)}
      title="Perusahaan terverifikasi"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d="M12 2l2.4 1.8 3-.3 1 2.8 2.6 1.5-.9 2.9.9 2.9-2.6 1.5-1 2.8-3-.3L12 22l-2.4-1.8-3 .3-1-2.8L3 16.2l.9-2.9L3 10.4l2.6-1.5 1-2.8 3 .3L12 2z" />
        <path
          d="m8.6 12.3 2.1 2.1 4.6-4.7"
          fill="none"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">Terverifikasi</span>
    </span>
  );
}
