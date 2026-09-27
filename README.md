# TradeLink

Prototipe platform marketplace **ekspor impor** untuk mempertemukan eksportir dan importir, dilengkapi pemantauan harga komoditas, kalkulator biaya, materi edukasi regulasi, dan asisten AI.

Dibangun dengan Next.js 16 (App Router), TypeScript, dan Tailwind CSS v4 dengan tema biru.

---

## Fitur

| Fitur | Halaman | Status |
| --- | --- | --- |
| **Marketplace dua arah** — eksportir memasang penawaran produk, importir memasang permintaan pembelian (seperti papan lowongan) | `/marketplace`, `/marketplace/[id]` | Berfungsi, data di memori |
| **Buat postingan** — satu form untuk dua jenis postingan, dengan validasi di client dan server | `/posting` | Berfungsi, data di memori |
| **Pencarian kode HS otomatis** — ketik nama barang, dapat saran pos tarif; kategori terisi sendiri | `/posting`, `/api/hs-codes` | Berfungsi, katalog 137 pos |
| **Persyaratan dokumen quality check** — pilih dokumen mutu per pengiriman, tandai wajib/opsional, beri ambang batas | `/posting`, `/marketplace/[id]` | Berfungsi, katalog 33 dokumen |
| **Harga komoditas** — 24 komoditas, perubahan harian, rentang 52 pekan, sparkline, pembaruan otomatis tiap 15 detik | `/harga` | Berfungsi, **angka simulasi** |
| **Kalkulator ekspor impor** — landed cost impor (bea masuk, PPN, PPh 22, biaya lokal) dan penyusunan harga jual ekspor (FOB/CFR/CIF, titik impas) | `/kalkulator` | Berfungsi penuh |
| **Edukasi & regulasi** — 8 panduan, daftar dokumen wajib, 22 tautan situs resmi, 20 istilah | `/edukasi` | Berfungsi penuh |
| **Asisten AI** — chat streaming dengan konteks perdagangan Indonesia | `/asisten` | Butuh `GEMINI_API_KEY` |
| **Bubble asisten melayang** — bulatan yang bisa digeser di semua halaman, klik untuk membuka panel chat | seluruh halaman kecuali `/asisten` | Butuh `GEMINI_API_KEY` |

---

## Menjalankan

```powershell
npm run dev
```

Buka <http://localhost:3000>. Tekan `Ctrl+C` untuk menghentikan.

```powershell
npm install        # pasang dependencies
npm run build      # build produksi, sekaligus type-check
npm start          # jalankan hasil build
npm run typecheck  # hanya periksa tipe
```

> Kalau ini terminal pertama yang Anda buka setelah setup di bawah, tutup dan
> buka ulang terminalnya dulu supaya PATH yang baru terbaca.

### Setup Node di mesin ini

Node.js tidak terpasang lewat installer biasa karena MSI-nya meminta hak
administrator. Sebagai gantinya dipakai distribusi ZIP portable, lalu dua
penyesuaian di lingkup akun pengguna (tanpa administrator) supaya perintah
`npm` berfungsi normal:

| Yang dilakukan | Lokasi | Alasan |
| --- | --- | --- |
| Node 24.19.0 portable (npm 11.17.0) | `%LOCALAPPDATA%\node-portable\node-v24.19.0-win-x64` | Tidak butuh administrator |
| Folder itu ditambahkan ke PATH pengguna | Environment variable `Path` scope `User` | Supaya `node` dan `npm` dikenali di terminal mana pun |
| `npm.ps1` dan `npx.ps1` diubah namanya menjadi `*.ps1.disabled` | folder Node portable | Lihat penjelasan di bawah |

**Kenapa shim `.ps1` dinonaktifkan.** Saat Anda mengetik `npm`, PowerShell lebih
dulu memilih `npm.ps1` daripada `npm.cmd`. Dengan execution policy `Restricted`,
skrip `.ps1` ditolak sehingga `npm` gagal. Dengan `npm.ps1` dinonaktifkan,
PowerShell jatuh ke `npm.cmd` yang tidak terkena aturan itu. Fungsinya identik.

Pendekatan ini dipilih supaya **tidak perlu mengubah setelan keamanan PowerShell
Anda**. Kalau Anda lebih suka solusi yang juga berlaku untuk tool global lain
yang Anda pasang di masa depan, jalankan sendiri:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Setelah itu shim `.ps1` bisa dipulihkan bila mau (ubah nama `*.ps1.disabled`
kembali menjadi `*.ps1`), meski membiarkannya juga tidak masalah.

