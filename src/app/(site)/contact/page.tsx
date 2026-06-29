import ContactForm from "@/components/site/ContactForm";
import { getSettings } from "@/lib/data";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();

  return (
    <div className="container-x pb-28 pt-32">
      <span className="eyebrow">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Get in touch
      </span>
      <h1 className="mt-5 max-w-3xl text-balance font-serif text-5xl leading-[1.0] text-cream md:text-7xl">
        Let&apos;s adorn your world.
      </h1>

      <div className="mt-14 grid gap-14 md:grid-cols-[1fr_1.1fr]">
        <div className="space-y-8">
          <p className="max-w-sm text-lg leading-relaxed text-cream/65">
            Tell us about your project and we&apos;ll be in touch to talk through
            ideas, timeline and budget.
          </p>
          <ul className="space-y-5">
            <ContactRow icon="ti-mail" label="Email" value={s.email} href={`mailto:${s.email}`} />
            <ContactRow icon="ti-phone" label="Phone" value={s.phone} href={`tel:${s.phone}`} />
            <ContactRow icon="ti-map-pin" label="Studio" value={s.address} />
          </ul>
        </div>

        <div className="rounded-3xl border border-ink-line bg-ink-card p-8 md:p-10">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink-line text-brand">
        <i className={`ti ${icon}`} />
      </span>
      <div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-cream/45">
          {label}
        </div>
        <div className="text-cream">{value}</div>
      </div>
    </div>
  );
  return <li>{href ? <a href={href} className="hover:opacity-80">{inner}</a> : inner}</li>;
}
