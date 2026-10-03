import type { ContainerType, ShippingMode } from "@/lib/types";
import {
  containsWords,
  findTransitDestination,
  type TransitRegion,
} from "@/data/transitTimes";

/* ============================================================
   Tarif logistik ekspor - ANGKA PERKIRAAN

   BACA INI SEBELUM MEMAKAI ANGKA DI FILE INI
   ------------------------------------------
   Seluruh tarif di sini adalah PERKIRAAN KASAR yang dipakai sebagai nilai
   awal di kalkulator, supaya pengguna tidak menghadapi form kosong. Angka
   ini TIDAK diambil dari sistem penawaran pelayaran mana pun dan TIDAK
   mengikat siapa pun.

   Ongkos angkut laut khususnya bisa berubah dua kali lipat atau turun
   setengah dalam hitungan pekan, tergantung musim puncak, kapasitas kapal,
   biaya bahan bakar, surcharge (BAF, CAF, GRI, PSS), dan kondisi selat.
   Biaya EMKL juga berbeda antar pelabuhan dan antar penyedia jasa.

   Karena itu:
     - Setiap angka hasil kalkulator WAJIB bisa diedit pengguna.
     - Tampilan WAJIB menyebut bahwa ini perkiraan.
     - Untuk angka yang mengikat, pengguna harus meminta penawaran resmi
       dari pelayaran, forwarder, atau EMKL.
   ============================================================ */

/** Kurs acuan untuk mengubah tarif berdenominasi dolar ke rupiah. */
export const DEFAULT_USD_IDR = 16_250;

/* ------------------------------------------------------------
   Pelabuhan muat di Indonesia
   ------------------------------------------------------------ */

export interface ExportPort {
  id: string;
  /** Nama pelabuhan. */
  name: string;
  city: string;
  province: string;
  /** Kode UN/LOCODE. */
  locode: string;
  note?: string;
}

export const EXPORT_PORTS: ExportPort[] = [
  {
    id: "priok",
    name: "Tanjung Priok",
    city: "Jakarta",
    province: "DKI Jakarta",
    locode: "IDJKT",
    note: "Pelabuhan ekspor tersibuk di Indonesia, pilihan jadwal paling banyak.",
  },
  {
    id: "perak",
    name: "Tanjung Perak",
    city: "Surabaya",
    province: "Jawa Timur",
    locode: "IDSUB",
  },
  {
    id: "emas",
    name: "Tanjung Emas",
    city: "Semarang",
    province: "Jawa Tengah",
    locode: "IDSRG",
  },
  {
    id: "belawan",
    name: "Belawan",
    city: "Medan",
    province: "Sumatera Utara",
    locode: "IDBLW",
  },
  {
    id: "telukbayur",
    name: "Teluk Bayur",
    city: "Padang",
    province: "Sumatera Barat",
    locode: "IDTLB",
  },
  {
    id: "boombaru",
    name: "Boom Baru",
    city: "Palembang",
    province: "Sumatera Selatan",
    locode: "IDPLM",
  },
  {
    id: "panjang",
    name: "Panjang",
    city: "Bandar Lampung",
    province: "Lampung",
    locode: "IDPNJ",
  },
  {
    id: "dumai",
    name: "Dumai",
    city: "Dumai",
    province: "Riau",
    locode: "IDDUM",
    note: "Terminal cair dan curah, banyak dipakai untuk CPO dan turunannya.",
  },
  {
    id: "batam",
    name: "Batu Ampar",
    city: "Batam",
    province: "Kepulauan Riau",
    locode: "IDBTM",
  },
  {
    id: "makassar",
    name: "Soekarno-Hatta",
    city: "Makassar",
    province: "Sulawesi Selatan",
    locode: "IDUPG",
  },
  {
    id: "bitung",
    name: "Bitung",
    city: "Bitung",
    province: "Sulawesi Utara",
    locode: "IDBIT",
  },
  {
    id: "benoa",
    name: "Benoa",
    city: "Denpasar",
    province: "Bali",
    locode: "IDBOA",
  },
  {
    id: "banjarmasin",
    name: "Trisakti",
    city: "Banjarmasin",
    province: "Kalimantan Selatan",
    locode: "IDBDJ",
  },
  {
    id: "balikpapan",
    name: "Semayang",
    city: "Balikpapan",
    province: "Kalimantan Timur",
    locode: "IDBPN",
  },
  {
    id: "pontianak",
    name: "Dwikora",
    city: "Pontianak",
    province: "Kalimantan Barat",
    locode: "IDPNK",
  },
];

export function getExportPort(id: string): ExportPort | undefined {
  return EXPORT_PORTS.find((p) => p.id === id);
}

/* ------------------------------------------------------------
   Kota asal barang dan ongkos trucking ke pelabuhan terdekat
   ------------------------------------------------------------ */

