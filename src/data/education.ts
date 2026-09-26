/* ============================================================
   Konten halaman Edukasi.

   Seluruh URL di file ini sudah dicek dapat diakses. Kalau ada yang
   berubah di kemudian hari, cukup perbarui di satu tempat ini.

   Angka tarif yang disebut dalam panduan hanyalah CONTOH untuk
   menjelaskan cara hitung. Tarif yang berlaku harus selalu dicek di
   INSW / Bea Cukai karena bisa berubah kapan saja.
   ============================================================ */

export type GuideLevel = "pemula" | "menengah" | "lanjutan";
export type Audience = "eksportir" | "importir" | "keduanya";

export interface GuideStep {
  title: string;
  detail: string;
}

export interface Guide {
  id: string;
  title: string;
  summary: string;
  level: GuideLevel;
  audience: Audience;
  readingMinutes: number;
  steps: GuideStep[];
}

export const GUIDE_LEVEL_LABEL: Record<GuideLevel, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  lanjutan: "Lanjutan",
};

export const AUDIENCE_LABEL: Record<Audience, string> = {
  eksportir: "Untuk Eksportir",
  importir: "Untuk Importir",
  keduanya: "Eksportir & Importir",
};

export const GUIDES: Guide[] = [
  {
    id: "mulai-ekspor",
    title: "Langkah Pertama Menjadi Eksportir",
    summary:
      "Urutan lengkap dari mengurus legalitas sampai uang masuk ke rekening, khusus untuk yang belum pernah ekspor sama sekali.",
    level: "pemula",
    audience: "eksportir",
    readingMinutes: 9,
    steps: [
      {
        title: "1. Siapkan legalitas usaha",
        detail:
          "Daftarkan usaha lewat sistem OSS untuk mendapatkan Nomor Induk Berusaha (NIB). NIB sekaligus berlaku sebagai Angka Pengenal Impor bila nanti Anda juga mengimpor. Pastikan KBLI yang dipilih mencakup kegiatan perdagangan ekspor. Siapkan juga NPWP badan usaha dan rekening bank yang bisa menerima transfer valuta asing.",
      },
      {
        title: "2. Pastikan komoditas Anda boleh diekspor",
        detail:
          "Cek status barang Anda: bebas ekspor, dibatasi, atau dilarang. Beberapa komoditas butuh Persetujuan Ekspor, kuota, atau laporan surveyor. Cari kode HS barang Anda lalu periksa ketentuannya di Indonesia National Trade Repository. Komoditas tertentu seperti CPO dan mineral juga dikenai Bea Keluar.",
      },
      {
        title: "3. Riset pasar dan tentukan negara tujuan",
        detail:
          "Gunakan ITC Trade Map untuk melihat negara mana yang paling banyak mengimpor produk Anda, berapa nilainya, dan siapa pesaing Anda. Perhatikan juga apakah ada perjanjian dagang (FTA) dengan negara tujuan, karena itu bisa memangkas bea masuk di sisi pembeli dan membuat harga Anda lebih bersaing.",
      },
      {
        title: "4. Hitung harga ekspor Anda",
        detail:
          "Jangan hanya menambahkan margin ke harga lokal. Hitung biaya produksi, pengemasan ekspor, transportasi ke pelabuhan, biaya dokumen, sertifikasi, dan bila perlu ongkos kapal serta asuransi. Tentukan Incoterm yang dipakai, karena FOB dan CIF menghasilkan angka yang berbeda. Kalkulator di TradeLink bisa membantu tahap ini.",
      },
      {
        title: "5. Cari pembeli",
        detail:
          "Manfaatkan marketplace B2B, pameran dagang seperti Trade Expo Indonesia, perwakilan dagang Indonesia di luar negeri (ITPC), asosiasi komoditas, dan platform seperti TradeLink. Di TradeLink, Anda bisa langsung melihat permintaan yang dipasang importir lalu memilih mana yang cocok dengan kapasitas Anda.",
      },
      {
        title: "6. Kirim sampel dan sepakati spesifikasi",
        detail:
          "Hampir semua pembeli serius akan minta sampel sebelum order. Kirim sampel dengan spesifikasi yang identik dengan yang akan diproduksi. Tuangkan hasil kesepakatan ke dalam spesifikasi tertulis: kadar air, ukuran, grading, kemasan, toleransi. Ini yang akan jadi rujukan bila terjadi sengketa mutu.",
      },
      {
        title: "7. Buat kontrak dan sepakati cara bayar",
        detail:
          "Kontrak minimal memuat: jenis dan mutu barang, kuantitas, harga dan Incoterm, jadwal pengapalan, cara pembayaran, dokumen yang harus diserahkan, klausul force majeure, dan forum penyelesaian sengketa. Untuk pembeli baru, hindari Open Account. Pilih L/C atau T/T dengan pembayaran muka.",
      },
      {
        title: "8. Urus dokumen dan pemberitahuan pabean",
        detail:
          "Siapkan Invoice, Packing List, Bill of Lading atau Airway Bill, Certificate of Origin, dan sertifikat khusus sesuai komoditas (fitosanitari, kesehatan, halal, fumigasi). Ajukan Pemberitahuan Ekspor Barang (PEB) ke Bea Cukai, umumnya melalui jasa PPJK atau freight forwarder bila Anda belum berpengalaman.",
      },
      {
        title: "9. Pengapalan dan serahkan dokumen ke bank",
        detail:
          "Setelah barang dimuat, Anda menerima Bill of Lading. Bila memakai L/C, serahkan set dokumen lengkap ke bank sebelum tanggal kedaluwarsa. Periksa berulang kali agar tidak ada ketidaksesuaian (discrepancy), karena satu huruf yang salah bisa menunda pembayaran berminggu-minggu.",
      },
      {
        title: "10. Terima pembayaran dan evaluasi",
        detail:
          "Setelah dana masuk, catat semua biaya yang benar-benar terjadi dan bandingkan dengan perhitungan awal Anda. Hampir selalu ada pos yang terlewat pada ekspor pertama. Pakai catatan ini untuk memperbaiki harga penawaran berikutnya.",
      },
    ],
  },
  {
    id: "incoterms",
    title: "Memahami Incoterms 2020",
    summary:
      "Incoterm menentukan sampai titik mana penjual bertanggung jawab atas biaya dan risiko. Salah pilih bisa membuat margin Anda habis.",
    level: "pemula",
    audience: "keduanya",
    readingMinutes: 7,
    steps: [
      {
        title: "Apa yang sebenarnya diatur Incoterms",
        detail:
          "Incoterms mengatur tiga hal: siapa menanggung biaya sampai titik mana, di titik mana risiko kerusakan berpindah dari penjual ke pembeli, dan siapa yang mengurus formalitas pabean. Incoterms TIDAK mengatur perpindahan hak milik, cara pembayaran, atau hukum yang berlaku. Itu semua harus diatur terpisah di kontrak.",
      },
      {
        title: "EXW - Ex Works",
        detail:
          "Pembeli mengambil barang di gudang penjual. Tanggung jawab penjual paling minim. Terlihat menguntungkan penjual, tapi banyak pembeli menghindarinya karena mereka kesulitan mengurus dokumen ekspor di negara penjual. Untuk eksportir pemula, FCA biasanya lebih realistis.",
      },
      {
        title: "FOB - Free On Board",
        detail:
          "Penjual menanggung biaya sampai barang berada di atas kapal di pelabuhan muat, termasuk pengurusan PEB. Risiko berpindah begitu barang di atas kapal. Ini Incoterm paling umum untuk ekspor Indonesia dan yang paling mudah dipahami kedua pihak. Hanya untuk angkutan laut, bukan udara.",
      },
      {
        title: "CFR dan CIF",
        detail:
          "CFR menambahkan ongkos kapal ke tujuan di atas FOB. CIF menambahkan ongkos kapal DAN asuransi minimum. Penting: meski penjual membayar ongkos sampai tujuan, RISIKO tetap berpindah ke pembeli sejak barang di atas kapal di pelabuhan muat. Banyak orang salah paham soal ini.",
      },
      {
        title: "FCA, CPT, CIP",
        detail:
          "Versi yang bisa dipakai untuk semua moda angkutan, termasuk udara dan darat. FCA sejajar dengan FOB, CPT sejajar dengan CFR, CIP sejajar dengan CIF namun dengan cakupan asuransi yang lebih luas. Untuk pengiriman udara, gunakan kelompok ini, bukan FOB.",
      },
      {
        title: "DAP, DPU, DDP",
        detail:
          "Penjual mengantar sampai tempat tujuan yang disepakati. Pada DDP penjual juga menanggung bea masuk dan pajak impor di negara pembeli. DDP berisiko tinggi bagi eksportir yang tidak paham sistem pabean negara tujuan. Hindari DDP sampai Anda benar-benar berpengalaman.",
      },
      {
        title: "Cara memilih untuk transaksi pertama",
        detail:
          "Sebagai eksportir pemula, mulailah dengan FOB. Anda hanya perlu mengurus sampai pelabuhan muat, dan pembeli yang mengatur pengapalan. Sebagai importir pemula, CIF atau CFR lebih nyaman karena penjual yang mengurus kapal. Setelah terbiasa, Anda bisa bernegosiasi ke Incoterm yang memberi kendali biaya lebih besar.",
      },
    ],
  },
  {
    id: "dokumen-ekspor-impor",
    title: "Dokumen Wajib Ekspor dan Impor",
    summary:
      "Daftar dokumen yang hampir selalu diminta, siapa yang menerbitkan, dan kesalahan yang paling sering terjadi.",
    level: "pemula",
    audience: "keduanya",
    readingMinutes: 6,
    steps: [
      {
        title: "Commercial Invoice",
        detail:
          "Diterbitkan penjual. Memuat uraian barang, kuantitas, harga satuan, nilai total, Incoterm, dan syarat pembayaran. Nilai pada invoice menjadi dasar penghitungan bea masuk di negara tujuan, jadi jangan pernah mengecilkan nilai (under-invoicing). Praktik itu ilegal dan berisiko besar.",
      },
      {
        title: "Packing List",
        detail:
          "Rincian isi setiap koli atau kemasan: nomor koli, isi, berat bersih, berat kotor, dimensi. Harus konsisten dengan invoice. Petugas pabean memakai dokumen ini saat pemeriksaan fisik, jadi ketidaksesuaian sekecil apa pun bisa memicu penundaan.",
      },
      {
        title: "Bill of Lading atau Airway Bill",
        detail:
          "Diterbitkan pengangkut atau agennya. Bill of Lading untuk laut, Airway Bill untuk udara. B/L asli bersifat dokumen kepemilikan: siapa yang memegangnya berhak mengambil barang. Karena itu B/L biasanya ditahan bank pada transaksi L/C sampai pembayaran beres. Airway Bill tidak bersifat demikian.",
      },
      {
        title: "Certificate of Origin (SKA)",
        detail:
          "Menyatakan negara asal barang. Sangat penting bila negara tujuan punya perjanjian dagang dengan Indonesia, karena SKA preferensi (misalnya Form D untuk ASEAN, Form E untuk Tiongkok, Form RCEP) bisa memangkas bea masuk di sisi pembeli secara signifikan. Diajukan melalui sistem e-SKA Kemendag.",
      },
      {
        title: "PEB dan PIB",
        detail:
          "Pemberitahuan Ekspor Barang (PEB) diajukan eksportir ke Bea Cukai sebelum barang dimuat. Pemberitahuan Impor Barang (PIB) diajukan importir sebelum barang dikeluarkan dari kawasan pabean. Keduanya diajukan secara elektronik. Kesalahan pada kode HS di PIB adalah penyebab paling umum terbitnya surat penetapan tarif dan denda.",
      },
      {
        title: "Sertifikat khusus sesuai komoditas",
        detail:
          "Produk tumbuhan butuh Phytosanitary Certificate, produk hewan dan ikan butuh Health Certificate dari karantina. Pangan olahan sering butuh sertifikat halal dan izin edar. Kayu dan produk kayu butuh dokumen legalitas kayu. Beberapa negara mewajibkan fumigasi dan sertifikatnya. Cek persyaratan negara tujuan SEBELUM produksi, bukan setelah.",
      },
      {
        title: "Kesalahan yang paling sering terjadi",
        detail:
          "Nama dan alamat pembeli berbeda antar dokumen. Berat pada packing list tidak sama dengan B/L. Deskripsi barang di invoice tidak cocok dengan kode HS. Tanggal B/L melewati batas pengapalan pada L/C. Semua ini bisa dicegah dengan satu kebiasaan sederhana: buat satu lembar data induk, lalu salin dari situ ke semua dokumen.",
      },
    ],
  },
  {
    id: "metode-pembayaran",
    title: "Metode Pembayaran Internasional dan Risikonya",
    summary:
      "Dari yang paling aman bagi penjual sampai yang paling berisiko, beserta kapan sebaiknya dipakai.",
    level: "menengah",
    audience: "keduanya",
    readingMinutes: 8,
    steps: [
      {
        title: "Advance Payment (T/T di muka)",
        detail:
          "Pembeli membayar sebelum barang dikirim. Paling aman bagi penjual, paling berisiko bagi pembeli. Umum dipakai untuk order pertama, order kecil, atau ketika penjual punya posisi tawar kuat. Kompromi yang lazim: 30% di muka sebagai deposit produksi, 70% menjelang atau setelah pengapalan.",
      },
      {
        title: "Letter of Credit (L/C)",
        detail:
          "Bank pembeli menjamin pembayaran asalkan penjual menyerahkan dokumen yang sesuai persyaratan L/C. Menyeimbangkan risiko kedua pihak, tapi biayanya lebih mahal dan sangat menuntut ketelitian dokumen. Selalu minta L/C yang irrevocable. Bila bank penerbit kurang dikenal, minta L/C yang dikonfirmasi bank di negara Anda.",
      },
      {
        title: "Documents against Payment (D/P)",
        detail:
          "Bank menyerahkan dokumen kepemilikan kepada pembeli hanya setelah pembayaran dilakukan. Lebih murah daripada L/C, tapi tidak ada jaminan bank. Bila pembeli menolak menebus, barang Anda sudah berada di pelabuhan tujuan dan Anda menghadapi biaya penumpukan serta ongkos pengembalian.",
      },
      {
        title: "Documents against Acceptance (D/A)",
        detail:
          "Pembeli mendapat dokumen setelah menandatangani janji bayar pada tanggal tertentu. Risiko penjual jauh lebih besar daripada D/P karena barang bisa diambil sebelum uang diterima. Hanya untuk mitra yang sudah lama dan terbukti.",
      },
      {
        title: "Open Account",
        detail:
          "Barang dikirim dulu, pembayaran menyusul dalam 30 sampai 90 hari. Paling nyaman bagi pembeli dan paling berisiko bagi penjual. Wajar hanya untuk hubungan dagang yang sudah berjalan lama, atau bila piutang Anda diasuransikan. Lembaga pembiayaan ekspor bisa membantu menutup risiko ini.",
      },
      {
        title: "Tanda bahaya yang perlu diwaspadai",
        detail:
          "Pembeli baru langsung minta Open Account untuk order besar. Permintaan mengubah rekening penerima di menit terakhir lewat email. L/C dengan klausul yang mustahil dipenuhi. Pembeli menolak video call atau kunjungan. Tekanan untuk segera mengirim tanpa kontrak. Bila ada satu saja dari tanda ini, berhentilah dan verifikasi ulang.",
      },
    ],
  },
  {
    id: "hs-code",
    title: "Menentukan Kode HS dengan Benar",
    summary:
      "Kode HS menentukan tarif, izin, dan pemeriksaan. Salah kode berarti salah biaya dan berpotensi denda.",
    level: "menengah",
    audience: "keduanya",
    readingMinutes: 6,
    steps: [
      {
        title: "Struktur kode HS",
        detail:
          "Enam digit pertama berlaku universal di seluruh dunia: dua digit bab, dua digit pos, dua digit subpos. Indonesia memakai delapan digit dalam Buku Tarif Kepabeanan Indonesia, dan beberapa negara memakai sepuluh digit. Untuk perdagangan lintas negara, enam digit pertama harus sama antara Anda dan mitra Anda.",
      },
      {
        title: "Kenapa ini penting sekali",
        detail:
          "Kode HS menentukan tarif bea masuk, apakah barang butuh izin impor atau ekspor, apakah kena bea antidumping, dan apakah bisa memakai tarif preferensi FTA. Selisih satu subpos bisa berarti selisih tarif dari 0% menjadi 20%, atau dari bebas izin menjadi wajib izin.",
      },
      {
        title: "Cara mencarinya",
        detail:
          "Mulai dari bentuk dan bahan barang, bukan dari nama dagangnya. Gunakan mesin pencari di Indonesia National Trade Repository, lalu baca uraian pos secara lengkap termasuk catatan babnya. Bandingkan dua atau tiga kandidat kode dan pilih yang uraiannya paling spesifik menggambarkan barang Anda.",
      },
      {
        title: "Aturan dasar penggolongan",
        detail:
          "Uraian yang lebih spesifik mengalahkan yang lebih umum. Untuk barang campuran atau set, penggolongan mengikuti bahan atau komponen yang memberi sifat utama. Bila tetap tidak terselesaikan, pilih pos terakhir menurut urutan nomor di antara kandidat yang setara.",
      },
      {
        title: "Kalau masih ragu, minta penetapan resmi",
        detail:
          "Bea Cukai menyediakan layanan penetapan klasifikasi sebelum impor. Untuk barang bernilai besar atau yang akan diimpor berulang, mengurus penetapan di awal jauh lebih murah daripada menghadapi koreksi tarif dan denda setelah barang tiba. Jangan pernah menyerahkan penentuan kode HS sepenuhnya kepada pemasok asing.",
      },
    ],
  },
  {
    id: "alur-impor",
    title: "Alur Impor Barang ke Indonesia",
    summary:
      "Dari izin usaha sampai barang keluar dari pelabuhan, termasuk komponen pungutan yang harus dibayar.",
    level: "menengah",
    audience: "importir",
    readingMinutes: 8,
    steps: [
      {
        title: "1. Legalitas dan hak akses kepabeanan",
        detail:
          "Anda perlu NIB yang berlaku sebagai Angka Pengenal Impor. API-U untuk barang yang akan diperdagangkan, API-P untuk barang yang dipakai sendiri dalam proses produksi. Setelah itu daftarkan hak akses kepabeanan agar bisa mengajukan PIB secara elektronik.",
      },
      {
        title: "2. Periksa ketentuan larangan dan pembatasan",
        detail:
          "Tentukan kode HS barang, lalu cek apakah termasuk barang bebas, dibatasi, atau dilarang impor. Barang yang dibatasi butuh Persetujuan Impor dari kementerian terkait, dan sering juga Laporan Surveyor dari surveyor yang ditunjuk. Barang modal bukan baru punya aturan tersendiri yang lebih ketat.",
      },
      {
        title: "3. Pahami komponen biaya impor",
        detail:
          "Dasar pengenaan adalah nilai CIF yang dikonversi ke rupiah memakai Nilai Dasar Penghitungan Bea Masuk, yaitu kurs yang ditetapkan pemerintah secara berkala. Di atas itu dikenakan Bea Masuk sesuai tarif kode HS, lalu PPN dan PPh Pasal 22 Impor dihitung dari Nilai Impor, yaitu CIF rupiah ditambah Bea Masuk.",
      },
      {
        title: "4. Manfaatkan tarif preferensi bila ada",
        detail:
          "Bila barang berasal dari negara yang punya perjanjian dagang dengan Indonesia dan pemasok bisa menerbitkan Surat Keterangan Asal yang sesuai, tarif bea masuk bisa jauh lebih rendah, bahkan nol. Mintakan SKA ini kepada pemasok SEBELUM pengapalan, karena mengurusnya setelah barang tiba jauh lebih sulit.",
      },
      {
        title: "5. Ajukan PIB dan bayar pungutan",
        detail:
          "Ajukan Pemberitahuan Impor Barang secara elektronik beserta dokumen pendukung, lalu bayar bea masuk dan pajak impor. Banyak importir memakai jasa Pengusaha Pengurusan Jasa Kepabeanan (PPJK) untuk tahap ini, terutama bila belum berpengalaman.",
      },
      {
        title: "6. Penjaluran dan pengeluaran barang",
        detail:
          "Sistem akan menentukan jalur pemeriksaan. Jalur hijau berarti barang bisa langsung keluar setelah dokumen beres. Jalur merah berarti ada pemeriksaan fisik, yang menambah waktu dan biaya. Riwayat kepatuhan yang baik membuat Anda lebih sering mendapat jalur hijau.",
      },
      {
        title: "7. Jaga waktu agar tidak terkena denda penumpukan",
        detail:
          "Demurrage adalah denda karena kontainer terlalu lama di pelabuhan, detention karena kontainer terlalu lama di luar pelabuhan sebelum dikembalikan. Keduanya bisa menjadi biaya yang sangat besar. Siapkan dokumen lengkap sebelum kapal tiba, jangan setelahnya.",
      },
    ],
  },
  {
    id: "manfaatkan-fta",
    title: "Menekan Bea Masuk dengan Perjanjian Dagang",
    summary:
      "Indonesia punya banyak perjanjian dagang yang sering tidak dimanfaatkan. Ini cara memakainya.",
    level: "lanjutan",
    audience: "keduanya",
    readingMinutes: 6,
    steps: [
      {
        title: "Apa itu tarif preferensi",
        detail:
          "Melalui perjanjian dagang, negara anggota sepakat saling menurunkan bea masuk. Tarif yang lebih rendah ini disebut tarif preferensi, berbeda dari tarif umum yang berlaku bagi semua negara. Selisihnya sering cukup besar untuk menentukan apakah transaksi Anda menguntungkan atau tidak.",
      },
      {
        title: "Perjanjian yang melibatkan Indonesia",
        detail:
          "Indonesia terlibat dalam berbagai skema, di antaranya kawasan perdagangan bebas ASEAN, perjanjian ASEAN dengan Tiongkok, Korea, Jepang, India, serta Australia dan Selandia Baru. Ada juga perjanjian kemitraan ekonomi bilateral dan skema kemitraan regional yang lebih luas. Setiap skema punya formulir SKA dan aturan asal barang sendiri.",
      },
      {
        title: "Aturan asal barang (rules of origin)",
        detail:
          "Tarif preferensi hanya berlaku bila barang benar-benar berasal dari negara anggota. Kriterianya bisa berupa seluruhnya diperoleh di negara itu, kandungan nilai regional minimum tertentu, atau adanya perubahan pos tarif akibat proses produksi. Anda perlu bisa membuktikannya dengan dokumen produksi.",
      },
      {
        title: "Langkah praktis bagi importir",
        detail:
          "Sebelum menutup harga, cek tarif preferensi yang tersedia memakai ASEAN Tariff Finder atau bertanya ke FTA Center Kemendag. Lalu pastikan dalam kontrak bahwa pemasok WAJIB menerbitkan SKA dengan formulir yang tepat. Tanpa SKA yang sah, Anda akan dikenai tarif umum yang lebih tinggi.",
      },
      {
        title: "Langkah praktis bagi eksportir",
        detail:
          "Pelajari cara mengurus SKA melalui sistem e-SKA Kemendag. Kemampuan menerbitkan SKA preferensi adalah nilai jual nyata: pembeli di negara mitra bisa menghemat bea masuk, sehingga penawaran Anda lebih menarik dibanding pesaing dari negara tanpa perjanjian dagang.",
      },
    ],
  },
  {
    id: "hindari-penipuan",
    title: "Menghindari Penipuan Perdagangan Internasional",
    summary:
      "Pola penipuan yang paling sering menimpa eksportir dan importir Indonesia, serta cara memeriksanya.",
    level: "pemula",
    audience: "keduanya",
    readingMinutes: 6,
    steps: [
      {
        title: "Verifikasi keberadaan perusahaan mitra",
        detail:
          "Cari nama perusahaan di daftar perusahaan resmi negaranya, bukan hanya di situs web mereka. Periksa apakah alamat kantor benar-benar ada, apakah domain email memakai domain perusahaan (bukan email gratis), dan sejak kapan domain itu terdaftar. Domain yang baru dibuat beberapa bulan untuk transaksi besar adalah tanda bahaya.",
      },
      {
        title: "Selalu lakukan panggilan video",
        detail:
          "Minta panggilan video dengan orang yang mengaku sebagai penanggung jawab, sebaiknya dari kantor mereka. Penipu hampir selalu menghindari ini dengan berbagai alasan. Untuk transaksi bernilai besar, pertimbangkan mengirim surveyor atau pihak ketiga untuk kunjungan langsung.",
      },
      {
        title: "Waspadai perubahan rekening di menit terakhir",
        detail:
          "Pola yang sangat umum: email yang tampak berasal dari mitra Anda memberitahu adanya perubahan rekening bank. Ini hampir selalu penipuan pembajakan email. Aturan mutlak: setiap perubahan data rekening harus diverifikasi lewat panggilan telepon ke nomor yang sudah Anda kenal sebelumnya, bukan nomor yang tercantum di email itu.",
      },
      {
        title: "Jangan kirim dokumen asli sebelum aman",
        detail:
          "Bill of Lading asli adalah dokumen kepemilikan barang. Jangan pernah mengirimkannya langsung ke pembeli sebelum pembayaran terjamin. Salurkan melalui bank. Kirim hanya salinan untuk keperluan pengurusan di negara tujuan.",
      },
      {
        title: "Periksa keaslian L/C",
        detail:
          "Bila menerima L/C, minta bank Anda memeriksa keasliannya dan menilai reputasi bank penerbit. Ada L/C palsu yang beredar, dan ada juga L/C asli tapi dengan klausul yang sengaja dibuat mustahil dipenuhi sehingga pembayaran bisa ditolak secara sah.",
      },
      {
        title: "Mulai dari transaksi kecil",
        detail:
          "Untuk mitra baru, lakukan satu transaksi percobaan dengan nilai yang tidak akan menghancurkan usaha Anda bila gagal. Biaya per unitnya memang lebih mahal, tapi itu jauh lebih murah dibanding kehilangan satu kontainer penuh.",
      },
    ],
  },
];

