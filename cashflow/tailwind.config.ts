import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-bg": "#203040",
        "brand-card": "#2b3550",
        "brand-sidebar": "#202030",
        "brand-primary": "#7060F0",
        "brand-secondary": "#8B7DFF",
        "brand-text": "#E2E8F0",
        "brand-muted": "#94A3B8",
        "brand-border": "#3f4a6d",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
