"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/types";

/* ============================================================
   Panel percakapan dengan asisten AI.

   Alur: kirim seluruh riwayat ke /api/chat, lalu baca balasan sebagai
   aliran teks dan tampilkan bertahap supaya terasa responsif.
   ============================================================ */

const SUGGESTIONS = [
  "Saya baru mau mulai ekspor kopi. Apa saja yang harus saya siapkan dari nol?",
  "Apa bedanya FOB, CFR, dan CIF? Mana yang sebaiknya saya pakai untuk ekspor pertama?",
  "Bagaimana cara menghitung total biaya impor barang ke Indonesia?",
  "Dokumen apa saja yang wajib untuk ekspor produk makanan olahan?",
  "Bagaimana cara mencari kode HS yang benar untuk produk saya?",
  "Pembeli baru minta pembayaran Open Account. Apakah aman?",
];

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatPanel({ initialQuestion }: { initialQuestion?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuestion ?? "");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Selalu ikuti pesan terbaru.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  // Bersihkan koneksi bila komponen dilepas saat masih streaming.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || streaming) return;

      setError(null);
      setNeedsApiKey(false);

      const userMessage: ChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
      };
      const replyId = makeId();

      // Tampilkan pesan pengguna dan balasan kosong yang akan diisi bertahap.
      const history = [...messages, userMessage];
      setMessages([...history, { id: replyId, role: "model", content: "" }]);
      setInput("");
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { error?: string; code?: string }
            | null;

          if (data?.code === "NO_API_KEY") setNeedsApiKey(true);
          setError(data?.error ?? "Terjadi kesalahan. Coba lagi.");
          // Buang gelembung balasan yang kosong.
          setMessages(history);
          return;
        }

        if (!response.body) {
          setError("Balasan dari server kosong. Coba lagi.");
          setMessages(history);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((m) =>
              m.id === replyId ? { ...m, content: accumulated } : m,
            ),
          );
        }

        // Kalau model tidak mengembalikan apa pun, beri tahu pengguna.
        if (!accumulated.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === replyId
                ? {
                    ...m,
                    content:
                      "Maaf, saya tidak menghasilkan jawaban untuk pertanyaan itu. Coba ajukan dengan kalimat yang berbeda.",
                  }
                : m,
            ),
          );
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Dibatalkan pengguna: simpan teks yang sudah masuk, jangan tampilkan error.
          setMessages((prev) =>
            prev.filter((m) => m.role !== "model" || m.content.trim() !== ""),
          );
          return;
        }
        setError(
          "Tidak bisa menghubungi server. Periksa koneksi Anda lalu coba lagi.",
        );
        setMessages(history);
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter mengirim, Shift+Enter membuat baris baru.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void send(input);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setStreaming(false);
    textareaRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ================= PERCAKAPAN ================= */}
      <div className="lg:col-span-2">
        <div className="card flex h-[clamp(28rem,68vh,44rem)] flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 2.5 13.7 8l5.5 1.7-5.5 1.7L12 17l-1.7-5.6L4.8 9.7 10.3 8 12 2.5z" />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-navy-900">Asisten TradeLink</p>
                <p className="text-xs text-slate-500">
                  {streaming ? "Sedang menyusun jawaban..." : "Siap membantu"}
                </p>
              </div>
            </div>

            {!isEmpty && (
              <Button variant="ghost" size="sm" onClick={reset}>
                Percakapan baru
              </Button>
            )}
          </div>

          {/* Daftar pesan */}
          <div
            ref={scrollRef}
            className="scrollbar-slim flex-1 space-y-4 overflow-y-auto px-5 py-5"
            role="log"
            aria-live="polite"
            aria-label="Riwayat percakapan"
          >
            {isEmpty ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <span
                  aria-hidden="true"
                  className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-500"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 14.5A2.5 2.5 0 0 1 17.5 17H9l-4 3.5V6.5A2.5 2.5 0 0 1 7.5 4h10A2.5 2.5 0 0 1 20 6.5v8z" />
                    <path d="M9 9h7M9 12.5h4.5" />
                  </svg>
                </span>
                <h2 className="mt-4 font-semibold text-navy-900">
                  Mau tanya apa soal ekspor impor?
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                  Tulis pertanyaan Anda di bawah, atau pilih salah satu contoh di
                  samping untuk memulai.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  streaming={
                    streaming &&
                    message.role === "model" &&
                    message.id === messages[messages.length - 1]?.id
                  }
                />
              ))
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="border-t border-slate-200 px-5 py-4">
              <Callout tone={needsApiKey ? "info" : "danger"} title={needsApiKey ? "Asisten belum dikonfigurasi" : "Gagal mengirim"}>
                {error}
                {needsApiKey && (
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs">
                    <li>
                      Ambil API key gratis di{" "}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline underline-offset-2"
                      >
                        Google AI Studio
                      </a>
                      .
                    </li>
                    <li>
                      Salin <code className="font-mono">.env.example</code>{" "}
                      menjadi <code className="font-mono">.env.local</code>.
                    </li>
                    <li>
                      Isi <code className="font-mono">GEMINI_API_KEY</code> lalu
                      jalankan ulang server.
                    </li>
                  </ol>
                )}
              </Callout>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white px-5 py-4"
          >
            <label htmlFor="chat-input" className="sr-only">
              Tulis pertanyaan Anda
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="chat-input"
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={4000}
                disabled={streaming}
                placeholder="Contoh: Bagaimana cara menghitung bea masuk untuk impor mesin dari Taiwan?"
                className="field-input max-h-40 flex-1 resize-y"
              />
              {streaming ? (
                <Button type="button" variant="outline" onClick={stop}>
                  Hentikan
                </Button>
              ) : (
                <Button type="submit" disabled={!input.trim()}>
                  Kirim
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Enter untuk mengirim, Shift+Enter untuk baris baru.
            </p>
          </form>
        </div>
      </div>

      {/* ================= SAMPING ================= */}
      <aside className="space-y-5">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy-900">
            Contoh pertanyaan
          </h2>
          <ul className="mt-3 space-y-2">
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => void send(suggestion)}
                  disabled={streaming}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-left text-sm leading-snug text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy-900">
            Cara memakainya dengan sehat
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-600">
            <li className="flex gap-2.5">
              <Dot />
              Sebutkan komoditas, negara tujuan, dan volume Anda. Jawabannya akan
              jauh lebih spesifik.
            </li>
            <li className="flex gap-2.5">
              <Dot />
              Asisten sengaja tidak menyebut angka tarif sebagai kepastian.
              Tarif berubah dan berbeda per kode HS.
            </li>
            <li className="flex gap-2.5">
              <Dot />
              Selalu verifikasi tarif dan ketentuan di{" "}
              <a
                href="https://insw.go.id/intr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-700 hover:underline"
              >
                INTR
              </a>{" "}
              atau{" "}
              <a
                href="https://www.beacukai.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-700 hover:underline"
              >
                Bea Cukai
              </a>
              .
            </li>
            <li className="flex gap-2.5">
              <Dot />
              Untuk keputusan bernilai besar, tetap libatkan PPJK atau konsultan
              kepabeanan.
            </li>
          </ul>
          <p className="mt-4 border-t border-slate-200 pt-3">
            <Badge tone="amber">Bukan nasihat resmi kepabeanan atau pajak</Badge>
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- Komponen bantu ---------------- */

function MessageBubble({
  message,
  streaming,
}: {
  message: ChatMessage;
  streaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold",
          isUser
            ? "bg-navy-800 text-white"
            : "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
        )}
      >
        {isUser ? (
          "Anda"
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M12 2.5 13.7 8l5.5 1.7-5.5 1.7L12 17l-1.7-5.6L4.8 9.7 10.3 8 12 2.5z" />
          </svg>
        )}
      </span>

      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3 text-sm",
          isUser
            ? "bg-brand-600 text-white"
            : "border border-slate-200 bg-white text-slate-700",
        )}
      >
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : message.content ? (
          <div>
            <SimpleMarkdown text={message.content} />
            {streaming && <Caret />}
          </div>
        ) : (
          <TypingDots />
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Sedang menulis">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot h-1.5 w-1.5 rounded-full bg-brand-500"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-brand-500 align-text-bottom"
    />
  );
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
    />
  );
}