/* ------------------------------------------------------------
   Kumpulan tautan regulasi dan situs penting.
   Semua URL sudah diverifikasi dapat diakses.
   ------------------------------------------------------------ */

export type LinkCategory =
  | "perizinan"
  | "kepabeanan"
  | "tarif"
  | "sertifikasi"
  | "data"
  | "pembiayaan"
  | "internasional";

export const LINK_CATEGORY_META: Record<
  LinkCategory,
  { label: string; description: string; icon: string }
> = {
  perizinan: {
    label: "Perizinan & Legalitas",
    description: "Mendirikan usaha, izin ekspor impor, dan hak akses sistem.",
    icon: "📋",
  },
  kepabeanan: {
    label: "Kepabeanan",
    description: "Prosedur pabean, PEB, PIB, dan ketentuan barang.",
    icon: "🛃",
  },
  tarif: {
    label: "Tarif & Kode HS",
    description: "Pencarian kode HS, tarif bea masuk, dan tarif preferensi FTA.",
    icon: "🔢",
  },
  sertifikasi: {
    label: "Sertifikasi & Karantina",
    description: "Karantina, izin edar, halal, dan surat keterangan asal.",
    icon: "✅",
  },
  data: {
    label: "Data & Riset Pasar",
    description: "Statistik perdagangan dan pencarian pasar tujuan.",
    icon: "📊",
  },
  pembiayaan: {
    label: "Pembiayaan & Kurs",
    description: "Pembiayaan ekspor, kurs acuan, dan kurs pajak.",
    icon: "🏦",
  },
  internasional: {
    label: "Rujukan Internasional",
    description: "Lembaga dan standar perdagangan global.",
    icon: "🌐",
  },
};

