import type { ShippingMode } from "@/lib/types";

/* ============================================================
   Estimasi waktu pengiriman dari Indonesia ke negara tujuan.

   SIFAT ANGKA DI FILE INI
   -----------------------
   Semua angka adalah RENTANG PERKIRAAN berdasarkan pola jadwal pelayaran
   niaga yang umum dari pelabuhan utama Indonesia. Angka ini BUKAN komitmen
   dan BUKAN kutipan dari pelayaran mana pun.

   Yang bisa menggeser angka ini jauh di luar rentang:
     - jadwal mingguan pelayaran dan jumlah transshipment (Singapura,
       Port Klang, Tanjung Pelepas, Colombo biasanya jadi titik pindah),
     - musim puncak, blank sailing, dan kemacetan pelabuhan,
     - cuaca, gangguan selat, dan pengalihan rute,
     - kecepatan pemeriksaan bea cukai di negara tujuan,
     - hari libur nasional di kedua ujung.

   Karena itu setiap tampilan yang memakai data ini WAJIB menyebut bahwa
   angkanya perkiraan dan menyarankan konfirmasi ke pelayaran atau
   forwarder untuk jadwal yang mengikat.
   ============================================================ */

export type TransitRegion =
  | "domestik"
  | "asean"
  | "asia-timur"
  | "asia-selatan"
  | "timur-tengah"
  | "eropa"
  | "amerika-utara"
  | "oseania"
  | "afrika"
  | "amerika-selatan";

export const REGION_META: Record<
  TransitRegion,
  { label: string; icon: string }
> = {
  domestik: { label: "Dalam negeri", icon: "🇮🇩" },
  asean: { label: "ASEAN", icon: "🌏" },
  "asia-timur": { label: "Asia Timur", icon: "🏯" },
  "asia-selatan": { label: "Asia Selatan", icon: "🕌" },
  "timur-tengah": { label: "Timur Tengah", icon: "🐪" },
  eropa: { label: "Eropa", icon: "🏰" },
  "amerika-utara": { label: "Amerika Utara", icon: "🗽" },
  oseania: { label: "Oseania", icon: "🦘" },
  afrika: { label: "Afrika", icon: "🦁" },
  "amerika-selatan": { label: "Amerika Selatan", icon: "⛰️" },
};

export interface TransitDestination {
  /** Nama negara dalam bahasa Indonesia. */
  country: string;
  region: TransitRegion;
  /** Nama lain yang mungkin ditulis pengguna, dicocokkan tanpa huruf besar. */
  aliases: string[];
  /** Pelayaran pelabuhan ke pelabuhan, hari. */
  seaMinDays: number;
  seaMaxDays: number;
  /** Penerbangan kargo bandara ke bandara, hari. */
  airMinDays: number;
  airMaxDays: number;
  /** Pelabuhan bongkar yang umum dipakai dari Indonesia. */
  commonPorts: string[];
  /** Catatan khusus rute ini. */
  note?: string;
}

