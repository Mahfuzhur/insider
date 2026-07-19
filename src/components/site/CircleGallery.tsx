"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type Img = { id: string; url: string; caption: string };

// Angular gap between cards on the wheel, and the circle radius (vh).
const STEP = 13; // degrees
const RADIUS_VH = 92;
const CENTER_TOP_VH = 126;

/**
 * A rotating circular carousel. Cards are fanned around a large circle
 * whose centre sits below the viewport; scrolling turns the wheel so each
 * card sweeps across the top in turn. After the last card the section
 * releases and the page scrolls on.
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
  const lastAngle = (n - 1) * STEP;
  // Wheel turns from card 0 centred (with a little lead-in) to card n-1.
  const wheelRotate = useTransform(
    smooth,
    [0, 1],
    [STEP * 0.7, -lastAngle - STEP * 0.7]
  );

  const trackVh = Math.max(220, n * 58);

  if (images.length === 0) return null;

  return (
    <section ref={ref} className="relative bg-ink" style={{ height: `${trackVh}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Heading */}
        <div className="container-x absolute inset-x-0 top-0 z-10 pt-16">
          <span className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> The collection
          </span>
          <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
            Turn through our spaces.
          </h2>
        </div>

        {/* The wheel — its centre is a zero-size point below the viewport */}
        <motion.div
          style={{ rotate: wheelRotate }}
          className="absolute left-1/2 h-0 w-0"
          // top positioned so the top of the circle lands in the upper third
          // eslint-disable-next-line react/forbid-dom-props
        >
          <div style={{ position: "absolute", top: `${CENTER_TOP_VH}vh`, left: 0 }}>
            {images.map((im, i) => (
              <CircleCard
                key={im.id}
                img={im}
                index={i}
                wheelRotate={wheelRotate}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          style={{ scaleX: scrollYProgress }}
          className="absolute inset-x-0 bottom-0 z-10 h-[2px] origin-left bg-brand"
        />
      </div>
    </section>
  );
}

function CircleCard({
  img,
  index,
  wheelRotate,
}: {
  img: Img;
  index: number;
  wheelRotate: MotionValue<number>;
}) {
  // Distance (in degrees) of this card from the top of the wheel.
  const offset = useTransform(wheelRotate, (r) => Math.abs(index * STEP + r));
  const scale = useTransform(offset, [0, STEP * 2], [1, 0.82], { clamp: true });
  const opacity = useTransform(offset, [0, STEP * 1.8, STEP * 3], [1, 0.85, 0], {
    clamp: true,
  });

  return (
    <div
      className="absolute left-0 top-0"
      style={{ transform: `rotate(${index * STEP}deg) translateY(-${RADIUS_VH}vh)` }}
    >
      <motion.div
        style={{ scale, opacity }}
        className="-translate-x-1/2 -translate-y-1/2"
      >
        <div className="w-[clamp(180px,22vw,300px)] overflow-hidden rounded-2xl border border-ink-line shadow-2xl">
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
        </div>
        {img.caption && (
          <p className="mt-4 text-center font-serif text-xl tracking-wide text-cream md:text-2xl">
            {img.caption}
          </p>
        )}
      </motion.div>
    </div>
  );
}
