import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingChat } from "@/components/assistant/FloatingChat";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TradeLink - Marketplace Ekspor Impor Indonesia",
    template: "%s | TradeLink",
  },
  description:
    "TradeLink menghubungkan eksportir dan importir: pasang penawaran produk atau permintaan pembelian, pantau harga komoditas, hitung biaya ekspor impor, dan pelajari regulasi perdagangan.",
  keywords: [
    "ekspor",
    "impor",
    "marketplace ekspor impor",
    "eksportir Indonesia",
    "importir",
    "harga komoditas",
    "kalkulator bea masuk",
    "HS code",
  ],
  applicationName: "TradeLink",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  /**
   * viewportFit "cover" membuat halaman mengisi seluruh layar termasuk area
   * di sekitar lekukan kamera. Ini SYARAT agar env(safe-area-inset-*) di CSS
   * bernilai selain nol; tanpa ini, penyesuaian area aman tidak berpengaruh.
   *
   * Konsekuensinya konten bisa tertutup indikator home, jadi elemen yang
   * menempel di tepi bawah wajib memakai padding area aman. Lihat utilitas
   * .pb-safe di globals.css dan penyesuaian di FloatingChat.
   */
  viewportFit: "cover",
  /**
   * maximumScale sengaja TIDAK dibatasi. Mengunci zoom memang menghilangkan
   * beberapa gangguan tata letak, tapi merampas kemampuan memperbesar teks
   * bagi pengguna dengan penglihatan terbatas.
   */
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning dipasang HANYA di <html>.
    //
    // Alasannya: elemen <html> adalah sasaran paling umum bagi hal-hal di luar
    // kendali React. Ekstensi penerjemah (mis. Google Translate) menulis ulang
    // atribut lang sebelum React selesai hydrate, sehingga memicu peringatan
    // mismatch padahal tidak ada yang salah pada kode kita.
    //
    // Cakupannya sempit: hanya atribut dan teks pada elemen ini sendiri.
    // Ketidaksesuaian di dalam <body> TETAP dilaporkan seperti biasa, jadi ini
    // tidak menyembunyikan bug hydration yang sesungguhnya.
    <html lang="id" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Lewati ke konten utama
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Bubble asisten melayang di atas seluruh halaman.
            Menyembunyikan dirinya sendiri di /asisten. */}
        <FloatingChat />
      </body>
    </html>
  );
}
