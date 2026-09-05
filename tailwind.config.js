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
        teal: { deep: "#061a2d" }, // fonds sombres / hero → marine
        creole: { DEFAULT: "#ff6f62", soft: "#ff8a7f" }, 
        sand: "#f3ecd9",
        cream: "#fffbf0",
        ink: "#061a2d",
      },
      fontFamily: {
        display: ['"Instrument Serif"', "ui-serif", "Georgia", "serif"],
        body: ['"Urbanist"', "ui-sans-serif", "system-ui", "sans-serif"],
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
