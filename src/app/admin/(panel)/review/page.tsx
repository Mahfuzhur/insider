import { getReviews } from "@/lib/data";
import ReviewsManager from "@/components/admin/ReviewsManager";

export default async function ReviewPage() {
  const reviews = await getReviews();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-cream">Client reviews</h1>
      <p className="mt-1 text-sm text-cream/50">
        Testimonial videos shown under the gallery. Add as many as you like —
        paste a YouTube / Vimeo / Facebook link, or upload a video file.
      </p>

      <div className="mt-8">
        <ReviewsManager reviews={reviews} />
      </div>
    </div>
  );
}
