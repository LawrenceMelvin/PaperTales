import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        paypal: {
          blue: "#003087",
          sky: "#0070BA",
          yellow: "#FFC439",
          dark: "#001C66",
        },
      },
    },
  },
  plugins: [],
};
export default config;