export interface OriginCity {
  city: string;
  province: string;
  /** Pelabuhan muat yang biasa dipakai dari kota ini. */
  portId: string;
  /** Perkiraan jarak jalan ke pelabuhan, km. */
  distanceKm: number;
  /**
   * Perkiraan ongkos trucking satu arah per kontainer, termasuk lift on,
   * dalam rupiah. Belum termasuk menunggu (waiting time) dan tol di luar
   * rute normal.
   */
  truckingIdr: Record<ContainerType, number>;
  note?: string;
}

export const ORIGIN_CITIES: OriginCity[] = [
  /* ---------- Jawa ---------- */
  {
    city: "Jakarta",
    province: "DKI Jakarta",
    portId: "priok",
    distanceKm: 20,
    truckingIdr: { "20ft": 1_800_000, "40ft": 2_400_000, "45ft": 2_700_000 },
  },
  {
    city: "Bekasi",
    province: "Jawa Barat",
    portId: "priok",
    distanceKm: 45,
    truckingIdr: { "20ft": 2_100_000, "40ft": 2_800_000, "45ft": 3_150_000 },
  },
  {
    city: "Tangerang",
    province: "Banten",
    portId: "priok",
    distanceKm: 40,
    truckingIdr: { "20ft": 2_000_000, "40ft": 2_650_000, "45ft": 3_000_000 },
  },
  {
    city: "Bogor",
    province: "Jawa Barat",
    portId: "priok",
    distanceKm: 70,
    truckingIdr: { "20ft": 2_500_000, "40ft": 3_300_000, "45ft": 3_700_000 },
  },
  {
    city: "Karawang",
    province: "Jawa Barat",
    portId: "priok",
    distanceKm: 85,
    truckingIdr: { "20ft": 2_600_000, "40ft": 3_450_000, "45ft": 3_900_000 },
  },
  {
    city: "Bandung",
    province: "Jawa Barat",
    portId: "priok",
    distanceKm: 160,
    truckingIdr: { "20ft": 3_800_000, "40ft": 4_800_000, "45ft": 5_300_000 },
  },
  {
    city: "Cirebon",
    province: "Jawa Barat",
    portId: "priok",
    distanceKm: 230,
    truckingIdr: { "20ft": 4_300_000, "40ft": 5_500_000, "45ft": 6_100_000 },
  },
  {
    city: "Semarang",
    province: "Jawa Tengah",
    portId: "emas",
    distanceKm: 15,
    truckingIdr: { "20ft": 1_700_000, "40ft": 2_300_000, "45ft": 2_600_000 },
  },
  {
    city: "Jepara",
    province: "Jawa Tengah",
    portId: "emas",
    distanceKm: 75,
    truckingIdr: { "20ft": 2_600_000, "40ft": 3_400_000, "45ft": 3_800_000 },
    note: "Pusat furnitur kayu. Banyak eksportir memakai 40ft HC atau 45ft karena barangnya bervolume besar.",
  },
  {
    city: "Solo",
    province: "Jawa Tengah",
    portId: "emas",
    distanceKm: 110,
    truckingIdr: { "20ft": 3_200_000, "40ft": 4_200_000, "45ft": 4_650_000 },
  },
  {
    city: "Yogyakarta",
    province: "DI Yogyakarta",
    portId: "emas",
    distanceKm: 130,
    truckingIdr: { "20ft": 3_500_000, "40ft": 4_500_000, "45ft": 5_000_000 },
  },
  {
    city: "Surabaya",
    province: "Jawa Timur",
    portId: "perak",
    distanceKm: 12,
    truckingIdr: { "20ft": 1_700_000, "40ft": 2_300_000, "45ft": 2_600_000 },
  },
  {
    city: "Sidoarjo",
    province: "Jawa Timur",
    portId: "perak",
    distanceKm: 30,
    truckingIdr: { "20ft": 1_900_000, "40ft": 2_500_000, "45ft": 2_850_000 },
  },
  {
    city: "Malang",
    province: "Jawa Timur",
    portId: "perak",
    distanceKm: 95,
    truckingIdr: { "20ft": 3_000_000, "40ft": 3_900_000, "45ft": 4_350_000 },
  },
  {
    city: "Banyuwangi",
    province: "Jawa Timur",
    portId: "perak",
    distanceKm: 290,
    truckingIdr: { "20ft": 4_800_000, "40ft": 6_100_000, "45ft": 6_800_000 },
  },

  /* ---------- Sumatera ---------- */
  {
    city: "Medan",
    province: "Sumatera Utara",
    portId: "belawan",
    distanceKm: 25,
    truckingIdr: { "20ft": 1_600_000, "40ft": 2_200_000, "45ft": 2_500_000 },
  },
  {
    city: "Takengon",
    province: "Aceh",
    portId: "belawan",
    distanceKm: 330,
    truckingIdr: { "20ft": 7_500_000, "40ft": 9_500_000, "45ft": 10_500_000 },
    note: "Sentra kopi Gayo. Jalur pegunungan, waktu tempuh truk bisa 10-14 jam.",
  },
  {
    city: "Banda Aceh",
    province: "Aceh",
    portId: "belawan",
    distanceKm: 600,
    truckingIdr: { "20ft": 9_500_000, "40ft": 12_000_000, "45ft": 13_200_000 },
  },
  {
    city: "Padang",
    province: "Sumatera Barat",
    portId: "telukbayur",
    distanceKm: 10,
    truckingIdr: { "20ft": 1_500_000, "40ft": 2_000_000, "45ft": 2_300_000 },
  },
  {
    city: "Kerinci",
    province: "Jambi",
    portId: "telukbayur",
    distanceKm: 280,
    truckingIdr: { "20ft": 5_500_000, "40ft": 7_000_000, "45ft": 7_800_000 },
    note: "Sentra kayu manis dan kopi robusta.",
  },
  {
    city: "Palembang",
    province: "Sumatera Selatan",
    portId: "boombaru",
    distanceKm: 12,
    truckingIdr: { "20ft": 1_600_000, "40ft": 2_200_000, "45ft": 2_500_000 },
  },
  {
    city: "Bandar Lampung",
    province: "Lampung",
    portId: "panjang",
    distanceKm: 15,
    truckingIdr: { "20ft": 1_500_000, "40ft": 2_000_000, "45ft": 2_300_000 },
  },
  {
    city: "Pekanbaru",
    province: "Riau",
    portId: "dumai",
    distanceKm: 190,
    truckingIdr: { "20ft": 3_600_000, "40ft": 4_600_000, "45ft": 5_100_000 },
  },
  {
    city: "Batam",
    province: "Kepulauan Riau",
    portId: "batam",
    distanceKm: 15,
    truckingIdr: { "20ft": 1_500_000, "40ft": 2_000_000, "45ft": 2_300_000 },
  },

  /* ---------- Kalimantan, Sulawesi, Bali, Nusa Tenggara ---------- */
  {
    city: "Pontianak",
    province: "Kalimantan Barat",
    portId: "pontianak",
    distanceKm: 12,
    truckingIdr: { "20ft": 1_700_000, "40ft": 2_300_000, "45ft": 2_600_000 },
  },
  {
    city: "Banjarmasin",
    province: "Kalimantan Selatan",
    portId: "banjarmasin",
    distanceKm: 10,
    truckingIdr: { "20ft": 1_700_000, "40ft": 2_300_000, "45ft": 2_600_000 },
  },
  {
    city: "Balikpapan",
    province: "Kalimantan Timur",
    portId: "balikpapan",
    distanceKm: 10,
    truckingIdr: { "20ft": 1_800_000, "40ft": 2_400_000, "45ft": 2_700_000 },
  },
  {
    city: "Makassar",
    province: "Sulawesi Selatan",
    portId: "makassar",
    distanceKm: 12,
    truckingIdr: { "20ft": 1_600_000, "40ft": 2_200_000, "45ft": 2_500_000 },
  },
  {
    city: "Kendari",
    province: "Sulawesi Tenggara",
    portId: "makassar",
    distanceKm: 560,
    truckingIdr: { "20ft": 8_500_000, "40ft": 10_800_000, "45ft": 11_900_000 },
    note: "Perlu penyeberangan kapal feri, jadwalnya ikut memengaruhi waktu.",
  },
  {
    city: "Manado",
    province: "Sulawesi Utara",
    portId: "bitung",
    distanceKm: 45,
    truckingIdr: { "20ft": 2_100_000, "40ft": 2_800_000, "45ft": 3_150_000 },
  },
  {
    city: "Denpasar",
    province: "Bali",
    portId: "benoa",
    distanceKm: 15,
    truckingIdr: { "20ft": 1_800_000, "40ft": 2_400_000, "45ft": 2_700_000 },
  },
  {
    city: "Mataram",
    province: "Nusa Tenggara Barat",
    portId: "benoa",
    distanceKm: 160,
    truckingIdr: { "20ft": 4_200_000, "40ft": 5_400_000, "45ft": 6_000_000 },
    note: "Termasuk penyeberangan feri Lembar - Padangbai.",
  },
];

