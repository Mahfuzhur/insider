import { getSettings } from "@/lib/data";
import { updateReviewSettings } from "@/app/admin/actions";
import { parseReviewVideo } from "@/lib/utils";

export default async function ReviewPage() {
  const s = await getSettings();
  const embed = parseReviewVideo(s.reviewVideoUrl);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-cream">Client review</h1>
      <p className="mt-1 text-sm text-cream/50">
        The testimonial video shown under the gallery. Paste a YouTube or Vimeo
        link, or a direct video file URL.
      </p>

      <form
        action={updateReviewSettings}
        className="mt-8 rounded-2xl border border-ink-line bg-ink-card p-6"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            Video link
          </span>
          <input
            name="reviewVideoUrl"
            defaultValue={s.reviewVideoUrl}
            placeholder="https://youtu.be/…  or  https://vimeo.com/…"
            className="admin-input"
          />
          <span className="mt-1 block text-xs text-cream/40">
            {embed.kind === "none"
              ? s.reviewVideoUrl
                ? "This link isn't a recognized YouTube/Vimeo/video URL — the section stays hidden until it is."
                : "Empty — the review section is hidden on the site."
              : `Recognized as a ${embed.kind} video. ✓`}
          </span>
        </label>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            Pull quote (optional)
          </span>
          <textarea
            name="reviewQuote"
            defaultValue={s.reviewQuote ?? ""}
            rows={3}
            placeholder="Friendly team and great quality materials…"
            className="admin-input"
          />
        </label>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
            Client name (optional)
          </span>
          <input
            name="reviewAuthor"
            defaultValue={s.reviewAuthor}
            placeholder="Nazrul Islam"
            className="admin-input"
          />
        </label>

        <button className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]">
          Save client review
        </button>
      </form>
    </div>
  );
}