/* Diurutkan per wilayah supaya mudah ditelusuri dan ditambah. */
export const TRANSIT_DESTINATIONS: TransitDestination[] = [
  /* ---------- Dalam negeri ---------- */
  {
    country: "Indonesia",
    region: "domestik",
    aliases: ["ina", "dalam negeri", "domestik"],
    seaMinDays: 2,
    seaMaxDays: 8,
    airMinDays: 1,
    airMaxDays: 2,
    commonPorts: ["Tanjung Priok", "Tanjung Perak", "Belawan", "Makassar"],
    note: "Antar pulau. Rute ke Indonesia timur bisa lebih lama karena jadwal kapal lebih jarang.",
  },

  /* ---------- ASEAN ---------- */
  {
    country: "Singapura",
    region: "asean",
    aliases: ["singapore", "sg"],
    seaMinDays: 2,
    seaMaxDays: 5,
    airMinDays: 1,
    airMaxDays: 2,
    commonPorts: ["Singapore (PSA)"],
    note: "Pelabuhan transshipment terbesar di kawasan, jadwal sangat sering.",
  },
  {
    country: "Malaysia",
    region: "asean",
    aliases: ["my", "malaysia barat"],
    seaMinDays: 3,
    seaMaxDays: 6,
    airMinDays: 1,
    airMaxDays: 3,
    commonPorts: ["Port Klang", "Tanjung Pelepas", "Penang"],
  },
  {
    country: "Thailand",
    region: "asean",
    aliases: ["th", "muangthai"],
    seaMinDays: 5,
    seaMaxDays: 10,
    airMinDays: 1,
    airMaxDays: 3,
    commonPorts: ["Laem Chabang", "Bangkok"],
  },
  {
    country: "Vietnam",
    region: "asean",
    aliases: ["vn", "viet nam"],
    seaMinDays: 5,
    seaMaxDays: 11,
    airMinDays: 1,
    airMaxDays: 3,
    commonPorts: ["Ho Chi Minh (Cat Lai)", "Hai Phong", "Da Nang"],
  },
  {
    country: "Filipina",
    region: "asean",
    aliases: ["philippines", "ph", "pilipina"],
    seaMinDays: 5,
    seaMaxDays: 11,
    airMinDays: 1,
    airMaxDays: 3,
    commonPorts: ["Manila", "Cebu", "Davao"],
  },
  {
    country: "Kamboja",
    region: "asean",
    aliases: ["cambodia", "kh"],
    seaMinDays: 7,
    seaMaxDays: 14,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Sihanoukville", "Phnom Penh"],
  },
  {
    country: "Myanmar",
    region: "asean",
    aliases: ["burma", "mm"],
    seaMinDays: 8,
    seaMaxDays: 16,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Yangon"],
  },
  {
    country: "Brunei Darussalam",
    region: "asean",
    aliases: ["brunei", "bn"],
    seaMinDays: 4,
    seaMaxDays: 9,
    airMinDays: 1,
    airMaxDays: 3,
    commonPorts: ["Muara"],
  },
  {
    country: "Laos",
    region: "asean",
    aliases: ["la", "rdr laos"],
    seaMinDays: 12,
    seaMaxDays: 20,
    airMinDays: 2,
    airMaxDays: 5,
    commonPorts: ["Laem Chabang lalu darat", "Da Nang lalu darat"],
    note: "Negara tanpa laut. Harus lanjut angkutan darat dari Thailand atau Vietnam.",
  },

  /* ---------- Asia Timur ---------- */
  {
    country: "Tiongkok",
    region: "asia-timur",
    aliases: ["china", "cina", "rrc", "cn", "republik rakyat tiongkok"],
    seaMinDays: 7,
    seaMaxDays: 17,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Shenzhen", "Guangzhou (Nansha)", "Shanghai", "Ningbo", "Qingdao", "Tianjin"],
    note: "Rentangnya lebar: pelabuhan selatan seperti Shenzhen jauh lebih cepat daripada pelabuhan utara seperti Tianjin.",
  },
  {
    country: "Hong Kong",
    region: "asia-timur",
    aliases: ["hk", "hongkong"],
    seaMinDays: 6,
    seaMaxDays: 12,
    airMinDays: 1,
    airMaxDays: 3,
    commonPorts: ["Hong Kong (Kwai Tsing)"],
  },
  {
    country: "Taiwan",
    region: "asia-timur",
    aliases: ["tw", "taipei"],
    seaMinDays: 8,
    seaMaxDays: 14,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Kaohsiung", "Keelung", "Taichung"],
  },
  {
    country: "Jepang",
    region: "asia-timur",
    aliases: ["japan", "jp", "nippon"],
    seaMinDays: 11,
    seaMaxDays: 20,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Tokyo", "Yokohama", "Osaka", "Kobe", "Nagoya"],
  },
  {
    country: "Korea Selatan",
    region: "asia-timur",
    aliases: ["korea", "south korea", "kr", "korsel"],
    seaMinDays: 10,
    seaMaxDays: 18,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Busan", "Incheon", "Gwangyang"],
  },

  /* ---------- Asia Selatan ---------- */
  {
    country: "India",
    region: "asia-selatan",
    aliases: ["in", "bharat"],
    seaMinDays: 10,
    seaMaxDays: 20,
    airMinDays: 2,
    airMaxDays: 5,
    commonPorts: ["Nhava Sheva (JNPT)", "Chennai", "Mundra", "Kolkata"],
  },
  {
    country: "Sri Lanka",
    region: "asia-selatan",
    aliases: ["lk", "srilanka", "ceylon"],
    seaMinDays: 8,
    seaMaxDays: 15,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Colombo"],
    note: "Colombo juga sering menjadi titik transshipment untuk rute ke Eropa dan Afrika Timur.",
  },
  {
    country: "Bangladesh",
    region: "asia-selatan",
    aliases: ["bd", "banglades"],
    seaMinDays: 12,
    seaMaxDays: 22,
    airMinDays: 2,
    airMaxDays: 5,
    commonPorts: ["Chattogram (Chittagong)"],
  },
  {
    country: "Pakistan",
    region: "asia-selatan",
    aliases: ["pk"],
    seaMinDays: 12,
    seaMaxDays: 22,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Karachi", "Port Qasim"],
  },

  /* ---------- Timur Tengah ---------- */
  {
    country: "Uni Emirat Arab",
    region: "timur-tengah",
    aliases: ["uae", "emirat", "dubai", "ae", "united arab emirates"],
    seaMinDays: 14,
    seaMaxDays: 24,
    airMinDays: 2,
    airMaxDays: 5,
    commonPorts: ["Jebel Ali (Dubai)", "Abu Dhabi (Khalifa)"],
  },
  {
    country: "Arab Saudi",
    region: "timur-tengah",
    aliases: ["saudi", "saudi arabia", "sa", "ksa"],
    seaMinDays: 16,
    seaMaxDays: 27,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Jeddah", "Dammam", "King Abdullah Port"],
  },
  {
    country: "Qatar",
    region: "timur-tengah",
    aliases: ["qa", "katar"],
    seaMinDays: 16,
    seaMaxDays: 26,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Hamad"],
  },
  {
    country: "Kuwait",
    region: "timur-tengah",
    aliases: ["kw"],
    seaMinDays: 18,
    seaMaxDays: 28,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Shuwaikh", "Shuaiba"],
  },
  {
    country: "Oman",
    region: "timur-tengah",
    aliases: ["om"],
    seaMinDays: 13,
    seaMaxDays: 23,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Sohar", "Salalah"],
  },
  {
    country: "Turki",
    region: "timur-tengah",
    aliases: ["turkey", "turkiye", "tr"],
    seaMinDays: 22,
    seaMaxDays: 34,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Istanbul (Ambarli)", "Mersin", "Izmir"],
  },
  {
    country: "Mesir",
    region: "timur-tengah",
    aliases: ["egypt", "eg"],
    seaMinDays: 18,
    seaMaxDays: 30,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Alexandria", "Port Said", "Damietta"],
  },

  /* ---------- Eropa ---------- */
  {
    country: "Belanda",
    region: "eropa",
    aliases: ["netherlands", "holland", "nl", "nederland"],
    seaMinDays: 28,
    seaMaxDays: 40,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Rotterdam", "Amsterdam"],
    note: "Rotterdam adalah pintu masuk utama kopi, rempah, dan minyak sawit Indonesia ke Eropa.",
  },
  {
    country: "Jerman",
    region: "eropa",
    aliases: ["germany", "de", "deutschland"],
    seaMinDays: 29,
    seaMaxDays: 42,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Hamburg", "Bremerhaven"],
  },
  {
    country: "Belgia",
    region: "eropa",
    aliases: ["belgium", "be"],
    seaMinDays: 28,
    seaMaxDays: 40,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Antwerpen", "Zeebrugge"],
  },
  {
    country: "Inggris",
    region: "eropa",
    aliases: ["uk", "united kingdom", "britain", "gb", "britania raya", "england"],
    seaMinDays: 30,
    seaMaxDays: 44,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Felixstowe", "Southampton", "London Gateway"],
  },
  {
    country: "Prancis",
    region: "eropa",
    aliases: ["france", "fr", "perancis"],
    seaMinDays: 27,
    seaMaxDays: 40,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Le Havre", "Marseille (Fos)"],
  },
  {
    country: "Italia",
    region: "eropa",
    aliases: ["italy", "it"],
    seaMinDays: 23,
    seaMaxDays: 35,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Genova", "La Spezia", "Trieste"],
  },
  {
    country: "Spanyol",
    region: "eropa",
    aliases: ["spain", "es", "espana"],
    seaMinDays: 23,
    seaMaxDays: 36,
    airMinDays: 3,
    airMaxDays: 6,
    commonPorts: ["Valencia", "Barcelona", "Algeciras"],
  },
  {
    country: "Polandia",
    region: "eropa",
    aliases: ["poland", "pl"],
    seaMinDays: 32,
    seaMaxDays: 46,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Gdansk", "Gdynia"],
  },
  {
    country: "Yunani",
    region: "eropa",
    aliases: ["greece", "gr"],
    seaMinDays: 21,
    seaMaxDays: 33,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Piraeus", "Thessaloniki"],
  },
  {
    country: "Portugal",
    region: "eropa",
    aliases: ["pt"],
    seaMinDays: 26,
    seaMaxDays: 38,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Lisboa", "Sines", "Leixoes"],
  },
  {
    country: "Swedia",
    region: "eropa",
    aliases: ["sweden", "se"],
    seaMinDays: 32,
    seaMaxDays: 46,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Gothenburg"],
  },
  {
    country: "Denmark",
    region: "eropa",
    aliases: ["dk", "denmark"],
    seaMinDays: 31,
    seaMaxDays: 45,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Aarhus", "Copenhagen"],
  },
  {
    country: "Rusia",
    region: "eropa",
    aliases: ["russia", "ru"],
    seaMinDays: 18,
    seaMaxDays: 50,
    airMinDays: 4,
    airMaxDays: 9,
    commonPorts: ["Vladivostok", "Novorossiysk", "St. Petersburg"],
    note: "Rentangnya sangat lebar. Vladivostok di Timur Jauh relatif dekat, sedangkan St. Petersburg harus memutari Eropa.",
  },

  /* ---------- Amerika Utara ---------- */
  {
    country: "Amerika Serikat",
    region: "amerika-utara",
    aliases: ["usa", "us", "united states", "amerika", "america"],
    seaMinDays: 18,
    seaMaxDays: 45,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Los Angeles", "Long Beach", "Oakland", "Seattle", "New York", "Savannah", "Houston"],
    note: "Beda pantai beda jauh: Pantai Barat sekitar 18-28 hari, Pantai Timur dan Gulf sekitar 30-45 hari karena lewat Terusan Panama atau Suez.",
  },
  {
    country: "Kanada",
    region: "amerika-utara",
    aliases: ["canada", "ca"],
    seaMinDays: 20,
    seaMaxDays: 46,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Vancouver", "Prince Rupert", "Montreal", "Halifax"],
    note: "Vancouver di pantai barat jauh lebih cepat daripada Montreal di pantai timur.",
  },
  {
    country: "Meksiko",
    region: "amerika-utara",
    aliases: ["mexico", "mx"],
    seaMinDays: 22,
    seaMaxDays: 36,
    airMinDays: 4,
    airMaxDays: 8,
    commonPorts: ["Manzanillo", "Lazaro Cardenas", "Veracruz"],
  },

  /* ---------- Oseania ---------- */
  {
    country: "Australia",
    region: "oseania",
    aliases: ["au", "aussie", "australi"],
    seaMinDays: 9,
    seaMaxDays: 21,
    airMinDays: 2,
    airMaxDays: 4,
    commonPorts: ["Fremantle", "Sydney", "Melbourne", "Brisbane", "Adelaide"],
    note: "Fremantle di pantai barat sekitar 9-13 hari, pantai timur seperti Sydney sekitar 14-21 hari.",
  },
  {
    country: "Selandia Baru",
    region: "oseania",
    aliases: ["new zealand", "nz"],
    seaMinDays: 16,
    seaMaxDays: 28,
    airMinDays: 2,
    airMaxDays: 5,
    commonPorts: ["Auckland", "Tauranga", "Lyttelton"],
  },
  {
    country: "Papua Nugini",
    region: "oseania",
    aliases: ["papua new guinea", "png"],
    seaMinDays: 7,
    seaMaxDays: 16,
    airMinDays: 2,
    airMaxDays: 5,
    commonPorts: ["Lae", "Port Moresby"],
  },

  /* ---------- Afrika ---------- */
  {
    country: "Afrika Selatan",
    region: "afrika",
    aliases: ["south africa", "za", "afsel"],
    seaMinDays: 21,
    seaMaxDays: 34,
    airMinDays: 3,
    airMaxDays: 7,
    commonPorts: ["Durban", "Cape Town", "Port Elizabeth"],
  },
  {
    country: "Kenya",
    region: "afrika",
    aliases: ["ke"],
    seaMinDays: 17,
    seaMaxDays: 30,
    airMinDays: 4,
    airMaxDays: 8,
    commonPorts: ["Mombasa"],
  },
  {
    country: "Tanzania",
    region: "afrika",
    aliases: ["tz"],
    seaMinDays: 18,
    seaMaxDays: 31,
    airMinDays: 4,
    airMaxDays: 8,
    commonPorts: ["Dar es Salaam"],
  },
  {
    country: "Nigeria",
    region: "afrika",
    aliases: ["ng"],
    seaMinDays: 28,
    seaMaxDays: 44,
    airMinDays: 4,
    airMaxDays: 9,
    commonPorts: ["Lagos (Apapa)", "Tin Can Island", "Onne"],
  },
  {
    country: "Maroko",
    region: "afrika",
    aliases: ["morocco", "ma"],
    seaMinDays: 24,
    seaMaxDays: 38,
    airMinDays: 4,
    airMaxDays: 8,
    commonPorts: ["Casablanca", "Tanger Med"],
  },
  {
    country: "Madagaskar",
    region: "afrika",
    aliases: ["madagascar", "mg"],
    seaMinDays: 17,
    seaMaxDays: 30,
    airMinDays: 4,
    airMaxDays: 9,
    commonPorts: ["Toamasina"],
  },

  /* ---------- Amerika Selatan ---------- */
  {
    country: "Brasil",
    region: "amerika-selatan",
    aliases: ["brazil", "br", "brasilia"],
    seaMinDays: 32,
    seaMaxDays: 50,
    airMinDays: 5,
    airMaxDays: 10,
    commonPorts: ["Santos", "Paranagua", "Rio de Janeiro"],
  },
  {
    country: "Chile",
    region: "amerika-selatan",
    aliases: ["cl", "chili"],
    seaMinDays: 28,
    seaMaxDays: 45,
    airMinDays: 5,
    airMaxDays: 10,
    commonPorts: ["San Antonio", "Valparaiso"],
  },
  {
    country: "Peru",
    region: "amerika-selatan",
    aliases: ["pe"],
    seaMinDays: 27,
    seaMaxDays: 43,
    airMinDays: 5,
    airMaxDays: 10,
    commonPorts: ["Callao"],
  },
  {
    country: "Argentina",
    region: "amerika-selatan",
    aliases: ["ar"],
    seaMinDays: 34,
    seaMaxDays: 52,
    airMinDays: 5,
    airMaxDays: 11,
    commonPorts: ["Buenos Aires", "Zarate"],
  },
  {
    country: "Kolombia",
    region: "amerika-selatan",
    aliases: ["colombia", "co"],
    seaMinDays: 29,
    seaMaxDays: 46,
    airMinDays: 5,
    airMaxDays: 10,
    commonPorts: ["Cartagena", "Buenaventura"],
  },
];

