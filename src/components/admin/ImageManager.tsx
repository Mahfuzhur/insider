"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { setCover, deleteImage } from "@/app/admin/actions";

type Img = {
  id: string;
  url: string;
  category: string;
  isCover: boolean;
};

export default function ImageManager({
  projectId,
  images,
}: {
  projectId: string;
  images: Img[];
}) {
  return (
    <div className="space-y-8">
      <Bucket
        projectId={projectId}
        category="live"
        title="Live photos"
        hint="Real photos of the finished space"
        images={images.filter((i) => i.category === "live")}
      />
      <Bucket
        projectId={projectId}
        category="3d"
        title="3D renders"
        hint="Visualizations / renders"
        images={images.filter((i) => i.category === "3d")}
      />
    </div>
  );
}

function Bucket({
  projectId,
  category,
  title,
  hint,
  images,
}: {
  projectId: string;
  category: string;
  title: string;
  hint: string;
  images: Img[];
}) {
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
        fd.append("projectId", projectId);
        fd.append("category", category);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
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
          <h3 className="text-sm font-medium text-cream">{title}</h3>
          <p className="text-xs text-cream/45">{hint}</p>
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
          Drop or click to add {title.toLowerCase()}
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((im) => (
            <div
              key={im.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-ink-line"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="h-full w-full object-cover" />
              {im.isCover && (
                <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[9px] uppercase text-[#2a1006]">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-between gap-1 bg-gradient-to-t from-ink/90 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <form action={setCover}>
                  <input type="hidden" name="id" value={im.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <button
                    className="rounded bg-cream/15 px-1.5 py-1 text-[10px] text-cream hover:bg-cream/25"
                    title="Set as cover"
                  >
                    <i className="ti ti-star" />
                  </button>
                </form>
                <form action={deleteImage}>
                  <input type="hidden" name="id" value={im.id} />
                  <input type="hidden" name="projectId" value={projectId} />
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
