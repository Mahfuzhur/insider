import { parseReviewVideo } from "@/lib/utils";

type Review = {
  id: string;
  videoUrl: string;
  quote: string | null;
  author: string;
};

export default function ClientReview({ reviews }: { reviews: Review[] }) {
  const valid = reviews.filter(
    (r) => parseReviewVideo(r.videoUrl).kind !== "none"
  );
  if (valid.length === 0) return null;

  const single = valid.length === 1;

  return (
    <section className="border-y border-ink-line bg-ink-soft py-24 md:py-32">
      <div className="container-x">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> In their words
        </span>
        <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
          What our clients say.
        </h2>

        <div
          className={
            "mt-12 grid gap-8 " +
            (single ? "md:grid-cols-[1.4fr_1fr] md:items-center" : "sm:grid-cols-2")
          }
        >
          {valid.map((r) => (
            <ReviewCard key={r.id} review={r} single={single} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, single }: { review: Review; single: boolean }) {
  const embed = parseReviewVideo(review.videoUrl);
  if (embed.kind === "none") return null;

  const player = (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-ink-line bg-ink">
      {embed.kind === "file" ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          src={embed.src}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <iframe
          src={embed.src}
          title={`Client review${review.author ? ` — ${review.author}` : ""}`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      )}
    </div>
  );

  const caption = (review.quote || review.author) && (
    <figure className={single ? "" : "mt-4"}>
      {review.quote && (
        <blockquote
          className={
            "font-serif leading-snug text-cream " +
            (single ? "text-2xl md:text-3xl" : "text-lg")
          }
        >
          <span className="text-brand">“</span>
          {review.quote}
          <span className="text-brand">”</span>
        </blockquote>
      )}
      {review.author && (
        <figcaption className="mt-3 text-sm uppercase tracking-[0.15em] text-cream/60">
          — {review.author}
        </figcaption>
      )}
    </figure>
  );

  // In single layout the video and caption are separate grid columns.
  if (single) {
    return (
      <>
        {player}
        {caption}
      </>
    );
  }
  return (
    <div>
      {player}
      {caption}
    </div>
  );
}
