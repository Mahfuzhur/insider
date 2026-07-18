"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/projects", label: "Work" },
  { href: "/about", label: "Studio" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Header({
  logoUrl,
  brandName,
  brandTagline,
}: {
  logoUrl?: string | null;
  brandName?: string;
  brandTagline?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-ink-line/80 bg-ink/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link href="/" aria-label={`${brandName ?? "Insider"} home`}>
          <Logo logoUrl={logoUrl} name={brandName} tagline={brandTagline} />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] uppercase tracking-[0.12em] text-cream/70 transition-colors hover:text-cream"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full border border-cream/25 px-5 py-2 text-[12px] uppercase tracking-[0.12em] text-cream transition-colors hover:border-brand hover:bg-brand hover:text-brand-fg"
          >
            Let&apos;s talk
          </Link>
        </nav>

        <button
          className="md:hidden text-2xl text-cream"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <i className={open ? "ti ti-x" : "ti ti-menu-2"} />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-ink-line bg-ink/95 px-6 py-4 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm uppercase tracking-[0.12em] text-cream/80"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
