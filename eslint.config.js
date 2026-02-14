import js from "@eslint/js";
import css from "@eslint/css";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from 'eslint-plugin-react-hooks';
import tailwindPlugin from "eslint-plugin-better-tailwindcss";
import { defineConfig } from "eslint/config";


export default defineConfig([
  // Base configuration for all files
  { ignores: [".wxt/", ".output/", "public/signalsmith-stretch-worklet.js"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], languageOptions: { globals: globals.browser } },

  // TS
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"]
  })),

  // React plugin configuration
  {
    ...pluginReact.configs.flat.recommended,
    files: ["**/*.{jsx,tsx}"],
    settings: {
      react: {
        version: "detect"
      }
    }
  },

  // React Hooks plugin configuration
  {
    ...reactHooks.configs.flat.recommended,
    files: ["**/*.{jsx,tsx}"]
  },

  // CSS plugin configuration
  {
    files: ["**/*.css"],
    plugins: {
      css,
      tailwindPlugin
    },
    language: "css/css",
    extends: ["css/recommended"],
    rules: {
      "css/font-family-fallbacks": "warn",
      "css/no-invalid-at-rules": "off",
      "css/no-invalid-properties": "off",
      "css/use-baseline": ["error", { "allowSelectors": ["nesting"] }],
    }
  },
  
  // Tailwind CSS plugin configuration
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    ...tailwindPlugin.configs.recommended,
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/entrypoints/popup/style.css",
        cssFiles: ["src/**/*.css"],
        classAttributes: ["class", "className"]
      }
    },
    rules: {
      "better-tailwindcss/classnames-order": "off",
      "better-tailwindcss/no-unknown-classes": "warn"
    }
  },
]);