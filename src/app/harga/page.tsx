import type { Metadata } from "next";
import { PriceTable } from "@/components/prices/PriceTable";
import { Callout } from "@/components/ui/Callout";
import { PageHeader } from "@/components/ui/SectionHeading";
import { getPriceSnapshot, summarizePrices } from "@/lib/priceEngine";

export const metadata: Metadata = {
  title: "Harga Komoditas",
  description:
    "Pantau pergerakan harga komoditas ekspor utama Indonesia: CPO, karet, kopi, kakao, nikel, timah, udang, rumput laut, dan rempah.",
};

export const dynamic = "force-dynamic";

export default function PricesPage() {
  const prices = getPriceSnapshot();
  const summary = summarizePrices(prices);

  return (
    <>
      <PageHeader
        eyebrow="Harga Komoditas"
        title="Pergerakan harga komoditas"
        description="Pantau komoditas ekspor utama Indonesia beserta perubahan harian dan posisinya dalam rentang 52 pekan. Tabel diperbarui otomatis setiap 15 detik."
      />

      <div className="container-page py-10">
        <Callout
          tone="warning"
          title="Angka di halaman ini masih simulasi"
          className="mb-6"
        >
          Harga yang tampil dihasilkan oleh mesin simulasi internal supaya
          tampilan dan alur datanya bisa diuji, <strong>bukan</strong> kutipan
          pasar sungguhan. Untuk angka resmi, gunakan tautan sumber di kolom
          paling kanan setiap baris. Ketika nanti disambungkan ke penyedia data
          harga berlangganan, hanya satu fungsi di sisi server yang perlu
          diganti.
        </Callout>

        <PriceTable initialPrices={prices} initialSummary={summary} />

        {/* Catatan tambahan */}
        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <h2 className="font-semibold text-navy-900">
              Cara membaca tabel ini
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-navy-800">Perubahan</dt>
                <dd className="mt-0.5 text-slate-600">
                  Dihitung terhadap harga pada awal hari, bukan terhadap
                  pembaruan sebelumnya. Jadi angkanya menggambarkan pergerakan
                  sepanjang hari.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-navy-800">Rentang 52 pekan</dt>
                <dd className="mt-0.5 text-slate-600">
                  Titik biru menunjukkan posisi harga sekarang di antara
                  terendah dan tertinggi setahun. Posisi mendekati ujung kanan
                  berarti harga sedang relatif tinggi.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-navy-800">Satuan harga</dt>
                <dd className="mt-0.5 text-slate-600">
                  Perhatikan satuannya karena berbeda antar komoditas. Ada yang
                  per MT, per kg, per pon, dan per bushel. Jangan
                  membandingkan angka mentah antar baris.
                </dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-navy-900">
              Untuk perhitungan biaya, pakai kurs yang tepat
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Saat menghitung bea masuk dan pajak impor, kurs yang dipakai
              bukan kurs bank atau kurs pasar, melainkan Nilai Dasar
              Penghitungan Bea Masuk (NDPBM) yang ditetapkan pemerintah secara
              berkala. Memakai kurs yang salah bisa membuat estimasi biaya Anda
              melenceng cukup jauh.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="https://fiskal.kemenkeu.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 hover:underline"
                >
                  Kurs Pajak / NDPBM - Badan Kebijakan Fiskal
                </a>
              </li>
              <li>
                <a
                  href="https://www.bi.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-700 hover:underline"
                >
                  Kurs referensi harian - Bank Indonesia
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
