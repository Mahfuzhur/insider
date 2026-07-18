"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commitHeroFrames } from "@/app/admin/actions";

const TARGET_FPS = 9;
const SLOW_FPS = 12;
const FAST_FPS = 3;
const MAX_FRAMES = 500;
const FRAME_WIDTH = 1280;
const WEBP_QUALITY = 0.68;

type Phase = "idle" | "reading" | "converting" | "uploading" | "saving" | "done" | "error";

/** "1.21" -> 81s (minutes.seconds); plain numbers are seconds. */
function parseTimecode(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const m = t.match(/^(\d+)[.:](\d{1,2})$/);
  if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** One "from - to" range per line; tolerates swapped ends. */
function parseSegments(text: string): [number, number][] {
  const out: [number, number][] = [];
  for (const line of text.split(/[\n,]+/)) {
    const ends = line.split(/[-–—]/).map(parseTimecode);
    if (ends.length === 2 && ends[0] !== null && ends[1] !== null) {
      const a = Math.min(ends[0], ends[1]);
      const b = Math.max(ends[0], ends[1]);
      if (b > a) out.push([a, b]);
    }
  }
  return out.sort((x, y) => x[0] - y[0]);
}

/**
 * Sample timestamps densely inside slow segments and sparsely outside, so
 * equal-scroll-per-frame playback lingers on the slow parts. Falls back to
 * uniform sampling when no segments are given.
 */
function buildTimestamps(duration: number, segments: [number, number][]): number[] {
  const plan = (slowFps: number, fastFps: number) => {
    const inSlow = (t: number) => segments.some(([a, b]) => t >= a && t <= b);
    const ts: number[] = [];
    let t = 0;
    while (t < duration) {
      ts.push(t);
      t += 1 / (segments.length ? (inSlow(t) ? slowFps : fastFps) : TARGET_FPS);
    }
    return ts;
  };
  let ts = plan(SLOW_FPS, FAST_FPS);
  if (ts.length > MAX_FRAMES) {
    const k = ts.length / MAX_FRAMES;
    ts = plan(SLOW_FPS / k, FAST_FPS / k);
  }
  return ts;
}

/**
 * Converts a video into a scrubbable frame sequence entirely in the
 * browser (the server can't run video tools), then uploads the frames.
 */
export default function HeroFilmUploader({
  slowSegments = "",
}: {
  slowSegments?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  async function handleFile(file: File) {
    try {
      setPhase("reading");
      setProgress(0);
      setMessage("");

      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = url;

      await new Promise<void>((res, rej) => {
        video.onloadedmetadata = () => res();
        video.onerror = () => rej(new Error("Could not read this video file."));
      });

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration < 1) {
        throw new Error("This video looks empty or unreadable.");
      }
      const segments = parseSegments(slowSegments).filter(([a]) => a < duration);
      const timestamps = buildTimestamps(duration, segments);
      const frameCount = timestamps.length;
      if (frameCount < 24) {
        throw new Error("This video is too short for a walkthrough film.");
      }

      const canvas = document.createElement("canvas");
      const scale = Math.min(1, FRAME_WIDTH / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable in this browser.");

      const setId = crypto.randomUUID();
      setPhase("converting");

      for (let i = 0; i < frameCount; i++) {
        // Seek and wait for the decoder to land on the frame.
        await new Promise<void>((res, rej) => {
          video.onseeked = () => res();
          video.onerror = () => rej(new Error("Seeking failed while reading the video."));
          video.currentTime = Math.min(duration - 0.01, timestamps[i]);
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/webp", WEBP_QUALITY)
        );
        if (!blob) throw new Error("Your browser could not encode WebP frames. Try Chrome.");

        const fd = new FormData();
        fd.set("setId", setId);
        fd.set("index", String(i));
        fd.set("file", new File([blob], `frame-${i}.webp`, { type: "image/webp" }));
        const r = await fetch("/api/upload/hero-frames", { method: "POST", body: fd });
        if (!r.ok) {
          const j = await r.json().catch(() => null);
          throw new Error(j?.error ?? `Upload failed at frame ${i + 1}.`);
        }
        setProgress(Math.round(((i + 1) / frameCount) * 100));
      }

      URL.revokeObjectURL(url);

      setPhase("saving");
      const fd = new FormData();
      fd.set("setId", setId);
      fd.set("count", String(frameCount));
      await commitHeroFrames(fd);

      setPhase("done");
      setMessage(`Done — the hero now plays ${frameCount} frames from your new video.`);
      router.refresh();
    } catch (e) {
      setPhase("error");
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  const busy = phase === "reading" || phase === "converting" || phase === "saving";

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-brand/50 px-5 py-2.5 text-sm text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
      >
        {busy ? "Working…" : "Upload new walkthrough video"}
      </button>

      {busy && (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-cream/10">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-cream/50">
            {phase === "saving"
              ? "Saving…"
              : `Converting and uploading — ${progress}%. Keep this tab open.`}
          </p>
        </div>
      )}

      {phase === "done" && <p className="mt-3 text-sm text-green-400">{message}</p>}
      {phase === "error" && <p className="mt-3 text-sm text-red-400">{message}</p>}
    </div>
  );
}
