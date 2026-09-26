import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { Sparkline } from "@/components/Sparkline";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GUIDES, GUIDE_LEVEL_LABEL } from "@/data/education";
import { formatNumber, formatPercent } from "@/lib/format";
import { getPriceSnapshot, summarizePrices } from "@/lib/priceEngine";
import { getAllListings, getListingStats } from "@/lib/store";

// Selalu render ulang di server supaya statistik & harga selalu terbaru.
export const dynamic = "force-dynamic";

const FEATURES = [
  {
    href: "/marketplace",
    title: "Marketplace Dua Arah",
    description:
      "Eksportir memasang penawaran produk, importir memasang permintaan pembelian. Keduanya bisa saling menelusuri dan memilih mitra yang paling cocok.",
    icon: (
      <>
        <path d="M3 9h18M3 9l2-4.5h14L21 9M5 9v10.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V9" />
        <path d="M9.5 13h5" />
      </>
    ),
  },
  {
    href: "/harga",
    title: "Harga Komoditas",
    description:
      "Pantau pergerakan harga komoditas ekspor utama Indonesia dalam satu tabel, lengkap dengan perubahan harian dan rentang 52 pekan.",
    icon: (
      <>
        <path d="M4 19h16" />
        <path d="m4 15 4.5-5 3.5 3 3-4.5 5 3" />
      </>
    ),
  },
  {
    href: "/kalkulator",
    title: "Kalkulator Biaya",
    description:
      "Hitung bea masuk, PPN, PPh 22, dan biaya lokal untuk impor. Atau susun harga jual FOB, CFR, dan CIF untuk ekspor lengkap dengan titik impas.",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8.5 7h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5v3.5M8.5 18h3.5" />
      </>
    ),
  },
  {
    href: "/edukasi",
    title: "Edukasi & Regulasi",
    description:
      "Panduan langkah demi langkah untuk eksportir pemula, kamus istilah, daftar dokumen wajib, dan tautan langsung ke situs regulasi resmi.",
    icon: (
      <>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5h-5A1.5 1.5 0 0 1 4 17V5.5z" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 0 20 17V5.5z" />
      </>
    ),
  },
  {
    href: "/asisten",
    title: "Asisten AI",
    description:
      "Tanya apa saja soal ekspor impor: kode HS, dokumen, Incoterms, cara hitung bea masuk. Dijawab kontekstual oleh model Gemini.",
    icon: (
      <>
        <path d="M12 3.5 13.6 8l4.4 1.6-4.4 1.6L12 15.6 10.4 11.2 6 9.6 10.4 8 12 3.5z" />
        <path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16z" />
      </>
    ),
  },
];

