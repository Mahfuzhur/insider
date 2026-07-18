"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { Logo } from "@/components/Logo";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, initial);

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-ink-line bg-ink-card p-8">
          <h1 className="font-serif text-2xl text-cream">Admin sign in</h1>
          <p className="mt-1 text-sm text-cream/50">
            Manage projects, images and content.
          </p>
          <form action={action} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-ink-line bg-cream/[0.03] px-3 py-2.5 text-cream outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.1em] text-cream/55">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-ink-line bg-cream/[0.03] px-3 py-2.5 text-cream outline-none focus:border-brand"
              />
            </div>
            {state.error && (
              <p className="text-sm text-brand-300">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-brand-fg transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
