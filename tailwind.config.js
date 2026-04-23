/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#0f172a",
        muted: "#64748b",
        line: "#e2e8f0",
        surface: "#ffffff",
        canvas: "#f8fafc",
        accent: "#0ea5e9",
      },
    },
  },
  plugins: [],
};
