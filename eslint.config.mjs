import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next (broadened with **/ to catch nested
    // build artifacts, e.g. stale .next dirs inside .claude/worktrees/*).
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/dist/**",
    "next-env.d.ts",
    // Claude Code scratch worktrees — never lint these.
    ".claude/**",
  ]),
]);

export default eslintConfig;