export const ORIGIN_CITY_NAMES = ORIGIN_CITIES.map((o) => o.city).sort((a, b) =>
  a.localeCompare(b, "id"),
);

function cityKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ORIGIN_LOOKUP = new Map<string, OriginCity>();
for (const origin of ORIGIN_CITIES) {
  ORIGIN_LOOKUP.set(cityKey(origin.city), origin);
}

/**
 * Cari kota asal dari teks bebas. Mengembalikan null bila tidak dikenali,
 * supaya pemanggil bisa memakai nilai default dan memberi tahu pengguna
 * bahwa ongkos trucking harus diisi sendiri.
 */
export function findOriginCity(cityName: string): OriginCity | null {
  const key = cityKey(cityName);
  if (!key) return null;

  const exact = ORIGIN_LOOKUP.get(key);
  if (exact) return exact;

  /* Terima penulisan seperti "Kota Bandung" atau "Bandung, Jawa Barat".
     Pencocokan per kata, bukan per karakter, supaya "Bandar Lampung"
     tidak tertukar dengan "Bandung". Nama terpanjang menang. */
  const keyWords = key.split(" ");
  let best: { origin: OriginCity; score: number } | null = null;

  for (const [name, origin] of ORIGIN_LOOKUP) {
    const nameWords = name.split(" ");
    if (
      !containsWords(keyWords, nameWords) &&
      !containsWords(nameWords, keyWords)
    ) {
      continue;
    }
    if (!best || name.length > best.score) {
      best = { origin, score: name.length };
    }
  }

  return best?.origin ?? null;
}

