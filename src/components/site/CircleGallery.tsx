"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Img = { id: string; url: string; caption: string };

// Ellipse (turntable) geometry.
const RX = 38; // horizontal radius, vw
const RY = 12; // vertical radius, vh (small → flat, seen-from-above look)

/**
 * A horizontal elliptical turntable. The images sit around a flat ring seen
 * in perspective; scrolling spins the ring so each card sweeps left→right
 * across the front (largest, nearest) then rotates to the back (smaller,
 * faded). After every card has come round, the pinned section releases and
 * the page scrolls on.
 */
export default function CircleGallery({ images }: { images: Img[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 24,
    mass: 0.4,
  });

  const n = Math.max(1, images.length);
  const step = (2 * Math.PI) / n; // even spacing around the ring
  // The ring turns so each card reaches the front in order, then a little
  // past the last so it can settle before the section releases.
  const rot = useTransform(
    smooth,
    [0, 1],
    [step * 0.5, -(n - 1) * step - step * 0.5]
  );

  const trackVh = Math.max(240, n * 62);

  if (images.length === 0) return null;

  return (
    <section ref={ref} className="relative bg-ink" style={{ height: `${trackVh}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Heading */}
        <div className="container-x absolute inset-x-0 top-0 z-[200] pt-16">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> The collection
          </span>
          <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
            Turn through our spaces.
          </h2>
        </div>

        {/* Ellipse centre = middle of the viewport */}
        <div className="absolute left-1/2 top-[52%]">
          {images.map((im, i) => (
            <CircleCard key={im.id} img={im} baseAngle={i * step} rot={rot} />
          ))}
        </div>

        {/* Progress bar */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 z-[200] h-[2px] origin-left bg-brand"
        />
      </div>
    </section>
  );
}

function CircleCard({
  img,
  baseAngle,
  rot,
}: {
  img: Img;
  baseAngle: number;
  rot: MotionValue<number>;
}) {
  const angle = useTransform(rot, (r) => baseAngle + r);
  // x: left↔right along the ring (negative sin → front sweeps left→right).
  const x = useTransform(angle, (a) => -Math.sin(a) * RX);
  // depth: +1 at the front (nearest), -1 at the back.
  const depth = useTransform(angle, (a) => Math.cos(a));
  const y = useTransform(depth, (d) => d * RY);
  const scale = useTransform(depth, (d) => 0.62 + ((d + 1) / 2) * 0.5);
  const opacity = useTransform(depth, (d) => 0.28 + ((d + 1) / 2) * 0.72);
  const zIndex = useTransform(depth, (d) => Math.round((d + 1) * 100));

  const transform = useMotionTemplate`translate(${x}vw, ${y}vh) scale(${scale})`;

  return (
    <motion.div
      style={{ transform, opacity, zIndex }}
      className="absolute left-0 top-0 will-change-transform"
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div className="w-[clamp(170px,20vw,280px)] overflow-hidden rounded-2xl border border-ink-line shadow-2xl">
          <div className="relative aspect-[3/4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.caption}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>
          {img.caption && (
            <p className="mt-4 text-center font-serif text-xl tracking-wide text-cream md:text-2xl">
              {img.caption}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
