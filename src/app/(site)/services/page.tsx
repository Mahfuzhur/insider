import Link from "next/link";
import { getServices } from "@/lib/data";

export const metadata = { title: "Services" };

const STEPS = [
  { n: "01", t: "Discovery", d: "We learn how you live or work and what the space needs to do." },
  { n: "02", t: "Concept & 3D", d: "Layouts, materials and photoreal renders to lock the vision." },
  { n: "03", t: "Build", d: "Managed fit-out with trusted craftspeople and quality materials." },
  { n: "04", t: "Handover", d: "A finished, styled space — turnkey and ready to enjoy." },
];

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="pt-32">
      <section className="container-x pb-16">
        <span className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" /> What we do
        </span>
        <h1 className="mt-5 max-w-3xl text-balance font-serif text-5xl leading-[1.0] text-cream md:text-7xl">
          Everything to adorn your world, under one roof.
        </h1>
      </section>

      <section className="container-x grid gap-6 pb-20 sm:grid-cols-2">
        {services.map((s) => (
          <div
            key={s.id}
            className="group rounded-2xl border border-ink-line bg-ink-card p-9 transition-colors hover:border-brand/40"
          >
            <i className={`ti ${s.icon} text-4xl text-brand`} />
            <h2 className="mt-6 font-serif text-3xl text-cream">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-cream/60">{s.description}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-ink-line bg-ink-soft py-24">
        <div className="container-x">
          <h2 className="mb-12 font-serif text-4xl text-cream md:text-5xl">
            How we work.
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n}>
                <div className="font-serif text-5xl text-brand/80">{step.n}</div>
                <h3 className="mt-4 font-serif text-2xl text-cream">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/55">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-24 text-center">
        <h2 className="font-serif text-4xl text-cream md:text-5xl">
          Ready when you are.
        </h2>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-medium text-brand-fg transition-transform hover:scale-[1.03]"
        >
          Get a quote <i className="ti ti-arrow-right" />
        </Link>
      </section>
    </div>
  );
}
