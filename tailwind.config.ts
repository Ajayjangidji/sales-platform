import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lumina Enterprise — Deep Indigo primary
        brand: {
          50: "#eef0fb",
          100: "#dfe0ff",
          200: "#c7cdff",
          300: "#bbc3ff",
          400: "#8b95e8",
          500: "#4454be",
          600: "#3e4eb8", // primary (Deep Indigo)
          700: "#2a3aa5",
          800: "#2334a0",
          900: "#1b2580",
        },
        // Cyan accent (data viz / success highlights)
        accent: {
          50: "#e0f2fe",
          100: "#bae6fd",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
        },
        surface: {
          DEFAULT: "#f7f9fb",
          dim: "#eceef0",
          high: "#e6e8ea",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
      boxShadow: {
        // Ambient elevation — diffused indigo-tinted shadow
        soft: "0 8px 24px -8px rgba(62, 78, 184, 0.18)",
        card: "0 1px 2px rgba(16,24,40,0.04), 0 12px 28px -16px rgba(62,78,184,0.16)",
        glass: "0 -4px 24px -8px rgba(16,24,40,0.10)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
