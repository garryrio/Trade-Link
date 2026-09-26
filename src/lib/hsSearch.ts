import { HS_CODES, type HsCodeEntry } from "@/data/hsCodes";

/* ============================================================
   Pencarian kode HS berperingkat.

   Tujuannya: pengguna mengetik nama barang sehari-hari ("kopi gayo",
   "udang beku", "patchouli", "mesin cnc") dan mendapat pos tarif yang
   relevan, tanpa perlu hafal nomornya.

   Cara kerja singkat:
     1. Kueri dipecah menjadi kata.
     2. Setiap entri katalog diberi skor berdasarkan di mana kata itu cocok.
        Kecocokan pada kata kunci bernilai lebih tinggi daripada pada uraian,
        dan kecocokan utuh lebih tinggi daripada sebagian.
     3. Entri yang tidak mengandung SALAH SATU kata pun akan dibuang.
     4. Hasil diurutkan menurun berdasarkan skor.

   Fungsi di file ini murni dan tanpa efek samping, jadi bisa dipakai di
   server maupun di client.
   ============================================================ */

export interface HsSearchResult extends HsCodeEntry {
  /** Skor relevansi. Hanya bermakna untuk pengurutan, bukan nilai absolut. */
  score: number;
}

/** Normalkan teks: huruf kecil, buang tanda baca, rapikan spasi. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Apakah kueri terlihat seperti kode HS, mis. "0901", "0901.11", "090111". */
function looksLikeCode(query: string): boolean {
  return /^\d[\d.\s]*$/.test(query.trim());
}

/** Samakan bentuk kode agar "090111" dan "0901.11" bisa dibandingkan. */
function digitsOnly(text: string): string {
  return text.replace(/\D/g, "");
}

/**
 * Kata yang terlalu umum sehingga tidak membantu membedakan hasil.
 * Dibuang dari kueri supaya pencarian "minyak kelapa sawit" tidak
 * menghasilkan semua pos yang mengandung kata "minyak".
 */
const STOPWORDS = new Set([
  "dan", "atau", "yang", "untuk", "dari", "dengan", "pada", "ke", "di",
  "tidak", "bukan", "lainnya", "lain", "grade", "kualitas", "premium",
  "the", "and", "or", "for", "of", "with",
]);

function scoreEntry(entry: HsCodeEntry, words: string[]): number {
  const description = normalize(entry.description);
  const keywords = entry.keywords.map(normalize);

  let score = 0;
  let matchedWords = 0;

  for (const word of words) {
    let wordScore = 0;

    // Kecocokan persis dengan salah satu kata kunci: sinyal terkuat.
    if (keywords.some((k) => k === word)) {
      wordScore = 100;
    } else if (keywords.some((k) => k.split(" ").includes(word))) {
      // Kata itu adalah salah satu kata di dalam frasa kata kunci.
      wordScore = 60;
    } else if (keywords.some((k) => k.includes(word))) {
      // Kecocokan sebagian pada kata kunci.
      wordScore = 35;
    } else if (description.split(" ").includes(word)) {
      wordScore = 25;
    } else if (description.includes(word)) {
      wordScore = 12;
    }

    if (wordScore > 0) {
      matchedWords++;
      score += wordScore;
    }
  }

  if (matchedWords === 0) return 0;

  // Beri bonus besar bila SEMUA kata kueri cocok. Ini membuat kueri
  // spesifik seperti "udang beku" mengalahkan yang hanya cocok "udang".
  if (matchedWords === words.length && words.length > 1) {
    score += 50 * words.length;
  }

  // Sedikit menguntungkan uraian yang lebih pendek, karena pos yang
  // uraiannya ringkas biasanya lebih spesifik.
  score += Math.max(0, 40 - description.length / 4) / 10;

  return score;
}

export interface HsSearchOptions {
  /** Jumlah maksimum hasil yang dikembalikan. Default 8. */
  limit?: number;
}

export function searchHsCodes(
  query: string,
  options: HsSearchOptions = {},
): HsSearchResult[] {
  const limit = options.limit ?? 8;
  const raw = query.trim();
  if (raw.length < 2) return [];

  // --- Jalur khusus: pengguna mengetik angka, berarti mencari kode ---
  if (looksLikeCode(raw)) {
    const needle = digitsOnly(raw);
    return HS_CODES.filter((entry) => digitsOnly(entry.code).startsWith(needle))
      .slice(0, limit)
      .map((entry) => ({ ...entry, score: 1000 }));
  }

  // --- Jalur umum: pencarian berdasarkan kata ---
  const words = normalize(raw)
    .split(" ")
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

  if (words.length === 0) return [];

  return HS_CODES.map((entry) => ({ ...entry, score: scoreEntry(entry, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))
    .slice(0, limit);
}

/** Cari satu entri berdasarkan kode, toleran terhadap format penulisan. */
export function findHsByCode(code: string): HsCodeEntry | undefined {
  const needle = digitsOnly(code);
  if (!needle) return undefined;

  // Cocokkan persis lebih dulu, baru berdasarkan awalan 6 digit.
  return (
    HS_CODES.find((entry) => digitsOnly(entry.code) === needle) ??
    HS_CODES.find(
      (entry) =>
        needle.length > 6 && needle.startsWith(digitsOnly(entry.code)),
    )
  );
}

/**
 * Periksa format kode HS yang ditulis pengguna.
 * Sengaja permisif: 4 sampai 10 digit, pemisah titik opsional. Format yang
 * benar TIDAK menjamin posnya tepat, hanya bahwa bentuknya masuk akal.
 */
export function isValidHsFormat(code: string): boolean {
  const digits = digitsOnly(code);
  if (digits.length < 4 || digits.length > 10) return false;
  if (digits.length % 2 !== 0) return false;
  return /^\d{4}(\.\d{2}){0,3}$/.test(code.trim()) || /^\d{4,10}$/.test(code.trim());
}

/** Ubah rentetan digit menjadi bentuk berpemisah titik, mis. 090111 -> 0901.11 */
export function formatHsCode(code: string): string {
  const digits = digitsOnly(code);
  if (digits.length < 4) return code.trim();

  const parts = [digits.slice(0, 4)];
  for (let i = 4; i < digits.length; i += 2) {
    parts.push(digits.slice(i, i + 2));
  }
  return parts.join(".");
}
