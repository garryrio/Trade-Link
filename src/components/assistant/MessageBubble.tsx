"use client";

import { SimpleMarkdown } from "@/components/SimpleMarkdown";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/types";

/* ============================================================
   Gelembung pesan percakapan.
   Dipakai bersama oleh halaman penuh dan bubble melayang.
   Varian "compact" memperkecil padding dan ukuran teks agar pas
   di panel melayang yang sempit.
   ============================================================ */

export function MessageBubble({
  message,
  streaming,
  compact = false,
}: {
  message: ChatMessage;
  streaming: boolean;
  compact?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 grid shrink-0 place-items-center rounded-lg font-bold",
          compact ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs",
          isUser
            ? "bg-navy-800 text-white"
            : "bg-gradient-to-br from-brand-500 to-brand-700 text-white",
        )}
      >
        {isUser ? (
          "Anda"
        ) : (
          <SparkGlyph className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
      </span>

      <div
        className={cn(
          "rounded-xl",
          compact ? "max-w-[82%] px-3 py-2 text-[13px]" : "max-w-[85%] px-4 py-3 text-sm",
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

export function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 13.7 8l5.5 1.7-5.5 1.7L12 17l-1.7-5.6L4.8 9.7 10.3 8 12 2.5z" />
    </svg>
  );
}

export function TypingDots() {
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
