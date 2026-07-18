"use client";

import { useState } from "react";
import {
  createReview,
  updateReview,
  deleteReview,
  moveReview,
} from "@/app/admin/actions";
import { parseReviewVideo } from "@/lib/utils";
import ReviewVideoUploader from "@/components/admin/ReviewVideoUploader";

type Review = {
  id: string;
  videoUrl: string;
  quote: string | null;
  author: string;
};

export default function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const [linkPreview, setLinkPreview] = useState("");
  const previewKind = parseReviewVideo(linkPreview).kind;

  return (
    <div className="space-y-8">
      {/* Add by link */}
      <div className="rounded-2xl border border-ink-line bg-ink-card p-6">
        <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-brand">
          Add a review
        </h2>

        <form action={createReview} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
              Video link (YouTube, Vimeo, Facebook, or a direct video URL)
            </span>
            <input
              name="videoUrl"
              value={linkPreview}
              onChange={(e) => setLinkPreview(e.target.value)}
              placeholder="https://www.facebook.com/share/v/…"
              className="admin-input"
            />
            {linkPreview && (
              <span className="mt-1 block text-xs text-cream/40">
                {previewKind === "none"
                  ? "Not a recognized video link yet."
                  : `Recognized as a ${previewKind} video. ✓`}
              </span>
            )}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
                Client name (optional)
              </span>
              <input name="author" placeholder="Nazrul Islam" className="admin-input" />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
              Pull quote (optional)
            </span>
            <textarea
              name="quote"
              rows={2}
              placeholder="Friendly team and great quality materials…"
              className="admin-input"
            />
          </label>

          <button className="rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-brand-fg hover:scale-[1.02]">
            Add review
          </button>
        </form>

        <ReviewVideoUploader />
      </div>

      {/* Existing reviews */}
      <div>
        <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-brand">
          Current reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-cream/40">
            No reviews yet. Add one above — the section stays hidden on the site
            until at least one exists.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r, idx) => (
              <ReviewRow
                key={r.id}
                review={r}
                index={idx}
                total={reviews.length}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({
  review,
  index,
  total,
}: {
  review: Review;
  index: number;
  total: number;
}) {
  const embed = parseReviewVideo(review.videoUrl);
  return (
    <div className="rounded-2xl border border-ink-line bg-ink-card p-4">
      <div className="flex items-start gap-4">
        <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg border border-ink-line bg-ink">
          {embed.kind === "file" ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={embed.src} className="h-full w-full object-cover" preload="metadata" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wide text-cream/50">
              {embed.kind === "none" ? "Unrecognized link" : `${embed.kind} video`}
            </div>
          )}
        </div>

        <form action={updateReview} className="flex-1 space-y-2">
          <input type="hidden" name="id" value={review.id} />
          <input
            name="author"
            defaultValue={review.author}
            placeholder="Client name"
            className="admin-input py-1.5 text-sm"
          />
          <textarea
            name="quote"
            defaultValue={review.quote ?? ""}
            rows={2}
            placeholder="Pull quote"
            className="admin-input text-sm"
          />
          <div className="flex items-center gap-2">
            <button className="rounded bg-cream/10 px-3 py-1.5 text-xs text-cream hover:bg-cream/20">
              Save text
            </button>
            <span className="truncate text-[10px] text-cream/30">{review.videoUrl}</span>
          </div>
        </form>

        <div className="flex shrink-0 flex-col gap-1">
          <form action={moveReview}>
            <input type="hidden" name="id" value={review.id} />
            <input type="hidden" name="dir" value="up" />
            <button
              disabled={index === 0}
              className="rounded bg-cream/10 px-2 py-1 text-xs text-cream hover:bg-cream/20 disabled:opacity-30"
              title="Move up"
            >
              <i className="ti ti-arrow-up" />
            </button>
          </form>
          <form action={moveReview}>
            <input type="hidden" name="id" value={review.id} />
            <input type="hidden" name="dir" value="down" />
            <button
              disabled={index === total - 1}
              className="rounded bg-cream/10 px-2 py-1 text-xs text-cream hover:bg-cream/20 disabled:opacity-30"
              title="Move down"
            >
              <i className="ti ti-arrow-down" />
            </button>
          </form>
          <form action={deleteReview}>
            <input type="hidden" name="id" value={review.id} />
            <button
              className="rounded bg-brand/80 px-2 py-1 text-xs text-brand-fg hover:bg-brand"
              title="Delete"
            >
              <i className="ti ti-trash" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
