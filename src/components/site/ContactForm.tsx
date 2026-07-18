"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/(site)/contact/actions";

const initial: ContactState = { ok: false };

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-brand/40 bg-brand/10 p-10 text-center">
        <i className="ti ti-circle-check text-4xl text-brand" />
        <h3 className="mt-4 font-serif text-2xl text-cream">Message sent</h3>
        <p className="mt-2 text-cream/60">
          Thank you — we&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
      </div>
      <Field name="phone" label="Phone (optional)" />
      <div>
        <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-cream/55">
          Tell us about your space
        </label>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full rounded-xl border border-ink-line bg-cream/[0.03] px-4 py-3 text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-brand"
          placeholder="Project type, location, approximate size, timeline…"
        />
      </div>

      {state.error && (
        <p className="text-sm text-brand-300">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-medium text-brand-fg transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
        {!pending && <i className="ti ti-arrow-right" />}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.1em] text-cream/55">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-xl border border-ink-line bg-cream/[0.03] px-4 py-3 text-cream outline-none transition-colors placeholder:text-cream/30 focus:border-brand"
      />
    </div>
  );
}
