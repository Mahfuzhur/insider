import { parseReviewVideo } from "@/lib/utils";

export default function ClientReview({
  videoUrl,
  quote,
  author,
}: {
  videoUrl: string;
  quote: string | null;
  author: string;
}) {
  const embed = parseReviewVideo(videoUrl);
  if (embed.kind === "none") return null;

  return (
    <section className="border-y border-ink-line bg-ink-soft py-24 md:py-32">
      <div className="container-x">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> In their words
        </span>
        <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
          What our clients say.
        </h2>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-center">
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
                title="Client review"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            )}
          </div>

          {(quote || author) && (
            <figure>
              {quote && (
                <blockquote className="font-serif text-2xl leading-snug text-cream md:text-3xl">
                  <span className="text-brand">“</span>
                  {quote}
                  <span className="text-brand">”</span>
                </blockquote>
              )}
              {author && (
                <figcaption className="mt-5 text-sm uppercase tracking-[0.15em] text-cream/60">
                  — {author}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
