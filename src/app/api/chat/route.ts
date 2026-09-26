import { NextResponse } from "next/server";

/* ============================================================
   /api/chat - asisten AI TradeLink.

   Memanggil Gemini REST API langsung dari server, tanpa SDK.
   Alasan memilih REST:
     - Tidak terikat versi SDK yang berubah cepat.
     - Tidak menambah dependency.

   KEAMANAN: GEMINI_API_KEY hanya dibaca di sini (server). Key tidak
   pernah dikirim ke browser. Jangan pernah memberi prefix NEXT_PUBLIC_
   pada variabel ini, karena itu akan membocorkannya ke client bundle.
   ============================================================ */

export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const DEFAULT_THINKING_LEVEL = "low";

/** Batas agar satu permintaan tidak membengkak tanpa kendali. */
const MAX_MESSAGES = 30;
const MAX_CHARS_PER_MESSAGE = 4_000;
const MAX_TOTAL_CHARS = 24_000;

const SYSTEM_PROMPT = `Kamu adalah Asisten TradeLink, pendamping untuk eksportir dan importir Indonesia di dalam aplikasi TradeLink.

PERAN DAN CAKUPAN
- Bantu soal perdagangan lintas negara: prosedur ekspor impor, penggolongan kode HS, Incoterms, dokumen, kepabeanan, bea masuk dan pajak impor, sertifikasi, logistik, metode pembayaran internasional, riset pasar, pencarian pembeli atau pemasok, serta penyusunan harga.
- Kalau pertanyaan benar-benar tidak berhubungan dengan perdagangan, jawab singkat dan arahkan kembali ke topik yang bisa kamu bantu. Jangan kaku: pertanyaan tentang usaha, keuangan dagang, atau operasional yang menyentuh ekspor impor tetap layak dibantu.

CARA MENJAWAB
- Gunakan bahasa Indonesia yang jelas dan langsung, kecuali pengguna menulis dalam bahasa lain. Kalau begitu, ikuti bahasa pengguna.
- Praktis dan konkret. Beri langkah bernomor bila menjelaskan proses, dan sebutkan lembaga atau sistem yang harus dituju.
- Panjang jawaban proporsional. Pertanyaan sederhana dijawab singkat, jangan diberi struktur berlebihan.
- Pakai markdown sederhana: paragraf, daftar bernomor atau bertanda, dan penebalan untuk istilah kunci. Hindari tabel besar dan hindari heading berjenjang banyak.

KEJUJURAN SOAL ANGKA - INI PENTING
- JANGAN menyebutkan tarif bea masuk, tarif PPN, tarif PPh Pasal 22, atau kode HS spesifik seolah-olah itu angka pasti yang kamu tahu terkini. Tarif berubah dan berbeda per kode HS serta per negara asal.
- Yang boleh kamu lakukan: menjelaskan CARA menghitungnya, menjelaskan STRUKTUR pungutannya, memberi contoh hitungan dengan angka yang kamu sebut jelas sebagai contoh, dan mengarahkan pengguna memverifikasi tarif sebenarnya.
- Untuk verifikasi tarif dan ketentuan larangan pembatasan, arahkan ke Indonesia National Trade Repository di insw.go.id/intr atau ke Bea Cukai di beacukai.go.id.
- Kalau kamu tidak yakin, katakan tidak yakin. Jangan mengarang nama peraturan, nomor peraturan, atau angka.

STRUKTUR BIAYA IMPOR INDONESIA (untuk menjelaskan cara hitung)
1. Nilai CIF = FOB + ongkos angkut + asuransi.
2. CIF dikonversi ke rupiah memakai NDPBM (kurs pajak yang ditetapkan pemerintah), bukan kurs bank.
3. Bea Masuk = tarif kode HS dikalikan nilai CIF rupiah.
4. Nilai Impor = CIF rupiah + Bea Masuk.
5. PPN Impor dan PPh Pasal 22 Impor dihitung dari Nilai Impor, bukan dari CIF saja.
6. Tambahkan biaya lokal: terminal handling, jasa PPJK, trucking, penumpukan.

FITUR APLIKASI YANG BISA KAMU REKOMENDASIKAN
- Halaman Marketplace di /marketplace untuk menelusuri penawaran eksportir dan permintaan importir.
- Halaman Buat Postingan di /posting untuk memasang penawaran atau permintaan.
- Halaman Kalkulator di /kalkulator untuk menghitung landed cost impor atau menyusun harga jual ekspor.
- Halaman Harga Komoditas di /harga. Ingatkan bahwa angka di halaman itu masih simulasi.
- Halaman Edukasi di /edukasi untuk panduan, daftar dokumen, kamus istilah, dan tautan regulasi resmi.

BATASAN
- Kamu bukan konsultan kepabeanan, penasihat hukum, atau penasihat pajak berlisensi. Untuk keputusan bernilai besar atau kasus rumit, sarankan berkonsultasi dengan PPJK, konsultan pajak, atau kuasa hukum.
- Jangan pernah menyarankan mengecilkan nilai invoice, salah menggolongkan kode HS, atau cara lain menghindari pungutan secara tidak sah. Kalau ditanya hal seperti itu, tolak dan jelaskan risikonya, lalu tawarkan jalan yang sah seperti memanfaatkan tarif preferensi FTA.`;

interface IncomingMessage {
  role: "user" | "model";
  content: string;
}