/** Nama negara untuk daftar saran di form. */
export const TRANSIT_COUNTRY_NAMES = TRANSIT_DESTINATIONS.map(
  (d) => d.country,
).sort((a, b) => a.localeCompare(b, "id"));

/**
 * Dipakai bila negara tujuan tidak ada di katalog.
 *
 * Rentangnya sengaja dibuat selebar seluruh dunia, dari tetangga ASEAN
 * sampai pantai timur Amerika Selatan. Memilih angka yang terkesan rapi
 * di sini justru berbahaya: pengguna akan menganggapnya perkiraan nyata
 * padahal kami sama sekali tidak tahu rutenya.
 */
const UNKNOWN_FALLBACK = {
  seaMinDays: 7,
  seaMaxDays: 50,
  airMinDays: 2,
  airMaxDays: 11,
};

/** Bersihkan teks negara agar bisa dicocokkan. */
function keyOf(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const LOOKUP = new Map<string, TransitDestination>();
for (const dest of TRANSIT_DESTINATIONS) {
  LOOKUP.set(keyOf(dest.country), dest);
  for (const alias of dest.aliases) LOOKUP.set(keyOf(alias), dest);
}

/**
 * true bila `needle` muncul sebagai rangkaian kata utuh di dalam `haystack`.
 *
 * Pencocokan dilakukan per kata, bukan per karakter. Kalau memakai
 * `String.includes` biasa, "Romania" akan dianggap cocok dengan "Oman"
 * karena huruf o-m-a-n memang ada di dalamnya. Kesalahan seperti itu
 * membuat estimasi rute melompat ke benua lain tanpa pengguna sadar.
 */
export function containsWords(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0 || needle.length > haystack.length) return false;

  for (let i = 0; i <= haystack.length - needle.length; i += 1) {
    let same = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) {
        same = false;
        break;
      }
    }
    if (same) return true;
  }

  return false;
}

