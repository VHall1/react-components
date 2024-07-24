import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@vhall1/react": resolve("packages/react"),
    },
  },
});
