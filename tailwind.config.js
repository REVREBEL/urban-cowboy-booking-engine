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
        linen: "#ebe8e0",
        paper: "#faf9f9",
        snow: "#ffffff",
        forest: "#0e301a",
        smoke: "#343833",
        copper: "#9a5636",
        umber: "#4e332d",
        oxblood: "#69253a",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"UC Desert Rain"', '"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        body: ['"Urbanist"', "ui-sans-serif", "system-ui", "sans-serif"],
        brand: ['"Brothers OT"', '"Arial Narrow"', "sans-serif"],
        label: ['"Brothers OT"', '"Arial Narrow"', "sans-serif"],
        topic: ['"Bianco Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        accent: ['"Tequila Blanco"', '"Brothers OT"', "sans-serif"],
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
  plugins: [],
};
