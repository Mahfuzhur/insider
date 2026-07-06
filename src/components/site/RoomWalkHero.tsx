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

export type HeroRoom = { label: string; url: string };

/**
 * One full-screen room layer. Layers stack in order; each new room fades in
 * over the previous one while both keep scaling up, so the camera feels like
 * it is continuously walking forward from room to room.
 */
function RoomLayer({
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
  const seg = 1 / (count - 1);
  // Each room holds for the first half of its segment, then the next room
  // dissolves in during the second half.
  const fadeStart = index * seg - seg / 2;
  const fadeEnd = index * seg;
  const visibleEnd = Math.min(1, (index + 1) * seg);

  const opacity = useTransform(progress, [fadeStart, fadeEnd], [0, 1]);
  const scale = useTransform(
    progress,
    [Math.max(0, fadeStart), visibleEnd],
    [1, 1.24]
  );

  return (
    <motion.div
      style={{ opacity, scale }}
      className="absolute inset-0 will-change-transform"
    >
      {index === 0 ? (
        // Slow settle-in on load: you arrive inside the first room.
        <motion.img
          src={room.url}
          alt={room.label}
          fetchPriority="high"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={room.url}
          alt={room.label}
          className="h-full w-full object-cover"
        />
      )}
    </motion.div>
  );
}

export default function RoomWalkHero({
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

  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.max(0, Math.min(n - 1, Math.round(v * (n - 1)))));
  });

  const [wi, setWi] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setWi((v) => (v + 1) % words.length), 2400);
    return () => clearInterval(t);
  }, [words.length]);

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

  const heading = (
    <>
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
              key={words[wi]}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="block italic text-brand"
            >
              {words[wi]}
            </motion.span>
          </AnimatePresence>
        </span>
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-7 max-w-md text-[15px] leading-relaxed text-cream/70"
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
    <section
      ref={trackRef}
      className="relative"
      style={{ height: `${n * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        {rooms.map((room, i) => (
          <RoomLayer
            key={room.url}
            room={room}
            index={i}
            count={n}
            progress={scrollYProgress}
          />
        ))}

        {/* Legibility washes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-ink/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/70 to-transparent" />

        {/* Headline */}
        <div className="container-x relative z-10 flex h-full items-center pt-[72px]">
          <div className="max-w-3xl">{heading}</div>
        </div>

        {/* Room caption — which room you are standing in */}
        <div className="absolute bottom-9 left-6 z-10 md:left-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-[11px] uppercase tracking-[0.35em] text-brand">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(n).padStart(2, "0")}
              </span>
              <p className="mt-1 font-serif text-2xl italic text-cream md:text-3xl">
                {rooms[active].label}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Room rail */}
        <div className="absolute right-8 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex">
          {rooms.map((room, i) => (
            <button
              key={room.url}
              type="button"
              onClick={() => jumpTo(i)}
              className="group flex items-center gap-3"
              aria-label={`Go to ${room.label}`}
            >
              <span
                className={
                  "text-[10px] uppercase tracking-[0.22em] transition-colors " +
                  (i === active
                    ? "text-cream"
                    : "text-cream/35 group-hover:text-cream/70")
                }
              >
                {room.label}
              </span>
              <span
                className={
                  "h-px transition-all duration-300 " +
                  (i === active ? "w-9 bg-brand" : "w-4 bg-cream/30")
                }
              />
            </button>
          ))}
        </div>

        {/* Scroll hint — fades once the walk begins */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.06], [1, 0]) }}
          className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 text-cream/60 sm:flex"
        >
          <i className="ti ti-chevron-down animate-bounce text-lg" />
          <span className="text-[11px] uppercase tracking-[0.3em]">
            Scroll to walk through
          </span>
        </motion.div>
      </div>
    </section>
  );
}
