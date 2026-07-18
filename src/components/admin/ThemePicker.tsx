"use client";

import { useState } from "react";
import { PALETTES } from "@/lib/theme";

export default function ThemePicker({ value }: { value: string }) {
  const [selected, setSelected] = useState(value);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PALETTES.map((p) => {
        const active = selected === p.id;
        return (
          <label
            key={p.id}
            className={
              "cursor-pointer rounded-xl border p-3 transition-colors " +
              (active ? "border-brand bg-brand/10" : "border-ink-line hover:border-cream/30")
            }
          >
            <input
              type="radio"
              name="theme"
              value={p.id}
              checked={active}
              onChange={() => setSelected(p.id)}
              className="sr-only"
            />
            <div className="flex items-center gap-2">
              <span
                className="h-8 w-8 rounded-md border border-black/10"
                style={{ background: p.swatch[0] }}
              />
              <span
                className="h-8 w-8 rounded-md border border-black/10"
                style={{ background: p.swatch[1] }}
              />
              {active && <i className="ti ti-check ml-auto text-brand" />}
            </div>
            <div className="mt-2 text-xs text-cream/70">{p.name}</div>
          </label>
        );
      })}
    </div>
  );
}
