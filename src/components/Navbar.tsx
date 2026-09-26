"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/posting", label: "Buat Postingan" },
  { href: "/harga", label: "Harga Komoditas" },
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/edukasi", label: "Edukasi" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup menu mobile setiap kali pindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
            aria-label="TradeLink - beranda"
          >
            <Logo />
          </Link>

          {/* Navigasi desktop */}
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-navy-900",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/asisten"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              <SparkIcon className="h-4 w-4" />
              Asisten AI
            </Link>
          </div>

          {/* Tombol menu mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-navy-800 transition-colors hover:bg-slate-100 lg:hidden"
          >
            {open ? (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Navigasi mobile */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-slate-200 bg-white lg:hidden"
        >
          <ul className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium",
                    isActive(link.href)
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/asisten"
                className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <SparkIcon className="h-4 w-4" />
                Asisten AI
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.5l1.9 5.1 5.1 1.9-5.1 1.9L12 16.5l-1.9-5.1L5 9.5l5.1-1.9L12 2.5z" />
      <path d="M18.5 15l.95 2.55L22 18.5l-2.55.95L18.5 22l-.95-2.55L15 18.5l2.55-.95L18.5 15z" />
    </svg>
  );
}
