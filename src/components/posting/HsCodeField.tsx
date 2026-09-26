"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { CATEGORY_META, type CommodityCategory } from "@/lib/types";

/* ============================================================
   Field kode HS dengan pencarian otomatis.

   Otomasinya bekerja dua arah:
     1. Saat pengguna mengisi nama komoditas dan kode HS masih kosong,
        saran muncul sendiri tanpa perlu menekan apa pun.
     2. Pengguna juga bisa mengetik langsung di field ini, baik nama barang
        ("udang beku") maupun angka ("0306").

   Catatan desain yang penting: kode TIDAK pernah diisi otomatis tanpa
   tindakan pengguna. Salah golong kode HS berakibat tarif dan izin yang
   salah, jadi keputusan akhir harus tetap berupa klik yang sadar.
   Yang kita otomatiskan adalah pencariannya, bukan keputusannya.
   ============================================================ */

interface HsSuggestion {
  code: string;
  description: string;
  category: CommodityCategory;
  keywords: string[];
  note?: string;
  score: number;
}

interface Props {
  /** Nilai kode HS saat ini. */
  value: string;
  onChange: (code: string) => void;
  /** Dipanggil saat pengguna memilih saran, agar kategori ikut terisi. */
  onPickCategory?: (category: CommodityCategory) => void;
  /** Nama komoditas dari field lain, dipakai untuk saran otomatis. */
  commodity: string;
  error?: string;
  /** Id elemen input, agar label dan pesan error bisa merujuk dengan benar. */
  id?: string;
}

