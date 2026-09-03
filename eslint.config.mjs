import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { react: { version: "19.2.8" } } },
  globalIgnores([".next/**", "out/**", "node_modules/**", ".worktrees/**", ".orchestration/**", "coverage/**", "next-env.d.ts"]),
]);