export interface RegulationLink {
  id: string;
  name: string;
  org: string;
  url: string;
  category: LinkCategory;
  description: string;
  /** Tandai yang paling sering dibutuhkan. */
  essential: boolean;
}

export const REGULATION_LINKS: RegulationLink[] = [
  // --- Perizinan ---
  {
    id: "oss",
    name: "OSS - Perizinan Berusaha",
    org: "Kementerian Investasi / BKPM",
    url: "https://oss.go.id",
    category: "perizinan",
    description:
      "Tempat mendaftarkan usaha dan memperoleh Nomor Induk Berusaha (NIB). NIB juga berlaku sebagai Angka Pengenal Impor. Ini titik awal wajib bagi siapa pun yang mau ekspor atau impor secara resmi.",
    essential: true,
  },
  {
    id: "inatrade",
    name: "INATRADE",
    org: "Kementerian Perdagangan",
    url: "https://inatrade.kemendag.go.id",
    category: "perizinan",
    description:
      "Sistem pelayanan perizinan ekspor dan impor Kemendag. Di sini Anda mengajukan Persetujuan Ekspor dan Persetujuan Impor untuk komoditas yang dibatasi.",
    essential: true,
  },
  {
    id: "jdih-kemendag",
    name: "JDIH Kemendag",
    org: "Kementerian Perdagangan",
    url: "https://jdih.kemendag.go.id",
    category: "perizinan",
    description:
      "Kumpulan peraturan perdagangan yang berlaku, termasuk peraturan menteri tentang ketentuan ekspor dan impor per komoditas. Rujuk ke sini untuk membaca teks aslinya.",
    essential: false,
  },

  // --- Kepabeanan ---
  {
    id: "insw",
    name: "INSW - Indonesia National Single Window",
    org: "Lembaga National Single Window",
    url: "https://insw.go.id",
    category: "kepabeanan",
    description:
      "Portal tunggal yang menghubungkan seluruh sistem perizinan ekspor impor pemerintah. Titik masuk utama untuk pengajuan dan pelacakan dokumen lintas kementerian.",
    essential: true,
  },
  {
    id: "beacukai",
    name: "Direktorat Jenderal Bea dan Cukai",
    org: "Kementerian Keuangan",
    url: "https://www.beacukai.go.id",
    category: "kepabeanan",
    description:
      "Otoritas kepabeanan Indonesia. Sumber resmi untuk prosedur PEB dan PIB, ketentuan barang larangan dan pembatasan, layanan klasifikasi barang, serta pengumuman perubahan aturan.",
    essential: true,
  },

  // --- Tarif & HS Code ---
  {
    id: "intr",
    name: "Indonesia National Trade Repository",
    org: "LNSW / INSW",
    url: "https://insw.go.id/intr",
    category: "tarif",
    description:
      "Pencarian kode HS lengkap dengan tarif bea masuk, pajak, ketentuan larangan dan pembatasan, serta tarif preferensi FTA untuk setiap pos tarif. Ini alat paling penting sebelum menghitung biaya impor.",
    essential: true,
  },
  {
    id: "asean-tariff-finder",
    name: "ASEAN Tariff Finder",
    org: "Sekretariat ASEAN",
    url: "https://tariff-finder.asean.org",
    category: "tarif",
    description:
      "Membandingkan tarif bea masuk antar negara ASEAN dan mitra FTA-nya untuk kode HS tertentu. Berguna untuk memperkirakan berapa bea masuk yang akan dibayar pembeli Anda di negara tujuan.",
    essential: true,
  },
  {
    id: "fta-center",
    name: "FTA Center Kemendag",
    org: "Kementerian Perdagangan",
    url: "https://ftacenter.kemendag.go.id",
    category: "tarif",
    description:
      "Pusat informasi dan pendampingan pemanfaatan perjanjian dagang Indonesia. Bisa dihubungi untuk konsultasi mengenai skema FTA mana yang paling menguntungkan untuk produk Anda.",
    essential: false,
  },

  // --- Sertifikasi & Karantina ---
  {
    id: "e-ska",
    name: "e-SKA - Surat Keterangan Asal",
    org: "Kementerian Perdagangan",
    url: "https://e-ska.kemendag.go.id",
    category: "sertifikasi",
    description:
      "Sistem penerbitan Certificate of Origin secara elektronik, termasuk SKA preferensi seperti Form D, Form E, dan formulir RCEP yang bisa menurunkan bea masuk di negara tujuan.",
    essential: true,
  },
  {
    id: "barantin",
    name: "Badan Karantina Indonesia",
    org: "Badan Karantina Indonesia",
    url: "https://karantinaindonesia.go.id",
    category: "sertifikasi",
    description:
      "Penerbit sertifikat karantina untuk produk pertanian, hewan, dan ikan. Wajib untuk hampir semua ekspor komoditas hasil pertanian dan perikanan, serta untuk impor produk serupa.",
    essential: true,
  },
  {
    id: "bpom",
    name: "Badan Pengawas Obat dan Makanan",
    org: "BPOM",
    url: "https://www.pom.go.id",
    category: "sertifikasi",
    description:
      "Izin edar dan Surat Keterangan Impor atau Ekspor untuk pangan olahan, obat, kosmetik, dan suplemen. Diperlukan bila produk Anda masuk kategori yang diawasi BPOM.",
    essential: false,
  },
  {
    id: "bpjph",
    name: "BPJPH - Sertifikasi Halal",
    org: "Kementerian Agama",
    url: "https://bpjph.halal.go.id",
    category: "sertifikasi",
    description:
      "Penyelenggara jaminan produk halal. Sertifikat halal makin sering diminta pembeli di negara berpenduduk muslim, dan menjadi syarat wajib untuk sebagian produk di pasar dalam negeri.",
    essential: false,
  },

  // --- Data & Riset ---
  {
    id: "trademap",
    name: "ITC Trade Map",
    org: "International Trade Centre",
    url: "https://www.trademap.org",
    category: "data",
    description:
      "Basis data perdagangan paling berguna untuk riset pasar: siapa mengimpor produk Anda, berapa nilainya, dari negara mana, dan bagaimana trennya. Pendaftaran gratis sudah cukup untuk kebutuhan dasar.",
    essential: true,
  },
  {
    id: "bps",
    name: "Badan Pusat Statistik",
    org: "BPS",
    url: "https://www.bps.go.id",
    category: "data",
    description:
      "Statistik resmi ekspor impor Indonesia menurut komoditas, negara, dan pelabuhan. Berguna untuk memahami posisi Indonesia dan mengidentifikasi komoditas yang sedang tumbuh.",
    essential: false,
  },
  {
    id: "satudata-kemendag",
    name: "Satu Data Perdagangan",
    org: "Kementerian Perdagangan",
    url: "https://satudata.kemendag.go.id",
    category: "data",
    description:
      "Portal data Kemendag: harga komoditas dalam negeri, neraca perdagangan, dan kinerja ekspor impor per sektor.",
    essential: false,
  },
  {
    id: "trade-expo",
    name: "Trade Expo Indonesia",
    org: "Kementerian Perdagangan",
    url: "https://tradexpoindonesia.com",
    category: "data",
    description:
      "Pameran dagang terbesar Indonesia dan salah satu jalur paling efektif bagi eksportir pemula untuk bertemu pembeli luar negeri secara langsung.",
    essential: false,
  },

  // --- Pembiayaan & Kurs ---
  {
    id: "lpei",
    name: "LPEI / Indonesia Eximbank",
    org: "Lembaga Pembiayaan Ekspor Indonesia",
    url: "https://www.indonesiaeximbank.go.id",
    category: "pembiayaan",
    description:
      "Lembaga khusus pembiayaan ekspor: kredit modal kerja ekspor, penjaminan, dan asuransi risiko pembayaran pembeli. Berguna bila Anda perlu memberi tempo pembayaran kepada pembeli tanpa menanggung risiko penuh.",
    essential: true,
  },
  {
    id: "bi-kurs",
    name: "Kurs Bank Indonesia",
    org: "Bank Indonesia",
    url: "https://www.bi.go.id",
    category: "pembiayaan",
    description:
      "Kurs referensi harian. Dipakai untuk memperkirakan nilai transaksi dan mengelola risiko selisih kurs antara saat kontrak dan saat pembayaran.",
    essential: true,
  },
  {
    id: "kurs-pajak",
    name: "Kurs Pajak (NDPBM)",
    org: "Badan Kebijakan Fiskal, Kemenkeu",
    url: "https://fiskal.kemenkeu.go.id",
    category: "pembiayaan",
    description:
      "Nilai Dasar Penghitungan Bea Masuk yang ditetapkan berkala. INI kurs yang dipakai menghitung bea masuk dan pajak impor, bukan kurs bank. Selalu pakai angka ini saat menghitung biaya impor.",
    essential: true,
  },

  // --- Internasional ---
  {
    id: "incoterms",
    name: "Incoterms 2020 - ICC",
    org: "International Chamber of Commerce",
    url: "https://iccwbo.org/business-solutions/incoterms-rules/",
    category: "internasional",
    description:
      "Sumber resmi aturan Incoterms. Karena Incoterms menentukan pembagian biaya dan risiko dalam kontrak Anda, pahami langsung dari sumbernya, bukan dari ringkasan pihak ketiga.",
    essential: true,
  },
  {
    id: "wto",
    name: "World Trade Organization",
    org: "WTO",
    url: "https://www.wto.org",
    category: "internasional",
    description:
      "Rujukan untuk aturan perdagangan multilateral, profil tarif per negara, serta informasi hambatan teknis perdagangan dan tindakan pengamanan yang sedang berlaku.",
    essential: false,
  },
];

