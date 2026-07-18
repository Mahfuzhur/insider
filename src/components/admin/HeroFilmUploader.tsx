"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commitHeroFrames } from "@/app/admin/actions";

const TARGET_FPS = 9;
const MAX_FRAMES = 240;
const FRAME_WIDTH = 1280;
const WEBP_QUALITY = 0.68;

type Phase = "idle" | "reading" | "converting" | "uploading" | "saving" | "done" | "error";

/**
 * Converts a video into a scrubbable frame sequence entirely in the
 * browser (the server can't run video tools), then uploads the frames.
 */
export default function HeroFilmUploader() {
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
      const frameCount = Math.min(MAX_FRAMES, Math.max(24, Math.round(duration * TARGET_FPS)));
      const step = duration / frameCount;

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
          video.currentTime = Math.min(duration - 0.01, i * step);
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
