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
        <HeroFilmUploader
          slowSegments={s.heroSlowSegments ?? ""}
          slowFps={s.heroSlowFps}
          fastFps={s.heroFastFps}
        />
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
              className="w-full accent-brand"
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

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            Slow segments — parts of the video that play slowly on scroll
          </span>
          <textarea
            name="heroSlowSegments"
            defaultValue={s.heroSlowSegments ?? ""}
            rows={6}
            placeholder={"04 - 12\n21 - 25\n1.21 - 1.23\n2.58 - 3.03"}
            className="admin-input font-mono text-sm"
          />
          <span className="mt-1 block text-xs text-cream/40">
            One range per line as minutes.seconds (1.21 = 1 min 21 s; plain
            numbers are seconds). These moments linger; everything between
            them rushes past. Save here first, then upload the video — the
            pacing is baked in during conversion.
          </span>
        </label>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            How slow — detail in slow moments (higher = lingers longer)
          </span>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="heroSlowFps"
              min="6"
              max="24"
              step="1"
              defaultValue={s.heroSlowFps}
              className="w-full accent-brand"
            />
            <span className="w-12 text-right text-sm text-cream/70">
              {s.heroSlowFps}
            </span>
          </div>
        </label>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            How fast — travel between slow moments (lower = rushes past)
          </span>
          <div className="flex items-center gap-4">
            <input
              type="range"
              name="heroFastFps"
              min="1"
              max="8"
              step="0.5"
              defaultValue={s.heroFastFps}
              className="w-full accent-brand"
            />
            <span className="w-12 text-right text-sm text-cream/70">
              {s.heroFastFps}
            </span>
          </div>
          <span className="mt-1 block text-xs text-cream/40">
            These two apply at conversion time — save, then (re)upload the
            video to hear the new rhythm.
          </span>
        </label>

        <button className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-brand-fg hover:scale-[1.02]">
          Save playback settings
        </button>
      </form>
    </div>
  );
}
