import Link from "next/link";
import { Logo } from "@/components/Logo";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/marketplace", label: "Marketplace" },
      { href: "/posting", label: "Buat Postingan" },
      { href: "/harga", label: "Harga Komoditas" },
      { href: "/kalkulator", label: "Kalkulator Biaya" },
    ],
  },
  {
    title: "Sumber Daya",
    links: [
      { href: "/edukasi", label: "Panduan Ekspor Impor" },
      { href: "/edukasi#regulasi", label: "Link Regulasi" },
      { href: "/edukasi#istilah", label: "Kamus Istilah" },
      { href: "/asisten", label: "Asisten AI" },
    ],
  },
] as const;

const EXTERNAL_LINKS = [
  { href: "https://insw.go.id", label: "INSW" },
  { href: "https://www.beacukai.go.id", label: "Bea Cukai" },
  { href: "https://www.kemendag.go.id", label: "Kemendag" },
  { href: "https://oss.go.id", label: "OSS / NIB" },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy-800 bg-navy-950 text-slate-300">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Menghubungkan eksportir dan importir Indonesia dengan pasar
              global. Satu tempat untuk mencari mitra, menghitung biaya, dan
              memahami regulasi.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-brand-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Situs Resmi
            </h2>
            <ul className="mt-4 space-y-2.5">
              {EXTERNAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-brand-300"
                  >
                    {link.label}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                    <span className="sr-only">(buka di tab baru)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-800 pt-6">
          <p className="text-xs leading-relaxed text-slate-500">
            <strong className="text-slate-400">Catatan penting:</strong> Ini
            adalah prototipe. Data perusahaan, postingan, dan harga komoditas
            yang ditampilkan masih berupa data contoh (simulasi), bukan data
            pasar sungguhan. Hasil kalkulator bersifat estimasi dan bukan
            nasihat resmi kepabeanan atau perpajakan. Selalu verifikasi tarif
            dan ketentuan terkini melalui INSW, Bea Cukai, atau konsultan
            kepabeanan berlisensi (PPJK).
          </p>
          <p className="mt-4 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} TradeLink. Dibuat untuk
            mempermudah perdagangan lintas negara.
          </p>
        </div>
      </div>
    </footer>
  );
}
