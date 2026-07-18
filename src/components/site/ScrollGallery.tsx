"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Img = { id: string; url: string; alt: string | null };

/**
 * Two-row image band. As the section scrolls through the viewport the top
 * row drifts left and the bottom row drifts right, in opposite directions.
 */
export default function ScrollGallery({ images }: { images: Img[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Opposite horizontal drift for the two rows.
  const xLeft = useTransform(scrollYProgress, [0, 1], ["2%", "-22%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["-22%", "2%"]);

  if (images.length === 0) return null;

  const mid = Math.ceil(images.length / 2);
  const topRow = images.slice(0, mid);
  const bottomRow = images.slice(mid);

  return (
    <section ref={ref} className="overflow-hidden bg-ink py-16 md:py-24">
      <div className="container-x mb-10">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> The gallery
        </span>
        <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
          Moments from our spaces.
        </h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        <motion.div style={{ x: xLeft }} className="flex gap-4 md:gap-6">
          {topRow.map((im) => (
            <GalleryCard key={im.id} img={im} />
          ))}
        </motion.div>

        {bottomRow.length > 0 && (
          <motion.div style={{ x: xRight }} className="flex justify-end gap-4 md:gap-6">
            {bottomRow.map((im) => (
              <GalleryCard key={im.id} img={im} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function GalleryCard({ img }: { img: Img }) {
  return (
    <div className="relative aspect-[3/4] w-[46vw] shrink-0 overflow-hidden rounded-2xl border border-ink-line sm:w-[30vw] md:w-[22vw] lg:w-[17vw]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.url}
        alt={img.alt ?? ""}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
    </div>
  );
}