### Mengembalikan perubahan

```powershell
# Hapus Node portable dari PATH pengguna
$nd = "$env:LOCALAPPDATA\node-portable\node-v24.19.0-win-x64"
$p  = [Environment]::GetEnvironmentVariable("Path","User") -split ';' |
      Where-Object { $_ -and $_ -ne $nd }
[Environment]::SetEnvironmentVariable("Path", ($p -join ';'), "User")

# Hapus Node portable-nya
Remove-Item "$env:LOCALAPPDATA\node-portable" -Recurse -Force
```

### Alternatif: pasang Node.js resmi

Cara paling bersih untuk jangka panjang. Jalankan installer dari
<https://nodejs.org/en/download> dengan hak administrator. Setelah itu Node
portable, penyesuaian PATH, dan `tl.cmd` semuanya tidak diperlukan lagi.

### Launcher `tl.cmd` (opsional, cadangan)

File `tl.cmd` di root project meneruskan perintah ke npm sambil mencari Node
sendiri. Berguna kalau PATH bermasalah atau saat memindahkan project ke mesin
lain yang belum disetel.

```powershell
.\tl run dev
.\tl run build
.\tl                 # tampilkan daftar perintah
```

### Konfigurasi environment (opsional, hanya untuk asisten AI)

```powershell
Copy-Item .env.example .env.local
```

Lalu isi `GEMINI_API_KEY` di `.env.local`. API key gratis bisa diambil di
<https://aistudio.google.com/apikey>.

Semua fitur lain berjalan tanpa API key. Kalau key belum diisi, halaman
`/asisten` menampilkan petunjuk pengisiannya, bukan error mentah.

---

## Struktur project

```
src/
├── app/
│   ├── layout.tsx              Shell: Navbar, Footer, skip-link
│   ├── page.tsx                Beranda
│   ├── globals.css             Tema biru (@theme Tailwind v4) + utilities
│   ├── error.tsx               Penanganan error global
│   ├── not-found.tsx           Halaman 404
│   ├── marketplace/            Daftar & detail postingan
│   ├── posting/                Form buat postingan
│   ├── harga/                  Tabel harga komoditas
│   ├── kalkulator/             Kalkulator impor & ekspor
│   ├── edukasi/                Panduan, dokumen, regulasi, istilah
│   ├── asisten/                Chat asisten AI
│   └── api/
│       ├── listings/route.ts   GET daftar + POST buat postingan
│       ├── prices/route.ts     GET snapshot harga
│       └── chat/route.ts       POST chat, streaming dari Gemini
├── components/
│   ├── ui/                     Button, Badge, Card, Callout, EmptyState, heading
│   ├── marketplace/            Penjelajah + filter
│   ├── posting/                Form postingan
│   ├── prices/                 Tabel harga dengan polling
│   ├── calculator/             Tab, kalkulator impor, kalkulator ekspor, field
│   ├── assistant/              Panel chat
│   ├── ListingCard.tsx         Kartu postingan
│   ├── Sparkline.tsx           Grafik mini SVG, tanpa library chart
│   ├── SimpleMarkdown.tsx      Perender markdown minimalis untuk jawaban AI
│   ├── TimeAgo.tsx             Waktu relatif tanpa hydration mismatch
│   ├── Navbar.tsx, Footer.tsx, Logo.tsx
├── data/
│   ├── listings.ts             26 postingan contoh (14 penawaran, 12 permintaan)
│   ├── commodities.ts          24 definisi komoditas + tautan sumber resmi
│   └── education.ts            Panduan, tautan regulasi, kamus istilah, dokumen
└── lib/
    ├── types.ts                Tipe inti + metadata (kategori, satuan, Incoterms)
    ├── format.ts               Formatter locale id-ID, timezone dipaku Asia/Jakarta
    ├── calculator.ts           Logika hitung impor & ekspor
    ├── priceEngine.ts          Simulasi harga deterministik berbasis waktu
    ├── store.ts                Penyimpanan postingan di memori
    ├── listingFilters.ts       Filter & pengurutan (dipakai client dan server)
    ├── validateListing.ts      Validasi form (dipakai client dan server)
    └── cn.ts                   Penggabung className
```

Tidak ada dependency runtime selain `next`, `react`, dan `react-dom`. Sparkline, markdown, dan penggabung className ditulis sendiri.

---

## Keterbatasan yang perlu diketahui

Ini prototipe. Beberapa hal disederhanakan secara sadar, dan penting dipahami sebelum dikembangkan lebih jauh.

