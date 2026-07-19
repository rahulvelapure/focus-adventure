import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Dedicated Vitest config. The app's vite.config.ts pulls in the Lovable
// TanStack plugin stack (SSR, nitro, PWA) which is unnecessary — and awkward —
// for fast unit tests, so tests run against a minimal jsdom setup instead.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**/*.ts", "src/hooks/**/*.tsx"],
    },
  },
});
