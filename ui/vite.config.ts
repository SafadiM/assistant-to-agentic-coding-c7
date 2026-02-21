import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 5173,
    proxy: {
      "/configs": "http://localhost:3000",
    },
  },
  build: {
    outDir: "dist",
    target: "es2022",
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
  },
});
