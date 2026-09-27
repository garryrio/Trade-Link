"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/types";

/* ============================================================
   Logika percakapan dengan asisten AI.

   Diangkat menjadi hook supaya dipakai bersama oleh dua tampilan:
     - halaman penuh di /asisten (ChatPanel)
     - bubble melayang di seluruh halaman (FloatingChat)

   Dengan begini logika streaming, pembatalan, dan penanganan error
   hanya ada di satu tempat.

   Catatan: setiap pemanggilan hook membuat state sendiri, jadi
   percakapan di bubble dan di halaman penuh terpisah. Ini disengaja
   supaya keduanya tidak saling mengganggu.
   ============================================================ */

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface AssistantChat {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  streaming: boolean;
  error: string | null;
  /** true bila server melaporkan GEMINI_API_KEY belum diisi. */
  needsApiKey: boolean;
  send: (question: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
  isEmpty: boolean;
  /** Id pesan terakhir, dipakai untuk menandai gelembung yang sedang diisi. */
  lastMessageId: string | undefined;
}

export function useAssistantChat(initialQuestion?: string): AssistantChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuestion ?? "");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // Batalkan permintaan yang masih berjalan bila komponen dilepas.
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

      // Tampilkan pesan pengguna beserta gelembung balasan kosong yang
      // akan diisi bertahap saat aliran teks masuk.
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
          // Dibatalkan pengguna: simpan teks yang sudah masuk, jangan
          // tampilkan error, tapi buang gelembung yang masih kosong.
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

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setError(null);
    setStreaming(false);
  }, []);

  return {
    messages,
    input,
    setInput,
    streaming,
    error,
    needsApiKey,
    send,
    stop,
    reset,
    isEmpty: messages.length === 0,
    lastMessageId: messages[messages.length - 1]?.id,
  };
}

/** Contoh pertanyaan, dipakai di halaman penuh maupun bubble. */
export const CHAT_SUGGESTIONS = [
  "Saya baru mau mulai ekspor kopi. Apa saja yang harus saya siapkan dari nol?",
  "Apa bedanya FOB, CFR, dan CIF? Mana yang sebaiknya saya pakai untuk ekspor pertama?",
  "Bagaimana cara menghitung total biaya impor barang ke Indonesia?",
  "Dokumen apa saja yang wajib untuk ekspor produk makanan olahan?",
  "Bagaimana cara mencari kode HS yang benar untuk produk saya?",
  "Pembeli baru minta pembayaran Open Account. Apakah aman?",
] as const;

/** Versi pendek untuk ruang sempit di bubble melayang. */
export const CHAT_SUGGESTIONS_SHORT = [
  "Apa bedanya FOB dan CIF?",
  "Cara hitung biaya impor?",
  "Cara cari kode HS produk saya?",
] as const;
