import Link from "next/link";
import Marquee from "@/components/site/Marquee";
import { getServices, getSettings } from "@/lib/data";

export const metadata = { title: "Studio" };

const STATS = [
  { value: "10+", label: "Years of craft" },
  { value: "120+", label: "Spaces delivered" },
  { value: "60", label: "Avg. days to finish" },
  { value: "100%", label: "Turnkey handover" },
];

export default async function AboutPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);

  return (
    <div className="pt-32">
      <section className="container-x pb-20">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> The studio
        </span>
        <h1 className="mt-5 max-w-4xl text-balance font-serif text-5xl leading-[1.0] text-cream md:text-7xl">
          {settings.aboutTitle}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-cream/65">
          {settings.aboutBody}
        </p>
      </section>

      <Marquee
        items={
          services.length
            ? services.map((s) => s.title)
            : ["Residential", "Commercial", "Fit-out", "Styling"]
        }
      />

      <section className="container-x grid gap-6 py-20 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink-line bg-ink-card p-8">
            <div className="font-serif text-5xl text-brand">{s.value}</div>
            <div className="mt-2 text-sm uppercase tracking-[0.1em] text-cream/55">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      <section className="container-x pb-28">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-balance font-serif text-4xl text-cream md:text-5xl">
              Design with restraint. Built to last.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-cream/65">
            We believe great interiors aren&apos;t about doing more — they&apos;re about
            doing the right things beautifully. Every project starts by
            understanding how you live, then translating that into space,
            light, material and detail. We visualize it in 3D so there are no
            surprises, then deliver it turnkey.
          </p>
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-medium text-brand-fg transition-transform hover:scale-[1.03]"
          >
            Work with us <i className="ti ti-arrow-right" />
          </Link>
        </div>
      </section>
    </div>
  );
}