/** Ongkos trucking default bila kota asal tidak dikenali. */
export const FALLBACK_TRUCKING_IDR: Record<ContainerType, number> = {
  "20ft": 3_000_000,
  "40ft": 4_000_000,
  "45ft": 4_500_000,
};

/* ------------------------------------------------------------
   Ongkos angkut laut per kontainer
   ------------------------------------------------------------ */

export interface OceanFreightRate {
  /** Nama negara, sama dengan katalog di transitTimes.ts. */
  country: string;
  /** Perkiraan ongkos angkut dasar per kontainer, USD. */
  usd: Record<ContainerType, number>;
  note?: string;
}

/**
 * Perkiraan ongkos angkut dasar dari pelabuhan utama Indonesia.
 *
 * Yang SUDAH termasuk: ongkos angkut dasar (ocean freight) dan surcharge
 * bahan bakar yang biasanya sudah menyatu dalam kutipan all-in.
 * Yang BELUM termasuk: THC di kedua ujung, biaya dokumen, biaya EMKL,
 * surcharge musiman (GRI, PSS), dan biaya di negara tujuan.
 */
export const OCEAN_FREIGHT: OceanFreightRate[] = [
  /* ASEAN */
  { country: "Singapura", usd: { "20ft": 250, "40ft": 400, "45ft": 480 } },
  { country: "Malaysia", usd: { "20ft": 300, "40ft": 480, "45ft": 560 } },
  { country: "Thailand", usd: { "20ft": 450, "40ft": 700, "45ft": 810 } },
  { country: "Vietnam", usd: { "20ft": 400, "40ft": 650, "45ft": 750 } },
  { country: "Filipina", usd: { "20ft": 500, "40ft": 800, "45ft": 920 } },
  { country: "Kamboja", usd: { "20ft": 600, "40ft": 950, "45ft": 1_090 } },
  { country: "Myanmar", usd: { "20ft": 700, "40ft": 1_100, "45ft": 1_270 } },
  { country: "Brunei Darussalam", usd: { "20ft": 450, "40ft": 720, "45ft": 830 } },
  {
    country: "Laos",
    usd: { "20ft": 900, "40ft": 1_400, "45ft": 1_610 },
    note: "Termasuk perkiraan angkutan darat lanjutan dari Thailand atau Vietnam.",
  },

  /* Asia Timur */
  {
    country: "Tiongkok",
    usd: { "20ft": 600, "40ft": 900, "45ft": 1_040 },
    note: "Untuk pelabuhan selatan seperti Shenzhen. Pelabuhan utara seperti Tianjin biasanya lebih tinggi 20-35%.",
  },
  { country: "Hong Kong", usd: { "20ft": 500, "40ft": 800, "45ft": 920 } },
  { country: "Taiwan", usd: { "20ft": 550, "40ft": 850, "45ft": 980 } },
  { country: "Jepang", usd: { "20ft": 800, "40ft": 1_200, "45ft": 1_380 } },
  { country: "Korea Selatan", usd: { "20ft": 750, "40ft": 1_150, "45ft": 1_320 } },

  /* Asia Selatan */
  { country: "India", usd: { "20ft": 700, "40ft": 1_100, "45ft": 1_270 } },
  { country: "Sri Lanka", usd: { "20ft": 600, "40ft": 950, "45ft": 1_090 } },
  { country: "Bangladesh", usd: { "20ft": 800, "40ft": 1_250, "45ft": 1_440 } },
  { country: "Pakistan", usd: { "20ft": 850, "40ft": 1_300, "45ft": 1_500 } },

  /* Timur Tengah */
  { country: "Uni Emirat Arab", usd: { "20ft": 900, "40ft": 1_400, "45ft": 1_610 } },
  { country: "Arab Saudi", usd: { "20ft": 1_100, "40ft": 1_700, "45ft": 1_960 } },
  { country: "Qatar", usd: { "20ft": 1_050, "40ft": 1_600, "45ft": 1_840 } },
  { country: "Kuwait", usd: { "20ft": 1_150, "40ft": 1_750, "45ft": 2_010 } },
  { country: "Oman", usd: { "20ft": 900, "40ft": 1_400, "45ft": 1_610 } },
  { country: "Turki", usd: { "20ft": 1_400, "40ft": 2_200, "45ft": 2_530 } },
  { country: "Mesir", usd: { "20ft": 1_200, "40ft": 1_900, "45ft": 2_190 } },

  /* Eropa */
  { country: "Belanda", usd: { "20ft": 1_600, "40ft": 2_600, "45ft": 2_990 } },
  { country: "Jerman", usd: { "20ft": 1_650, "40ft": 2_700, "45ft": 3_110 } },
  { country: "Belgia", usd: { "20ft": 1_600, "40ft": 2_600, "45ft": 2_990 } },
  { country: "Inggris", usd: { "20ft": 1_700, "40ft": 2_800, "45ft": 3_220 } },
  { country: "Prancis", usd: { "20ft": 1_650, "40ft": 2_700, "45ft": 3_110 } },
  { country: "Italia", usd: { "20ft": 1_500, "40ft": 2_400, "45ft": 2_760 } },
  { country: "Spanyol", usd: { "20ft": 1_500, "40ft": 2_400, "45ft": 2_760 } },
  { country: "Polandia", usd: { "20ft": 1_800, "40ft": 2_900, "45ft": 3_340 } },
  { country: "Yunani", usd: { "20ft": 1_400, "40ft": 2_300, "45ft": 2_650 } },
  { country: "Portugal", usd: { "20ft": 1_550, "40ft": 2_500, "45ft": 2_880 } },
  { country: "Swedia", usd: { "20ft": 1_850, "40ft": 3_000, "45ft": 3_450 } },
  { country: "Denmark", usd: { "20ft": 1_800, "40ft": 2_900, "45ft": 3_340 } },
  {
    country: "Rusia",
    usd: { "20ft": 1_700, "40ft": 2_700, "45ft": 3_110 },
    note: "Vladivostok jauh lebih murah daripada St. Petersburg. Periksa juga pembatasan pembayaran dan sanksi.",
  },

  /* Amerika */
  {
    country: "Amerika Serikat",
    usd: { "20ft": 2_000, "40ft": 2_800, "45ft": 3_220 },
    note: "Angka ini untuk Pantai Barat (Los Angeles, Oakland). Pantai Timur dan Gulf biasanya lebih tinggi USD 800-1.400 per kontainer.",
  },
  {
    country: "Kanada",
    usd: { "20ft": 2_100, "40ft": 2_900, "45ft": 3_340 },
    note: "Vancouver lebih murah daripada Montreal.",
  },
  { country: "Meksiko", usd: { "20ft": 2_200, "40ft": 3_100, "45ft": 3_570 } },
  { country: "Brasil", usd: { "20ft": 2_200, "40ft": 3_500, "45ft": 4_030 } },
  { country: "Chile", usd: { "20ft": 2_100, "40ft": 3_300, "45ft": 3_800 } },
  { country: "Peru", usd: { "20ft": 2_000, "40ft": 3_200, "45ft": 3_680 } },
  { country: "Argentina", usd: { "20ft": 2_300, "40ft": 3_600, "45ft": 4_140 } },
  { country: "Kolombia", usd: { "20ft": 2_100, "40ft": 3_400, "45ft": 3_910 } },

  /* Oseania */
  {
    country: "Australia",
    usd: { "20ft": 900, "40ft": 1_500, "45ft": 1_730 },
    note: "Fremantle paling murah. Sydney dan Melbourne biasanya lebih tinggi USD 150-350.",
  },
  { country: "Selandia Baru", usd: { "20ft": 1_200, "40ft": 1_900, "45ft": 2_190 } },
  { country: "Papua Nugini", usd: { "20ft": 800, "40ft": 1_300, "45ft": 1_500 } },

  /* Afrika */
  { country: "Afrika Selatan", usd: { "20ft": 1_500, "40ft": 2_400, "45ft": 2_760 } },
  { country: "Kenya", usd: { "20ft": 1_400, "40ft": 2_200, "45ft": 2_530 } },
  { country: "Tanzania", usd: { "20ft": 1_400, "40ft": 2_200, "45ft": 2_530 } },
  { country: "Nigeria", usd: { "20ft": 1_900, "40ft": 3_000, "45ft": 3_450 } },
  { country: "Maroko", usd: { "20ft": 1_700, "40ft": 2_700, "45ft": 3_110 } },
  { country: "Madagaskar", usd: { "20ft": 1_500, "40ft": 2_400, "45ft": 2_760 } },

  /* Dalam negeri */
  {
    country: "Indonesia",
    usd: { "20ft": 350, "40ft": 550, "45ft": 640 },
    note: "Pengiriman antar pulau. Bukan ekspor, jadi tidak ada PEB, bea keluar, maupun COO.",
  },
];

