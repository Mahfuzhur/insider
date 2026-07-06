"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type HeroRoom = { label: string; url: string };

const EASE = [0.16, 1, 0.3, 1] as const;

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
      {/* Idle Ken Burns drift keeps the scene alive between scrolls */}
      <div className="hero-drift h-full w-full">
        {index === 0 ? (
          // Slow settle-in on load: you arrive inside the first room.
          <motion.img
            src={room.url}
            alt={room.label}
            fetchPriority="high"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
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
      </div>
    </motion.div>
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
              show: {
                y: 0,
                rotate: 0,
                transition: { duration: 0.55, ease: EASE },
              },
              exit: {
                y: "-115%",
                rotate: -3,
                transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
              },
            }}
            className="inline-block will-change-transform"
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
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
    const t = setInterval(() => setWi((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);

  // Mouse-reactive depth: rooms lean toward the cursor, text leans away.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 45, damping: 18, mass: 0.6 });
  const roomX = useTransform(sx, (v) => v * 14);
  const roomY = useTransform(sy, (v) => v * 10);
  const textX = useTransform(sx, (v) => v * -7);
  const textY = useTransform(sy, (v) => v * -5);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

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
            <span
              key={`${w}-${i}`}
              className="inline-block overflow-hidden align-top"
            >
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
        <Link
          href="/about"
          className="inline-flex items-center gap-3 text-sm text-cream"
        >
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
    <section
      ref={trackRef}
      className="relative"
      style={{ height: `${n * 100}vh` }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden bg-ink"
        onMouseMove={onMouseMove}
      >
        {/* Room stack, slightly overscaled so mouse parallax never shows edges */}
        <motion.div
          style={{ x: roomX, y: roomY, scale: 1.04 }}
          className="absolute inset-0 will-change-transform"
        >
          {rooms.map((room, i) => (
            <RoomLayer
              key={room.url}
              room={room}
              index={i}
              count={n}
              progress={scrollYProgress}
            />
          ))}
        </motion.div>

        {/* Legibility washes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-ink/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/70 to-transparent" />

        {/* Oversized room-name watermark */}
        <div className="pointer-events-none absolute bottom-2 right-3 z-[5] select-none overflow-hidden md:bottom-4 md:right-6">
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ y: "65%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-45%", opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="block whitespace-nowrap font-serif italic leading-none"
              style={{
                fontSize: "clamp(3.5rem, 11vw, 10rem)",
                WebkitTextStroke: "1px rgba(253,254,255,0.16)",
                color: "transparent",
              }}
            >
              {rooms[active].label}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Headline */}
        <motion.div
          style={{ x: textX, y: textY }}
          className="container-x relative z-10 flex h-full items-center pt-[72px]"
        >
          <div className="max-w-3xl">{heading}</div>
        </motion.div>

        {/* Room caption — which room you are standing in */}
        <div className="absolute bottom-9 left-6 z-10 md:left-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -22, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
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

        {/* Walk progress */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 z-10 h-[2px] origin-left bg-brand"
        />
      </div>
    </section>
  );
}
