import type { CommodityCategory } from "@/lib/types";

/* ============================================================
   Katalog kode HS untuk bantuan pencarian otomatis.

   BATASAN YANG WAJIB DIPAHAMI
   ---------------------------
   1. Ini BUKAN Buku Tarif Kepabeanan Indonesia (BTKI) yang resmi dan
      lengkap. Ini katalog ringkas berisi pos yang paling sering dipakai
      dalam perdagangan Indonesia, dibuat untuk mempercepat pencarian.
   2. Kode di sini umumnya 6 digit, yaitu bagian yang berlaku UNIVERSAL di
      seluruh dunia. Indonesia memakai 8 digit pada BTKI, dan sebagian
      negara memakai 10 digit. Jadi kode dari katalog ini biasanya perlu
      diperpanjang menjadi 8 digit untuk keperluan PEB/PIB.
   3. Penggolongan akhir tetap wewenang Bea Cukai. Untuk barang bernilai
      besar atau yang diimpor berulang, ajukan penetapan klasifikasi lebih
      dulu daripada menanggung risiko koreksi tarif dan denda.

   SELALU verifikasi di Indonesia National Trade Repository:
   https://insw.go.id/intr
   ============================================================ */

export const HS_VERIFY_URL = "https://insw.go.id/intr";

export interface HsCodeEntry {
  /** Kode HS, format "NNNN.NN" (6 digit) atau "NNNN" (heading 4 digit). */
  code: string;
  /** Uraian pos dalam bahasa Indonesia, diringkas agar mudah dibaca. */
  description: string;
  /** Kategori komoditas di TradeLink. Dipakai untuk mengisi form otomatis. */
  category: CommodityCategory;
  /**
   * Kata kunci pencarian: nama dagang, sinonim, istilah Inggris, dan
   * sebutan lokal. Inilah yang membuat pencarian "kopi gayo" atau
   * "patchouli" tetap menemukan pos yang benar.
   */
  keywords: string[];
  /** Catatan tambahan, mis. peringatan izin atau bea keluar. */
  note?: string;
}