/** Periksa dan rapikan riwayat percakapan dari client. */
function parseMessages(body: unknown): IncomingMessage[] | null {
  if (typeof body !== "object" || body === null) return null;

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) return null;

  const messages: IncomingMessage[] = [];

  for (const item of raw) {
    if (typeof item !== "object" || item === null) continue;

    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "model") continue;
    if (typeof content !== "string") continue;

    const trimmed = content.trim();
    if (!trimmed) continue;

    messages.push({
      role,
      content: trimmed.slice(0, MAX_CHARS_PER_MESSAGE),
    });
  }

  if (messages.length === 0) return null;

  // Ambil hanya bagian akhir percakapan bila terlalu panjang.
  const recent = messages.slice(-MAX_MESSAGES);

  // Gemini mensyaratkan giliran terakhir berasal dari user dan tidak kosong.
  if (recent[recent.length - 1]?.role !== "user") return null;

  const totalChars = recent.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    // Buang dari yang paling lama sampai muat.
    let running = totalChars;
    while (recent.length > 1 && running > MAX_TOTAL_CHARS) {
      const removed = recent.shift();
      running -= removed?.content.length ?? 0;
    }
  }

  return recent;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      {
        code: "NO_API_KEY",
        error:
          "Asisten AI belum dikonfigurasi. Tambahkan GEMINI_API_KEY ke file .env.local lalu jalankan ulang server.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "BAD_JSON", error: "Body harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  const messages = parseMessages(body);
  if (!messages) {
    return NextResponse.json(
      {
        code: "BAD_MESSAGES",
        error:
          "Format percakapan tidak valid. Pesan terakhir harus dari pengguna dan tidak boleh kosong.",
      },
      { status: 400 },
    );
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
  const thinkingLevel =
    process.env.GEMINI_THINKING_LEVEL?.trim() || DEFAULT_THINKING_LEVEL;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${encodeURIComponent(model)}:streamGenerateContent?alt=sse`;

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Key dikirim lewat header, jadi tidak pernah muncul di URL atau log.
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 2_048,
          // Catatan: model Gemini 3 ke atas tidak menerima temperature,
          // topP, topK, atau candidateCount. Gunakan thinkingLevel.
          thinkingConfig: { thinkingLevel },
        },
      }),
    });
  } catch {
    return NextResponse.json(
      {
        code: "UPSTREAM_UNREACHABLE",
        error:
          "Tidak bisa menghubungi layanan AI. Periksa koneksi internet server lalu coba lagi.",
      },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    // Catat detail di server untuk penelusuran, tapi jangan kirim ke client.
    const detail = await upstream.text().catch(() => "");
    console.error(
      `[api/chat] Gemini menolak permintaan. status=${upstream.status} model=${model} detail=${detail.slice(0, 500)}`,
    );

    const message =
      upstream.status === 400
        ? `Permintaan ditolak layanan AI. Periksa apakah nama model "${model}" benar dan didukung API key Anda.`
        : upstream.status === 401 || upstream.status === 403
          ? "API key ditolak. Pastikan GEMINI_API_KEY masih berlaku dan punya akses ke model ini."
          : upstream.status === 429
            ? "Kuota permintaan sedang penuh. Tunggu sebentar lalu coba lagi."
            : "Layanan AI sedang bermasalah. Coba lagi beberapa saat lagi.";

    return NextResponse.json(
      { code: "UPSTREAM_ERROR", error: message },
      { status: 502 },
    );
  }

  /* ---- Ubah SSE dari Gemini menjadi aliran teks biasa ----

     Satu event SSE bisa terbelah di antara dua chunk jaringan, jadi kita
     menyimpan sisa potongan di `buffer` dan hanya memproses baris yang
     sudah lengkap (diakhiri newline). Sisanya menunggu chunk berikutnya. */
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";

      try {
        for (;;) {
          const { done, value } = await reader.read();

          if (done) {
            // Proses sisa terakhir yang mungkin tidak diakhiri newline.
            const tail = extractText(buffer);
            if (tail) controller.enqueue(encoder.encode(tail));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });

          // Sisakan bagian setelah newline terakhir untuk putaran berikutnya.
          const lastNewline = buffer.lastIndexOf("\n");
          if (lastNewline === -1) continue;

          const complete = buffer.slice(0, lastNewline);
          buffer = buffer.slice(lastNewline + 1);

          const text = extractText(complete);
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (error) {
        console.error("[api/chat] Aliran dari Gemini terputus:", error);
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
    cancel() {
      // Pengguna menutup halaman atau membatalkan: tutup koneksi ke Gemini.
      void reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      // Cegah proxy menahan buffer supaya teks muncul bertahap.
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * Ambil potongan teks dari payload SSE Gemini.
 *
 * Bentuk tiap event: `data: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}`
 * Bagian "thought" (penalaran internal model) sengaja dilewati.
 */
function extractText(chunk: string): string {
  let output = "";

  for (const line of chunk.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;

    const payload = trimmed.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;

    try {
      const parsed = JSON.parse(payload) as {
        candidates?: {
          content?: { parts?: { text?: string; thought?: boolean }[] };
        }[];
      };

      for (const candidate of parsed.candidates ?? []) {
        for (const part of candidate.content?.parts ?? []) {
          if (part.thought) continue;
          if (typeof part.text === "string") output += part.text;
        }
      }
    } catch {
      // Baris bukan JSON yang valid (mis. komentar keep-alive). Lewati.
      continue;
    }
  }

  return output;
}