const FREIGHT_LOOKUP = new Map<string, OceanFreightRate>();
for (const rate of OCEAN_FREIGHT) {
  FREIGHT_LOOKUP.set(rate.country, rate);
}

/** Dipakai bila negara tujuan tidak ada di tabel ongkos angkut. */
const FALLBACK_OCEAN_USD: Record<ContainerType, number> = {
  "20ft": 1_500,
  "40ft": 2_400,
  "45ft": 2_760,
};

/** Perkiraan tarif kargo udara per kg berdasarkan wilayah, USD. */
export const AIR_FREIGHT_USD_PER_KG: Record<TransitRegion, number> = {
  domestik: 0.9,
  asean: 1.8,
  "asia-timur": 2.6,
  "asia-selatan": 2.8,
  "timur-tengah": 3.4,
  eropa: 4.6,
  "amerika-utara": 5.2,
  oseania: 3.1,
  afrika: 5.6,
  "amerika-selatan": 7.2,
};

/**
 * Pembagi berat volume untuk kargo udara (kg per m³).
 *
 * IATA memakai 1 m³ = 167 kg. Barang ringan bervolume besar ditagih
 * memakai angka ini, bukan berat aslinya.
 */
export const AIR_VOLUMETRIC_KG_PER_CBM = 167;

