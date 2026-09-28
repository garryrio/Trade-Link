"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  MessageBubble,
  SparkGlyph,
} from "@/components/assistant/MessageBubble";
import {
  CHAT_SUGGESTIONS_SHORT,
  useAssistantChat,
} from "@/components/assistant/useAssistantChat";
import { cn } from "@/lib/cn";

/* ============================================================
   Bubble asisten AI yang melayang di atas seluruh halaman.

   Perilaku:
     - Bulatan kecil yang bisa digeser ke mana saja (mouse maupun sentuh).
     - Setelah dilepas, ia menempel ke sisi kiri atau kanan layar, mengikuti
       sisi terdekat. Posisi vertikal tetap bebas.
     - Posisinya diingat di localStorage, jadi tetap di tempat yang sama
       saat halaman dibuka lagi.
     - Sekali klik (tanpa digeser) membuka panel percakapan.

   Membedakan klik dari geser: pergerakan di bawah DRAG_THRESHOLD piksel
   dianggap klik. Tanpa ini, setiap kali pengguna menggeser, panel akan
   ikut terbuka.

   Aksesibilitas: bulatan tetap berupa <button> sungguhan, bisa difokuskan
   dengan Tab dan dibuka dengan Enter atau Spasi. Tombol panah memindahkan
   posisinya, sehingga fungsi geser tidak eksklusif untuk pengguna tetikus.
   ============================================================ */

const BUBBLE_SIZE = 56;
const EDGE_MARGIN = 20;
/** Pergerakan di bawah nilai ini (piksel) dianggap klik, bukan geser. */
const DRAG_THRESHOLD = 6;
const STORAGE_KEY = "tradelink.assistant.bubble";
/** Langkah perpindahan saat memakai tombol panah. */
const KEY_STEP = 24;

const PANEL_WIDTH = 384;
const PANEL_HEIGHT = 540;
const PANEL_GAP = 14;

