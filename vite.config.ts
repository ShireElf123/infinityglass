import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
  },
  build: {
    outDir: process.env.APPDEPLOY_VITE_OUT_DIR || "dist",
    sourcemap:
      process.env.APPDEPLOY_VITE_SOURCEMAP === "hidden" ? "hidden" : false,
    rollupOptions: {
      maxParallelFileOps: 128,
    },
  },
});
