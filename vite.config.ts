import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  base: process.env.BUILD_BASE ?? "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./src/index.html",
      },
    },
  },
});
