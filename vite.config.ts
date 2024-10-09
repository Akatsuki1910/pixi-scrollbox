import { defineConfig } from "vite";

export default defineConfig({
  root: "./src",
  base: process.env.BUILD_BASE ?? "/",
  build: {
    target: "esnext",
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./src/index.html",
      },
    },
  },
});