/* ------------------------------------------------------------
   Kamus istilah
   ------------------------------------------------------------ */

export interface GlossaryTerm {
  term: string;
  full?: string;
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: "B/L",
    full: "Bill of Lading",
    definition:
      "Dokumen yang diterbitkan pengangkut laut sebagai tanda terima barang, bukti kontrak pengangkutan, dan dokumen kepemilikan. Pemegang B/L asli berhak mengambil barang di pelabuhan tujuan.",
  },
  {
    term: "BMAD",
    full: "Bea Masuk Anti Dumping",
    definition:
      "Pungutan tambahan atas barang impor yang dijual di bawah harga normal dan merugikan industri dalam negeri. Berlaku untuk kode HS dan negara asal tertentu, dan bisa jauh lebih besar dari bea masuk biasa.",
  },
  {
    term: "CIF",
    full: "Cost, Insurance and Freight",
    definition:
      "Incoterm di mana penjual menanggung biaya barang, asuransi, dan ongkos kapal sampai pelabuhan tujuan. Risiko tetap berpindah ke pembeli saat barang dimuat di pelabuhan asal.",
  },
  {
    term: "COO / SKA",
    full: "Certificate of Origin / Surat Keterangan Asal",
    definition:
      "Dokumen yang menyatakan negara asal barang. Versi preferensinya dipakai untuk memperoleh tarif bea masuk yang lebih rendah berdasarkan perjanjian dagang.",
  },
  {
    term: "Demurrage",
    definition:
      "Denda yang dikenakan pelayaran karena kontainer terlalu lama berada di dalam area pelabuhan melewati masa bebas. Dihitung per hari per kontainer dan bisa membengkak cepat.",
  },
  {
    term: "Detention",
    definition:
      "Denda karena kontainer terlalu lama berada di luar pelabuhan sebelum dikembalikan ke depo. Berbeda dari demurrage meski sering tertukar.",
  },
  {
    term: "FCL / LCL",
    full: "Full Container Load / Less than Container Load",
    definition:
      "FCL berarti Anda menyewa satu kontainer utuh. LCL berarti barang Anda digabung dengan barang pengirim lain dalam satu kontainer. LCL lebih murah untuk volume kecil tapi lebih lama dan lebih berisiko.",
  },
  {
    term: "FOB",
    full: "Free On Board",
    definition:
      "Incoterm di mana tanggung jawab penjual berakhir saat barang berada di atas kapal di pelabuhan muat. Incoterm paling umum untuk ekspor Indonesia.",
  },
  {
    term: "Freight Forwarder",
    definition:
      "Penyedia jasa yang mengatur pengangkutan barang dari pintu ke pintu, termasuk pemesanan ruang kapal, pengurusan dokumen, dan koordinasi dengan pelayaran. Mitra penting bagi eksportir yang belum berpengalaman.",
  },
  {
    term: "HS Code",
    full: "Harmonized System Code",
    definition:
      "Kode penggolongan barang internasional yang menentukan tarif bea masuk, kewajiban izin, dan pemeriksaan. Enam digit pertama berlaku universal, Indonesia memakai delapan digit.",
  },
  {
    term: "L/C",
    full: "Letter of Credit",
    definition:
      "Jaminan pembayaran dari bank pembeli kepada penjual, yang berlaku bila penjual menyerahkan dokumen sesuai persyaratan. Menyeimbangkan risiko kedua pihak tetapi menuntut ketelitian dokumen tinggi.",
  },
  {
    term: "NDPBM",
    full: "Nilai Dasar Penghitungan Bea Masuk",
    definition:
      "Kurs yang ditetapkan pemerintah secara berkala untuk mengonversi nilai barang impor ke rupiah dalam penghitungan bea masuk dan pajak. Berbeda dari kurs bank atau kurs pasar.",
  },
  {
    term: "NIB",
    full: "Nomor Induk Berusaha",
    definition:
      "Identitas tunggal pelaku usaha yang diterbitkan melalui sistem OSS. Berlaku juga sebagai Angka Pengenal Impor, sehingga menjadi syarat dasar kegiatan ekspor dan impor.",
  },
  {
    term: "Nilai Impor",
    definition:
      "Nilai CIF dalam rupiah ditambah bea masuk. Angka inilah yang menjadi dasar penghitungan PPN dan PPh Pasal 22 Impor, bukan nilai CIF saja.",
  },
  {
    term: "PEB",
    full: "Pemberitahuan Ekspor Barang",
    definition:
      "Dokumen pabean yang diajukan eksportir kepada Bea Cukai sebelum barang dimuat ke sarana pengangkut.",
  },
  {
    term: "PIB",
    full: "Pemberitahuan Impor Barang",
    definition:
      "Dokumen pabean yang diajukan importir sebelum barang dikeluarkan dari kawasan pabean. Kesalahan kode HS di PIB adalah penyebab paling umum koreksi tarif dan denda.",
  },
  {
    term: "PPJK",
    full: "Pengusaha Pengurusan Jasa Kepabeanan",
    definition:
      "Perusahaan berizin yang mengurus formalitas kepabeanan atas nama eksportir atau importir. Sangat membantu bagi pelaku usaha yang belum berpengalaman.",
  },
  {
    term: "Phytosanitary Certificate",
    definition:
      "Sertifikat kesehatan tumbuhan yang menyatakan produk bebas hama dan penyakit, diterbitkan otoritas karantina. Wajib untuk hampir semua ekspor produk tumbuhan.",
  },
  {
    term: "Shipping Instruction",
    definition:
      "Instruksi tertulis dari pengirim kepada pelayaran atau forwarder yang memuat data untuk penerbitan Bill of Lading. Kesalahan di sini akan terbawa ke B/L dan sulit diperbaiki.",
  },
  {
    term: "THC",
    full: "Terminal Handling Charge",
    definition:
      "Biaya penanganan kontainer di terminal pelabuhan, dikenakan di pelabuhan muat dan pelabuhan bongkar. Sering terlewat saat eksportir pemula menghitung harga.",
  },
];