export function HsCodeField({
  value,
  onChange,
  onPickCategory,
  commodity,
  error,
  id = "f-hsCode",
}: Props) {
  const listId = useId();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HsSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [resolved, setResolved] = useState<HsSuggestion | null>(null);
  /** Saran otomatis dari nama komoditas, ditampilkan sebagai banner. */
  const [autoSuggest, setAutoSuggest] = useState<HsSuggestion | null>(null);
  const [dismissedAuto, setDismissedAuto] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  /* ---------- Tutup dropdown saat klik di luar ---------- */
  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  /* ---------- Pencarian saat pengguna mengetik di field ini ---------- */
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/hs-codes?q=${encodeURIComponent(term)}&limit=8`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { results: HsSuggestion[] };
        setResults(data.results ?? []);
        setActiveIndex(-1);
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  /* ---------- Saran otomatis dari nama komoditas ---------- */
  useEffect(() => {
    const term = commodity.trim();

    // Hanya menyarankan bila kode masih kosong dan nama komoditas cukup jelas.
    if (term.length < 3 || value.trim()) {
      setAutoSuggest(null);
      return;
    }
    if (dismissedAuto) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/hs-codes?q=${encodeURIComponent(term)}&limit=1`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { results: HsSuggestion[] };
        setAutoSuggest(data.results?.[0] ?? null);
      } catch {
        // Diamkan: saran otomatis bersifat opsional, bukan alur utama.
      }
    }, 600);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [commodity, value, dismissedAuto]);

  /* ---------- Terjemahkan kode yang sudah terisi menjadi uraian ---------- */
  useEffect(() => {
    const code = value.trim();
    if (!code) {
      setResolved(null);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/hs-codes?code=${encodeURIComponent(code)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data = (await response.json()) as { entry: HsSuggestion | null };
        setResolved(data.entry);
      } catch {
        // Diamkan.
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  function pick(entry: HsSuggestion) {
    onChange(entry.code);
    onPickCategory?.(entry.category);
    setResolved(entry);
    setQuery("");
    setResults([]);
    setOpen(false);
    setAutoSuggest(null);
  }

  function searchFromCommodity() {
    const term = commodity.trim();
    if (!term) return;
    setDismissedAuto(false);
    setQuery(term);
    setOpen(true);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) {
      if (event.key === "ArrowDown" && results.length > 0) {
        setOpen(true);
        event.preventDefault();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      pick(results[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showDropdown = open && (loading || results.length > 0);

  return (
    <div ref={wrapperRef}>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="field-label mb-0">
          Kode HS
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        </label>
        <button
          type="button"
          onClick={searchFromCommodity}
          disabled={!commodity.trim()}
          className="text-xs font-semibold text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
        >
          Cari dari nama komoditas
        </button>
      </div>

      {/* ---------- Input gabungan: kode atau pencarian ---------- */}
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-opt-${activeIndex}` : undefined
          }
          autoComplete="off"
          value={query || value}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            // Angka dianggap sebagai kode yang sedang ditulis langsung.
            if (/^[\d.\s]*$/.test(next)) {
              onChange(next);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Ketik nama barang atau kode, mis. kopi / 0901"
          className={cn("field-input pr-9", query && "font-normal")}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
        >
          {loading ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.9-3.9" />
            </svg>
          )}
        </span>

        {/* ---------- Dropdown hasil ---------- */}
        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            aria-label="Saran kode HS"
            className="scrollbar-slim absolute z-30 mt-1.5 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-[var(--shadow-card-hover)]"
          >
            {loading && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-500">Mencari...</li>
            )}

            {results.map((entry, index) => (
              <li
                key={entry.code}
                id={`${listId}-opt-${index}`}
                role="option"
                aria-selected={index === activeIndex}
              >
                <button
                  type="button"
                  onClick={() => pick(entry)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full flex-col items-start gap-1 px-4 py-2.5 text-left transition-colors",
                    index === activeIndex ? "bg-brand-50" : "hover:bg-slate-50",
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-brand-700">
                      {entry.code}
                    </span>
                    <Badge tone="slate">
                      <span aria-hidden="true">
                        {CATEGORY_META[entry.category].icon}
                      </span>
                      {CATEGORY_META[entry.category].label}
                    </Badge>
                  </span>
                  <span className="text-sm leading-snug text-navy-900">
                    {entry.description}
                  </span>
                  {entry.note && (
                    <span className="text-xs text-amber-700">{entry.note}</span>
                  )}
                </button>
              </li>
            ))}

            {!loading && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-slate-500">
                Tidak ada yang cocok. Anda tetap bisa menulis kodenya manual.
              </li>
            )}

            <li className="mt-1 border-t border-slate-200 px-4 py-2">
              <a
                href="https://insw.go.id/intr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Tidak ketemu? Cari di INSW Trade Repository
                <span className="sr-only"> (buka di tab baru)</span>
              </a>
            </li>
          </ul>
        )}
      </div>

      {/* ---------- Saran otomatis dari nama komoditas ---------- */}
      {autoSuggest && !value.trim() && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2.5">
          <span className="text-xs text-brand-900">
            Saran untuk{" "}
            <strong>&ldquo;{commodity.trim()}&rdquo;</strong>:{" "}
            <span className="font-mono font-semibold">{autoSuggest.code}</span>{" "}
            {autoSuggest.description}
          </span>
          <span className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => pick(autoSuggest)}
              className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
            >
              Gunakan
            </button>
            <button
              type="button"
              onClick={() => {
                setDismissedAuto(true);
                setAutoSuggest(null);
              }}
              className="rounded-md px-2 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100"
            >
              Abaikan
            </button>
          </span>
        </div>
      )}

      {/* ---------- Konfirmasi kode yang sudah terisi ---------- */}
      {resolved && value.trim() && !query && (
        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-emerald-900">
            <svg
              viewBox="0 0 24 24"
              className="mr-1 inline h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
            Dikenali: {resolved.description}
          </p>
          {resolved.note && (
            <p className="mt-1 text-xs text-amber-800">{resolved.note}</p>
          )}
        </div>
      )}

      {/* ---------- Error atau petunjuk ---------- */}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : (
        <p className="field-hint">
          Katalog ini ringkas dan kodenya 6 digit internasional. Indonesia
          memakai 8 digit, jadi{" "}
          <a
            href="https://insw.go.id/intr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            verifikasi di INSW
          </a>{" "}
          sebelum dipakai untuk PEB atau PIB.
        </p>
      )}
    </div>
  );
}
