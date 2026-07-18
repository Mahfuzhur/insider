"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { HeroRoom } from "./RoomWalkHero";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One full-screen panel on the horizontal track. The image drifts against
 * the pan direction while its panel crosses the viewport, so every frame
 * has depth instead of sliding as a flat card.
 */
function PanPanel({
  room,
  index,
  count,
  progress,
}: {
  room: HeroRoom;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const seg = 1 / Math.max(1, count - 1);
  const x = useTransform(
    progress,
    [Math.max(0, (index - 1) * seg), Math.min(1, (index + 1) * seg)],
    ["-6%", "6%"]
  );

  return (
    <div className="relative h-full w-screen shrink-0 overflow-hidden">
      <motion.div style={{ x, scale: 1.15 }} className="absolute inset-0 will-change-transform">
        {index === 0 ? (
          <motion.img
            src={room.url}
            alt={room.label}
            fetchPriority="high"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
            className="h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.url} alt={room.label} className="h-full w-full object-cover" />
        )}
      </motion.div>
      {/* In-frame caption, bottom-right of each panel */}
      <div className="absolute bottom-24 right-8 z-[5] text-right md:right-14">
        <span className="text-[11px] uppercase tracking-[0.35em] text-brand">
          {String(index + 1).padStart(2, "0")}
        </span>
        <p className="font-serif text-3xl italic text-cream md:text-4xl">{room.label}</p>
      </div>
    </div>
  );
}

/** Rotating brand word, revealed letter by letter. */
function KineticWord({ word }: { word: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={word}
        initial="hidden"
        animate="show"
        exit="exit"
        variants={{
          show: { transition: { staggerChildren: 0.04 } },
          exit: { transition: { staggerChildren: 0.02 } },
        }}
        className="block italic text-brand"
      >
        {word.split("").map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            variants={{
              hidden: { y: "115%", rotate: 4 },
              show: { y: 0, rotate: 0, transition: { duration: 0.55, ease: EASE } },
              exit: {
                y: "-115%",
                rotate: -3,
                transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
              },
            }}
            className="inline-block will-change-transform"
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

export default function RoomPanHero({
  heroLine,
  words,
  tagline,
  rooms,
}: {
  heroLine: string;
  words: string[];
  tagline: string;
  rooms: HeroRoom[];
}) {
  const n = rooms.length;
  const trackRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const trackX = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(n - 1) * 100}vw`]);

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.max(0, Math.min(n - 1, Math.round(v * (n - 1)))));
  });

  const [wi, setWi] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setWi((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);

  // Headline slides gently up and away as the pan begins, returning focus
  // to the rooms themselves.
  const headY = useTransform(scrollYProgress, [0, 0.18], ["0%", "-6%"]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.14, 0.22], [1, 1, 0]);

  function jumpTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    const scrollable = el.offsetHeight - window.innerHeight;
    const target = top + (i / (n - 1)) * scrollable;
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { duration: 1.4 });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }

  const firstLineWords = (
    heroLine.split(" ").slice(0, -1).join(" ") || heroLine
  ).split(" ");

  const heading = (
    <>
      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="eyebrow"
      >
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
        Interior design studio — Banani, Dhaka
      </motion.span>

      <h1 className="mt-6 font-serif text-[clamp(3.2rem,8.5vw,6.8rem)] leading-[0.95] text-cream">
        <span className="block">
          {firstLineWords.map((w, i) => (
            <span key={`${w}-${i}`} className="inline-block overflow-hidden align-top">
              <motion.span
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.09, ease: EASE }}
                className="inline-block will-change-transform"
              >
                {w}
                {i < firstLineWords.length - 1 ? " " : ""}
              </motion.span>
            </span>
          ))}
        </span>
        <span className="mt-1 block h-[1.05em] overflow-hidden">
          <KineticWord word={words[wi]} />
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="mt-7 max-w-md text-[15px] leading-relaxed text-cream/70"
      >
        {tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-9 flex flex-wrap items-center gap-5"
      >
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-medium text-[#2a1006] transition-transform hover:scale-[1.03]"
        >
          View projects{" "}
          <i className="ti ti-arrow-right transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/about" className="inline-flex items-center gap-3 text-sm text-cream">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-cream/30 transition-colors hover:border-brand hover:bg-brand/20">
            <i className="ti ti-player-play text-xs" />
          </span>
          The studio
        </Link>
      </motion.div>
    </>
  );

  // Reduced motion: a single still room, no scroll choreography.
  if (reduced) {
    return (
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink pt-[72px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rooms[0].url}
          alt={rooms[0].label}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-ink/20" />
        <div className="container-x relative z-10 max-w-3xl">{heading}</div>
      </section>
    );
  }

  return (
    <section ref={trackRef} className="relative" style={{ height: `${n * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        {/* Horizontal film strip */}
        <motion.div style={{ x: trackX }} className="flex h-full will-change-transform">
          {rooms.map((room, i) => (
            <PanPanel key={room.url} room={room} index={i} count={n} progress={scrollYProgress} />
          ))}
        </motion.div>

        {/* Legibility washes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/70 to-transparent" />

        {/* Headline — hands the stage to the rooms once the pan starts */}
        <motion.div
          style={{ y: headY, opacity: headOpacity }}
          className="container-x pointer-events-none absolute inset-0 z-10 flex items-center pt-[72px]"
        >
          <div className="pointer-events-auto max-w-3xl">{heading}</div>
        </motion.div>

        {/* Frame dots — jump between rooms */}
        <div className="absolute bottom-9 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
          {rooms.map((room, i) => (
            <button
              key={room.url}
              type="button"
              onClick={() => jumpTo(i)}
              aria-label={`Go to ${room.label}`}
              className={
                "h-1.5 rounded-full transition-all duration-300 " +
                (i === active ? "w-8 bg-brand" : "w-1.5 bg-cream/35 hover:bg-cream/70")
              }
            />
          ))}
        </div>

        {/* Counter */}
        <div className="absolute bottom-9 left-6 z-10 md:left-12">
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="block text-[11px] uppercase tracking-[0.35em] text-cream/70"
            >
              {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Scroll hint — fades once the pan begins */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
          className="absolute bottom-9 right-6 z-10 hidden items-center gap-3 text-cream/60 sm:flex md:right-12"
        >
          <span className="text-[11px] uppercase tracking-[0.3em]">Scroll to pan</span>
          <i className="ti ti-arrow-right animate-pulse text-lg" />
        </motion.div>

        {/* Pan progress */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 z-10 h-[2px] origin-left bg-brand"
        />
      </div>
    </section>
  );
}
