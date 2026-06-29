import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getSettings } from "@/lib/data";

export default async function Footer() {
  const s = await getSettings();
  return (
    <footer className="border-t border-ink-line bg-ink-soft">
      <div className="container-x py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo logoUrl={s.logoUrl} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/55">
              {s.aboutBody.slice(0, 140)}…
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[12px] uppercase tracking-widest2 text-brand">
              Explore
            </h4>
            <ul className="space-y-3 text-sm text-cream/65">
              <li><Link href="/projects" className="hover:text-cream">Work</Link></li>
              <li><Link href="/about" className="hover:text-cream">Studio</Link></li>
              <li><Link href="/services" className="hover:text-cream">Services</Link></li>
              <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[12px] uppercase tracking-widest2 text-brand">
              Get in touch
            </h4>
            <ul className="space-y-3 text-sm text-cream/65">
              <li className="flex items-start gap-2">
                <i className="ti ti-mail mt-0.5 text-brand" />
                <a href={`mailto:${s.email}`} className="hover:text-cream">{s.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <i className="ti ti-phone mt-0.5 text-brand" />
                <a href={`tel:${s.phone}`} className="hover:text-cream">{s.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <i className="ti ti-map-pin mt-0.5 text-brand" />
                <span>{s.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-ink-line pt-6 text-xs text-cream/40 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Insider Limited. Adorn Your World.</span>
          <div className="flex gap-5">
            <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
              Facebook
            </a>
            <Link href="/admin" className="hover:text-cream">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
