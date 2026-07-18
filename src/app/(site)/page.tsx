import Link from "next/link";
import Hero from "@/components/site/Hero";
import { type HeroRoom } from "@/components/site/RoomWalkHero";
import VideoScrubHero from "@/components/site/VideoScrubHero";
import Marquee from "@/components/site/Marquee";
import ProjectCard from "@/components/site/ProjectCard";
import ScrollGallery from "@/components/site/ScrollGallery";
import ClientReview from "@/components/site/ClientReview";
import {
  getFeaturedProjects,
  getGalleryImages,
  getReviews,
  getServices,
  getSettings,
} from "@/lib/data";
import { wordsToArray } from "@/lib/utils";

// Walk order for the hero: the natural path through a home.
const ROOM_ORDER = [
  "drawing",
  "living",
  "dining",
  "kitchen",
  "master bed",
  "bed",
  "guest bed",
  "kids",
  "study",
  "office",
];

const ROOM_LABELS: Record<string, string> = {
  drawing: "Drawing Room",
  living: "Living Room",
  dining: "Dining",
  kitchen: "Kitchen",
  "master bed": "Master Bedroom",
  bed: "Bedroom",
  "guest bed": "Guest Bedroom",
  kids: "Kids' Room",
  study: "Study",
  office: "Office",
};

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Studio renders used for the hero walk until projects carry room photos. */
const FALLBACK_ROOMS: HeroRoom[] = [
  { label: "The Bedroom", url: "/hero/bedroom-01.jpg" },
  { label: "The Sage Wall", url: "/hero/bedroom-02.jpg" },
  { label: "The Vanity", url: "/hero/bedroom-03.jpg" },
  { label: "The Dressing", url: "/hero/bedroom-04.jpg" },
  { label: "Morning Light", url: "/hero/bedroom-05.jpg" },
  { label: "The Gallery", url: "/hero/bedroom-06.jpg" },
];

/** One live photo per room across featured projects, in walk order. */
function heroRooms(
  projects: Awaited<ReturnType<typeof getFeaturedProjects>>
): HeroRoom[] {
  const byRoom = new Map<string, HeroRoom>();
  for (const p of projects) {
    for (const img of p.images) {
      if (img.category !== "live" || !img.alt) continue;
      const key = img.alt.toLowerCase().replace(/[\s\d]+$/, "").trim();
      if (!key || byRoom.has(key)) continue;
      byRoom.set(key, { label: ROOM_LABELS[key] ?? titleCase(key), url: img.url });
    }
  }
  const orderOf = (key: string) => {
    const i = ROOM_ORDER.findIndex((t) => key.startsWith(t));
    return i === -1 ? ROOM_ORDER.length : i;
  };
  return [...byRoom.entries()]
    .sort((a, b) => orderOf(a[0]) - orderOf(b[0]))
    .slice(0, 5)
    .map(([, room]) => room);
}

export default async function HomePage() {
  const [settings, featured, services, gallery, reviews] = await Promise.all([
    getSettings(),
    getFeaturedProjects(6),
    getServices(),
    getGalleryImages(),
    getReviews(),
  ]);

  const words = wordsToArray(settings.heroWords);
  const dbRooms = heroRooms(featured);
  const rooms = dbRooms.length >= 2 ? dbRooms : FALLBACK_ROOMS;

  const heroImage =
    featured[0]?.images.find((i) => i.category === "live")?.url ??
    featured[0]?.images[0]?.url ??
    null;

  const cards = [
    featured[0]
      ? {
          label: "Live photo",
          tone: "live" as const,
          url:
            featured[0].images.find((i) => i.category === "live")?.url ??
            featured[0].images[0]?.url ??
            null,
        }
      : { label: "Live photo", tone: "live" as const, url: null },
    featured[1]
      ? {
          label: "3D render",
          tone: "3d" as const,
          url:
            featured[1].images.find((i) => i.category === "3d")?.url ??
            featured[1].images[0]?.url ??
            null,
        }
      : { label: "3D render", tone: "3d" as const, url: null },
  ];

  return (
    <>
      {rooms.length >= 2 ? (
        <VideoScrubHero
          heroLine={settings.heroLine}
          words={words}
          tagline={settings.heroTagline}
          frameDir={settings.heroFrameDir}
          frameCount={settings.heroFrameCount}
          speed={settings.heroSpeed}
          caption={settings.heroCaption}
        />
      ) : (
        <Hero
          heroLine={settings.heroLine}
          words={words}
          tagline={settings.heroTagline}
          cards={cards}
          heroImage={heroImage}
        />
      )}

      <ScrollGallery images={gallery} />

      <ClientReview reviews={reviews} />

      <Marquee
        items={
          services.length
            ? services.map((s) => s.title)
            : ["Interior design", "Space planning", "3D visualization", "Turnkey fit-out", "Styling"]
        }
      />

      {/* Featured work */}
      <section className="container-x py-24 md:py-32">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Selected work
            </span>
            <h2 className="mt-4 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
              Spaces we&apos;ve shaped, room by room.
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-cream/70 hover:text-brand"
          >
            All projects <i className="ti ti-arrow-right" />
          </Link>
        </div>

        {featured.length ? (
          <div className="grid gap-8 md:grid-cols-2">
            {featured.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-cream/50">
            Projects added from the admin panel will appear here.
          </p>
        )}
      </section>

      {/* About teaser */}
      <section className="border-y border-ink-line bg-ink-soft py-24 md:py-32">
        <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> The studio
            </span>
            <h2 className="mt-4 text-balance font-serif text-4xl text-cream md:text-5xl">
              {settings.aboutTitle}
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-cream/65">
              {settings.aboutBody}
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-brand hover:text-cream"
            >
              More about Insider <i className="ti ti-arrow-right" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="container-x py-24 md:py-32">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> What we do
        </span>
        <h2 className="mt-4 mb-12 max-w-xl text-balance font-serif text-4xl text-cream md:text-5xl">
          From first sketch to the finished room.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(services.length ? services : []).map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-ink-line bg-ink-card p-7 transition-colors hover:border-brand/40"
            >
              <i className={`ti ${s.icon} text-3xl text-brand`} />
              <h3 className="mt-5 font-serif text-2xl text-cream">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/55">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-[#1c130f] to-ink px-8 py-20 text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(218,78,42,0.3), rgba(218,78,42,0) 65%)",
            }}
          />
          <h2 className="relative font-serif text-4xl text-cream md:text-6xl">
            Let&apos;s adorn your world.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-cream/60">
            Tell us about your space. We&apos;ll turn it into somewhere you never
            want to leave.
          </p>
          <Link
            href="/contact"
            className="relative mt-9 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-medium text-[#2a1006] transition-transform hover:scale-[1.03]"
          >
            Start a project <i className="ti ti-arrow-right" />
          </Link>
        </div>
      </section>
    </>
  );
}
