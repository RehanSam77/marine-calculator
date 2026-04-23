import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative paths so the build works on any static host
  // (Vercel, Netlify, GitHub Pages, S3, nginx, etc.)
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
