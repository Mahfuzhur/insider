"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

const pad4 = (n: number) => String(n).padStart(4, "0");

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
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}

export default function VideoScrubHero({
  heroLine,
  words,
  tagline,
  frameDir,
  frameCount,
  speed,
  caption,
}: {
  heroLine: string;
  words: string[];
  tagline: string;
  /** Public path holding frame-0001.webp … frame-NNNN.webp */
  frameDir: string;
  frameCount: number;
  /** vh of scroll per frame — higher is slower playback. */
  speed: number;
  caption: string;
}) {
  const frameSrc = (i: number) => `${frameDir}/frame-${pad4(i + 1)}.webp`;
  const trackHeight = Math.max(150, Math.round(frameCount * speed));

  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrame = useRef(0);
  const reduced = useReducedMotion();
  const [coarseReady, setCoarseReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Spring-smoothed progress: the film glides between frames instead of
  // snapping with every scroll tick.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 22,
    mass: 0.4,
  });

  // While the page settles (layout measurement, browser scroll
  // restoration) the raw progress can jump around — snap the spring to it
  // instantly during that window so the film neither starts mid-way nor
  // auto-plays to a restored position. After the window, the spring smooths.
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!mountedAt.current || performance.now() - mountedAt.current < 600) {
      smoothProgress.jump(v);
    }
  });

  // Draw the closest loaded frame, cover-fit, at device resolution.
  const draw = (frame: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let img: HTMLImageElement | null = null;
    for (let d = 0; d < frameCount; d++) {
      const lo = frame - d;
      const hi = frame + d;
      if (lo >= 0 && imagesRef.current[lo]?.complete) { img = imagesRef.current[lo]; break; }
      if (hi < frameCount && imagesRef.current[hi]?.complete) { img = imagesRef.current[hi]; break; }
    }
    if (!img) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth * dpr;
    const h = canvas.clientHeight * dpr;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * s;
    const dh = img.naturalHeight * s;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  };

  // Two-pass preload: every 6th frame first so scrubbing works almost
  // immediately, then the rest fill in.
  useEffect(() => {
    let cancelled = false;
    imagesRef.current = [];
    setCoarseReady(false);

    const load = (i: number, onload?: () => void) => {
      const img = new Image();
      img.src = frameSrc(i);
      img.onload = () => {
        if (cancelled) return;
        onload?.();
        if (Math.abs(i - currentFrame.current) < 6) draw(currentFrame.current);
      };
      imagesRef.current[i] = img;
    };

    let coarse = 0;
    const coarseTotal = Math.ceil(frameCount / 6);
    for (let i = 0; i < frameCount; i += 6) {
      load(i, () => {
        coarse++;
        if (coarse >= coarseTotal) setCoarseReady(true);
      });
    }
    const t = setTimeout(() => {
      for (let i = 0; i < frameCount; i++) {
        if (!imagesRef.current[i]) load(i);
      }
    }, 800);

    const onResize = () => draw(currentFrame.current);
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameDir, frameCount]);

  useMotionValueEvent(smoothProgress, "change", (v) => {
    const frame = Math.max(
      0,
      Math.min(frameCount - 1, Math.round(v * (frameCount - 1)))
    );
    if (frame !== currentFrame.current) {
      currentFrame.current = frame;
      requestAnimationFrame(() => draw(frame));
    }
  });

  const [wi, setWi] = useState(0);
  useEffect(() => {
    if (words.length < 2) return;
    const t = setInterval(() => setWi((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);

  // Headline hands the stage to the film once the scrub begins.
  const headY = useTransform(scrollYProgress, [0, 0.16], ["0%", "-6%"]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.12, 0.2], [1, 1, 0]);

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

  // Reduced motion: a single still frame, no scroll choreography.
  if (reduced) {
    return (
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-ink pt-[72px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameSrc(0)}
          alt="Interior walkthrough"
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
      style={{ height: `${trackHeight}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* First frame as instant paint while the sequence loads */}
        {!coarseReady && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frameSrc(0)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Legibility washes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/85 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink/70 to-transparent" />

        {/* Headline */}
        <motion.div
          style={{ y: headY, opacity: headOpacity }}
          className="container-x pointer-events-none absolute inset-0 z-10 flex items-center pt-[72px]"
        >
          <div className="pointer-events-auto max-w-3xl">{heading}</div>
        </motion.div>

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-9 left-6 z-10 md:left-12">
            <p className="font-serif text-2xl italic text-cream md:text-3xl">
              {caption}
            </p>
          </div>
        )}

        {/* Scroll hint — fades once the film starts */}
        <motion.div
          style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
          className="absolute bottom-9 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 text-cream/60 sm:flex"
        >
          <i className="ti ti-chevron-down animate-bounce text-lg" />
          <span className="text-[11px] uppercase tracking-[0.3em]">
            Scroll to play the walkthrough
          </span>
        </motion.div>

        {/* Film progress */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 z-10 h-[2px] origin-left bg-brand"
        />
      </div>
    </section>
  );
}
