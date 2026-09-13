import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: resolve("src"),
      components: resolve("src/components"),
      assets: resolve("src/assets"),
    },
  },
});
