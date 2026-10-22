import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: "var(--ground)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        border: "var(--border)",
        rule: "var(--rule)",
        ink: {
          DEFAULT: "var(--text-ink)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          tertiary: "var(--text-tertiary)",
        },
        data: {
          DEFAULT: "var(--data-hue)",
          subtle: "var(--data-hue-subtle)",
          ink: "var(--data-hue-ink)",
          contrast: "var(--data-contrast)",
        },
        status: {
          correct: "var(--status-correct)",
          "correct-bg": "var(--status-correct-bg)",
          "correct-contrast": "var(--status-correct-contrast)",
          wrong: "var(--status-wrong)",
          "wrong-bg": "var(--status-wrong-bg)",
          "wrong-contrast": "var(--status-wrong-contrast)",
          flag: "var(--status-flag)",
          "flag-bg": "var(--status-flag-bg)",
          "flag-contrast": "var(--status-flag-contrast)",
        },
      },
      transitionTimingFunction: {
        emil: "cubic-bezier(0.23, 1, 0.32, 1)",
        drawer: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      transitionDuration: {
        press: "100ms",
        snap: "160ms",
        modal: "220ms",
        drawer: "280ms",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "var(--radius-card)",
        control: "var(--radius-control)",
        badge: "var(--radius-badge)",
      },
    },
  },
  plugins: [],
};

export default config;
