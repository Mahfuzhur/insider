"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  deleteCircleImage,
  moveCircleImage,
  updateCircleCaption,
} from "@/app/admin/actions";

type Img = { id: string; url: string; caption: string };

export default function CircleGalleryManager({ images }: { images: Img[] }) {
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
        const res = await fetch("/api/upload/circle", { method: "POST", body: fd });
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
          <h3 className="text-sm font-medium text-cream">Circle gallery images</h3>
          <p className="text-xs text-cream/45">
            Shown on the rotating circular carousel. Order sets the sweep
            sequence; each caption appears under its card.
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
          Drop or click to add circle-gallery images
        </button>
      ) : (
        <div className="space-y-3">
          {images.map((im, idx) => (
            <div
              key={im.id}
              className="flex items-center gap-3 rounded-xl border border-ink-line p-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={im.url}
                alt={im.caption}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
              <form action={updateCircleCaption} className="flex flex-1 items-center gap-2">
                <input type="hidden" name="id" value={im.id} />
                <input
                  name="caption"
                  defaultValue={im.caption}
                  placeholder="Caption (e.g. SIDAMO LOT 07)"
                  className="admin-input py-1.5 text-sm"
                />
                <button className="shrink-0 rounded bg-cream/10 px-3 py-1.5 text-xs text-cream hover:bg-cream/20">
                  Save
                </button>
              </form>
              <div className="flex shrink-0 gap-1">
                <form action={moveCircleImage}>
                  <input type="hidden" name="id" value={im.id} />
                  <input type="hidden" name="dir" value="up" />
                  <button
                    disabled={idx === 0}
                    className="rounded bg-cream/10 px-2 py-1.5 text-xs text-cream hover:bg-cream/20 disabled:opacity-30"
                    title="Move earlier"
                  >
                    <i className="ti ti-arrow-up" />
                  </button>
                </form>
                <form action={moveCircleImage}>
                  <input type="hidden" name="id" value={im.id} />
                  <input type="hidden" name="dir" value="down" />
                  <button
                    disabled={idx === images.length - 1}
                    className="rounded bg-cream/10 px-2 py-1.5 text-xs text-cream hover:bg-cream/20 disabled:opacity-30"
                    title="Move later"
                  >
                    <i className="ti ti-arrow-down" />
                  </button>
                </form>
                <form action={deleteCircleImage}>
                  <input type="hidden" name="id" value={im.id} />
                  <button
                    className="rounded bg-brand/80 px-2 py-1.5 text-xs text-brand-fg hover:bg-brand"
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