/* ------------------------------------------------------------
   Daftar periksa dokumen
   ------------------------------------------------------------ */

export interface DocumentItem {
  name: string;
  issuedBy: string;
  note: string;
  /** false bila hanya diperlukan untuk komoditas atau kondisi tertentu. */
  always: boolean;
}

export const EXPORT_DOCUMENTS: DocumentItem[] = [
  {
    name: "Commercial Invoice",
    issuedBy: "Eksportir",
    note: "Dasar penghitungan bea masuk di negara tujuan. Harus konsisten dengan semua dokumen lain.",
    always: true,
  },
  {
    name: "Packing List",
    issuedBy: "Eksportir",
    note: "Rincian per koli: isi, berat bersih, berat kotor, dimensi.",
    always: true,
  },
  {
    name: "PEB - Pemberitahuan Ekspor Barang",
    issuedBy: "Eksportir / PPJK ke Bea Cukai",
    note: "Diajukan elektronik sebelum barang dimuat.",
    always: true,
  },
  {
    name: "Bill of Lading / Airway Bill",
    issuedBy: "Pelayaran / maskapai",
    note: "Diterbitkan setelah barang dimuat. B/L asli adalah dokumen kepemilikan.",
    always: true,
  },
  {
    name: "Certificate of Origin (SKA)",
    issuedBy: "Kemendag via e-SKA",
    note: "Wajib bila pembeli ingin memakai tarif preferensi FTA.",
    always: false,
  },
  {
    name: "Phytosanitary / Health Certificate",
    issuedBy: "Badan Karantina Indonesia",
    note: "Untuk produk tumbuhan, hewan, dan ikan.",
    always: false,
  },
  {
    name: "Certificate of Analysis",
    issuedBy: "Laboratorium terakreditasi",
    note: "Membuktikan mutu sesuai spesifikasi kontrak. Sering diminta untuk pangan dan kimia.",
    always: false,
  },
  {
    name: "Fumigation Certificate",
    issuedBy: "Penyedia jasa fumigasi berizin",
    note: "Diminta banyak negara untuk kemasan kayu dan komoditas pertanian.",
    always: false,
  },
  {
    name: "Insurance Policy",
    issuedBy: "Perusahaan asuransi",
    note: "Wajib bila memakai Incoterm CIF atau CIP.",
    always: false,
  },
];

