"use client";

import {
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  MessageBubble,
  SparkGlyph,
} from "@/components/assistant/MessageBubble";
import {
  CHAT_SUGGESTIONS,
  useAssistantChat,
} from "@/components/assistant/useAssistantChat";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";

/* ============================================================
   Panel percakapan versi halaman penuh di /asisten.

   Seluruh logika percakapan berada di hook useAssistantChat, yang juga
   dipakai oleh bubble melayang. Komponen ini hanya mengurus tata letak.
   ============================================================ */

export function ChatPanel({ initialQuestion }: { initialQuestion?: string }) {
  const chat = useAssistantChat(initialQuestion);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Selalu ikuti pesan terbaru.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages, chat.streaming]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void chat.send(chat.input);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    // Enter mengirim, Shift+Enter membuat baris baru.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void chat.send(chat.input);
    }
  }

  function reset() {
    chat.reset();
    textareaRef.current?.focus();
  }

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
                <SparkGlyph className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-navy-900">Asisten TradeLink</p>
                <p className="text-xs text-slate-500">
                  {chat.streaming
                    ? "Sedang menyusun jawaban..."
                    : "Siap membantu"}
                </p>
              </div>
            </div>

            {!chat.isEmpty && (
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
            {chat.isEmpty ? (
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
              chat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  streaming={
                    chat.streaming &&
                    message.role === "model" &&
                    message.id === chat.lastMessageId
                  }
                />
              ))
            )}
          </div>

          {/* Error */}
          {chat.error && (
            <div className="border-t border-slate-200 px-5 py-4">
              <Callout
                tone={chat.needsApiKey ? "info" : "danger"}
                title={
                  chat.needsApiKey
                    ? "Asisten belum dikonfigurasi"
                    : "Gagal mengirim"
                }
              >
                {chat.error}
                {chat.needsApiKey && (
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
                      Isi <code className="font-mono">GEMINI_API_KEY</code> di
                      file <code className="font-mono">.env.local</code>.
                    </li>
                    <li>Jalankan ulang server pengembangan.</li>
                  </ol>
                )}
              </Callout>
            </div>
          )}

          {/* Kolom tulis */}
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
                value={chat.input}
                onChange={(e) => chat.setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                maxLength={4000}
                disabled={chat.streaming}
                placeholder="Contoh: Bagaimana cara menghitung bea masuk untuk impor mesin dari Taiwan?"
                className="field-input max-h-40 flex-1 resize-y"
              />
              {chat.streaming ? (
                <Button type="button" variant="outline" onClick={chat.stop}>
                  Hentikan
                </Button>
              ) : (
                <Button type="submit" disabled={!chat.input.trim()}>
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
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => void chat.send(suggestion)}
                  disabled={chat.streaming}
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

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-navy-900">
            Bubble melayang
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Di halaman lain, asisten ini juga tersedia sebagai bulatan melayang
            di sudut layar. Bulatan itu bisa digeser ke posisi mana pun, dan
            letaknya akan diingat. Di halaman ini bulatannya disembunyikan
            karena percakapan sudah tampil penuh.
          </p>
        </div>
      </aside>
    </div>
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
