import { getGalleryImages } from "@/lib/data";
import GalleryManager from "@/components/admin/GalleryManager";

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl text-cream">Gallery</h1>
      <p className="mt-1 text-sm text-cream/50">
        The scrolling image band shown under the hero. As visitors scroll, the
        top row drifts left and the bottom row drifts right.
      </p>

      <div className="mt-8">
        <GalleryManager images={images} />
      </div>
    </div>
  );
}