/**
 * Cari negara tujuan dari teks bebas yang ditulis pengguna.
 *
 * Pencocokan bertahap: persis dulu, baru per kata. Nama yang lebih panjang
 * menang, supaya "Korea Selatan" tidak kalah oleh "Korea" saja ketika
 * pengguna menulis nama panjangnya.
 */
export function findTransitDestination(
  countryName: string,
): TransitDestination | null {
  const key = keyOf(countryName);
  if (!key) return null;

  const exact = LOOKUP.get(key);
  if (exact) return exact;

  // "Terbuka (global)" dan sejenisnya memang bukan satu negara.
  if (key.startsWith("terbuka") || key.includes("global")) return null;

  const keyWords = key.split(" ");
  let best: { dest: TransitDestination; score: number } | null = null;

  for (const [name, dest] of LOOKUP) {
    if (name.length < 3) continue;

    const nameWords = name.split(" ");
    if (
      !containsWords(keyWords, nameWords) &&
      !containsWords(nameWords, keyWords)
    ) {
      continue;
    }

    const score = name.length;
    if (!best || score > best.score) best = { dest, score };
  }

  return best?.dest ?? null;
}

/* ------------------------------------------------------------
   Tahapan di luar pelayaran

   Waktu tempuh yang dirasakan pembeli bukan cuma lama kapal berlayar.
   Ada waktu menyiapkan dokumen dan menunggu jadwal di awal, lalu
   waktu bongkar dan kepabeanan di ujung. Dua tahap ini sering lebih
   menentukan daripada pelayarannya sendiri, jadi ditampilkan terpisah
   supaya pengguna tidak kaget.
   ------------------------------------------------------------ */