### 1. Belum ada autentikasi

Tidak ada sistem akun. Konsekuensinya:

- Identitas pemosting diisi manual di form dan tidak diverifikasi.
- **Endpoint `POST /api/listings` terbuka.** Siapa pun yang bisa menjangkau server bisa membuat postingan. Sebelum dipakai sungguhan, endpoint ini wajib dilindungi autentikasi, otorisasi, dan pembatasan laju (rate limiting).
- Belum ada perpesanan antar pengguna. Halaman detail postingan mengarahkan ke asisten AI dan kalkulator sebagai langkah lanjut.

### 2. Data postingan tersimpan di memori

`src/lib/store.ts` menyimpan data di memori proses server, jadi:

- Postingan yang Anda buat **hilang saat server di-restart**.
- Tidak cocok untuk deployment yang menjalankan beberapa instance.

Untuk beralih ke database sungguhan, cukup ganti isi fungsi di `store.ts`. Seluruh aplikasi hanya memanggil fungsi dari file itu, jadi tidak ada kode lain yang perlu diubah.

### 3. Harga komoditas masih simulasi

`src/lib/priceEngine.ts` menghasilkan harga sebagai fungsi deterministik dari waktu. Nilai awalnya memang kisaran yang wajar, tapi **bukan kutipan pasar sungguhan**. Ini ditandai jelas di antarmuka, dan setiap baris menyertakan tautan ke sumber resminya.

Untuk data nyata, ganti isi `getPriceSnapshot()` dengan pemanggilan API penyedia data (misalnya Trading Economics, Commodities-API, atau Nasdaq Data Link). Lakukan pemanggilan hanya dari `src/app/api/prices/route.ts` agar API key tidak pernah sampai ke browser.

### 3b. Katalog kode HS bukan BTKI resmi

`src/data/hsCodes.ts` berisi 137 pos yang paling sering dipakai dalam
perdagangan Indonesia, bukan Buku Tarif Kepabeanan Indonesia yang lengkap.
Dua hal yang perlu diperhatikan:

- Kodenya **6 digit**, yaitu bagian yang berlaku universal. Indonesia memakai
  **8 digit** pada BTKI, jadi kode dari katalog ini masih perlu diperpanjang
  untuk keperluan PEB atau PIB.
- Penggolongan akhir tetap wewenang Bea Cukai.