/** Minimum tagihan LCL, dalam satuan W/M (ton atau m³, mana yang lebih besar). */
export const LCL_MINIMUM_WM = 2;

export interface FreightEstimate {
  /** Ongkos angkut total dalam USD. */
  usd: number;
  /** Ongkos angkut total dalam rupiah. */
  idr: number;
  /** Penjelasan singkat cara angkanya didapat. */
  basis: string;
  /** true bila negara tujuan tidak ditemukan dan dipakai angka umum. */
  fallback: boolean;
  /** Catatan rute, bila ada. */
  note: string | null;
  /** Untuk LCL dan udara: satuan yang ditagih. */
  chargeableUnits: number | null;
  chargeableUnitLabel: string | null;
}

export interface FreightQuery {
  destinationCountry: string;
  mode: ShippingMode;
  containerType: ContainerType;
  containerCount: number;
  /** Berat total kiriman, kg. Dipakai untuk LCL, curah, dan udara. */
  weightKg: number;
  /** Volume total kiriman, m³. Dipakai untuk LCL dan udara. */
  volumeCbm: number;
  /** Kurs yang dipakai mengubah USD ke rupiah. */
  usdIdr: number;
}

/**
 * Perkirakan ongkos angkut internasional.
 *
 * Cara hitung per metode:
 *  - FCL  : tarif per kontainer dikali jumlah kontainer.
 *  - LCL  : tarif per W/M, yaitu berat dalam ton atau volume dalam m³,
 *           mana yang lebih besar, dengan minimum 2 W/M. Tarif per W/M
 *           diturunkan dari tarif 20ft dibagi 14, karena satu 20ft yang
 *           terisi penuh kira-kira memuat 25-28 W/M dan konsolidator
 *           mengambil selisihnya sebagai margin dan biaya CFS.
 *  - BULK : tarif per ton, diturunkan dari tarif 20ft dibagi 22 ton, lalu
 *           dikali 0,8 karena kapal curah lebih murah per ton.
 *  - AIR  : tarif per kg dikali berat tertagih, yaitu berat asli atau
 *           berat volume (m³ x 167), mana yang lebih besar.
 */
