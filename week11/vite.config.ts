import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: { name: "logic", environment: "node", include: ["tests/**/*.test.ts"] },
      },
      {
        extends: true,
        test: { name: "react", environment: "jsdom", include: ["tests/**/*.test.tsx"] },
      },
    ],
  },
});
