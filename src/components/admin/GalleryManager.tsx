"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { deleteGalleryImage, moveGalleryImage } from "@/app/admin/actions";

type Img = { id: string; url: string; alt: string | null };

export default function GalleryManager({ images }: { images: Img[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload/gallery", { method: "POST", body: fd });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? "Upload failed");
        }
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-ink-line bg-ink-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-cream">Gallery images</h3>
          <p className="text-xs text-cream/45">
            The scrolling band under the hero. First half fills the top row,
            the rest the bottom row.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-ink-line px-3 py-2 text-xs text-cream hover:border-brand disabled:opacity-50"
        >
          <i className="ti ti-upload" /> {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {error && <p className="mb-3 text-xs text-brand-300">{error}</p>}

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="grid h-28 w-full place-items-center rounded-xl border border-dashed border-ink-line text-xs text-cream/40 hover:border-brand/50"
        >
          Drop or click to add gallery images
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((im, idx) => (
            <div
              key={im.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-ink-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={im.alt ?? ""} className="h-full w-full object-cover" />
              <span className="absolute left-1 top-1 rounded bg-ink/70 px-1.5 py-0.5 text-[9px] text-cream/80">
                {idx + 1}
              </span>
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-ink/90 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <form action={moveGalleryImage}>
                    <input type="hidden" name="id" value={im.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button
                      className="rounded bg-cream/15 px-1.5 py-1 text-[10px] text-cream hover:bg-cream/25 disabled:opacity-30"
                      title="Move earlier"
                      disabled={idx === 0}
                    >
                      <i className="ti ti-arrow-left" />
                    </button>
                  </form>
                  <form action={moveGalleryImage}>
                    <input type="hidden" name="id" value={im.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button
                      className="rounded bg-cream/15 px-1.5 py-1 text-[10px] text-cream hover:bg-cream/25 disabled:opacity-30"
                      title="Move later"
                      disabled={idx === images.length - 1}
                    >
                      <i className="ti ti-arrow-right" />
                    </button>
                  </form>
                </div>
                <form action={deleteGalleryImage}>
                  <input type="hidden" name="id" value={im.id} />
                  <button
                    className="rounded bg-brand/80 px-1.5 py-1 text-[10px] text-[#2a1006] hover:bg-brand"
                    title="Delete"
                  >
                    <i className="ti ti-trash" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