export const HS_CODES: HsCodeEntry[] = [
  /* ---------- Kopi, teh, rempah (Bab 09) ---------- */
  {
    code: "0901.11",
    description: "Kopi, belum disangrai, tidak dihilangkan kafeinnya",
    category: "agri",
    keywords: ["kopi", "green bean", "biji kopi", "arabika", "robusta", "gayo", "toraja", "kintamani", "mandheling", "coffee", "raw coffee"],
    note: "Pos paling umum untuk ekspor green bean Indonesia.",
  },
  {
    code: "0901.21",
    description: "Kopi, disangrai, tidak dihilangkan kafeinnya",
    category: "food",
    keywords: ["kopi sangrai", "roasted coffee", "kopi bubuk", "ground coffee", "roastery"],
  },
  {
    code: "0902.10",
    description: "Teh hijau tidak difermentasi, kemasan tidak melebihi 3 kg",
    category: "agri",
    keywords: ["teh hijau", "green tea", "teh"],
  },
  {
    code: "0902.30",
    description: "Teh hitam difermentasi, kemasan tidak melebihi 3 kg",
    category: "agri",
    keywords: ["teh hitam", "black tea", "teh"],
  },
  {
    code: "0904.11",
    description: "Lada, tidak dihancurkan dan tidak ditumbuk",
    category: "agri",
    keywords: ["lada", "lada hitam", "lada putih", "black pepper", "white pepper", "merica", "muntok", "pepper"],
  },
  {
    code: "0904.12",
    description: "Lada, dihancurkan atau ditumbuk",
    category: "agri",
    keywords: ["lada bubuk", "ground pepper", "lada tumbuk"],
  },
  {
    code: "0904.21",
    description: "Buah genus Capsicum, dikeringkan, tidak dihancurkan",
    category: "agri",
    keywords: ["cabai kering", "dried chili", "paprika kering", "capsicum", "chilli"],
  },
  {
    code: "0905.10",
    description: "Vanili, tidak dihancurkan dan tidak ditumbuk",
    category: "agri",
    keywords: ["vanili", "vanilla", "vanilla bean", "vanili kering", "planifolia", "gourmet vanilla"],
  },
  {
    code: "0906.11",
    description: "Kayu manis (Cinnamomum zeylanicum), tidak dihancurkan",
    category: "agri",
    keywords: ["kayu manis", "cinnamon", "ceylon cinnamon"],
  },
  {
    code: "0906.19",
    description: "Kayu manis lainnya, tidak dihancurkan (termasuk cassia)",
    category: "agri",
    keywords: ["kayu manis", "cassia", "cassiavera", "korintji", "kerinci", "cinnamon stick", "cinnamon"],
  },
  {
    code: "0907.10",
    description: "Cengkeh (buah utuh, bunga dan tangkai), tidak dihancurkan",
    category: "agri",
    keywords: ["cengkeh", "clove", "cloves", "bunga cengkeh"],
  },
  {
    code: "0908.11",
    description: "Buah pala, dalam kulit",
    category: "agri",
    keywords: ["pala", "nutmeg", "buah pala", "pala dalam kulit"],
  },
  {
    code: "0908.12",
    description: "Buah pala, dikupas",
    category: "agri",
    keywords: ["pala", "nutmeg", "pala kupas", "shelled nutmeg"],
  },
  {
    code: "0908.21",
    description: "Bunga pala (mace), tidak dihancurkan",
    category: "agri",
    keywords: ["bunga pala", "fuli", "mace"],
  },
  {
    code: "0910.11",
    description: "Jahe, tidak dihancurkan dan tidak ditumbuk",
    category: "agri",
    keywords: ["jahe", "ginger", "jahe emprit", "jahe gajah"],
  },
  {
    code: "0910.30",
    description: "Kunyit (curcuma)",
    category: "agri",
    keywords: ["kunyit", "turmeric", "curcuma", "temulawak"],
  },
  {
    code: "0910.99",
    description: "Rempah-rempah lainnya, campuran rempah",
    category: "agri",
    keywords: ["rempah", "rempah campuran", "spice", "spice mix", "bumbu"],
  },

  /* ---------- Kelapa & buah (Bab 08) ---------- */
  {
    code: "0801.11",
    description: "Kelapa, dikeringkan (desiccated coconut)",
    category: "food",
    keywords: ["kelapa parut kering", "desiccated coconut", "kelapa kering", "coconut"],
  },
  {
    code: "0801.19",
    description: "Kelapa segar lainnya",
    category: "agri",
    keywords: ["kelapa", "kelapa segar", "fresh coconut", "young coconut", "kelapa muda"],
  },
  {
    code: "0804.30",
    description: "Nanas, segar atau dikeringkan",
    category: "agri",
    keywords: ["nanas", "pineapple"],
  },
  {
    code: "0804.50",
    description: "Jambu, mangga dan manggis, segar atau dikeringkan",
    category: "agri",
    keywords: ["mangga", "manggis", "jambu", "mango", "mangosteen", "guava"],
  },
  {
    code: "0810.90",
    description: "Buah segar lainnya",
    category: "agri",
    keywords: ["buah segar", "salak", "rambutan", "durian", "fresh fruit", "buah tropis"],
  },
  {
    code: "0813.40",
    description: "Buah dikeringkan lainnya",
    category: "food",
    keywords: ["buah kering", "dried fruit", "keripik buah"],
  },

  /* ---------- Sarang walet, madu (Bab 04) ---------- */
  {
    code: "0410.10",
    description: "Sarang burung walet dan produk asal hewan layak dimakan",
    category: "food",
    keywords: ["sarang burung walet", "sarang walet", "edible bird nest", "bird nest", "walet"],
    note: "Ekspor ke Tiongkok mewajibkan rumah produksi terdaftar (registrasi GACC).",
  },
  {
    code: "0409.00",
    description: "Madu alam",
    category: "food",
    keywords: ["madu", "honey", "madu hutan", "raw honey"],
  },

  /* ---------- Perikanan (Bab 03, 16) ---------- */
  {
    code: "0303.89",
    description: "Ikan beku lainnya",
    category: "seafood",
    keywords: ["ikan beku", "frozen fish", "kakap", "kerapu", "snapper", "grouper"],
  },
  {
    code: "0304.61",
    description: "Fillet tilapia beku",
    category: "seafood",
    keywords: ["fillet nila", "tilapia", "frozen tilapia fillet"],
  },
  {
    code: "0304.87",
    description: "Fillet tuna beku",
    category: "seafood",
    keywords: ["fillet tuna", "tuna loin", "frozen tuna", "tuna"],
  },
  {
    code: "0306.17",
    description: "Udang beku lainnya",
    category: "seafood",
    keywords: ["udang beku", "udang vaname", "vannamei", "black tiger", "frozen shrimp", "shrimp", "prawn", "hoso", "hlso"],
  },
  {
    code: "0306.36",
    description: "Udang segar atau dingin",
    category: "seafood",
    keywords: ["udang segar", "fresh shrimp", "udang dingin"],
  },
  {
    code: "0307.43",
    description: "Cumi-cumi, beku",
    category: "seafood",
    keywords: ["cumi", "cumi beku", "squid", "frozen squid", "sotong"],
  },
  {
    code: "0306.33",
    description: "Kepiting, segar atau dingin",
    category: "seafood",
    keywords: ["kepiting", "crab", "rajungan", "blue swimming crab"],
  },
  {
    code: "1604.14",
    description: "Tuna, cakalang dan bonito, diolah atau diawetkan",
    category: "food",
    keywords: ["tuna kaleng", "canned tuna", "cakalang", "skipjack", "tuna olahan"],
  },
  {
    code: "1605.21",
    description: "Udang diolah, tidak dalam kemasan kedap udara",
    category: "food",
    keywords: ["udang olahan", "processed shrimp", "breaded shrimp", "udang tepung"],
  },
  {
    code: "1212.21",
    description: "Rumput laut dan algae lainnya, layak dikonsumsi manusia",
    category: "seafood",
    keywords: ["rumput laut", "seaweed", "cottonii", "eucheuma", "gracilaria", "spinosum", "agar", "karaginan", "carrageenan"],
  },
  {
    code: "1212.29",
    description: "Rumput laut dan algae lainnya",
    category: "seafood",
    keywords: ["rumput laut industri", "seaweed", "algae"],
  },

  /* ---------- Sawit & minyak nabati (Bab 15) ---------- */
  {
    code: "1511.10",
    description: "Minyak kelapa sawit mentah (CPO)",
    category: "plantation",
    keywords: ["cpo", "crude palm oil", "minyak sawit mentah", "minyak kelapa sawit", "palm oil", "sawit"],
    note: "Termasuk komoditas yang dapat dikenai Bea Keluar. Cek tarif yang berlaku.",
  },
  {
    code: "1511.90",
    description: "Minyak kelapa sawit dan fraksinya, dimurnikan",
    category: "plantation",
    keywords: ["rbd palm oil", "palm olein", "minyak sawit olahan", "refined palm oil", "stearin"],
  },
  {
    code: "1513.11",
    description: "Minyak kelapa (coconut/copra) mentah",
    category: "plantation",
    keywords: ["cno", "crude coconut oil", "minyak kelapa mentah", "coconut oil", "kopra"],
  },
  {
    code: "1513.19",
    description: "Minyak kelapa dan fraksinya, dimurnikan",
    category: "plantation",
    keywords: ["rbd coconut oil", "minyak kelapa murni", "vco", "virgin coconut oil"],
  },
  {
    code: "1513.21",
    description: "Minyak inti sawit dan babassu, mentah",
    category: "plantation",
    keywords: ["cpko", "palm kernel oil", "minyak inti sawit", "pko"],
  },
  {
    code: "1515.90",
    description: "Minyak dan lemak nabati tertentu lainnya",
    category: "plantation",
    keywords: ["minyak nabati", "vegetable oil", "minyak jarak", "minyak kemiri"],
  },

  /* ---------- Kakao (Bab 18) ---------- */
  {
    code: "1801.00",
    description: "Biji kakao, utuh atau pecah, mentah atau digongseng",
    category: "agri",
    keywords: ["kakao", "biji kakao", "cocoa bean", "cacao", "kokoa", "fermented cocoa"],
  },
  {
    code: "1803.10",
    description: "Pasta kakao, tidak dihilangkan lemaknya",
    category: "food",
    keywords: ["pasta kakao", "cocoa mass", "cocoa liquor", "cocoa paste"],
  },
  {
    code: "1804.00",
    description: "Lemak dan minyak kakao (cocoa butter)",
    category: "food",
    keywords: ["cocoa butter", "lemak kakao", "mentega kakao"],
  },
  {
    code: "1805.00",
    description: "Bubuk kakao, tanpa tambahan gula",
    category: "food",
    keywords: ["bubuk kakao", "cocoa powder", "kakao bubuk"],
  },
  {
    code: "1806.90",
    description: "Cokelat dan olahan makanan mengandung kakao lainnya",
    category: "food",
    keywords: ["cokelat", "chocolate", "olahan cokelat", "couverture"],
  },

  /* ---------- Karet (Bab 40) ---------- */
  {
    code: "4001.10",
    description: "Lateks karet alam, dipravulkanisasi atau tidak",
    category: "plantation",
    keywords: ["lateks", "latex", "lateks karet", "natural latex"],
  },
  {
    code: "4001.21",
    description: "Lembaran karet alam diasap (RSS)",
    category: "plantation",
    keywords: ["rss", "ribbed smoked sheet", "sit asap", "karet lembaran", "rss3"],
  },
  {
    code: "4001.22",
    description: "Karet alam spesifikasi teknis (TSNR / SIR)",
    category: "plantation",
    keywords: ["sir", "sir 20", "sir20", "tsnr", "karet alam", "natural rubber", "crumb rubber", "karet"],
  },
  {
    code: "4001.29",
    description: "Karet alam dalam bentuk lainnya",
    category: "plantation",
    keywords: ["karet alam", "natural rubber", "karet bongkah"],
  },
  {
    code: "4011.10",
    description: "Ban pneumatik baru dari karet untuk mobil penumpang",
    category: "manufacture",
    keywords: ["ban", "tyre", "tire", "ban mobil", "pneumatic tyre"],
  },

  /* ---------- Minyak atsiri & kimia (Bab 33, 39, 29) ---------- */
  {
    code: "3301.29",
    description: "Minyak esensial lainnya (bukan jeruk)",
    category: "chemical",
    keywords: ["minyak nilam", "patchouli oil", "nilam", "minyak atsiri", "essential oil", "sereh wangi", "citronella", "cengkeh oil", "clove oil", "vetiver", "akar wangi", "kenanga", "cananga", "ylang ylang"],
  },
  {
    code: "3301.19",
    description: "Minyak esensial dari buah jeruk lainnya",
    category: "chemical",
    keywords: ["minyak jeruk", "citrus oil", "lemon oil", "orange oil"],
  },
  {
    code: "3901.10",
    description: "Polietilena dengan berat jenis kurang dari 0,94 (LDPE)",
    category: "chemical",
    keywords: ["ldpe", "polietilena", "polyethylene", "resin ldpe"],
  },
  {
    code: "3901.20",
    description: "Polietilena dengan berat jenis 0,94 atau lebih (HDPE)",
    category: "chemical",
    keywords: ["hdpe", "polietilena", "polyethylene", "resin hdpe", "blow moulding resin"],
  },
  {
    code: "3902.10",
    description: "Polipropilena",
    category: "chemical",
    keywords: ["pp", "polipropilena", "polypropylene", "resin pp"],
  },
  {
    code: "3904.10",
    description: "Poli(vinil klorida) tidak dicampur (PVC)",
    category: "chemical",
    keywords: ["pvc", "polivinil klorida", "polyvinyl chloride", "resin pvc"],
  },
  {
    code: "3907.61",
    description: "Poli(etilena tereftalat) dengan bilangan viskositas 78 ml/g atau lebih",
    category: "chemical",
    keywords: ["pet", "resin pet", "polyethylene terephthalate", "botol plastik"],
  },
  {
    code: "3823.11",
    description: "Asam stearat",
    category: "chemical",
    keywords: ["asam stearat", "stearic acid", "fatty acid"],
  },
  {
    code: "3808.91",
    description: "Insektisida",
    category: "chemical",
    keywords: ["insektisida", "insecticide", "pestisida", "pesticide"],
    note: "Umumnya termasuk barang dibatasi impor. Periksa persyaratan izinnya.",
  },

  /* ---------- Energi & biomassa (Bab 27, 44, 14) ---------- */
  {
    code: "2701.12",
    description: "Batu bara bituminus, tidak diaglomerasi",
    category: "energy",
    keywords: ["batu bara", "coal", "bituminous coal", "batubara"],
  },
  {
    code: "2701.19",
    description: "Batu bara lainnya, tidak diaglomerasi",
    category: "energy",
    keywords: ["batu bara", "coal", "sub bituminous", "lignit", "batubara"],
  },
  {
    code: "1404.90",
    description: "Produk nabati lainnya yang tidak dirinci di tempat lain",
    category: "energy",
    keywords: ["cangkang sawit", "pks", "palm kernel shell", "biomassa", "biomass", "sabut kelapa", "coco fiber", "cocopeat", "arang", "briket"],
  },
  {
    code: "4401.31",
    description: "Pelet kayu",
    category: "energy",
    keywords: ["wood pellet", "pelet kayu", "pellet", "biomassa kayu"],
  },
  {
    code: "4402.90",
    description: "Arang kayu lainnya",
    category: "energy",
    keywords: ["arang", "charcoal", "arang kayu", "briket arang", "arang kelapa", "shisha charcoal"],
  },

  /* ---------- Mineral & logam (Bab 26, 72-81) ---------- */
  {
    code: "2601.11",
    description: "Bijih besi dan konsentratnya, tidak diaglomerasi",
    category: "mineral",
    keywords: ["bijih besi", "iron ore", "besi"],
  },
  {
    code: "2603.00",
    description: "Bijih tembaga dan konsentratnya",
    category: "mineral",
    keywords: ["bijih tembaga", "copper ore", "konsentrat tembaga"],
  },
  {
    code: "2604.00",
    description: "Bijih nikel dan konsentratnya",
    category: "mineral",
    keywords: ["bijih nikel", "nickel ore", "nikel", "laterit"],
    note: "Ekspor bijih mentah tertentu dibatasi atau dilarang. Periksa aturan terkini.",
  },
  {
    code: "2606.00",
    description: "Bijih aluminium dan konsentratnya (bauksit)",
    category: "mineral",
    keywords: ["bauksit", "bauxite", "bijih aluminium"],
  },
  {
    code: "2609.00",
    description: "Bijih timah dan konsentratnya",
    category: "mineral",
    keywords: ["bijih timah", "tin ore", "timah"],
  },
  {
    code: "7202.60",
    description: "Fero-nikel",
    category: "mineral",
    keywords: ["fero nikel", "ferronickel", "feni", "nickel pig iron", "npi"],
  },
  {
    code: "7403.11",
    description: "Katoda tembaga dan bagian katoda, tidak ditempa",
    category: "mineral",
    keywords: ["katoda tembaga", "copper cathode", "tembaga"],
  },
  {
    code: "7502.10",
    description: "Nikel tidak ditempa, tidak dipadu",
    category: "mineral",
    keywords: ["nikel", "nickel", "nikel murni", "nickel matte"],
  },
  {
    code: "8001.10",
    description: "Timah tidak ditempa, tidak dipadu",
    category: "mineral",
    keywords: ["timah", "tin", "tin ingot", "balok timah"],
  },
  {
    code: "7601.10",
    description: "Aluminium tidak ditempa, tidak dipadu",
    category: "mineral",
    keywords: ["aluminium", "aluminum", "ingot aluminium"],
  },
  {
    code: "7108.13",
    description: "Emas dalam bentuk setengah jadi lainnya",
    category: "mineral",
    keywords: ["emas", "gold", "gold bar", "dore"],
  },

  /* ---------- Kayu & furnitur (Bab 44, 94, 46) ---------- */
  {
    code: "4407.29",
    description: "Kayu tropis digergaji, tebal melebihi 6 mm",
    category: "furniture",
    keywords: ["kayu gergajian", "sawn timber", "kayu jati", "teak", "merbau", "meranti", "sawn wood"],
    note: "Produk kayu memerlukan dokumen legalitas kayu untuk ekspor.",
  },
  {
    code: "4412.31",
    description: "Kayu lapis dengan sekurangnya satu lapisan luar kayu tropis",
    category: "furniture",
    keywords: ["kayu lapis", "plywood", "tripleks", "multipleks"],
  },
  {
    code: "9401.61",
    description: "Tempat duduk dengan kerangka kayu, dilapisi kain",
    category: "furniture",
    keywords: ["kursi", "sofa", "kursi kayu", "upholstered chair", "seating"],
  },
  {
    code: "9401.69",
    description: "Tempat duduk dengan kerangka kayu lainnya",
    category: "furniture",
    keywords: ["kursi kayu", "kursi rotan", "rattan chair", "wooden chair", "kursi taman", "outdoor chair"],
  },
  {
    code: "9403.30",
    description: "Perabot kayu untuk kantor",
    category: "furniture",
    keywords: ["perabot kantor", "office furniture", "meja kantor"],
  },
  {
    code: "9403.50",
    description: "Perabot kayu untuk kamar tidur",
    category: "furniture",
    keywords: ["perabot kamar", "bedroom furniture", "tempat tidur", "dipan", "lemari"],
  },
  {
    code: "9403.60",
    description: "Perabot kayu lainnya",
    category: "furniture",
    keywords: ["furnitur kayu", "wooden furniture", "meja", "dining table", "buffet", "furnitur jati", "teak furniture"],
  },
  {
    code: "9403.82",
    description: "Perabot dari bambu",
    category: "furniture",
    keywords: ["perabot bambu", "bamboo furniture", "bambu"],
  },
  {
    code: "9403.83",
    description: "Perabot dari rotan",
    category: "furniture",
    keywords: ["perabot rotan", "rattan furniture", "rotan", "furnitur rotan"],
  },
  {
    code: "4602.11",
    description: "Barang keranjang dan anyaman dari bambu",
    category: "furniture",
    keywords: ["kerajinan bambu", "bamboo basket", "anyaman bambu", "handicraft"],
  },
  {
    code: "4602.12",
    description: "Barang keranjang dan anyaman dari rotan",
    category: "furniture",
    keywords: ["kerajinan rotan", "rattan basket", "anyaman rotan", "handicraft", "keranjang"],
  },

  /* ---------- Tekstil & garmen (Bab 52-64) ---------- */
  {
    code: "5208.52",
    description: "Kain tenunan dari katun, dicetak, 85% atau lebih katun, ringan",
    category: "textile",
    keywords: ["batik", "kain batik", "kain katun", "printed cotton", "batik tulis", "batik cap", "kain cetak"],
  },
  {
    code: "5208.42",
    description: "Kain tenunan dari katun, dari benang berbeda warna",
    category: "textile",
    keywords: ["tenun", "kain tenun", "woven cotton", "tenun ikat", "songket", "ulos"],
  },
  {
    code: "5407.61",
    description: "Kain tenunan dari benang filamen poliester tekstur",
    category: "textile",
    keywords: ["kain poliester", "polyester fabric", "kain sintetis"],
  },
  {
    code: "6109.10",
    description: "T-shirt, singlet dan kaos lainnya, rajutan, dari katun",
    category: "textile",
    keywords: ["kaos", "t-shirt", "tshirt", "kaos katun", "cotton tee", "garmen"],
  },
  {
    code: "6203.42",
    description: "Celana panjang pria dari katun, bukan rajutan",
    category: "textile",
    keywords: ["celana pria", "trousers", "jeans", "celana panjang", "garmen"],
  },
  {
    code: "6204.62",
    description: "Celana panjang wanita dari katun, bukan rajutan",
    category: "textile",
    keywords: ["celana wanita", "women trousers", "garmen"],
  },
  {
    code: "6302.21",
    description: "Linen tempat tidur dari katun, dicetak",
    category: "textile",
    keywords: ["bed linen", "sprei", "sarung bantal", "bed sheet", "linen"],
  },
  {
    code: "6403.99",
    description: "Alas kaki lain dengan sol karet/plastik dan bagian atas kulit",
    category: "textile",
    keywords: ["sepatu", "footwear", "shoes", "sepatu kulit", "alas kaki"],
  },
  {
    code: "6404.11",
    description: "Alas kaki olahraga dengan bagian atas dari bahan tekstil",
    category: "textile",
    keywords: ["sepatu olahraga", "sneakers", "sports shoes", "sepatu kanvas"],
  },

  /* ---------- Makanan olahan & gula (Bab 17, 19-21) ---------- */
  {
    code: "1701.14",
    description: "Gula tebu mentah lainnya, tanpa tambahan perasa",
    category: "food",
    keywords: ["gula mentah", "raw sugar", "gula tebu"],
  },
  {
    code: "1701.99",
    description: "Gula lainnya (termasuk gula kristal putih)",
    category: "food",
    keywords: ["gula", "gula kristal putih", "gkp", "white sugar", "refined sugar"],
    note: "Impor gula umumnya memerlukan Persetujuan Impor.",
  },
  {
    code: "1702.90",
    description: "Gula lainnya termasuk gula invert dan sirup",
    category: "food",
    keywords: ["gula kelapa", "coconut sugar", "gula aren", "palm sugar", "sirup"],
  },
  {
    code: "1902.30",
    description: "Pasta lainnya (termasuk mi instan)",
    category: "food",
    keywords: ["mi instan", "instant noodle", "mie", "pasta", "bihun"],
  },
  {
    code: "1905.31",
    description: "Biskuit manis",
    category: "food",
    keywords: ["biskuit", "biscuit", "cookies", "kue kering"],
  },
  {
    code: "2008.19",
    description: "Buah kacang dan biji lainnya, diolah atau diawetkan",
    category: "food",
    keywords: ["kacang olahan", "processed nuts", "kacang goreng", "mete olahan"],
  },
  {
    code: "2009.89",
    description: "Jus buah atau sayuran lainnya",
    category: "food",
    keywords: ["jus", "juice", "jus buah", "konsentrat buah", "puree"],
  },
  {
    code: "2101.11",
    description: "Ekstrak, esens dan konsentrat kopi",
    category: "food",
    keywords: ["kopi instan", "instant coffee", "ekstrak kopi", "coffee extract"],
  },
  {
    code: "2103.90",
    description: "Bumbu dan penyedap campuran lainnya",
    category: "food",
    keywords: ["sambal", "saus", "sauce", "kecap", "bumbu", "seasoning", "chili sauce"],
  },
  {
    code: "2106.90",
    description: "Olahan makanan lainnya yang tidak dirinci",
    category: "food",
    keywords: ["olahan makanan", "food preparation", "suplemen", "bubuk minuman", "premix"],
  },

  /* ---------- Pangan pokok & pakan (Bab 10-12, 23) ---------- */
  {
    code: "1001.19",
    description: "Gandum durum lainnya",
    category: "agri",
    keywords: ["gandum durum", "durum wheat", "gandum pasta"],
  },
  {
    code: "1001.99",
    description: "Gandum dan meslin lainnya",
    category: "agri",
    keywords: ["gandum", "wheat", "terigu", "milling wheat"],
  },
  {
    code: "1005.90",
    description: "Jagung lainnya",
    category: "agri",
    keywords: ["jagung", "corn", "maize", "jagung pakan"],
  },
  {
    code: "1006.30",
    description: "Beras setengah giling atau digiling seluruhnya",
    category: "agri",
    keywords: ["beras", "rice", "beras giling", "milled rice"],
    note: "Impor beras umumnya memerlukan Persetujuan Impor.",
  },
  {
    code: "1201.90",
    description: "Kacang soya lainnya",
    category: "agri",
    keywords: ["kedelai", "soybean", "soya", "kacang soya"],
  },
  {
    code: "1207.99",
    description: "Biji dan buah mengandung minyak lainnya",
    category: "agri",
    keywords: ["biji minyak", "oilseed", "biji jarak", "kemiri", "wijen", "sesame"],
  },
  {
    code: "1211.90",
    description: "Tanaman dan bagiannya untuk obat atau parfum",
    category: "agri",
    keywords: ["tanaman obat", "herbal", "medicinal plant", "jamu", "empon", "daun kering"],
  },
  {
    code: "2304.00",
    description: "Bungkil dan residu padat dari ekstraksi minyak kacang soya",
    category: "agri",
    keywords: ["bungkil kedelai", "soybean meal", "sbm", "pakan"],
  },
  {
    code: "2306.49",
    description: "Bungkil dan residu padat lainnya dari biji rape/colza",
    category: "agri",
    keywords: ["bungkil", "meal", "rapeseed meal", "pakan ternak"],
  },

  /* ---------- Mesin & elektronik (Bab 84-85) ---------- */
  {
    code: "8457.10",
    description: "Pusat permesinan (machining centre) untuk pengerjaan logam",
    category: "manufacture",
    keywords: ["machining center", "cnc", "vmc", "vertical machining", "mesin cnc", "milling center"],
    note: "Impor mesin bukan baru memerlukan Persetujuan Impor dan Laporan Surveyor.",
  },
  {
    code: "8458.11",
    description: "Mesin bubut kendali numerik untuk pengerjaan logam",
    category: "manufacture",
    keywords: ["mesin bubut", "lathe", "cnc lathe", "turning machine"],
  },
  {
    code: "8459.61",
    description: "Mesin frais kendali numerik lainnya",
    category: "manufacture",
    keywords: ["mesin frais", "milling machine", "cnc milling"],
  },
  {
    code: "8471.30",
    description: "Mesin pengolah data otomatis portabel, berat maks 10 kg",
    category: "manufacture",
    keywords: ["laptop", "notebook", "komputer portabel", "tablet"],
  },
  {
    code: "8481.80",
    description: "Keran, kran, klep dan perlengkapan semacam itu lainnya",
    category: "manufacture",
    keywords: ["valve", "klep", "kran", "ball valve", "gate valve"],
  },
  {
    code: "8501.52",
    description: "Motor arus bolak-balik multi fase, daya 750 W - 75 kW",
    category: "manufacture",
    keywords: ["motor listrik", "electric motor", "motor induksi", "ac motor"],
  },
  {
    code: "8504.40",
    description: "Konverter statis (termasuk inverter dan power supply)",
    category: "manufacture",
    keywords: ["inverter", "power supply", "konverter", "adaptor", "charger"],
  },
  {
    code: "8517.13",
    description: "Telepon pintar (smartphone)",
    category: "manufacture",
    keywords: ["smartphone", "telepon pintar", "handphone", "ponsel", "hp"],
    note: "Impor perangkat telekomunikasi memerlukan sertifikasi dan izin khusus.",
  },
  {
    code: "8544.42",
    description: "Konduktor listrik lainnya dilengkapi konektor",
    category: "manufacture",
    keywords: ["kabel", "cable", "wiring harness", "kabel data"],
  },
  {
    code: "8708.99",
    description: "Bagian dan aksesori kendaraan bermotor lainnya",
    category: "manufacture",
    keywords: ["spare part", "suku cadang", "auto part", "komponen otomotif"],
  },
  {
    code: "8414.51",
    description: "Kipas meja, lantai, dinding, jendela atau langit-langit",
    category: "manufacture",
    keywords: ["kipas", "fan", "kipas angin", "exhaust fan"],
  },

  /* ---------- Kertas, kemasan, lainnya ---------- */
  {
    code: "4804.11",
    description: "Kraftliner tidak dikelantang, tidak dilapisi",
    category: "manufacture",
    keywords: ["kraftliner", "kertas kraft", "kraft paper", "kertas kemasan"],
  },
  {
    code: "4819.10",
    description: "Karton, kotak dan peti dari kertas bergelombang",
    category: "manufacture",
    keywords: ["karton", "kardus", "corrugated box", "kotak karton", "packaging"],
  },
  {
    code: "2523.29",
    description: "Semen portland lainnya",
    category: "manufacture",
    keywords: ["semen", "cement", "portland cement"],
  },
  {
    code: "6802.91",
    description: "Marmer, travertin dan alabaster yang dikerjakan",
    category: "mineral",
    keywords: ["marmer", "marble", "travertin", "batu alam", "granit"],
  },
  {
    code: "7113.19",
    description: "Barang perhiasan dari logam mulia lainnya",
    category: "manufacture",
    keywords: ["perhiasan", "jewellery", "jewelry", "emas perhiasan", "cincin"],
  },
  {
    code: "3304.99",
    description: "Preparat kecantikan atau tata rias lainnya",
    category: "chemical",
    keywords: ["kosmetik", "cosmetics", "skincare", "krim", "lotion"],
    note: "Memerlukan izin edar BPOM.",
  },
  {
    code: "3305.10",
    description: "Sampo",
    category: "chemical",
    keywords: ["sampo", "shampoo", "perawatan rambut"],
  },
  {
    code: "3401.19",
    description: "Sabun dan preparat aktif permukaan lainnya, batangan",
    category: "chemical",
    keywords: ["sabun", "soap", "sabun batang", "sabun mandi"],
  },
  {
    code: "2401.20",
    description: "Tembakau, sebagian atau seluruhnya dibuang gagangnya",
    category: "agri",
    keywords: ["tembakau", "tobacco", "tembakau rajangan"],
  },
  {
    code: "9503.00",
    description: "Mainan lainnya, model skala, puzzle",
    category: "manufacture",
    keywords: ["mainan", "toys", "mainan anak", "puzzle", "boneka"],
  },
];

/** Jumlah entri, dipakai di antarmuka untuk transparansi cakupan katalog. */
export const HS_CODE_COUNT = HS_CODES.length;
