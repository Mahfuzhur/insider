import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#DA4E2A",
          50: "#FBEDE8",
          100: "#F4CBBC",
          200: "#EDA88F",
          300: "#E68463",
          400: "#DF6136",
          500: "#DA4E2A",
          600: "#B23E20",
          700: "#892F18",
          800: "#5F2010",
          900: "#361208",
        },
        ink: {
          DEFAULT: "#0B0908",
          soft: "#12100E",
          card: "#171411",
          line: "#221E1A",
        },
        cream: "#FDFEFF",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.22em",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
