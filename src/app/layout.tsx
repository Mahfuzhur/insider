import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { paletteStyle } from "@/lib/theme";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Insider — Interior Design Studio in Dhaka",
    template: "%s · Insider",
  },
  description:
    "Insider is an interior design studio in Dhaka. We adorn your world — residential and commercial interiors, from 3D visualization to turnkey fit-out.",
  metadataBase: new URL("https://insiderltd.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const themeVars = paletteStyle(settings.theme);

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.24.0/dist/tabler-icons.min.css"
        />
      </head>
      <body style={themeVars as React.CSSProperties}>{children}</body>
    </html>
  );
}
