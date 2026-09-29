import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        beige: { DEFAULT: "#fffbf0", deep: "#f3ecd9" },
        corail: { DEFAULT: "#ff6f62", soft: "#ff8a7f", dark: "#e85b4f" },
        marine: { DEFAULT: "#061a2d", soft: "#0e2c47" },
        turquoise: { DEFAULT: "#061a2d", vivid: "#ff6f62" },
        teal: { deep: "#061a2d" },
        creole: { DEFAULT: "#ff6f62", soft: "#ff8a7f" },
        sand: "#f3ecd9",
        cream: "#fffbf0",
        ink: "#061a2d",

        // Cowboy design tokens used by the imported component library.
        umber: "#4e332d",
        oxblood: "#69253a",
        linen: "#ebe8e0",
        forest: "#0e301a",

        // Semantic shadcn-style tokens. Values resolve through CSS variables so
        // primitives stay themeable instead of baking property colors into UI code.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"UC Desert Rain"', '"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        body: ['"Urbanist"', "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ['"DesertRain"', '"Instrument Serif"', "Georgia", "serif"],
        label: ['"Brothers OT"', '"League Spartan"', "ui-sans-serif", "system-ui", "sans-serif"],
        topic: ['"Bianco Sans"', '"Urbanist"', "ui-sans-serif", "system-ui", "sans-serif"],
        button: ['"Urbanist"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(6, 26, 45, 0.18)",
        float: "0 24px 60px -20px rgba(6, 26, 45, 0.38)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      backgroundImage: {
        "hero-fade":
          "linear-gradient(180deg, rgba(6,26,45,0.15) 0%, rgba(6,26,45,0.55) 55%, rgba(6,26,45,0.9) 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
      },
    },
  },
  plugins: [animate],
};
