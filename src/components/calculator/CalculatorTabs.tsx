"use client";

import { useState } from "react";
import { ExportCalculator } from "@/components/calculator/ExportCalculator";
import { ImportCalculator } from "@/components/calculator/ImportCalculator";
import { cn } from "@/lib/cn";

export type CalculatorMode = "impor" | "ekspor";

const TABS: {
  value: CalculatorMode;
  label: string;
  description: string;
}[] = [
  {
    value: "impor",
    label: "Hitung Biaya Impor",
    description:
      "Dari harga pemasok sampai landed cost di gudang Anda, termasuk bea masuk, PPN, dan PPh 22.",
  },
  {
    value: "ekspor",
    label: "Susun Harga Ekspor",
    description:
      "Dari harga pokok produksi sampai harga jual FOB, CFR, atau CIF, lengkap dengan titik impas.",
  },
];

export function CalculatorTabs({
  initialMode,
}: {
  initialMode: CalculatorMode;
}) {
  const [mode, setMode] = useState<CalculatorMode>(initialMode);
  const active = TABS.find((t) => t.value === mode) ?? TABS[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Mode kalkulator"
        className="grid gap-3 sm:grid-cols-2"
      >
        {TABS.map((tab) => {
          const selected = mode === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="calculator-panel"
              onClick={() => setMode(tab.value)}
              className={cn(
                "rounded-xl border-2 p-5 text-left transition-all",
                selected
                  ? "border-brand-600 bg-white shadow-[var(--shadow-card)]"
                  : "border-slate-200 bg-white/60 hover:border-slate-300",
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "font-semibold",
                    selected ? "text-brand-700" : "text-navy-900",
                  )}
                >
                  {tab.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2",
                    selected ? "border-brand-600 bg-brand-600" : "border-slate-300",
                  )}
                >
                  {selected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">
                {tab.description}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="calculator-panel"
        role="tabpanel"
        aria-label={active.label}
        className="mt-8"
      >
        {mode === "impor" ? <ImportCalculator /> : <ExportCalculator />}
      </div>
    </div>
  );
}
