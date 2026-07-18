"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commitReviewVideo } from "@/app/admin/actions";

export default function ReviewVideoUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setDone(false);
    setProgress(0);
    try {
      const url: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload/review-video");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          try {
            const j = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) resolve(j.url);
            else reject(new Error(j.error ?? "Upload failed."));
          } catch {
            reject(new Error("Upload failed."));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        const fd = new FormData();
        fd.append("file", file);
        xhr.send(fd);
      });

      const fd = new FormData();
      fd.set("url", url);
      await commitReviewVideo(fd);
      setDone(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-dashed border-ink-line p-4">
      <p className="mb-3 text-xs text-cream/50">
        …or upload a video file straight from your computer (MP4, WebM or MOV,
        up to 200MB). It becomes the review video immediately.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/ogg"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-lg border border-brand/50 px-5 py-2.5 text-sm text-brand transition-colors hover:bg-brand/10 disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Upload video file"}
      </button>

      {busy && (
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-cream/10">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-cream/50">
            Uploading — {progress}%. Keep this tab open.
          </p>
        </div>
      )}
      {done && (
        <p className="mt-3 text-sm text-green-400">
          Uploaded — this video is now live in the review section.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