interface Position {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Posisi bawaan: sudut kanan bawah, di atas area aman perangkat. */
function defaultPosition(safeBottom = 0): Position {
  return {
    x: window.innerWidth - BUBBLE_SIZE - EDGE_MARGIN,
    y: window.innerHeight - BUBBLE_SIZE - EDGE_MARGIN - 8 - safeBottom,
  };
}

/**
 * Ukur tinggi area aman di bagian bawah layar.
 *
 * Pada iPhone tanpa tombol home, ada indikator garis di tepi bawah yang
 * menutupi sekitar 34px. Nilai env(safe-area-inset-bottom) hanya tersedia
 * dari CSS, jadi diukur lewat elemen bantu sekali saja. Perangkat lain
 * mengembalikan 0.
 */
function measureSafeAreaBottom(): number {
  try {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;bottom:0;left:0;width:0;height:env(safe-area-inset-bottom);visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return Number.isFinite(height) ? height : 0;
  } catch {
    return 0;
  }
}

function clampToViewport(pos: Position, safeBottom = 0): Position {
  return {
    x: clamp(pos.x, EDGE_MARGIN, window.innerWidth - BUBBLE_SIZE - EDGE_MARGIN),
    y: clamp(
      pos.y,
      EDGE_MARGIN,
      window.innerHeight - BUBBLE_SIZE - EDGE_MARGIN - safeBottom,
    ),
  };
}

export function FloatingChat() {
  const pathname = usePathname();

  /**
   * Bubble baru dirender setelah komponen ter-mount.
   * Alasannya: posisi awal bergantung pada ukuran jendela dan localStorage,
   * yang keduanya tidak tersedia saat render di server. Menunda render
   * menghindari ketidaksesuaian hydration sekaligus mencegah bubble
   * berkedip dari posisi bawaan ke posisi tersimpan.
   */
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  /** Tinggi indikator home iPhone, 0 di perangkat lain. */
  const safeBottom = useRef(0);

  const chat = useAssistantChat();

  const bubbleRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** Data sementara selama proses geser. */
  const dragState = useRef({
    active: false,
    /** Selisih antara titik tekan dan sudut bubble, agar tidak melompat. */
    offsetX: 0,
    offsetY: 0,
    /** Koordinat penunjuk saat pertama ditekan, acuan menghitung jarak. */
    startClientX: 0,
    startClientY: 0,
    /** Jarak total dari titik tekan, bukan per-frame. */
    moved: 0,
  });

  /* ---------- Muat posisi tersimpan ---------- */
  useEffect(() => {
    safeBottom.current = measureSafeAreaBottom();

    let initial = defaultPosition(safeBottom.current);

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Position>;
        if (typeof saved.x === "number" && typeof saved.y === "number") {
          initial = { x: saved.x, y: saved.y };
        }
      }
    } catch {
      // localStorage bisa diblokir atau isinya rusak. Pakai posisi bawaan.
    }

    setPos(clampToViewport(initial, safeBottom.current));
    setMounted(true);
  }, []);

  /* ---------- Jaga posisi tetap di dalam layar saat jendela diubah ---------- */
  useEffect(() => {
    if (!mounted) return;

    function onResize() {
      setPos((prev) => clampToViewport(prev, safeBottom.current));
    }

    window.addEventListener("resize", onResize);
    // orientationchange perlu didengarkan terpisah: sebagian peramban ponsel
    // tidak selalu memicu resize saat perangkat diputar.
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [mounted]);

  const persist = useCallback((next: Position) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Tidak masalah bila gagal disimpan.
    }
  }, []);

  /** Tempelkan ke sisi terdekat agar bubble tidak menghalangi tengah layar. */
  const snapToEdge = useCallback(
    (current: Position): Position => {
      const centerX = current.x + BUBBLE_SIZE / 2;
      const snappedX =
        centerX < window.innerWidth / 2
          ? EDGE_MARGIN
          : window.innerWidth - BUBBLE_SIZE - EDGE_MARGIN;

      return clampToViewport({ x: snappedX, y: current.y }, safeBottom.current);
    },
    [],
  );

  /* ---------- Geser dengan penunjuk (tetikus, sentuh, pena) ---------- */
  function onPointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    // Hanya tombol utama tetikus, agar klik kanan tetap normal.
    if (event.button !== 0) return;

    dragState.current = {
      active: true,
      offsetX: event.clientX - pos.x,
      offsetY: event.clientY - pos.y,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: 0,
    };

    // Pointer capture membuat pointermove tetap terkirim ke elemen ini
    // walau kursor bergerak keluar dari batasnya.
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const state = dragState.current;
    if (!state.active) return;

    const nextX = event.clientX - state.offsetX;
    const nextY = event.clientY - state.offsetY;

    // Diukur dari titik tekan awal, bukan dari posisi frame sebelumnya.
    // Kalau diukur per-frame, geseran lambat yang bergerak sedikit-sedikit
    // tidak akan pernah melewati ambang dan salah dianggap sebagai klik.
    state.moved = Math.hypot(
      event.clientX - state.startClientX,
      event.clientY - state.startClientY,
    );

    if (state.moved > DRAG_THRESHOLD && !dragging) {
      setDragging(true);
      // Begitu benar-benar digeser, tutup panel supaya tidak ikut melompat.
      setOpen(false);
    }

    setPos(clampToViewport({ x: nextX, y: nextY }, safeBottom.current));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const state = dragState.current;
    if (!state.active) return;

    state.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (state.moved <= DRAG_THRESHOLD) {
      // Dianggap klik biasa.
      setDragging(false);
      setOpen((v) => !v);
      return;
    }

    setDragging(false);
    setPos((prev) => {
      const snapped = snapToEdge(prev);
      persist(snapped);
      return snapped;
    });
  }

  /* ---------- Geser memakai papan tuts ---------- */
  function onBubbleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const moves: Record<string, Position> = {
      ArrowLeft: { x: -KEY_STEP, y: 0 },
      ArrowRight: { x: KEY_STEP, y: 0 },
      ArrowUp: { x: 0, y: -KEY_STEP },
      ArrowDown: { x: 0, y: KEY_STEP },
    };

    const delta = moves[event.key];
    if (!delta) return;

    event.preventDefault();
    setPos((prev) => {
      const next = clampToViewport(
        { x: prev.x + delta.x, y: prev.y + delta.y },
        safeBottom.current,
      );
      persist(next);
      return next;
    });
  }

  /* ---------- Tutup panel dengan Escape ---------- */
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        bubbleRef.current?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /* ---------- Fokus ke kolom tulis saat panel dibuka ---------- */
  useEffect(() => {
    if (open) {
      // Tunggu satu frame agar elemen sudah ada di DOM.
      const id = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
  }, [open]);

  /* ---------- Ikuti pesan terbaru ---------- */
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages, chat.streaming, open]);

  /* ---------- Jangan tampilkan di halaman asisten penuh ---------- */
  if (pathname === "/asisten") return null;
  if (!mounted) return null;

  const onLeftHalf = pos.x + BUBBLE_SIZE / 2 < window.innerWidth / 2;
  const isNarrow = window.innerWidth < 640;

  /* Posisi panel: menempel di sisi bubble pada layar lebar, dan menjadi
     lembar penuh di bagian bawah pada layar sempit. */
  const panelStyle = isNarrow
    ? {
        left: EDGE_MARGIN / 2,
        right: EDGE_MARGIN / 2,
        // Angkat di atas indikator home iPhone agar kolom tulis tidak tertutup.
        bottom: EDGE_MARGIN / 2 + safeBottom.current,
      }
    : {
        left: onLeftHalf
          ? pos.x + BUBBLE_SIZE + PANEL_GAP
          : clamp(pos.x - PANEL_WIDTH - PANEL_GAP, EDGE_MARGIN, Infinity),
        top: clamp(
          pos.y + BUBBLE_SIZE / 2 - PANEL_HEIGHT / 2,
          EDGE_MARGIN,
          Math.max(EDGE_MARGIN, window.innerHeight - PANEL_HEIGHT - EDGE_MARGIN),
        ),
        width: PANEL_WIDTH,
        height: `min(${PANEL_HEIGHT}px, calc(100vh - ${EDGE_MARGIN * 2}px))`,
      };

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void chat.send(chat.input);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void chat.send(chat.input);
    }
  }

  return (
    <>
      {/* ================= PANEL ================= */}
      {open && (
        <div
          role="dialog"
          aria-label="Asisten TradeLink"
          style={panelStyle}
          className={cn(
            "fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white",
            "shadow-[0_20px_60px_-12px_rgb(15_40_70/0.35)]",
            // Batas tinggi lembar bawah memakai dvh agar tidak terpotong
            // bilah alamat peramban ponsel.
            isNarrow && "max-h-sheet",
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-slate-200 bg-gradient-to-r from-brand-700 to-navy-900 px-4 py-3">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white"
            >
              <SparkGlyph className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                Asisten TradeLink
              </p>
              <p className="truncate text-xs text-brand-100/80">
                {chat.streaming ? "Sedang menyusun jawaban..." : "Siap membantu"}
              </p>
            </div>

            {!chat.isEmpty && (
              <button
                type="button"
                onClick={chat.reset}
                title="Mulai percakapan baru"
                aria-label="Mulai percakapan baru"
                className="grid h-9 w-9 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:h-8 sm:w-8"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 11a8 8 0 1 0-2.6 5.9" />
                  <path d="M20 5v6h-6" />
                </svg>
              </button>
            )}

            <Link
              href="/asisten"
              title="Buka di halaman penuh"
              aria-label="Buka di halaman penuh"
              className="grid h-9 w-9 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:h-8 sm:w-8"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h6v6M21 3l-8 8M9 21H3v-6M3 21l8-8" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                bubbleRef.current?.focus();
              }}
              aria-label="Tutup asisten"
              className="grid h-9 w-9 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:h-8 sm:w-8"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          {/* Daftar pesan */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-label="Riwayat percakapan"
            className="scrollbar-slim flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-4"
          >
            {chat.isEmpty ? (
              <div className="py-2">
                <p className="text-sm leading-relaxed text-slate-600">
                  Ada yang mau ditanyakan soal ekspor impor? Tulis di bawah, atau
                  pilih salah satu berikut.
                </p>
                <ul className="mt-3 space-y-2">
                  {CHAT_SUGGESTIONS_SHORT.map((suggestion) => (
                    <li key={suggestion}>
                      <button
                        type="button"
                        onClick={() => void chat.send(suggestion)}
                        disabled={chat.streaming}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[13px] leading-snug text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {suggestion}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              chat.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  compact
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
            <div
              role="alert"
              className={cn(
                "border-t px-4 py-3 text-xs leading-relaxed",
                chat.needsApiKey
                  ? "border-brand-200 bg-brand-50 text-brand-900"
                  : "border-red-200 bg-red-50 text-red-800",
              )}
            >
              {chat.error}
              {chat.needsApiKey && (
                <>
                  {" "}
                  Ambil key di{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2"
                  >
                    Google AI Studio
                  </a>
                  , isi <code className="font-mono">GEMINI_API_KEY</code> di{" "}
                  <code className="font-mono">.env.local</code>, lalu jalankan
                  ulang server.
                </>
              )}
            </div>
          )}

          {/* Kolom tulis */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white px-3 py-3"
          >
            <label htmlFor="floating-chat-input" className="sr-only">
              Tulis pertanyaan Anda
            </label>
            <div className="flex items-end gap-2">
              <textarea
                id="floating-chat-input"
                ref={inputRef}
                value={chat.input}
                onChange={(e) => chat.setInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                rows={1}
                maxLength={4000}
                disabled={chat.streaming}
                placeholder="Tulis pertanyaan..."
                className="field-input max-h-28 flex-1 resize-y py-2 text-[13px]"
              />
              {chat.streaming ? (
                <button
                  type="button"
                  onClick={chat.stop}
                  className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-navy-800 transition-colors hover:bg-slate-50"
                >
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!chat.input.trim()}
                  aria-label="Kirim pertanyaan"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4.5 12h14M13 6l5.5 6-5.5 6" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Bukan nasihat resmi kepabeanan atau pajak.
            </p>
          </form>
        </div>
      )}

      {/* ================= BULATAN ================= */}
      <button
        ref={bubbleRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onBubbleKeyDown}
        aria-expanded={open}
        aria-label={
          open
            ? "Tutup asisten TradeLink"
            : "Buka asisten TradeLink. Geser untuk memindahkan, atau pakai tombol panah."
        }
        style={{
          left: pos.x,
          top: pos.y,
          width: BUBBLE_SIZE,
          height: BUBBLE_SIZE,
          // Cegah halaman ikut tergulir saat bubble digeser dengan sentuhan.
          touchAction: "none",
        }}
        className={cn(
          "fixed z-[71] grid place-items-center rounded-full",
          "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
          "shadow-[0_10px_30px_-6px_rgb(37_99_235/0.6)]",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600",
          dragging
            ? "scale-110 cursor-grabbing"
            : "cursor-grab transition-transform hover:scale-105 active:scale-95",
        )}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <SparkGlyph className="h-6 w-6" />
        )}

        {/* Titik penanda kecil, hanya saat panel tertutup dan belum dipakai */}
        {!open && chat.isEmpty && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400"
          />
        )}
      </button>
    </>
  );
}
