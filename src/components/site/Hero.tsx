"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/Logo";
import LiquidBackground from "./LiquidBackground";
import LiquidImage from "./LiquidImage";

type Card = { label: string; url: string | null; tone: "live" | "3d" };

export default function Hero({
  heroLine,
  words,
  tagline,
  cards,
  heroImage,
}: {
  heroLine: string;
  words: string[];
  tagline: string;
  cards: Card[];
  heroImage?: string | null;
}) {
  const [i, setI] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [words.length]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        const d = Number(el.dataset.depth) || 10;
        el.style.transform = `translate(${-x * d}px, ${-y * d}px)`;
      });
    };
    const onLeave = () => {
      stage.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        el.style.transform = "";
      });
    };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => {
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={stageRef}
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink pt-[72px]"
    >
      <div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(120% 95% at 72% 8%, rgba(218,78,42,0.22), rgba(11,9,8,0) 55%), #0B0908",
        }}
      />
      {heroImage ? (
        <LiquidImage
          src={heroImage}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        />
      ) : (
        <LiquidBackground className="pointer-events-none absolute inset-0 z-0 h-full w-full" />
      )}
      <div
        className={
          "pointer-events-none absolute inset-0 z-0 bg-gradient-to-r " +
          (heroImage
            ? "from-ink/90 via-ink/60 to-ink/30"
            : "from-ink/85 via-ink/40 to-ink/10")
        }
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="eyebrow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            Interior design studio — Banani, Dhaka
          </motion.span>

          <h1 className="mt-6 font-serif text-[clamp(3rem,8vw,6.2rem)] leading-[0.95] text-cream">
            <motion.span
              initial={{ opacity: 0, y: "60%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {heroLine.split(" ").slice(0, -1).join(" ") || heroLine}
            </motion.span>
            <span className="mt-1 block h-[1.05em] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={words[i]}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="block italic text-brand"
                >
                  {words[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-7 max-w-md text-[15px] leading-relaxed text-cream/60"
          >
            {tagline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-9 flex flex-wrap items-center gap-5"
          >
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-[#2a1006] transition-transform hover:scale-[1.03]"
            >
              View projects <i className="ti ti-arrow-right" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-3 text-sm text-cream"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-cream/30">
                <i className="ti ti-player-play text-xs" />
              </span>
              The studio
            </Link>
          </motion.div>
        </div>

        <div className="relative hidden h-[420px] lg:block">
          {cards.slice(0, 2).map((c, idx) => (
            <motion.div
              key={idx}
              data-depth={idx === 0 ? 34 : 50}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 + idx * 0.15 }}
              className="absolute overflow-hidden rounded-2xl border border-cream/10 shadow-2xl"
              style={
                idx === 0
                  ? { top: 0, right: 0, width: 300, height: 220 }
                  : { top: 180, right: 170, width: 210, height: 160 }
              }
            >
              {c.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.url}
                  alt={c.label}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3a2a24] to-[#1a110d]">
                  <LogoMark className="h-12 text-cream/10" />
                </div>
              )}
              <span
                className={
                  "absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.08em] " +
                  (c.tone === "3d"
                    ? "bg-brand text-[#2a1006]"
                    : "bg-cream/90 text-[#1c1512]")
                }
              >
                {c.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-cream/40">
        <i className="ti ti-chevron-down animate-bounce text-xl" />
      </div>
    </section>
  );
}
