"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { removeLogo } from "@/app/admin/actions";
import { LogoMark } from "@/components/Logo";

export default function LogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/logo", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Upload failed");
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
    <div className="flex flex-wrap items-center gap-5">
      <div className="grid h-20 w-44 place-items-center rounded-xl border border-ink-line bg-ink p-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
        ) : (
          <div className="flex items-center gap-2 text-cream/40">
            <LogoMark className="h-8 text-brand" />
            <span className="text-[11px]">Built-in logo</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[#2a1006] hover:scale-[1.02] disabled:opacity-60"
          >
            <i className="ti ti-upload" /> {busy ? "Uploading…" : "Upload logo"}
          </button>
          {logoUrl && (
            <form action={removeLogo}>
              <button className="text-sm text-cream/50 hover:text-brand">
                Remove
              </button>
            </form>
          )}
        </div>
        <p className="text-xs text-cream/40">
          SVG, PNG, JPG or WebP. A white / light version works best on the dark
          site. Max 4MB.
        </p>
        {error && <p className="text-xs text-brand-300">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => upload(e.target.files)}
      />
    </div>
  );
}
