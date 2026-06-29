import { getSettings } from "@/lib/data";
import { updateSettings } from "@/app/admin/actions";
import LogoUploader from "@/components/admin/LogoUploader";

export default async function SettingsPage() {
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-cream">Site settings</h1>
      <p className="mt-1 text-sm text-cream/50">
        Homepage hero, studio intro, and contact details.
      </p>

      <div className="mt-8 rounded-2xl border border-ink-line bg-ink-card p-6">
        <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-brand">
          Brand logo
        </h2>
        <LogoUploader logoUrl={s.logoUrl} />
      </div>

      <form action={updateSettings} className="mt-6 space-y-6">
        <Section title="Homepage hero">
          <Field label="Hero headline" name="heroLine" defaultValue={s.heroLine} />
          <Field
            label="Rotating words (comma separated)"
            name="heroWords"
            defaultValue={s.heroWords}
          />
          <Area label="Hero tagline" name="heroTagline" defaultValue={s.heroTagline} />
        </Section>

        <Section title="Studio / about">
          <Field label="About title" name="aboutTitle" defaultValue={s.aboutTitle} />
          <Area label="About body" name="aboutBody" defaultValue={s.aboutBody} rows={4} />
        </Section>

        <Section title="Contact">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" name="email" defaultValue={s.email} />
            <Field label="Phone" name="phone" defaultValue={s.phone} />
          </div>
          <Field label="Address" name="address" defaultValue={s.address} />
          <Field label="Facebook URL" name="facebook" defaultValue={s.facebook} />
        </Section>

        <button className="rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-[#2a1006] hover:scale-[1.02]">
          Save settings
        </button>
      </form>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-line bg-ink-card p-6">
      <h2 className="mb-4 text-sm uppercase tracking-[0.1em] text-brand">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
        {label}
      </span>
      <input name={name} defaultValue={defaultValue} className="admin-input" />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
        {label}
      </span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="admin-input"
      />
    </label>
  );
}
