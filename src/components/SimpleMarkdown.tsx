import type { ReactNode } from "react";

/* ============================================================
   Perender markdown minimalis.

   Dibuat sendiri (bukan memakai library) karena kebutuhannya kecil dan
   ini menghindari satu dependency lagi.

   PENTING untuk keamanan: perender ini membangun elemen React, dan TIDAK
   PERNAH memakai dangerouslySetInnerHTML. Jadi teks apa pun dari model AI
   tetap ditampilkan sebagai teks, bukan dieksekusi sebagai HTML.

   Yang didukung:
     - Paragraf
     - Judul (# sampai ######)
     - Daftar bertanda (-, *) dan daftar bernomor (1. 2. dst)
     - Penebalan **tebal**, miring *miring*, dan kode `inline`
     - Blok kode dengan tiga backtick
   ============================================================ */

export function SimpleMarkdown({ text }: { text: string }) {
  return <>{renderBlocks(text)}</>;
}

function renderBlocks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    // --- Baris kosong ---
    if (!line.trim()) {
      index++;
      continue;
    }

    // --- Blok kode ``` ---
    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        code.push(lines[index]);
        index++;
      }
      index++; // lewati penutup ```
      nodes.push(
        <pre
          key={key++}
          className="scrollbar-slim my-3 overflow-x-auto rounded-lg bg-navy-950 px-4 py-3 text-xs leading-relaxed text-slate-100"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // --- Judul ---
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2]);
      const className =
        level <= 2
          ? "mt-4 mb-2 text-base font-bold text-navy-900 first:mt-0"
          : "mt-3 mb-1.5 text-sm font-bold text-navy-900 first:mt-0";

      nodes.push(
        level <= 2 ? (
          <h3 key={key++} className={className}>
            {content}
          </h3>
        ) : (
          <h4 key={key++} className={className}>
            {content}
          </h4>
        ),
      );
      index++;
      continue;
    }

    // --- Daftar bernomor ---
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ""));
        index++;
      }
      nodes.push(
        <ol
          key={key++}
          className="my-2.5 list-decimal space-y-1.5 pl-5 leading-relaxed"
        >
          {items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // --- Daftar bertanda ---
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*+]\s+/, ""));
        index++;
      }
      nodes.push(
        <ul
          key={key++}
          className="my-2.5 list-disc space-y-1.5 pl-5 leading-relaxed"
        >
          {items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // --- Paragraf: kumpulkan sampai baris kosong atau awal blok lain ---
    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*[-*+]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^#{1,6}\s/.test(lines[index]) &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraph.push(lines[index]);
      index++;
    }

    nodes.push(
      <p key={key++} className="my-2 leading-relaxed first:mt-0 last:mb-0">
        {renderInline(paragraph.join(" "))}
      </p>,
    );
  }

  return nodes;
}

/** Tangani penandaan dalam satu baris: **tebal**, *miring*, `kode`. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Urutan penting: kode lebih dulu, lalu tebal, lalu miring.
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\n]+\*)/g;

  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-navy-900"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-navy-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