Karena itu antarmuka **tidak pernah mengisi kode secara otomatis tanpa klik
pengguna**. Yang diotomatiskan adalah pencariannya, bukan keputusannya. Salah
golong kode HS berakibat tarif dan kewajiban izin yang salah, jadi keputusan
akhir harus tetap sadar. Setiap titik masuk menyertakan tautan verifikasi ke
[INSW Trade Repository](https://insw.go.id/intr).

Untuk data resmi, ganti isi `searchHsCodes()` di `src/lib/hsSearch.ts` atau
langsung route `src/app/api/hs-codes/route.ts`. Komponen form tidak perlu
diubah, karena ia hanya berbicara dengan endpoint tersebut.

### 4. Kalkulator adalah alat estimasi

Rumusnya mengikuti struktur pungutan impor Indonesia (CIF → NDPBM → Bea Masuk → Nilai Impor → PPN & PPh 22 → biaya lokal), tapi:

- **Tarif default di aplikasi hanya titik awal.** Tarif berbeda per kode HS dan per negara asal, serta berubah dari waktu ke waktu. Verifikasi di [Indonesia National Trade Repository](https://insw.go.id/intr).
- Nilai pabean bisa ditetapkan berbeda oleh Bea Cukai.
- Masih ada kemungkinan biaya lain seperti demurrage, karantina, atau pemeriksaan fisik jalur merah.

Hasilnya bukan nasihat kepabeanan atau perpajakan.

### 5. Asisten AI punya batasan yang disengaja

System prompt di `src/app/api/chat/route.ts` secara eksplisit melarang model menyebut angka tarif atau kode HS sebagai kepastian, dan mengarahkan pengguna memverifikasi ke sumber resmi. Ini pilihan sadar: model bahasa mudah mengarang angka regulasi yang terdengar meyakinkan.

`GEMINI_API_KEY` hanya dibaca di sisi server dan tidak pernah dikirim ke browser. **Jangan pernah memberi prefix `NEXT_PUBLIC_` pada variabel ini.**

---

## Catatan teknis

**Kenapa Gemini dipanggil lewat REST, bukan SDK.** Route `api/chat` memanggil `generativelanguage.googleapis.com` langsung dengan `fetch`. Ini menghindari ketergantungan pada versi SDK yang berubah cepat dan tidak menambah dependency. Model default `gemini-3.8-flash` bisa diganti lewat `GEMINI_MODEL`.

Perlu diingat model Gemini 3 ke atas **tidak menerima** `temperature`, `topP`, `topK`, atau `candidateCount`. Pengendalian penalaran memakai `thinkingConfig.thinkingLevel` (`low`, `medium`, `high`).

**Kenapa harga disimulasikan sebagai fungsi waktu, bukan state.** Pendekatan ini membuat hasilnya sama untuk semua request pada slot waktu yang sama, tahan restart server, dan tidak menimbulkan perbedaan antara render di server dan di browser.

**Pencegahan hydration mismatch.** Semua formatter di `src/lib/format.ts` memaku locale ke `id-ID` dan timezone ke `Asia/Jakarta`. Waktu relatif ("3 hari lalu") ditangani komponen `TimeAgo` yang merender tanggal absolut lebih dulu, lalu menukarnya setelah komponen ter-mount di browser.

**Keamanan perender markdown.** `SimpleMarkdown` membangun elemen React dan tidak pernah memakai `dangerouslySetInnerHTML`, sehingga keluaran model AI selalu ditampilkan sebagai teks, bukan dieksekusi sebagai HTML.

**Bubble asisten melayang.** `src/components/assistant/FloatingChat.tsx` dipasang
sekali di `layout.tsx` dan menyembunyikan dirinya di `/asisten`. Beberapa
keputusan di dalamnya:

- Geser memakai **Pointer Events** dengan `setPointerCapture`, jadi satu jalur
  kode menangani tetikus, sentuh, dan pena sekaligus. `touchAction: "none"`
  mencegah halaman ikut tergulir saat digeser di ponsel.
- Klik dibedakan dari geser lewat ambang jarak. Jaraknya diukur **dari titik
  tekan awal**, bukan antar-frame; kalau diukur antar-frame, geseran lambat
  tidak akan pernah melewati ambang dan salah dianggap klik.
- Setelah dilepas, bubble menempel ke sisi terdekat agar tidak menghalangi
  tengah layar. Posisinya disimpan di `localStorage`.
- Bubble baru dirender setelah mount, karena posisi awalnya bergantung pada
  ukuran jendela dan `localStorage` yang tidak ada di server. Ini menghindari
  hydration mismatch sekaligus kedipan posisi.
- Logika percakapan berada di hook `useAssistantChat`, dipakai bersama dengan
  halaman penuh, jadi streaming dan pembatalan tidak diduplikasi.

**Aksesibilitas.** Skip-link ke konten utama, fokus keyboard yang selalu terlihat, label pada seluruh input form, `aria-live` pada hasil pencarian dan percakapan, tabel dengan `caption` dan `scope`, serta penghormatan terhadap `prefers-reduced-motion`. Bubble asisten adalah `<button>` sungguhan: bisa difokuskan dengan Tab, dibuka dengan Enter, dipindahkan dengan tombol panah, dan panelnya ditutup dengan Escape.

---

## Langkah pengembangan berikutnya

Urutan yang masuk akal, dari yang paling mendasar:

1. **Autentikasi & peran** (eksportir / importir / admin) — prasyarat untuk hampir semua hal di bawah.
2. **Database** menggantikan `store.ts`, plus proteksi endpoint `POST`.
3. **Perpesanan** antar pengguna, dan alur pengajuan penawaran terhadap sebuah permintaan.
4. **Verifikasi perusahaan** dengan unggah dokumen NIB dan izin, diperiksa admin.
5. **Data harga sungguhan** dari penyedia berlangganan.
6. **Unggah gambar produk** dan galeri.
7. **Notifikasi email** untuk permintaan baru yang cocok dengan komoditas eksportir.
8. **Pencarian yang lebih baik**, termasuk pencocokan otomatis penawaran dengan permintaan.

---

## Penafian

Aplikasi ini disediakan untuk keperluan pengembangan dan pembelajaran. Data perusahaan, postingan, dan harga adalah contoh simulasi. Hasil kalkulator bersifat estimasi dan bukan nasihat resmi kepabeanan atau perpajakan. Selalu verifikasi tarif dan ketentuan terkini melalui [INSW](https://insw.go.id), [Bea Cukai](https://www.beacukai.go.id), atau konsultan kepabeanan berlisensi (PPJK).
