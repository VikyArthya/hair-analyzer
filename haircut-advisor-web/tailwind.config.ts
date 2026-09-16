import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B11",
        surface: {
          DEFAULT: "#0F141E",
          hover: "#171E2D",
          border: "#1E2638",
        },
        barber: {
          gold: "#E5B869",
          amber: "#F59E0B",
          darkgold: "#A88338",
        },
        accent: {
          cyan: "#06B6D4",
          emerald: "#10B981",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanLine 2.5s ease-in-out infinite",
      },
      keyframes: {
        scanLine: {
          "0%, 100%": { transform: "translateY(0%)", opacity: "0.2" },
          "50%": { transform: "translateY(100%)", opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