const PRE_CARRIAGE: Record<
  ShippingMode,
  { minDays: number; maxDays: number; label: string }
> = {
  FCL: {
    minDays: 5,
    maxDays: 11,
    label: "Stuffing di gudang, trucking ke pelabuhan, dokumen ekspor, menunggu cut-off dan jadwal kapal",
  },
  LCL: {
    minDays: 8,
    maxDays: 16,
    label: "Kirim ke gudang konsolidasi, menunggu kontainer gabungan terisi, dokumen ekspor, lalu cut-off",
  },
  BULK: {
    minDays: 10,
    maxDays: 24,
    label: "Menunggu kapal sesuai laycan, antre tambatan, dan proses muat curah",
  },
  AIR: {
    minDays: 2,
    maxDays: 5,
    label: "Pengemasan, trucking ke bandara, dokumen ekspor, dan booking ruang kargo",
  },
};

const POST_CARRIAGE: Record<
  ShippingMode,
  { minDays: number; maxDays: number; label: string }
> = {
  FCL: {
    minDays: 3,
    maxDays: 9,
    label: "Bongkar, kepabeanan impor, dan pengantaran ke gudang pembeli",
  },
  LCL: {
    minDays: 5,
    maxDays: 13,
    label: "Bongkar, dekonsolidasi di gudang tujuan, kepabeanan impor, lalu pengantaran",
  },
  BULK: {
    minDays: 4,
    maxDays: 12,
    label: "Antre tambatan, bongkar curah, penimbangan, dan kepabeanan impor",
  },
  AIR: {
    minDays: 2,
    maxDays: 5,
    label: "Bongkar di terminal kargo, kepabeanan impor, dan pengantaran",
  },
};

