import { getSettings } from "@/lib/data";
import { updateHeroSettings } from "@/app/admin/actions";
import HeroFilmUploader from "@/components/admin/HeroFilmUploader";

export default async function HeroPage() {
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-cream">Hero video</h1>
      <p className="mt-1 text-sm text-cream/50">
        The homepage walkthrough film — swap the video and tune how it plays
        as visitors scroll.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-line bg-ink-card p-6">
        <h2 className="mb-1 text-sm uppercase tracking-[0.1em] text-brand">
          Walkthrough video
        </h2>
        <p className="mb-4 text-xs text-cream/40">
          Currently showing {s.heroFrameCount} frames from{" "}
          <code className="text-cream/60">{s.heroFrameDir}</code>. Upload a new
          video to replace it — the film is converted right here in your
          browser, so this works best on a computer.
        </p>
        <HeroFilmUploader />
      </div>

      <form
        action={updateHeroSettings}
        className="mt-6 rounded-2xl border border-ink-line bg-ink-card p-6"
      >
        <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-brand">
          Playback
        </h2>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            Speed — scroll length per frame (higher = slower, calmer)
          </span>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="heroSpeed"
              min="1.5"
              max="12"
              step="0.5"
              defaultValue={s.heroSpeed}
              className="w-full accent-[#da4e2a]"
            />
            <span className="w-12 text-right text-sm text-cream/70">
              {s.heroSpeed}
            </span>
          </div>
          <span className="mt-1 block text-xs text-cream/40">
            Around 2 feels quick, 5 is cinematic, 10 is very slow. Saved value:{" "}
            {s.heroSpeed}
          </span>
        </label>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            Caption (shown bottom-left, leave empty to hide)
          </span>
          <input
            name="heroCaption"
            defaultValue={s.heroCaption}
            className="admin-input"
          />
        </label>

        <button className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]">
          Save playback settings
        </button>
      </form>
    </div>
  );
}