export default function HomePage() {
  const stats = getListingStats();
  const listings = getAllListings();

  // Ambil campuran: beberapa penawaran dan beberapa permintaan terbaru.
  const featuredSupply = listings.filter((l) => l.kind === "supply").slice(0, 3);
  const featuredDemand = listings.filter((l) => l.kind === "demand").slice(0, 3);

  const prices = getPriceSnapshot();
  const summary = summarizePrices(prices);
  const movers = [...prices]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 5);

  const starterGuides = GUIDES.slice(0, 3);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero-grid relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-brand-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl"
        />
        <div className="container-page relative py-16 sm:py-24">
          <div className="max-w-3xl">
            <Badge tone="brand" className="border-brand-400/40 bg-brand-500/15 text-brand-200">
              Platform ekspor impor Indonesia
            </Badge>

            <h1 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hubungkan produk Indonesia
              <span className="block text-brand-300">dengan pembeli dunia</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-100/90 sm:text-lg">
              TradeLink mempertemukan eksportir dan importir dalam satu tempat.
              Pasang penawaran atau permintaan, pantau harga komoditas, hitung
              biaya sampai rupiah terakhir, dan pahami regulasinya tanpa harus
              membuka sepuluh situs berbeda.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/marketplace" size="lg">
                Jelajahi Marketplace
              </ButtonLink>
              <ButtonLink
                href="/posting"
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/10"
              >
                Buat Postingan
              </ButtonLink>
            </div>
          </div>

          {/* Statistik */}
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-4">
            <HeroStat label="Postingan aktif" value={formatNumber(stats.total)} />
            <HeroStat
              label="Penawaran eksportir"
              value={formatNumber(stats.supply)}
            />
            <HeroStat
              label="Permintaan importir"
              value={formatNumber(stats.demand)}
            />
            <HeroStat
              label="Negara terlibat"
              value={formatNumber(stats.countries)}
            />
          </dl>
        </div>
      </section>

      {/* ============ DUA SISI PASAR ============ */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Cara kerjanya"
          title="Dua arah, satu platform"
          description="Tidak semua orang datang untuk menjual. Karena itu TradeLink memberi ruang setara bagi eksportir yang menawarkan barang dan importir yang mencari pemasok."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <RoleCard
            tone="brand"
            eyebrow="Untuk Eksportir"
            title="Pasang produk, atau ambil permintaan yang sudah ada"
            points={[
              "Pasang penawaran dengan spesifikasi, kode HS, kapasitas, dan sertifikasi Anda.",
              "Telusuri permintaan yang dipasang importir, lalu pilih sendiri mana yang cocok dengan kapasitas produksi Anda.",
              "Susun harga jual FOB, CFR, atau CIF memakai kalkulator agar margin tidak terkikis biaya tersembunyi.",
            ]}
            primary={{ href: "/posting?kind=supply", label: "Pasang Penawaran" }}
            secondary={{
              href: "/marketplace?kind=demand",
              label: "Lihat Permintaan Importir",
            }}
          />
          <RoleCard
            tone="amber"
            eyebrow="Untuk Importir"
            title="Pasang permintaan, biarkan pemasok datang"
            points={[
              "Pasang permintaan seperti membuka lowongan: sebutkan spesifikasi, volume, dan tenggat penawaran.",
              "Telusuri penawaran eksportir yang sudah tersedia beserta sertifikasi dan kapasitasnya.",
              "Hitung landed cost lengkap dengan bea masuk, PPN, dan PPh 22 sebelum menyetujui harga.",
            ]}
            primary={{ href: "/posting?kind=demand", label: "Pasang Permintaan" }}
            secondary={{
              href: "/marketplace?kind=supply",
              label: "Lihat Penawaran Eksportir",
            }}
          />
        </div>
      </section>

      {/* ============ FITUR ============ */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Fitur"
            title="Yang bisa Anda lakukan di sini"
          />

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.href}>
                <Link
                  href={feature.href}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {feature.icon}
                    </svg>
                  </span>
                  <h3 className="mt-4 font-semibold text-navy-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    Buka
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ POSTINGAN TERBARU ============ */}
      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Penawaran Eksportir"
          title="Produk yang siap dikirim"
          description="Penawaran terbaru dari eksportir Indonesia."
          action={
            <ButtonLink href="/marketplace?kind=supply" variant="secondary">
              Lihat semua penawaran
            </ButtonLink>
          }
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredSupply.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        <SectionHeading
          className="mt-16"
          eyebrow="Permintaan Importir"
          title="Pembeli yang sedang mencari pemasok"
          description="Seperti papan lowongan: baca persyaratannya, lalu ajukan penawaran bila Anda bisa memenuhinya."
          action={
            <ButtonLink href="/marketplace?kind=demand" variant="secondary">
              Lihat semua permintaan
            </ButtonLink>
          }
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredDemand.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* ============ HARGA KOMODITAS ============ */}
      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Harga Komoditas"
            title="Pergerakan terbesar hari ini"
            description={
              <>
                {summary.gainers} komoditas naik, {summary.losers} turun dari{" "}
                {summary.total} yang dipantau.{" "}
                <strong className="text-navy-800">
                  Angka ini masih simulasi
                </strong>{" "}
                dan setiap baris menyertakan tautan ke sumber resminya.
              </>
            }
            action={
              <ButtonLink href="/harga" variant="secondary">
                Buka tabel lengkap
              </ButtonLink>
            }
          />

          <Card className="mt-8 overflow-hidden">
            <ul className="divide-y divide-slate-200">
              {movers.map((item) => {
                const up = item.changePercent >= 0;
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-navy-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.market}
                      </p>
                    </div>

                    <Sparkline
                      data={item.history}
                      positive={up}
                      className="hidden sm:block"
                    />

                    <div className="w-32 shrink-0 text-right">
                      <p className="font-semibold text-navy-900">
                        {formatNumber(item.price, item.price < 10 ? 3 : 2)}
                      </p>
                      <p className="text-xs text-slate-500">{item.priceUnit}</p>
                    </div>

                    <p
                      className={`w-20 shrink-0 text-right text-sm font-semibold ${
                        up ? "text-[var(--color-up)]" : "text-[var(--color-down)]"
                      }`}
                    >
                      {formatPercent(item.changePercent)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </section>

      {/* ============ ASISTEN AI ============ */}
      <section className="container-page py-16 sm:py-20">
        <div className="hero-grid overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-800 to-navy-900 px-6 py-12 sm:px-12 sm:py-16">
          <div className="max-w-2xl">
            <Badge className="border-white/25 bg-white/10 text-white">
              Didukung Gemini
            </Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Bingung soal kode HS atau dokumen ekspor? Tanya saja.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-brand-100/90 sm:text-base">
              Asisten TradeLink sudah dibekali konteks perdagangan Indonesia. Ia
              bisa menjelaskan perbedaan FOB dan CIF, memandu Anda mencari kode
              HS, merinci dokumen yang dibutuhkan komoditas Anda, atau
              menguraikan cara menghitung bea masuk, dalam bahasa yang mudah
              dipahami.
            </p>
            <div className="mt-8">
              <ButtonLink
                href="/asisten"
                size="lg"
                className="bg-white text-brand-800 hover:bg-brand-50"
              >
                Mulai bertanya
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EDUKASI ============ */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Edukasi"
            title="Mulai dari yang paling dasar"
            description="Belum pernah ekspor sama sekali? Tiga panduan ini cukup untuk memahami gambaran besarnya."
            action={
              <ButtonLink href="/edukasi" variant="secondary">
                Semua panduan & regulasi
              </ButtonLink>
            }
          />

          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {starterGuides.map((guide) => (
              <li key={guide.id}>
                <Link
                  href={`/edukasi#${guide.id}`}
                  className="flex h-full flex-col rounded-xl border border-slate-200 p-6 transition-all hover:border-brand-300 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{GUIDE_LEVEL_LABEL[guide.level]}</Badge>
                    <span className="text-xs text-slate-500">
                      {guide.readingMinutes} menit baca
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-navy-900">
                    {guide.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {guide.summary}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-brand-700">
                    Baca panduan
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

/* ---------------- Komponen bantu khusus halaman ini ---------------- */

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="text-3xl font-bold text-white sm:text-4xl">{value}</dd>
      <dt className="mt-1 text-xs tracking-wide text-brand-200/80 uppercase">
        {label}
      </dt>
    </div>
  );
}

function RoleCard({
  tone,
  eyebrow,
  title,
  points,
  primary,
  secondary,
}: {
  tone: "brand" | "amber";
  eyebrow: string;
  title: string;
  points: string[];
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  const accent =
    tone === "brand"
      ? { bar: "bg-brand-500", chip: "bg-brand-50 text-brand-700", check: "text-brand-600" }
      : { bar: "bg-amber-400", chip: "bg-amber-50 text-amber-700", check: "text-amber-600" };

  return (
    <Card className="relative overflow-hidden">
      <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} />
      <CardBody className="p-7">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${accent.chip}`}
        >
          {eyebrow}
        </span>
        <h3 className="mt-4 text-xl font-bold text-navy-900">{title}</h3>

        <ul className="mt-5 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <svg
                viewBox="0 0 24 24"
                className={`mt-0.5 h-4 w-4 shrink-0 ${accent.check}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 13 4 4L19 7" />
              </svg>
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
          <ButtonLink href={secondary.href} variant="outline">
            {secondary.label}
          </ButtonLink>
        </div>
      </CardBody>
    </Card>
  );
}