/** Tambahan hari pelayaran khusus LCL, di luar pelayaran FCL biasa. */
const LCL_SEA_EXTRA = { minDays: 2, maxDays: 6 };

export interface TransitStage {
  label: string;
  detail: string;
  minDays: number;
  maxDays: number;
}

export interface TransitEstimate {
  /** Negara yang berhasil dicocokkan, atau teks asli bila tidak ketemu. */
  country: string;
  /** true bila negara ditemukan di katalog. */
  matched: boolean;
  region: TransitRegion | null;
  mode: ShippingMode;
  /** Tiga tahap: sebelum berlayar, pelayaran/penerbangan, setelah tiba. */
  stages: TransitStage[];
  /** Jumlah seluruh tahap. */
  totalMinDays: number;
  totalMaxDays: number;
  /** Pelabuhan bongkar yang umum dipakai. Kosong bila tidak diketahui. */
  commonPorts: string[];
  /** Hal yang perlu diwaspadai untuk rute ini. */
  notes: string[];
}

/**
 * Hitung perkiraan waktu dari barang siap di gudang penjual sampai
 * diterima di gudang pembeli.
 *
 * Mengembalikan null bila negara tujuan tidak bisa ditafsirkan, mis.
 * "Terbuka (global)" pada penawaran yang belum punya tujuan tetap.
 * Pemanggil harus menangani null, bukan menampilkan angka asal-asalan.
 */
