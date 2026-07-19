import { getCircleImages } from "@/lib/data";
import CircleGalleryManager from "@/components/admin/CircleGalleryManager";

export default async function CircleGalleryPage() {
  const images = await getCircleImages();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-cream">Circle gallery</h1>
      <p className="mt-1 text-sm text-cream/50">
        The rotating circular carousel below the first gallery. As visitors
        scroll, the wheel turns left→right through these images, then releases
        down the page.
      </p>

      <div className="mt-8">
        <CircleGalleryManager images={images} />
      </div>
    </div>
  );
}
