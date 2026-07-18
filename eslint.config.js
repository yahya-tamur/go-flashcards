import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { defineConfig } from "eslint/config";
import promisePlugin from "eslint-plugin-promise";

export default defineConfig(
  // 1. Globally ignore build artifacts and system files
  {
    ignores: ["dist", "build", "node_modules", "src-tauri"],
  },

  // 2. Base JavaScript and TypeScript configuration
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Specific React and TypeScript matching configuration
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      // Set the global environment variables for browser-facing apps
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        // Enforce parsing configuration specific to your TS environment
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      promise: promisePlugin,
    },
    rules: {
      // Pull in standard configurations manually for plugins missing full Flat Config support
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat["jsx-runtime"].rules, // Use this for React 17+
      ...reactHooks.configs.recommended.rules,

      // Custom adjustments
      "react/react-in-jsx-scope": "off", // Unnecessary for modern React
      "react/jsx-uses-react": "off",
      "promise/catch-or-return": "error",
    },
    settings: {
      react: {
        version: "detect", // Automatically matches your installed React version
      },
    },
  },
);