export function estimateFreight(query: FreightQuery): FreightEstimate {
  const dest = findTransitDestination(query.destinationCountry);
  const rate = dest ? FREIGHT_LOOKUP.get(dest.country) : undefined;
  const fallback = !rate;
  const perContainer = rate?.usd ?? FALLBACK_OCEAN_USD;
  const usdIdr = query.usdIdr > 0 ? query.usdIdr : DEFAULT_USD_IDR;

  const toResult = (
    usd: number,
    basis: string,
    chargeableUnits: number | null = null,
    chargeableUnitLabel: string | null = null,
  ): FreightEstimate => ({
    usd,
    idr: usd * usdIdr,
    basis,
    fallback,
    note: rate?.note ?? null,
    chargeableUnits,
    chargeableUnitLabel,
  });

  if (query.mode === "AIR") {
    const region = dest?.region ?? "asean";
    const perKg = AIR_FREIGHT_USD_PER_KG[region];
    const volumetricKg = Math.max(query.volumeCbm, 0) * AIR_VOLUMETRIC_KG_PER_CBM;
    const chargeableKg = Math.max(Math.max(query.weightKg, 0), volumetricKg);

    return toResult(
      perKg * chargeableKg,
      `USD ${perKg.toFixed(2)} per kg x ${Math.round(chargeableKg).toLocaleString("id-ID")} kg tertagih` +
        (volumetricKg > query.weightKg
          ? " (dipakai berat volume, karena lebih besar daripada berat asli)"
          : ""),
      chargeableKg,
      "kg tertagih",
    );
  }

  if (query.mode === "LCL") {
    const perWm = Math.max(30, perContainer["20ft"] / 14);
    const tons = Math.max(query.weightKg, 0) / 1000;
    const wm = Math.max(LCL_MINIMUM_WM, Math.max(tons, Math.max(query.volumeCbm, 0)));

    return toResult(
      perWm * wm,
      `USD ${perWm.toFixed(2)} per W/M x ${wm.toFixed(2)} W/M` +
        (wm === LCL_MINIMUM_WM ? " (kena minimum 2 W/M)" : ""),
      wm,
      "W/M",
    );
  }

  if (query.mode === "BULK") {
    const perTon = (perContainer["20ft"] / 22) * 0.8;
    const tons = Math.max(query.weightKg, 0) / 1000;

    return toResult(
      perTon * tons,
      `USD ${perTon.toFixed(2)} per ton x ${tons.toLocaleString("id-ID", { maximumFractionDigits: 2 })} ton`,
      tons,
      "ton",
    );
  }

  const count = Math.max(Math.round(query.containerCount), 1);
  const perUnit = perContainer[query.containerType];

  return toResult(
    perUnit * count,
    `USD ${perUnit.toLocaleString("en-US")} per kontainer ${query.containerType} x ${count} kontainer`,
    count,
    `kontainer ${query.containerType}`,
  );
}

/* ------------------------------------------------------------
   Biaya EMKL di pelabuhan muat
   ------------------------------------------------------------ */

/**
 * Perkiraan biaya penanganan di pelabuhan muat, rupiah per kontainer.
 *
 * Angka 20ft mengikuti besaran yang umum terlihat pada lembar biaya EMKL
 * di Tanjung Priok. Untuk 40ft dan 45ft dipakai pengali yang lazim, karena
 * tarif pelabuhan memang tidak naik dua kali lipat saat ukuran naik.
 */
export const EMKL_FEES: Record<
  ContainerType,
  {
    /** Lift on di gudang sudah masuk ongkos trucking, ini untuk di pelabuhan. */
    liftOnOff: number;
    /** Penumpukan / storage di lapangan penumpukan. */
    stackingPortCharges: number;
    /** Terminal Handling Charge. */
    thc: number;
  }
> = {
  "20ft": { liftOnOff: 450_000, stackingPortCharges: 400_000, thc: 1_396_500 },
  "40ft": { liftOnOff: 675_000, stackingPortCharges: 600_000, thc: 2_094_750 },
  "45ft": { liftOnOff: 760_000, stackingPortCharges: 680_000, thc: 2_356_000 },
};

/** Biaya tetap per pengapalan, rupiah. Tidak bergantung ukuran kontainer. */
export const SHIPMENT_FEES = {
  /** Jasa pengurusan custom clearance / PEB oleh PPJK. */
  customClearance: 300_000,
  /** Administrasi dokumen pengapalan, umumnya disebut B/L fee. */
  billOfLading: 900_000,
};

/* ------------------------------------------------------------
   Biaya dokumen ekspor
   ------------------------------------------------------------ */

export interface DocumentFee {
  id: string;
  label: string;
  /** Perkiraan biaya, rupiah. */
  idr: number;
  /** true bila biayanya dihitung per kontainer, bukan per pengapalan. */
  perContainer: boolean;
  /** Penjelasan kapan dokumen ini diperlukan. */
  when: string;
  /** Dicentang secara default di kalkulator. */
  defaultOn: boolean;
}

