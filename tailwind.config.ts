import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(30 26 23 / <alpha-value>)",
        moss: "rgb(117 105 93 / <alpha-value>)",
        jade: "rgb(143 29 29 / <alpha-value>)",
        coral: "rgb(143 29 29 / <alpha-value>)",
        paper: "rgb(247 241 229 / <alpha-value>)",
        line: "rgb(30 26 23 / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 18px 48px rgba(23, 33, 27, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