export const IMPORT_DOCUMENTS: DocumentItem[] = [
  {
    name: "PIB - Pemberitahuan Impor Barang",
    issuedBy: "Importir / PPJK ke Bea Cukai",
    note: "Diajukan elektronik sebelum barang dikeluarkan dari kawasan pabean.",
    always: true,
  },
  {
    name: "Commercial Invoice & Packing List",
    issuedBy: "Pemasok luar negeri",
    note: "Dasar penetapan nilai pabean. Pastikan uraian barang cocok dengan kode HS yang Anda pakai.",
    always: true,
  },
  {
    name: "Bill of Lading / Airway Bill",
    issuedBy: "Pelayaran / maskapai",
    note: "Diperlukan untuk menebus barang di pelabuhan tujuan.",
    always: true,
  },
  {
    name: "Bukti bayar bea masuk dan pajak impor",
    issuedBy: "Bank persepsi",
    note: "Bea Masuk, PPN Impor, dan PPh Pasal 22 Impor.",
    always: true,
  },
  {
    name: "Persetujuan Impor (PI)",
    issuedBy: "Kementerian terkait via INATRADE",
    note: "Untuk barang yang termasuk kategori dibatasi.",
    always: false,
  },
  {
    name: "Laporan Surveyor (LS)",
    issuedBy: "Surveyor yang ditunjuk pemerintah",
    note: "Untuk komoditas tertentu dan barang modal bukan baru.",
    always: false,
  },
  {
    name: "Certificate of Origin (SKA)",
    issuedBy: "Otoritas negara asal",
    note: "Diperlukan untuk memakai tarif preferensi FTA. Minta ke pemasok SEBELUM pengapalan.",
    always: false,
  },
  {
    name: "Sertifikat karantina / izin edar",
    issuedBy: "Barantin / BPOM",
    note: "Untuk pangan, produk pertanian, hewan, obat, dan kosmetik.",
    always: false,
  },
];