export const DOCUMENT_FEES: DocumentFee[] = [
  {
    id: "coo",
    label: "Certificate of Origin (SKA)",
    idr: 225_000,
    perContainer: false,
    when: "Diminta pembeli untuk klaim tarif preferensi FTA. Diterbitkan lewat e-SKA Kemendag.",
    defaultOn: true,
  },
  {
    id: "phyto",
    label: "Phytosanitary Certificate",
    idr: 550_000,
    perContainer: false,
    when: "Wajib untuk produk tumbuhan: kopi, rempah, biji-bijian, kayu, hasil kebun.",
    defaultOn: true,
  },
  {
    id: "fumigation",
    label: "Fumigasi",
    idr: 1_200_000,
    perContainer: true,
    when: "Diminta banyak negara untuk komoditas kering dan kemasan kayu. Negara tujuan tertentu mewajibkan standar ISPM 15.",
    defaultOn: false,
  },
  {
    id: "inspection",
    label: "Pre-shipment Inspection (surveyor)",
    idr: 3_500_000,
    perContainer: false,
    when: "Dipakai bila pembeli minta verifikasi pihak ketiga seperti SGS atau Intertek, atau bila L/C mensyaratkannya.",
    defaultOn: false,
  },
  {
    id: "coa",
    label: "Certificate of Analysis (uji laboratorium)",
    idr: 1_500_000,
    perContainer: false,
    when: "Untuk produk pangan, minyak atsiri, dan bahan kimia yang mutunya harus dibuktikan per lot.",
    defaultOn: false,
  },
  {
    id: "health",
    label: "Health Certificate / Sertifikat Karantina Ikan",
    idr: 500_000,
    perContainer: false,
    when: "Untuk produk perikanan dan pangan hewani, diterbitkan BKIPM atau otoritas terkait.",
    defaultOn: false,
  },
  {
    id: "halal",
    label: "Sertifikat Halal",
    idr: 2_500_000,
    perContainer: false,
    when: "Diminta pasar Timur Tengah, Malaysia, dan beberapa pembeli pangan. Biaya tergantung jumlah produk yang disertifikasi.",
    defaultOn: false,
  },
];

/* ------------------------------------------------------------
   Biaya bank
   ------------------------------------------------------------ */

/**
 * Perkiraan biaya bank, rupiah. Besarnya berbeda antar bank dan
 * tergantung metode pembayaran yang dipakai.
 */
export const BANK_FEES = {
  /** Pemberitahuan L/C masuk dari bank penerbit. */
  lcAdvising: 350_000,
  /** Negosiasi dokumen L/C. Umumnya persentase dari nilai tagihan. */
  lcNegotiationPercent: 0.15,
  lcNegotiationMinimum: 750_000,
  /** Pengiriman dokumen asli ke bank pembeli. */
  documentCourier: 450_000,
  /** Biaya penanganan transfer dan administrasi. */
  handling: 300_000,
  /**
   * Biaya diskrepansi: dikenakan bila dokumen tidak sesuai syarat L/C.
   * Tidak otomatis muncul, tapi sering terjadi pada ekspor pertama.
   */
  discrepancy: 1_200_000,
};

/* ------------------------------------------------------------
   Asuransi, komisi agen, dan bea keluar
   ------------------------------------------------------------ */

/** Tarif asuransi kargo default, persen dari nilai yang dipertanggungkan. */
export const DEFAULT_CARGO_INSURANCE_PERCENT = 0.25;

/**
 * Nilai pertanggungan yang lazim: 110% dari nilai CFR.
 * Tambahan 10% mewakili perkiraan keuntungan dan biaya pembeli.
 */
export const INSURANCE_COVERAGE_MULTIPLIER = 1.1;

/** Komisi agen atau perantara, persen dari nilai FOB. Lazimnya 2-5%. */
export const DEFAULT_AGENT_COMMISSION_PERCENT = 3;

/**
 * Komoditas yang umumnya terkena Bea Keluar.
 *
 * SENGAJA TIDAK MENCANTUMKAN ANGKA TARIF. Bea keluar sawit memakai tarif
 * berjenjang yang ditinjau berkala mengikuti harga referensi, sedangkan
 * mineral memakai skema sendiri yang berubah seiring kebijakan hilirisasi.
 * Mencantumkan angka di sini akan cepat basi dan berisiko menyesatkan.
 *
 * Yang bisa kami lakukan dengan jujur: mengingatkan pengguna untuk
 * memeriksa tarif yang berlaku sebelum menetapkan harga.
 */
export const EXPORT_DUTY_WATCHLIST = [
  "Kelapa sawit: CPO, CPKO, dan produk turunannya",
  "Kayu bulat, kayu olahan tertentu, dan rotan",
  "Kulit mentah dan kulit setengah jadi",
  "Biji kakao",
  "Mineral logam hasil pengolahan tertentu",
  "Produk hasil pengolahan mineral yang masih diatur pembatasan ekspornya",
];

/** Tempat memeriksa tarif bea keluar yang sedang berlaku. */
export const EXPORT_DUTY_REFERENCE_URL = "https://insw.go.id/intr";
