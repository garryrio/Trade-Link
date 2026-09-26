import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-6xl font-bold text-brand-200">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-navy-900">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
        Tautannya mungkin salah, atau postingan yang Anda cari sudah dihapus.
        Perlu diketahui bahwa data prototipe ini disimpan di memori server,
        sehingga postingan yang Anda buat akan hilang setelah server di-restart.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/marketplace">Buka Marketplace</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Ke Beranda
        </ButtonLink>
      </div>
    </div>
  );
}
