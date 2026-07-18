/**
 * Runtime-swappable colour palettes, built around the logo colours
 * (#ef5926 orange, #fbfbfb near-white). Every value is an "R G B" channel
 * triple so Tailwind's alpha modifiers (text-cream/55, bg-brand/10) work.
 *
 * Token meaning is semantic, so light and dark palettes both work by
 * swapping values:
 *   brand     — accent (the logo orange)
 *   brand300  — a lighter accent for hovers/detail
 *   brandFg   — text/icon colour that sits ON the accent
 *   ink       — page background
 *   inkSoft   — slightly raised background (bands)
 *   inkCard   — cards / inputs
 *   inkLine   — hairline borders
 *   cream     — primary foreground (text)
 */
export type PaletteVars = {
  brand: string;
  brand300: string;
  brandFg: string;
  ink: string;
  inkSoft: string;
  inkCard: string;
  inkLine: string;
  cream: string;
};

export type Palette = {
  id: string;
  name: string;
  mode: "dark" | "light";
  /** Two swatches shown in the admin picker. */
  swatch: [string, string];
  vars: PaletteVars;
};

export const PALETTES: Palette[] = [
  {
    id: "ember",
    name: "Ember (dark)",
    mode: "dark",
    swatch: ["#0b0908", "#ef5926"],
    vars: {
      brand: "239 89 38",
      brand300: "242 138 105",
      brandFg: "42 16 6",
      ink: "11 9 8",
      inkSoft: "18 16 14",
      inkCard: "23 20 17",
      inkLine: "34 30 26",
      cream: "251 251 251",
    },
  },
  {
    id: "espresso",
    name: "Espresso (warm dark)",
    mode: "dark",
    swatch: ["#18100c", "#ef5926"],
    vars: {
      brand: "239 89 38",
      brand300: "242 138 105",
      brandFg: "40 20 8",
      ink: "24 16 12",
      inkSoft: "33 22 16",
      inkCard: "41 28 20",
      inkLine: "56 40 30",
      cream: "245 240 235",
    },
  },
  {
    id: "midnight",
    name: "Midnight (cool dark)",
    mode: "dark",
    swatch: ["#090b10", "#ef5926"],
    vars: {
      brand: "239 89 38",
      brand300: "242 138 105",
      brandFg: "9 12 20",
      ink: "9 11 16",
      inkSoft: "14 17 24",
      inkCard: "19 23 32",
      inkLine: "31 37 50",
      cream: "240 244 250",
    },
  },
  {
    id: "ivory",
    name: "Ivory (light)",
    mode: "light",
    swatch: ["#fbfbfb", "#ef5926"],
    vars: {
      brand: "232 80 30",
      brand300: "209 70 30",
      brandFg: "255 255 255",
      ink: "251 251 251",
      inkSoft: "244 243 241",
      inkCard: "255 255 255",
      inkLine: "224 221 216",
      cream: "26 22 19",
    },
  },
  {
    id: "sand",
    name: "Sand (warm light)",
    mode: "light",
    swatch: ["#f6f1ea", "#e0491a"],
    vars: {
      brand: "224 73 26",
      brand300: "198 66 28",
      brandFg: "255 250 246",
      ink: "247 242 235",
      inkSoft: "240 233 223",
      inkCard: "255 253 250",
      inkLine: "223 213 199",
      cream: "38 28 20",
    },
  },
];

export const DEFAULT_THEME = "ember";

export function getPalette(id: string | null | undefined): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** CSS custom-property block for a palette, for inline injection. */
export function paletteStyle(id: string | null | undefined): Record<string, string> {
  const v = getPalette(id).vars;
  return {
    "--brand": v.brand,
    "--brand-300": v.brand300,
    "--brand-fg": v.brandFg,
    "--ink": v.ink,
    "--ink-soft": v.inkSoft,
    "--ink-card": v.inkCard,
    "--ink-line": v.inkLine,
    "--cream": v.cream,
  };
}
