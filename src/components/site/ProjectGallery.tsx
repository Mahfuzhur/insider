"use client";

import { useMemo, useState } from "react";
import { LogoMark } from "@/components/Logo";

type Img = { id: string; url: string; category: string; alt: string | null };

export default function ProjectGallery({
  images,
  title,
}: {
  images: Img[];
  title: string;
}) {
  const has3d = images.some((i) => i.category === "3d");
  const hasLive = images.some((i) => i.category === "live");
  const [mode, setMode] = useState<"live" | "3d">(hasLive ? "live" : "3d");

  const filtered = useMemo(
    () => images.filter((i) => i.category === mode),
    [images, mode]
  );
  const [active, setActive] = useState(0);
  const current = filtered[active];

  const showToggle = has3d && hasLive;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-ink-line">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.alt ?? title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={
              "flex h-full w-full items-center justify-center " +
              (mode === "3d"
                ? "bg-gradient-to-br from-[#1e2c38] to-[#0f1822]"
                : "bg-gradient-to-br from-[#3a2a24] to-[#1a110d]")
            }
          >
            {mode === "3d" && (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(120,180,220,0.25) 1px,transparent 1px),linear-gradient(90deg,rgba(120,180,220,0.25) 1px,transparent 1px)",
                  backgroundSize: "38px 38px",
                }}
              />
            )}
            <LogoMark className="relative h-16 text-cream/15" />
          </div>
        )}

        {showToggle && (
          <div className="absolute right-4 top-4 flex gap-1 rounded-full border border-cream/20 bg-ink/50 p-1 backdrop-blur">
            <button
              onClick={() => {
                setMode("live");
                setActive(0);
              }}
              className={
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-colors " +
                (mode === "live"
                  ? "bg-brand text-brand-fg"
                  : "text-cream/70 hover:text-cream")
              }
            >
              <i className="ti ti-camera" /> Live photo
            </button>
            <button
              onClick={() => {
                setMode("3d");
                setActive(0);
              }}
              className={
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-colors " +
                (mode === "3d"
                  ? "bg-brand text-brand-fg"
                  : "text-cream/70 hover:text-cream")
              }
            >
              <i className="ti ti-cube" /> 3D render
            </button>
          </div>
        )}

        <span className="absolute bottom-4 left-4 rounded-full bg-ink/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] text-cream backdrop-blur">
          {mode === "3d" ? "3D render" : "Live photo"}
        </span>
      </div>

      {filtered.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {filtered.map((im, idx) => (
            <button
              key={im.id}
              onClick={() => setActive(idx)}
              className={
                "h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all " +
                (idx === active
                  ? "border-brand"
                  : "border-ink-line opacity-70 hover:opacity-100")
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
