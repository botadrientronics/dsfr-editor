import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Base surchargeable pour un déploiement en sous-chemin (GitHub Pages…).
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      // La démo consomme la librairie directement depuis les sources.
      "dsfr-editor/style.css": resolve(__dirname, "../src/styles/index.css"),
      "dsfr-editor": resolve(__dirname, "../src/index.ts"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