export function estimateTransit(
  destinationCountry: string,
  mode: ShippingMode,
): TransitEstimate | null {
  const dest = findTransitDestination(destinationCountry);
  const region = dest?.region ?? null;

  if (!dest) {
    const key = keyOf(destinationCountry);
    if (!key || key.startsWith("terbuka") || key.includes("global")) return null;
  }

  const base = dest ?? null;
  const notes: string[] = [];

  let legMin: number;
  let legMax: number;
  let legLabel: string;
  let legDetail: string;

  if (mode === "AIR") {
    legMin = base?.airMinDays ?? UNKNOWN_FALLBACK.airMinDays;
    legMax = base?.airMaxDays ?? UNKNOWN_FALLBACK.airMaxDays;
    legLabel = "Penerbangan kargo";
    legDetail = "Bandara muat ke bandara bongkar, termasuk kemungkinan transit";
  } else {
    legMin = base?.seaMinDays ?? UNKNOWN_FALLBACK.seaMinDays;
    legMax = base?.seaMaxDays ?? UNKNOWN_FALLBACK.seaMaxDays;
    legLabel = "Pelayaran";
    legDetail = "Pelabuhan muat ke pelabuhan bongkar, termasuk transshipment";

    if (mode === "LCL") {
      legMin += LCL_SEA_EXTRA.minDays;
      legMax += LCL_SEA_EXTRA.maxDays;
      legDetail += ". LCL sering ikut kapal yang berhenti di lebih banyak pelabuhan";
    }
  }

  const pre = PRE_CARRIAGE[mode];
  const post = POST_CARRIAGE[mode];

  const stages: TransitStage[] = [
    {
      label: "Persiapan sampai kapal berangkat",
      detail: pre.label,
      minDays: pre.minDays,
      maxDays: pre.maxDays,
    },
    { label: legLabel, detail: legDetail, minDays: legMin, maxDays: legMax },
    {
      label: "Tiba sampai diterima pembeli",
      detail: post.label,
      minDays: post.minDays,
      maxDays: post.maxDays,
    },
  ];

  if (!base) {
    notes.push(
      `Negara "${destinationCountry.trim()}" belum ada di katalog rute kami, jadi angka di bawah dipakai sebagai pembanding kasar saja. Minta jadwal sebenarnya ke forwarder.`,
    );
  }
  if (base?.note) notes.push(base.note);

  if (mode === "LCL") {
    notes.push(
      "LCL menunggu kontainer gabungan terisi dulu di awal dan dibongkar lagi di gudang tujuan, jadi hampir selalu lebih lama daripada FCL pada rute yang sama.",
    );
  }
  if (mode === "BULK") {
    notes.push(
      "Pengiriman curah bergantung pada jadwal sewa kapal dan antrean tambatan, sehingga penyimpangan dari rentang ini wajar terjadi.",
    );
  }
  if (mode === "FCL") {
    notes.push(
      "Rentang ini berlaku untuk jadwal normal. Pada musim puncak atau saat terjadi blank sailing, tambahkan satu sampai dua pekan.",
    );
  }

  return {
    country: base?.country ?? destinationCountry.trim(),
    matched: Boolean(base),
    region,
    mode,
    stages,
    totalMinDays: stages.reduce((sum, s) => sum + s.minDays, 0),
    totalMaxDays: stages.reduce((sum, s) => sum + s.maxDays, 0),
    commonPorts: base?.commonPorts ?? [],
    notes,
  };
}

/** Teks ringkas, mis. "34-58 hari (sekitar 5-8 pekan)". */
export function formatTransitRange(minDays: number, maxDays: number): string {
  const minWeeks = Math.round(minDays / 7);
  const maxWeeks = Math.round(maxDays / 7);
  const weeks =
    minWeeks === maxWeeks
      ? `sekitar ${minWeeks} pekan`
      : `sekitar ${minWeeks}-${maxWeeks} pekan`;
  return `${minDays}-${maxDays} hari (${weeks})`;
}

/**
 * Perkiraan tanggal tiba bila dikirim mulai hari tertentu.
 * Dipakai untuk menunjukkan rentang tanggal, bukan satu tanggal pasti.
 */
export function transitArrivalWindow(
  estimate: TransitEstimate,
  from: Date = new Date(),
): { earliest: Date; latest: Date } {
  const earliest = new Date(from);
  earliest.setDate(earliest.getDate() + estimate.totalMinDays);

  const latest = new Date(from);
  latest.setDate(latest.getDate() + estimate.totalMaxDays);

  return { earliest, latest };
}
