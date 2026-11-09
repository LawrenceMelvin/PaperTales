import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        atelier: {
          cream: "#FFFDF9",
          linen: "#FAF6EE",
          vellum: "#F4EFEA",
          card: "#FFFFFF",
          charcoal: "#1E2530",
          muted: "#64748B",
          border: "#E8DFD3",
          gold: "#D97706",
          goldHover: "#B45309",
          goldLight: "#FEF3C7",
          sage: "#059669",
          sageLight: "#D1FAE5",
          coral: "#E11D48",
          coralLight: "#FFE4E6",
        },
        paypal: {
          blue: "#003087",
          sky: "#0070BA",
          yellow: "#FFC439",
          dark: "#001C66",
        },
      },
      boxShadow: {
        book: "0 20px 50px -12px rgba(120, 90, 60, 0.18), 0 2px 8px rgba(120, 90, 60, 0.08)",
        warm: "0 10px 30px -5px rgba(180, 140, 90, 0.12), 0 4px 10px -2px rgba(180, 140, 90, 0.06)",
        "glow-amber": "0 0 25px rgba(217, 119, 6, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
